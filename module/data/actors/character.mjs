const { NumberField, SchemaField } = foundry.data.fields;

/**
 * Character data.
 * @extends foundry.abstract.TypeDataModel
 */
export default class CharacterData extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = ["METANTHROPES.ACTOR.CHARACTER"];

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    const characteristics = {};
    const stats = {};
    const statuses = {};
    const defenses = {};

    const statField = () => {
      return new SchemaField({
        value: new NumberField({ nullable: false, initial: 0, integer: true, min: 0 }),
      });
    };

    const statusFields = v => {
      statuses[v.buff] = new NumberField({ integer: true, nullable: true, initial: null, min: 0, persisted: false });
      statuses[v.condition] = new NumberField({ integer: true, nullable: true, initial: null, min: 0, persisted: false });
    };

    for (const [k, v] of metanthropes.config.stats) {
      statusFields(v);
      stats[k] = statField();
    }

    for (const [k, v] of metanthropes.config.characteristics) {
      statusFields(v);
      characteristics[k] = statField();
    }

    for (const [k, v] of metanthropes.config.energyTypes) {
      defenses[k] = new SchemaField({
        cover: new NumberField({ initial: 0, nullable: false, choices: [0, 10, 25, 50, 75, 90] }),
        resistance: new NumberField({ placeholder: "0", min: 0, nullable: true, initial: null, integer: true}),
      });
    }

    return {
      attributes: new SchemaField({
        characteristics: new SchemaField(characteristics),
        stats: new SchemaField(stats),
      }),
      defenses: new SchemaField({
        energy: new SchemaField(defenses),
      }),
      resources: new SchemaField({
        destiny: new SchemaField({
          value: new NumberField({ integer: true, min: 0, initial: null, nullable: true, placeholder: "0" }),
          max: new NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
        }),
        health: new SchemaField({
          value: new NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
          max: new NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
        }),
      }),
      statuses: new SchemaField(statuses),
    };
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    this.#prepareAttributes();
    this.#prepareResources();
  }

  /* -------------------------------------------------- */

  /**
   * Prepare stats and characteristics.
   */
  #prepareAttributes() {
    const { characteristics: c, stats: s } = this.attributes;

    for (const [key, { buff, condition }] of metanthropes.config.characteristics) {
      c[key].buffs = this.statuses[buff];
      c[key].debuffs = this.statuses[condition];
    }

    for (const [key, { buff, condition, characteristic }] of metanthropes.config.stats) {
      s[key].buffs = this.statuses[buff] + c[characteristic].buffs;
      s[key].debuffs = this.statuses[condition] + c[characteristic].debuffs;
    }
  }

  /* -------------------------------------------------- */

  /**
   * Prepare health and destiny.
   */
  #prepareResources() {
    const d = this.resources.destiny;
    d.value = Math.min(d.value, d.max) || null;
    d.spent = d.max - d.value;
    d.pct = d.value / d.max * 100;

    const h = this.resources.health;
    h.value = Math.min(h.value, h.max);
    h.spent = h.max - h.value;
    h.pct = h.value / h.max * 100;
  }
}
