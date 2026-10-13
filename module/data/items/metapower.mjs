const { HTMLField, SchemaField, StringField } = foundry.data.fields;

/**
 * Data model for metapowers.
 * @extends foundry.abstract.TypeDataModel
 */
export default class MetapowerData extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static defineSchema() {
    return {
      activation: new SchemaField({
        stat: new StringField({ required: true, choices: () => metanthropes.config.stats.toChoices(), initial: "awareness" }),
      }),
      category: new SchemaField({
        classification: new StringField({ required: true, choices: () => metanthropes.config.classifications.toChoices(), initial: "aegis" }),
        energy: new StringField({ required: true, choices: () => metanthropes.config.energyTypes.toChoices(), initial: "cosmic" }),
      }),
      description: new SchemaField({
        value: new HTMLField(),
      }),
    };
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = ["METANTHROPES.ITEM", "METANTHROPES.ITEM.METAPOWER"];
}
