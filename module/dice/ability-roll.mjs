/**
 * @import MetanthropesItem from "../documents/item.mjs";
 */

/**
 * A d100 roll for using a metapower ability.
 */
export default class AbilityRoll extends foundry.dice.Roll {
  constructor(_, data={}, options={}) {
    const stat = options.stat;
    if (!metanthropes.config.stats.keys().includes(stat)) {
      throw new Error("An AbilityRoll must be constructed with a valid stat.");
    }

    if (!Number.isFinite(options.target)) {
      throw new Error("An AbilityRoll must be constructed with a target value.");
    }

    const formula = ["1d100", options.bonus].filterJoin(" + ");
    super(formula, data, options);
  }

  /* -------------------------------------------------- */

  /**
   * Factory method.
   * @param {MetanthropesItem} item
   * @param {object} [options]
   * @param {number} [options.bonus=0]
   * @returns {AbilityRoll}
   */
  static build(item, { bonus=0 }={}) {
    const data = item.getRollData();
    const stat = item.system.activation.stat;
    const target = item.actor.system.attributes.stats[options.stat].value;
    const options = { stat, target, bonus };

    const roll = new this(null, data, options);
    return roll;
  }

  /* -------------------------------------------------- */

  /**
   * The stat used for this ability roll.
   * @type {string}
   */
  get stat() {
    return this.options.stat;
  }

  /* -------------------------------------------------- */

  /**
   * The value the roll must fall below to achieve a success.
   * @type {number}
   */
  get target() {
    return this.options.target;
  }

  /* -------------------------------------------------- */

  /**
   * The bonus to the roll.
   * @type {number}
   */
  get bonus() {
    return Number.isFinite(this.options.bonus) ? this.options.bonus : 0;
  }

  /* -------------------------------------------------- */

  /**
   * Is the roll a critical success?
   * @type {boolean | null}
   */
  get isCriticalSuccess() {
    if (!this._evaluated) return null;
    return this.dice[0].results[0].result === 1;
  }

  /* -------------------------------------------------- */

  /**
   * Is the roll a critical failure?
   * @type {boolean | null}
   */
  get isCriticalFailure() {
    if (!this._evaluated) return null;
    return this.dice[0].results[0].result === 100;
  }

  /* -------------------------------------------------- */

  /**
   * Was the roll a success?
   * @type {boolean | null}
   */
  get isSuccess() {
    if (!this._evaluated) return null;
    if (this.isCriticalSuccess) return true;
    if (this.isCriticalFailure) return false;
    return this.total <= this.target;
  }

  /* -------------------------------------------------- */

  /**
   * Was the roll a failure?
   * @type {boolean | null}
   */
  get isFailure() {
    if (!this._evaluated) return null;
    if (this.isCriticalFailure) return true;
    if (this.isCriticalSuccess) return false;
    return this.total > this.target;
  }

  /* -------------------------------------------------- */

  /**
   * How many levels of success were accumulated?
   * @type {number | null}
   */
  get successLevels() {
    if (!this._evaluated) return null;
    if (!this.isSuccess) return 0;

    const n = Math.abs(this.isCriticalSuccess ? 100 : this.target - this.total) + this.bonus;
    return Math.floor(n / 10);
  }

  /* -------------------------------------------------- */

  /**
   * How many levels of failure were accumulated?
   * @type {number | null}
   */
  get failureLevels() {
    if (!this._evaluated) return null;
    if (!this.isFailure) return 0;

    const n = Math.abs(this.isCriticalFailure ? 100 : this.target - this.total) + this.bonus;
    return Math.floor(n / 10);
  }
}
