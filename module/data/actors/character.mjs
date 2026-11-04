/**
 * @import { DamageConfig } from "./_types.d.ts";
 * @import { DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 * @import MetanthropesActor from "../../documents/actor.mjs";
 */

const { NumberField, SchemaField, StringField } = foundry.data.fields;

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
    const defenses = {};
    const perks = {};
    const stats = {};
    const statuses = {};

    const statField = () => {
      return new SchemaField({
        value: new NumberField({ nullable: false, initial: 0, integer: true, min: 0 }),
      });
    };

    for (const k of metanthropes.config.statuses.keys()) {
      statuses[k] = new NumberField({ integer: true, nullable: true, initial: null, min: 0, persisted: false });
    }

    for (const k of metanthropes.config.stats.keys()) stats[k] = statField();
    for (const k of metanthropes.config.characteristics.keys()) characteristics[k] = statField();

    for (const [k, v] of metanthropes.config.energyTypes) {
      defenses[k] = new SchemaField({
        cover: new NumberField({ initial: 0, nullable: false, choices: [0, 10, 25, 50, 75, 90] }),
        immunity: new NumberField({ placeholder: "0", min: 0, nullable: true, initial: null, integer: true}),
        resistance: new NumberField({ placeholder: "0", min: 0, nullable: true, initial: null, integer: true}),
      });
    }

    for (const [k, v] of metanthropes.config.perks) {
      perks[k] = new SchemaField({
        // Max 5, can be increased to 10 with a supplement.
        value: new NumberField({ initial: 0, nullable: false, min: 0, integer: true }),
      });
    }

    return {
      attributes: new SchemaField({
        characteristics: new SchemaField(characteristics),
        stats: new SchemaField(stats),
        speed: new SchemaField({
          value: new NumberField({ initial: 10, integer: true, nullable: false, min: 0 }),
        }),
        weight: new SchemaField({
          value: new NumberField({ initial: 10, integer: true, nullable: false, min: 0 }),
        }),
        size: new SchemaField({
          value: new NumberField({ initial: 10, integer: true, nullable: false, min: 0 }),
        }),
      }),
      defenses: new SchemaField(defenses),
      details: new SchemaField({
        age: new NumberField({ initial: null, nullable: true, integer: true, min: 0 }),
        birth: new StringField({ required: true }),
        gender: new StringField({ required: true }),
        height: new SchemaField({
          value: new NumberField({ nullable: true, initial: null, min: 0 }),
          units: new StringField({ required: true, initial: "cm", choices: ["cm", "ft"] }),
        }),
        weight: new SchemaField({
          value: new NumberField({ nullable: true, initial: null, min: 0 }),
          units: new StringField({ required: true, initial: "kg", choices: ["kg", "lb"] }),
        }),
      }),
      perks: new SchemaField(perks),
      resources: new SchemaField({
        destiny: new SchemaField({
          value: new NumberField({ integer: true, min: 0, initial: null, nullable: true, placeholder: "0" }),
          max: new NumberField({ integer: true, min: 0, initial: 0, nullable: false }),
        }),
        life: new SchemaField({
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
    this.#preparePerks();
    this.#preparePhysical();

    // Life is prepared after physical, as Size may influence it.
    this.#prepareResources();
  }

  /* -------------------------------------------------- */

  /**
   * Prepare stats and characteristics.
   */
  #prepareAttributes() {
    const { characteristics: c, stats: s } = this.attributes;

    for (const [key, { buff, condition }] of metanthropes.config.characteristics) {
      const b = c[key].buffs = this.statuses[buff];
      const d = c[key].debuffs = this.statuses[condition];
      const modifier = (b - d) * 5 / 100;
      c[key].value = c[key].value * (1 + modifier);
    }

    for (const [key, { buff, condition, characteristic }] of metanthropes.config.stats) {
      const char = s[key].characteristic = c[characteristic];
      const mb = s[key].buffs = this.statuses[buff] + char.buffs;
      const md = s[key].debuffs = this.statuses[condition] + char.debuffs;
      const modifier = (mb - md) * 5 / 100;
      s[key].value = s[key].value * (1 + modifier);
    }
  }

  /* -------------------------------------------------- */

  /**
   * Prepare knowledges and skills.
   */
  #preparePerks() {
    const types = {
      knowledge: {},
      skill: {},
      expertise: {},
    };

    for (const [k, v] of metanthropes.config.perks) {
      this.perks[k].type = v.type;
      types[v.type][k] = this.perks[k];
    }

    Object.defineProperties(this.perks, {
      knowledges: {
        get() {
          return types.knowledge;
        },
      },
      skills: {
        get() {
          return types.skill;
        },
      },
      expertises: {
        get() {
          return types.expertise;
        },
      },
    });
  }

  /* -------------------------------------------------- */

  /**
   * Prepare speed, weight, size, and movement.
   */
  #preparePhysical() {
    const s = this.attributes.speed;
    s.statuses = this.statuses.accelerated - this.statuses.slowed;
    s.total = Math.clamp(s.value + s.statuses, 0, 20);
    s.modifier = metanthropes.config.speed.modifiers[s.total];

    const w = this.attributes.weight;
    w.statuses = this.statuses.encumbered - this.statuses.lightened;
    w.total = Math.clamp(w.value + w.statuses, 0, 20);
    w.modifier = metanthropes.config.weight.modifiers[w.total];

    const z = this.attributes.size;
    z.statuses = this.statuses.enlarged - this.statuses.shrunken;
    z.total = Math.clamp(z.value + z.statuses, 0, 20);
    z.modifier = metanthropes.config.size.modifiers[z.total]

    const movementBonus = metanthropes.config.size.movementBonus[z.total] ?? 0;
    this.attributes.movement = Math.ceil(s.modifier * w.modifier * z.modifier) + movementBonus;
  }

  /* -------------------------------------------------- */

  /**
   * Prepare health and destiny.
   */
  #prepareResources() {
    const d = this.resources.destiny;
    d.value = Math.min(d.value, d.max) || null;
    d.spent = d.max - d.value;
    d.pct = (d.value / d.max * 100) || 0;

    const h = this.resources.life;
    const lifeBonus = metanthropes.config.size.lifeBonus[this.attributes.size.total] ?? 0;
    h.max += lifeBonus;
    h.value = Math.min(h.value, h.max);
    h.spent = h.max - h.value;
    h.pct = (h.value / h.max * 100) || 0;
  }

  /* -------------------------------------------------- */
  /*   Change handlers                                  */
  /* -------------------------------------------------- */

  /**
   * Create an operation for spending or restoring destiny.
   * @param {number} value    The amount to spend or restore. Use a negative amount to restore.
   * @returns {DatabaseWriteOperation}
   */
  _applyDestinyOperation(value) {
    const actor = this.parent;
    const d = actor.system.resources.destiny;

    const { parent, documentName, pack } = actor;
    return {
      action: "update",
      parent, documentName, pack,
      updates: [{ _id: actor.id, "system.resources.destiny.value": d.value - value }],
    };
  }

  /* -------------------------------------------------- */

  /**
   * Consume or restore destiny.
   * @param {number} value    The amount to spend or restore. Use a negative amount to restore.
   * @returns {Promise<MetanthropesActor>}
   */
  async applyDestiny(value) {
    const operation = this._applyDestinyOperation(value);
    await foundry.documents.modifyBatch([operation]);
    return this.parent;
  }

  /* -------------------------------------------------- */

  /**
   * Calculate the damage this actor would take.
   * @param {DamageConfig[]} damages
   * @param {object} [options={}]
   * @param {boolean} [options.ignoreResistance=false]    Ignore all resistances?
   * @returns {number}
   */
  calculateDamage(damages, options = {}) {
    damages = foundry.utils.deepClone(damages);
    const actor = this.parent;

    /** @param {DamageConfig} damage */
    const apply = damage => {
      const resistance = options.ignoreResistance || damage.options.ignoreResistance
        ? 0
        : actor.system.defenses[damage.type].resistance;
      damage.value = Math.max(0, damage.value - resistance);
    };

    let total = 0;
    for (const damage of damages) {
      apply(damage);
      total += damage.value;
    }

    return total;
  }

  /* -------------------------------------------------- */

  /**
   * Create an operation for applying damage to this actor.
   * @param {DamageConfig[]} damages
   * @returns {DatabaseWriteOperation}
   */
  _applyDamageOperation(damages) {
    const total = this.calculateDamage(damages);
    const actor = this.parent;
    const life = actor.system.resources.life;

    const { parent, documentName, pack } = actor;
    return {
      action: "update",
      documentName, parent, pack,
      updates: [{
        _id: actor.id,
        "system.resources.life.value": life.value - total,
        "flags.metanthropes.previousLife": life.value,
      }],
    };
  }

  /* -------------------------------------------------- */

  /**
   * Apply damage to this actor.
   * @param {DamageConfig[]} damages
   * @returns {Promise<MetanthropesActor>}
   */
  async applyDamage(damages) {
    const operation = this._applyDamageOperation(damages);
    await foundry.documents.modifyBatch([operation]);
    return this.parent;
  }
}
