import ConfigObject from "./config-object.mjs";

/**
 * @import { CharacteristicConfig, StatConfig, ClassificationConfig, MetapowerConfig, EnergyTypeConfig } from "./_types.d.ts";
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

export default config;
