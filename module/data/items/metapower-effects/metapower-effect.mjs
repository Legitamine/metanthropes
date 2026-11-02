/**
 * @import AbilityData from "../ability.mjs";
 * @import MetanthropesItem from "../../../documents/item.mjs";
 */

const { StringField } = foundry.data.fields;

/**
 * A metapower effect defines an effect of using a metapower ability.
 * @extends foundry.abstract.DataModel
 */
export default class MetapowerEffect extends foundry.abstract.DataModel {
  /**
   * The metapower effect subtypes.
   * @type {Record<string, typeof MetapowerEffect>}
   */
  static get TYPES() {
    if (MetapowerEffect.#TYPES) return MetapowerEffect.#TYPES;
    const m = metanthropes.data.items.metapowerEffects;
    return MetapowerEffect.#TYPES = {
      [m.DamageEffect.TYPE]: m.DamageEffect,
      [m.HealingEffect.TYPE]: m.HealingEffect,
    };
  }

  /* -------------------------------------------------- */

  /**
   * The metapower effect subtypes.
   * @type {Record<string, typeof MetapowerEffect>}
   */
  static #TYPES;

  /* -------------------------------------------------- */

  /**
   * The subtype of this metapower effect.
   * @type {string}
   */
  static TYPE;

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    return {
      type: new StringField({
        blank: false,
        required: true,
        nullable: false,
        initial: () => this.TYPE,
        validate: type => type === this.TYPE,
        validationError: `must be equal to '${this.TYPE}'`,
      }),
    };
  }

  /* -------------------------------------------------- */

  /**
   * The metapower ability.
   * @type {MetanthropesItem & { system: AbilityData }}
   */
  get item() {
    return this.getNearestDocument();
  }

  /* -------------------------------------------------- */

  /**
   * Scale up this effect.
   * @param {number} [steps=1]    Number of steps to scale up.
   * @returns {object}            An update payload to apply to a clone of this effect's item.
   */
  _upscale(steps=1) {
    throw new Error("Subclasses of MetapowerEffect must extend _upscale.");
  }

  /* -------------------------------------------------- */

  /**
   * Get the cost of upscaling this effect.
   * @param {number} [steps=0]    Number of steps to scale up.
   * @returns {number}
   */
  getUpscaleCost(steps=0) {
    return 0;
  }
}
