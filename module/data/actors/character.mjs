/**
 * @import { DamageConfig } from "./_types.d.ts";
 * @import { DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 * @import MetanthropesActor from "../../documents/actor.mjs";
 */

const { NumberField, SchemaField, StringField, TypedObjectField } = foundry.data.fields;

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

    const charField = () => {
      return new SchemaField({
        base: new NumberField({ nullable: false, initial: 10, choices: [10, 20, 30] }),
        progressions: new NumberField({ nullable: false, initial: 0, choices: [0, 1, 2, 3, 4, 5] }),
      });
    };

    const statField = () => {
      return new SchemaField({
        base: new NumberField({ nullable: false, initial: 0, integer: true, min: 0 }),
        progressions: new NumberField({ nullable: false, initial: 0, choices: [0, 1, 2, 3, 4, 5] }),
      });
    };

    for (const k of metanthropes.config.statuses.keys()) {
      statuses[k] = new NumberField({ integer: true, nullable: true, initial: null, min: 0, persisted: false });
    }

    for (const k of metanthropes.config.characteristics.keys()) characteristics[k] = charField();
    for (const k of metanthropes.config.stats.keys()) stats[k] = statField();

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
          base: new NumberField({ initial: 10, integer: true, nullable: false, min: 0 }),
        }),
        weight: new SchemaField({
          base: new NumberField({ initial: 10, integer: true, nullable: false, min: 0 }),
        }),
        size: new SchemaField({
          base: new NumberField({ initial: 10, integer: true, nullable: false, min: 0 }),
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
      metapowers: new SchemaField({
        prime: new StringField({
          required: true,
          initial: "aegis",
          choices: () => metanthropes.config.classifications.toChoices(),
        }),
        levels: new TypedObjectField(
          new NumberField({ nullable: false, initial: 1, min: 1, integer: true }),
          { validateKey: key => metanthropes.config.classifications.keys().includes(key) },
        ),
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
      // _progression: [],
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
    for (const [key, { buff, condition }] of metanthropes.config.characteristics) {
      const char = this.attributes.characteristics[key];
      char.buffs = this.statuses[buff];
      char.conditions = this.statuses[condition];
      char.value = char.base + char.progressions * 5 + (char.buffs - char.conditions) * 5;
      char.value = Math.max(0, char.value);
    }

    for (const [key, { buff, condition }] of metanthropes.config.stats) {
      const stat = this.attributes.stats[key];
      stat.characteristic = metanthropes.config.stats[key].characteristic;
      const char = this.attributes.characteristics[stat.characteristic];
      stat.buffs = this.statuses[buff] + char.buffs;
      stat.conditions = this.statuses[condition] + char.conditions;
      stat.value = stat.base + stat.progressions * 5 + (stat.buffs - stat.conditions) * 5;
      stat.value = Math.max(0, stat.value);
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
    s.value = Math.clamp(s.base + s.statuses, 0, 20);
    s.modifier = metanthropes.config.speed.modifiers[s.value];

    const w = this.attributes.weight;
    w.statuses = this.statuses.encumbered - this.statuses.lightened;
    w.value = Math.clamp(w.base + w.statuses, 0, 20);
    w.modifier = metanthropes.config.weight.modifiers[w.value];

    const z = this.attributes.size;
    z.statuses = this.statuses.enlarged - this.statuses.shrunken;
    z.value = Math.clamp(z.base + z.statuses, 0, 20);
    z.modifier = metanthropes.config.size.modifiers[z.value]

    const movementBonus = metanthropes.config.size.movementBonus[z.value] ?? 0;
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

  /* -------------------------------------------------- */
  /*  Progression & Metapowers                          */
  /* -------------------------------------------------- */

  /**
   * Get the XP cost to increase a characteristic, stat, or perk.
   * @param {string} attribute
   * @returns {number}
   */
  getAttributeXPCost(attribute) {
    if (this.attributes.characteristics[attribute]) {
      return this._source.attributes.characteristics[attribute].base * 10;
    }

    if (this.attributes.stats[attribute]) {
      return this._source.attributes.stats[attribute].base * 3;
    }

    if (this.perks[attribute]) {
      return 100;
    }

    throw new Error(`Attribute '${attribute}' is not a characteristic, stat, or perk.`);
  }

  /* -------------------------------------------------- */

  /**
   * Get the XP cost to increase a metapower level.
   * @param {string} metapower    The identifier of the metapower.
   * @returns {number | null}
   */
  getMetapowerEXPCost(metapower) {
    const data = metanthropes.registry.metapowers.lookupMetapower(metapower);
    if (!data) return null;

    const prime = this.getPrimeMetapower();

    const isSynergizing = c => {
      if (c === prime.classification) return true;
      const wheel = metanthropes.config.classificationWheel;
      const index = wheel.indexOf(prime.classification);

      const next = wheel[index + 1] ?? wheel[0];
      const previous = wheel[index - 1] ?? wheel.at(-1);
      return [next, previous].includes(c);
    };

    const synergy = isSynergizing(data.classification);
    const isUtil = data.classification === "utilitarian";
    const tier = (isUtil ? 3 : synergy ? 1 : 5) + Number(prime.energy !== data.energy);
    const level = this.getCurrentMetapowerLevel(metapower);

    const table = [
      Array.fromRange(6).map(n => 1000 + 5 * n),
      Array.fromRange(6).map(n => 200 + 10 * n),
      Array.fromRange(6).map(n => 600 + 30 * n),
      Array.fromRange(6).map(n => 1200 + 60 * n),
      Array.fromRange(6).map(n => 2000 + 100 * n),
    ];

    return table[level][tier];
  }

  /* -------------------------------------------------- */

  /**
   * Get the current metapower level.
   * @param {string} metapower    The identifier of a metapower
   * @returns {number}
   */
  getCurrentMetapowerLevel(metapower) {
    const isPrime = metapower === this.metapowers.prime;
    return Math.max(this.metapowers.levels[metapower] ?? 0, Number(isPrime));
  }

  /* -------------------------------------------------- */

  /**
   * Get data on the prime metapower of this character.
   * @returns {{ classification: string; energy: string } | null}
   */
  getPrimeMetapower() {
    const lookup = metanthropes.registry.metapowers.lookupMetapower(this.metapowers.prime);
    if (!lookup) return null;

    return {
      classification: lookup.classification,
      energy: lookup.energy,
    };
  }

  /* -------------------------------------------------- */

  /**
   * Get uuids of learned metapower abilities.
   * @yields {string}
   */
  * getLearnedMetapowerAbilities() {
    const keys = new Set(Object.keys(this.metapowers.levels)).add(this.metapowers.prime);
    const range = Array.fromRange(this.getCurrentMetapowerLevel(this.metapowers.prime), 1);

    for (const key of keys) {
      const abilities = metanthropes.registry.metapowers.getAbilities({
        metapower: key,
        level: range,
      });
      for (const uuid of abilities) yield uuid;
    }
  }
}
