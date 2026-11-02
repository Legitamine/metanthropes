import ConfigObject from "./config-object.mjs";

/**
 * @import { CharacteristicConfig, StatConfig, ClassificationConfig, MetapowerConfig, EnergyTypeConfig, PerkConfig } from "./_types.d.ts";
 */

const config = {};

/* -------------------------------------------------- */

/** @type {ConfigObject & Record<string, CharacteristicConfig>} */
config.characteristics = new ConfigObject({
  body: {
    label: "METANTHROPES.CHARACTERISTICS.body",
    buff: "hardened",
    condition: "burned",
  },
  mind: {
    label: "METANTHROPES.CHARACTERISTICS.mind",
    buff: "sharpened",
    condition: "disconnected",
  },
  soul: {
    label: "METANTHROPES.CHARACTERISTICS.soul",
    buff: "enlightened",
    condition: "tormented",
  },
});

/* -------------------------------------------------- */

/** @type {ConfigObject & Record<string, StatConfig>} */
config.stats = new ConfigObject({
  endurance: {
    label: "METANTHROPES.STATS.endurance",
    characteristic: "body",
    buff: "fortified",
    condition: "boneInjury"
  },
  power: {
    label: "METANTHROPES.STATS.power",
    characteristic: "body",
    buff: "empowered",
    condition: "muscleInjury"
  },
  reflexes: {
    label: "METANTHROPES.STATS.reflexes",
    characteristic: "body",
    buff: "hastened",
    condition: "skinInjury",
  },
  creativity: {
    label: "METANTHROPES.STATS.creativity",
    characteristic: "mind",
    buff: "inspired",
    condition: "wobbly",
  },
  manipulation: {
    label: "METANTHROPES.STATS.manipulation",
    characteristic: "mind",
    buff: "articulated",
    condition: "confused",
  },
  perception: {
    label: "METANTHROPES.STATS.perception",
    characteristic: "mind",
    buff: "alerted",
    condition: "disoriented",
  },
  awareness: {
    label: "METANTHROPES.STATS.awareness",
    characteristic: "soul",
    buff: "focused",
    condition: "bewildered",
  },
  willpower: {
    label: "METANTHROPES.STATS.willpower",
    characteristic: "soul",
    buff: "determined",
    condition: "terrorized",
  },
  consciousness: {
    label: "METANTHROPES.STATS.consciousness",
    characteristic: "soul",
    buff: "awakened",
    condition: "demented",
  },
});

/* -------------------------------------------------- */

/** @type {ConfigObject & Record<string, ClassificationConfig>} */
config.classifications = new ConfigObject({
  aegis: {
    label: "METANTHROPES.CLASSIFICATIONS.aegis"
  },
  animator: {
    label: "METANTHROPES.CLASSIFICATIONS.animator"
  },
  arbiter: {
    label: "METANTHROPES.CLASSIFICATIONS.arbiter"
  },
  clairvoyant: {
    label: "METANTHROPES.CLASSIFICATIONS.clairvoyant"
  },
  controller: {
    label: "METANTHROPES.CLASSIFICATIONS.controller"
  },
  cosmonaut: {
    label: "METANTHROPES.CLASSIFICATIONS.cosmonaut"
  },
  hammer: {
    label: "METANTHROPES.CLASSIFICATIONS.hammer"
  },
  kineticist: {
    label: "METANTHROPES.CLASSIFICATIONS.kineticist"
  },
  manipulator: {
    label: "METANTHROPES.CLASSIFICATIONS.manipulator"
  },
  utilitarian: {
    label: "METANTHROPES.CLASSIFICATIONS.utilitarian"
  }
});

/* -------------------------------------------------- */

/** @type {ConfigObject & Record<string, MetapowerConfig>} */
config.metapowers = {}; // Initialized on the "ready" hook.

/* -------------------------------------------------- */

/** @type {ConfigObject & Record<string, EnergyTypeConfig>} */
config.energyTypes = new ConfigObject({
  cosmic: {
    label: "METANTHROPES.ENERGY.cosmic",
  },
  elemental: {
    label: "METANTHROPES.ENERGY.elemental",
  },
  material: {
    label: "METANTHROPES.ENERGY.material",
  },
  psychic: {
    label: "METANTHROPES.ENERGY.psychic",
  },
});

/* -------------------------------------------------- */

/** @type {ConfigObject & Record<string, PerkConfig>} */
config.perks = new ConfigObject({
  academics: {
    label: "METANTHROPES.PERK.academics",
    type: "knowledge",
  },
  engineering: {
    label: "METANTHROPES.PERK.engineering",
    type: "knowledge",
  },
  lore: {
    label: "METANTHROPES.PERK.lore",
    type: "knowledge",
  },
  medicine: {
    label: "METANTHROPES.PERK.medicine",
    type: "knowledge",
  },
  science: {
    label: "METANTHROPES.PERK.science",
    type: "knowledge",
  },
  athletics: {
    label: "METANTHROPES.PERK.athletics",
    type: "skill",
  },
  crafting: {
    label: "METANTHROPES.PERK.crafting",
    type: "skill",
  },
  gadgets: {
    label: "METANTHROPES.PERK.gadgets",
    type: "skill",
  },
  vehicles: {
    label: "METANTHROPES.PERK.vehicles",
    type: "skill",
  },
  weapons: {
    label: "METANTHROPES.PERK.weapons",
    type: "skill",
  },
});

/* -------------------------------------------------- */

/** @type {ConfigObject & Record<string, { label: string }> } */
config.statuses = new ConfigObject({
  amnesia: { label: "METANTHROPES.STATUS.amnesia" },
  asphyxiation: { label: "METANTHROPES.STATUS.asphyxiation" },
  bleeding: { label: "METANTHROPES.STATUS.bleeding" },
  diseased: { label: "METANTHROPES.STATUS.diseased" },
  fatigue: { label: "METANTHROPES.STATUS.fatigue" },
  hunger: { label: "METANTHROPES.STATUS.hunger" },
  infiltrated: { label: "METANTHROPES.STATUS.infiltrated" },
  maimed: { label: "METANTHROPES.STATUS.maimed" },
  pain: { label: "METANTHROPES.STATUS.pain" },
  probed: { label: "METANTHROPES.STATUS.probed" },
  senseLost: { label: "METANTHROPES.STATUS.senseLost" },
  unconscious: { label: "METANTHROPES.STATUS.unconscious" },
  // Movement, weight, size
  accelerated: { label: "METANTHROPES.STATUS.accelerated" },
  encumbered: { label: "METANTHROPES.STATUS.encumbered" },
  enlarged: { label: "METANTHROPES.STATUS.enlarged" },
  lightened: { label: "METANTHROPES.STATUS.lightened" },
  shrunken: { label: "METANTHROPES.STATUS.shrunken" },
  slowed: { label: "METANTHROPES.STATUS.slowed" },
  // Characteristics
  burned: { label: "METANTHROPES.STATUS.burned" },
  disconnected: { label: "METANTHROPES.STATUS.disconnected" },
  enlightened: { label: "METANTHROPES.STATUS.enlightened" },
  hardened: { label: "METANTHROPES.STATUS.hardened" },
  sharpened: { label: "METANTHROPES.STATUS.sharpened" },
  tormented: { label: "METANTHROPES.STATUS.tormented" },
  // Stats
  alerted: { label: "METANTHROPES.STATUS.alerted" },
  articulated: { label: "METANTHROPES.STATUS.articulated" },
  awakened: { label: "METANTHROPES.STATUS.awakened" },
  bewildered: { label: "METANTHROPES.STATUS.bewildered" },
  confused: { label: "METANTHROPES.STATUS.confused" },
  demented: { label: "METANTHROPES.STATUS.demented" },
  determined: { label: "METANTHROPES.STATUS.determined" },
  disoriented: { label: "METANTHROPES.STATUS.disoriented" },
  empowered: { label: "METANTHROPES.STATUS.empowered" },
  focused: { label: "METANTHROPES.STATUS.focused" },
  hastened: { label: "METANTHROPES.STATUS.hastened" },
  inspired: { label: "METANTHROPES.STATUS.inspired" },
  muscleInjury: { label: "METANTHROPES.STATUS.muscleInjury" },
  skinInjury: { label: "METANTHROPES.STATUS.skinInjury" },
  terrorized: { label: "METANTHROPES.STATUS.terrorized" },
  wobbly: { label: "METANTHROPES.STATUS.wobbly" },
});

/* -------------------------------------------------- */

/**
 * Speed related values.
 */
config.speed = {
  modifiers: {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 1,
    6: 2,
    7: 4,
    8: 6,
    9: 8,
    10: 10,
    11: 20,
    12: 50,
    13: 100,
    14: 250,
    15: 500,
    16: 1000,
    17: 2000,
    18: 5000,
    19: 10000,
    20: 20000,
  }
};

/* -------------------------------------------------- */

/** Weight related values. */
config.weight = {
  modifiers: {
    0: 200,
    1: 100,
    2: 50,
    3: 20,
    4: 10,
    5: 5,
    6: 4,
    7: 3,
    8: 2,
    9: 1.5,
    10: 1,
    11: 0.8,
    12: 0.6,
    13: 0.4,
    14: 0.2,
    15: 0.1,
    16: 0.02,
    17: 0.01,
    18: 0.002,
    19: 0.001,
    20: 0.0002,
  },
};

/* -------------------------------------------------- */

/** Size related values. */
config.size = {
  modifiers: {
    0: 0.0002,
    1: 0.001,
    2: 0.002,
    3: 0.01,
    4: 0.02,
    5: 0.1,
    6: 0.2,
    7: 0.4,
    8: 0.6,
    9: 0.8,
    10: 1,
    11: 2,
    12: 3,
    13: 9,
    14: 27,
    15: 81,
    16: 243,
    17: 729,
    18: 2187,
    19: 6561,
    20: 19683,
  },
  movementBonus: {
    0: 1,
    10: 1,
  },
  lifeBonus: {
    0: -20,
    10: 50,
  },
};

/* -------------------------------------------------- */

export default config;
