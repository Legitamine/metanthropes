/**
 * @import { Scaling } from "./_types.d.ts";
 */

const { HTMLField, NumberField, SchemaField } = foundry.data.fields;

/**
 * Data model for abilities of metapowers.
 * @extends foundry.abstract.TypeDataModel
 */
export default class AbilityData extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static defineSchema() {
    return {
      activation: new SchemaField({
        cost: new NumberField({ nullable: true, initial: null, min: 0, integer: true }),
      }),
      category: new SchemaField({
        level: new NumberField({ integer: true, min: 1, initial: 1, nullable: false }),
        metapower: new metanthropes.data.fields.IdentifierField(),
      }),
      description: new SchemaField({
        value: new HTMLField(),
      }),
      effects: new metanthropes.data.fields.MetapowerEffectsField(),
    };
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = ["METANTHROPES.ITEM", "METANTHROPES.ITEM.ABILITY"];

  /* -------------------------------------------------- */

  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.#prepareMetapower();
  }

  /* -------------------------------------------------- */

  /**
   * Assign properties derived from the metapower.
   */
  #prepareMetapower() {
    const item = this.parent;
    if (!item.isEmbedded) {
      this.activation.stat = null;
      return;
    }

    const metapower = item.collection.documentsByType.metapower.find(m => m.system.identifier === this.category.metapower);
    if (!metapower) return;

    this.activation.stat = metapower.activation.stat;
    this.category.energy = metapower.category.energy;
    this.category.classification = metapower.category.classification;
  }

  /* -------------------------------------------------- */

  /**
   * Perform an upscaling of this item.
   * @param {Scaling} scaling
   * @returns {Item}    A clone of this item.
   */
  upscale(scaling) {
    const payload = {};
    for (const [effectId, steps] of Object.entries(scaling)) {
      const effect = this.effects.get(effectId);
      payload[effect.id] = foundry.utils.expandObject(effect._upscale(steps));
    }
    return this.parent.clone({ system: { effects: payload } }, { keepId: true });
  }

  /* -------------------------------------------------- */

  /**
   * Get the total cost of upscaling effects.
   * @param {Scaling} scaling
   * @returns {number}
   */
  getUpscaleCost(scaling) {
    let cost = 0;
    for (const [effectId, steps] of Object.entries(scaling)) {
      const effect = this.effects.get(effectId);
      cost += effect.getUpscaleCost(steps);
    }
    return cost;
  }
}
