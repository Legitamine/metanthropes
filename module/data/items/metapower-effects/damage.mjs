import MetapowerEffect from "./metapower-effect.mjs";

const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

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
    if (!this.damage.scaling.enabled) return {};
    return { "damage.number": this.damage.number + this.damage.scaling.step * steps };
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  getUpscaleCost(steps=0) {
    if (!steps || !this.damage.scaling.enabled) return 0;
    return steps * this.damage.scaling.cost;
  }
}
