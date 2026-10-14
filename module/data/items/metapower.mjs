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
        stat: new StringField({
          required: true,
          choices: () => metanthropes.config.stats.toChoices(),
          initial: "awareness",
        }),
      }),
      category: new SchemaField({
        classification: new StringField({
          required: true,
          choices: () => metanthropes.config.classifications.toChoices(),
          initial: "aegis",
        }),
        energy: new StringField({
          required: true,
          choices: () => metanthropes.config.energyTypes.toChoices(),
          initial: "cosmic",
        }),
      }),
      description: new SchemaField({
        value: new HTMLField(),
      }),
      identifier: new metanthropes.data.fields.IdentifierField(),
    };
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = ["METANTHROPES.ITEM", "METANTHROPES.ITEM.METAPOWER"];

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) return false;

    if (!this.identifier) {
      this.parent.updateSource({ "system.identifier": metanthropes.utils.createDefaultIdentifier(this.parent.name) });
    }

    // TODO: Disallow item creation if the parent actor already has a Metapower item with this same identifier?
  }
}
