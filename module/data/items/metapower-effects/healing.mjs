import MetapowerEffect from "./metapower-effect.mjs";

const { NumberField, SchemaField } = foundry.data.fields;

/**
 * Define healing done by a metapower.
 * @extends MetapowerEffect
 */
export default class HealingEffect extends MetapowerEffect {
  /** @inheritdoc */
  static TYPE = "healing";

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      healing: new SchemaField({
        number: new NumberField({ nullable: false, min: 1, initial: 1, integer: true }),
        base: new NumberField({ nullable: true, min: 0, integer: true, initial: null, placeholder: "0" }),
      }),
    });
  }
}
