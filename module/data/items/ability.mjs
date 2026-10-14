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
}
