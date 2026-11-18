/**
 * @import { Scaling, AbilityUsageConfig, AbilityDialogConfig, AbilityMessageConfig } from "./_types.d.ts";
 * @import AbilityRoll from "../../dice/ability-roll.mjs";
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

    this.activation.stat = metapower.system.activation.stat;
    this.category.energy = metapower.system.category.energy;
    this.category.classification = metapower.system.category.classification;
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

  /* -------------------------------------------------- */

  /**
   * Use this metapower ability.
   * @param {AbilityUsageConfig} [usage]
   * @param {AbilityDialogConfig} [dialog]
   * @param {AbilityMessageConfig} [message]
   * @returns {Promise<AbilityRoll | null>}
   */
  async use(usage={}, dialog={}, message={}) {
    const stat = this.activation.stat;
    if (!stat) {
      throw new Error(`Item '${this.parent.uuid}' does not have a derived stat for activation.`);
    }

    usage = foundry.utils.mergeObject({ scaling: {}, bonus: 0 }, usage);
    dialog = foundry.utils.mergeObject({ configure: true }, dialog);
    message = foundry.utils.mergeObject({ create: true }, message);

    const item = this.upscale(usage.scaling);
    const roll = metanthropes.dice.AbilityRoll.build(item, { bonus: usage.bonus });

    if (dialog.configure) {
      const Class = metanthropes.dice.AbilityRoll.configurationClass;
      const { promise, resolve } = Promise.withResolvers();
      const application = new Class({
        resolve, item,
        configs: { usage, dialog, message },
      });
      await application.render({ force: true });
      const resolved = await promise;
      if (!resolved) return null;
    }

    if (!roll._evaluated) await roll.evaluate({ allowInteractive: false });

    const ChatMessage = getDocumentClass("ChatMessage");
    const messageData = {
      type: "resolution",
      speaker: ChatMessage.getSpeaker({ actor: item.actor }),
      rolls: [roll],
      system: {
        autoresolve: true,
        resolved: false,
        resolvers: [],
      },
    };
    ChatMessage.applyMode(messageData);
    // TODO: add data for content, item data, resolvers, roll(s).

    if (message.create) ChatMessage.create(messageData);

    return roll;
  }
}
