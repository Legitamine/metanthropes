/**
 * Object subclass for metanthropes config.
 * @extends Object
 */
export default class ConfigObject extends Object {
  /**
   * @param {Record<string, any>} [data={}]   The data of the object.
   */
  constructor(data={}) {
    super();
    Object.assign(this, foundry.utils.deepClone(data));
    Object.freeze(this);
  }

  /* -------------------------------------------------- */

  * [Symbol.iterator]() {
    for (const k of this.entries()) yield k;
  }

  /* -------------------------------------------------- */

  /**
   * Iterate over the entries of the object.
   * @yields {[string, any]}
   */
  * entries() {
    for (const k of foundry.utils.objectEntries(this)) yield k;
  }

  /* -------------------------------------------------- */

  /**
   * Iterate over the values of the object.
   * @yields {any}
   */
  * values() {
    for (const k of foundry.utils.objectValues(this)) yield k;
  }

  /* -------------------------------------------------- */

  /**
   * Iterate over the keys of the object.
   * @yields {string}
   */
  * keys() {
    for (const k of foundry.utils.objectKeys(this)) yield k;
  }

  /* -------------------------------------------------- */

  /**
   * Convert the enum to an array of options for a select or multi-select.
   * The inner values must contain a `label` property.
   * @param {(option: object) => void|false} [transformer]    An optional transformer to mutate the
   *                                                          options. Can return `false` to skip an option.
   * @returns {{ value: string; label: string; group?: string }[]|null}
   */
  toOptions(transformer) {
    const options = [];
    transformer = typeof transformer === "function" ? transformer : () => {};

    for (const [value, { label, group }] of this) {
      if (!label || (typeof label !== "string")) return null;
      const option = { value, label };
      if (group && (typeof group === "string")) option.group = group;
      if (transformer(option) === false) continue;
      options.push(option);
    }
    return options;
  }

  /* -------------------------------------------------- */

  /**
   * Convert the enum to an array of options for a select or multi-select.
   * The inner values must contain a `label` property.
   * @param {(option: object) => void|false} [transformer]    An optional transformer to mutate the
   *                                                          options. Can return `false` to skip an option.
   * @returns {Record<string, { label: string; group?: string }>|null}
   */
  toChoices(transformer) {
    const options = [];
    transformer = typeof transformer === "function" ? transformer : () => {};

    for (const [value, { label, group }] of this) {
      if (!label || (typeof label !== "string")) return null;
      const option = { label };
      if (group && (typeof group === "string")) option.group = group;
      if (transformer(option) === false) continue;
      options[value] = option;
    }
    return options;
  }
}
