import MetapowerEffect from "./metapower-effect.mjs";

const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

/**
 * Define a buff or condition applied by a metapower.
 * @extends MetapowerEffect
 */
export default class StatusEffect extends MetapowerEffect {
  /** @inheritdoc */
  static TYPE = "status";

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      status: new SchemaField({
        id: new StringField({
          required: true,
          blank: false,
          initial: "amnesia",
          choices: metanthropes.config.statuses.toChoices(),
        }),
        strength: new NumberField({ nullable: false, min: 1, initial: 1, integer: true }),
        scaling: new SchemaField({
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
    if (!this.healing.scaling.enabled) return {};
    return { "status.strength": this.status.strength + this.status.scaling.step * steps };
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  getUpscaleCost(steps=0) {
    if (!steps || !this.status.scaling.enabled) return 0;
    return steps * this.status.scaling.cost;
  }
}
