import MetapowerEffect from "./metapower-effect.mjs";

const { BooleanField, NumberField, SchemaField } = foundry.data.fields;

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
        spending: new SchemaField({
          enabled: new BooleanField(),
          cost: new NumberField({ initial: 1, nullable: false, integer: true, min: 1 }),
          step: new NumberField({ initial: 1, nullable: false, integer: true, min: 1 }),
        }),
      }),
    });
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  _upscale(steps=1) {
    if (!this.healing.spending.enabled) return {};
    return { "healing.number": this.healing.number + this.healing.spending.step * steps };
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  getUpscaleCost(steps=0) {
    if (!steps || !this.healing.spending.enabled) return 0;
    return steps * this.healing.spending.cost;
  }
}
