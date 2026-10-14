import MetapowerEffect from "./metapower-effect.mjs";

const { NumberField, SchemaField, StringField } = foundry.data.fields;

/**
 * Define damage dealt by a metapower.
 * @extends MetapowerEffect
 */
export default class DamageEffect extends MetapowerEffect {
  /** @inheritdoc */
  static TYPE = "damage";

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      damage: new SchemaField({
        type: new StringField({ required: true, initial: "cosmic", choices: () => metanthropes.config.energyTypes.toChoices() }),
        number: new NumberField({ nullable: false, min: 1, initial: 1, integer: true }),
        base: new NumberField({ nullable: true, min: 0, integer: true, initial: null, placeholder: "0" }),
      }),
    });
  }
}
