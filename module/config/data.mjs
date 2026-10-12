import ConfigObject from "./config-object.mjs";

/**
 * @import { StatsConfig, ClassificationConfig, MetapowerConfig } from "./_types.d.ts";
 */

const config = {};

/* -------------------------------------------------- */

/** @type {Record<string, StatsConfig>} */
const stats = {
  endurance: {
    label: "METANTHROPES.STATS.endurance",
    characteristic: "body",
  },
  power: {
    label: "METANTHROPES.STATS.power",
    characteristic: "body",
  },
  reflexes: {
		label: "METANTHROPES.STATS.reflexes",
		characteristic: "body",
	},
	creativity: {
		label: "METANTHROPES.STATS.creativity",
		characteristic: "mind",
	},
	manipulation: {
		label: "METANTHROPES.STATS.manipulation",
		characteristic: "mind",
	},
	perception: {
		label: "METANTHROPES.STATS.perception",
		characteristic: "mind",
	},
	awareness: {
		label: "METANTHROPES.STATS.awareness",
		characteristic: "soul",
	},
	willpower: {
		label: "METANTHROPES.STATS.willpower",
		characteristic: "soul",
	},
	consciousness: {
		label: "METANTHROPES.STATS.consciousness",
		characteristic: "soul",
	},
}
/** @type {Record<string, StatsConfig>} */
config.stats = new ConfigObject(stats);

/* -------------------------------------------------- */

/** @type {Record<string, ClassificationConfig>} */
const classifications = {
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
};
/** @type {Record<string, ClassificationConfig>} */
config.classifications = new ConfigObject(classifications);

/* -------------------------------------------------- */

/** @type {Record<string, MetapowerConfig>} */
const metapowers = {
  "singularity-powers": {
    label: "METANTHROPES.METAPOWER.singularity-powers",
    group: "hammer"
  },
  "meta-ingenuity": {
    label: "METANTHROPES.METAPOWER.meta-ingenuity",
    group: "animator"
  },
  "mind-control": {
    label: "METANTHROPES.METAPOWER.mind-control",
    group: "manipulator"
  },
  "meta-hearing": {
    label: "METANTHROPES.METAPOWER.meta-hearing",
    group: "clairvoyant"
  },
  "animate-objects": {
    label: "METANTHROPES.METAPOWER.animate-objects",
    group: "animator"
  },
  "control-dark-matter": {
    label: "METANTHROPES.METAPOWER.control-dark-matter",
    group: "controller"
  },
  "meta-willpower": {
    label: "METANTHROPES.METAPOWER.meta-willpower",
    group: "aegis"
  },
  "pheromone-manipulation": {
    label: "METANTHROPES.METAPOWER.pheromone-manipulation",
    group: "manipulator"
  },
  "meta-taste": {
    label: "METANTHROPES.METAPOWER.meta-taste",
    group: "clairvoyant"
  },
  "control-earth": {
    label: "METANTHROPES.METAPOWER.control-earth",
    group: "controller"
  },
  "augment-metapower": {
    label: "METANTHROPES.METAPOWER.augment-metapower",
    group: "arbiter"
  },
  "electrokinesis": {
    label: "METANTHROPES.METAPOWER.electrokinesis",
    group: "kineticist"
  },
  "technopathy": {
    label: "METANTHROPES.METAPOWER.technopathy",
    group: "animator"
  },
  "order-bending": {
    label: "METANTHROPES.METAPOWER.order-bending",
    group: "arbiter"
  },
  "reanimation": {
    label: "METANTHROPES.METAPOWER.reanimation",
    group: "animator"
  },
  "adaptive-imitation": {
    label: "METANTHROPES.METAPOWER.adaptive-imitation",
    group: "aegis"
  },
  "memory-manipulation": {
    label: "METANTHROPES.METAPOWER.memory-manipulation",
    group: "manipulator"
  },
  "mind-swap": {
    label: "METANTHROPES.METAPOWER.mind-swap",
    group: "manipulator"
  },
  "negate-metapower": {
    label: "METANTHROPES.METAPOWER.negate-metapower",
    group: "arbiter"
  },
  "random-metapower": {
    label: "METANTHROPES.METAPOWER.random-metapower",
    group: "utilitarian"
  },
  "meta-smell": {
    label: "METANTHROPES.METAPOWER.meta-smell",
    group: "clairvoyant"
  },
  "hypnotic-manipulation": {
    label: "METANTHROPES.METAPOWER.hypnotic-manipulation",
    group: "manipulator"
  },
  "inner-dimension": {
    label: "METANTHROPES.METAPOWER.inner-dimension",
    group: "cosmonaut"
  },
  "portal-projection": {
    label: "METANTHROPES.METAPOWER.portal-projection",
    group: "cosmonaut"
  },
  "meta-strength": {
    label: "METANTHROPES.METAPOWER.meta-strength",
    group: "hammer"
  },
  "chaos-bending": {
    label: "METANTHROPES.METAPOWER.chaos-bending",
    group: "arbiter"
  },
  "solar-imitation": {
    label: "METANTHROPES.METAPOWER.solar-imitation",
    group: "aegis"
  },
  "6th-sense": {
    label: "METANTHROPES.METAPOWER.6th-sense",
    group: "clairvoyant"
  },
  "substance-imitation": {
    label: "METANTHROPES.METAPOWER.substance-imitation",
    group: "aegis"
  },
  "illusion-manipulation": {
    label: "METANTHROPES.METAPOWER.illusion-manipulation",
    group: "manipulator"
  },
  "immortality": {
    label: "METANTHROPES.METAPOWER.immortality",
    group: "utilitarian"
  },
  "lunar-connection": {
    label: "METANTHROPES.METAPOWER.lunar-connection",
    group: "utilitarian"
  },
  "alter-sound": {
    label: "METANTHROPES.METAPOWER.alter-sound",
    group: "utilitarian"
  },
  "life-restoration": {
    label: "METANTHROPES.METAPOWER.life-restoration",
    group: "aegis"
  },
  "biomorphic-powers": {
    label: "METANTHROPES.METAPOWER.biomorphic-powers",
    group: "hammer"
  },
  "weaken-metapower": {
    label: "METANTHROPES.METAPOWER.weaken-metapower",
    group: "arbiter"
  },
  "shapeshift": {
    label: "METANTHROPES.METAPOWER.shapeshift",
    group: "utilitarian"
  },
  "transfer-metapower": {
    label: "METANTHROPES.METAPOWER.transfer-metapower",
    group: "arbiter"
  },
  "detect-matter": {
    label: "METANTHROPES.METAPOWER.detect-matter",
    group: "clairvoyant"
  },
  "control-kinetic-energy": {
    label: "METANTHROPES.METAPOWER.control-kinetic-energy",
    group: "controller"
  },
  "control-magnetism": {
    label: "METANTHROPES.METAPOWER.control-magnetism",
    group: "controller"
  },
  "meta-empathy": {
    label: "METANTHROPES.METAPOWER.meta-empathy",
    group: "manipulator"
  },
  "intangibility": {
    label: "METANTHROPES.METAPOWER.intangibility",
    group: "aegis"
  },
  "dark-energy-projection": {
    label: "METANTHROPES.METAPOWER.dark-energy-projection",
    group: "cosmonaut"
  },
  "quantum-projection": {
    label: "METANTHROPES.METAPOWER.quantum-projection",
    group: "cosmonaut"
  },
  "nether-projection": {
    label: "METANTHROPES.METAPOWER.nether-projection",
    group: "cosmonaut"
  },
  "meta-charisma": {
    label: "METANTHROPES.METAPOWER.meta-charisma",
    group: "manipulator"
  },
  "duplicate-self": {
    label: "METANTHROPES.METAPOWER.duplicate-self",
    group: "animator"
  },
  "craft-toxin": {
    label: "METANTHROPES.METAPOWER.craft-toxin",
    group: "animator"
  },
  "mirror-metapower": {
    label: "METANTHROPES.METAPOWER.mirror-metapower",
    group: "arbiter"
  },
  "retrocognition": {
    label: "METANTHROPES.METAPOWER.retrocognition",
    group: "clairvoyant"
  },
  "seismokinesis": {
    label: "METANTHROPES.METAPOWER.seismokinesis",
    group: "kineticist"
  },
  "radiokinesis": {
    label: "METANTHROPES.METAPOWER.radiokinesis",
    group: "kineticist"
  },
  "animate-plants": {
    label: "METANTHROPES.METAPOWER.animate-plants",
    group: "animator"
  },
  "thermal-powers": {
    label: "METANTHROPES.METAPOWER.thermal-powers",
    group: "hammer"
  },
  "elasticity": {
    label: "METANTHROPES.METAPOWER.elasticity",
    group: "hammer"
  },
  "meta-touch": {
    label: "METANTHROPES.METAPOWER.meta-touch",
    group: "utilitarian"
  },
  "telepathy": {
    label: "METANTHROPES.METAPOWER.telepathy",
    group: "manipulator"
  },
  "antikinesis": {
    label: "METANTHROPES.METAPOWER.antikinesis",
    group: "kineticist"
  },
  "control-weather": {
    label: "METANTHROPES.METAPOWER.control-weather",
    group: "controller"
  },
  "aerokinesis": {
    label: "METANTHROPES.METAPOWER.aerokinesis",
    group: "kineticist"
  },
  "craft-disease": {
    label: "METANTHROPES.METAPOWER.craft-disease",
    group: "animator"
  },
  "teleport": {
    label: "METANTHROPES.METAPOWER.teleport",
    group: "cosmonaut"
  },
  "precognition": {
    label: "METANTHROPES.METAPOWER.precognition",
    group: "clairvoyant"
  },
  "duplicate-objects": {
    label: "METANTHROPES.METAPOWER.duplicate-objects",
    group: "animator"
  },
  "invulnerability": {
    label: "METANTHROPES.METAPOWER.invulnerability",
    group: "aegis"
  },
  "astral-projection": {
    label: "METANTHROPES.METAPOWER.astral-projection",
    group: "cosmonaut"
  },
  "alter-energy": {
    label: "METANTHROPES.METAPOWER.alter-energy",
    group: "utilitarian"
  },
  "spirit-manipulation": {
    label: "METANTHROPES.METAPOWER.spirit-manipulation",
    group: "manipulator"
  },
  "luck-bending": {
    label: "METANTHROPES.METAPOWER.luck-bending",
    group: "arbiter"
  },
  "substance-generation": {
    label: "METANTHROPES.METAPOWER.substance-generation",
    group: "controller"
  },
  "hydrokinesis": {
    label: "METANTHROPES.METAPOWER.hydrokinesis",
    group: "kineticist"
  },
  "control-density": {
    label: "METANTHROPES.METAPOWER.control-density",
    group: "controller"
  },
  "control-gravity": {
    label: "METANTHROPES.METAPOWER.control-gravity",
    group: "controller"
  },
  "acidokinesis": {
    label: "METANTHROPES.METAPOWER.acidokinesis",
    group: "kineticist"
  },
  "meta-evocation": {
    label: "METANTHROPES.METAPOWER.meta-evocation",
    group: "utilitarian"
  },
  "detect-metapower": {
    label: "METANTHROPES.METAPOWER.detect-metapower",
    group: "clairvoyant"
  },
  "zoopathy": {
    label: "METANTHROPES.METAPOWER.zoopathy",
    group: "animator"
  },
  "control-matter": {
    label: "METANTHROPES.METAPOWER.control-matter",
    group: "controller"
  },
  "meta-speed": {
    label: "METANTHROPES.METAPOWER.meta-speed",
    group: "hammer"
  },
  "telekinesis": {
    label: "METANTHROPES.METAPOWER.telekinesis",
    group: "kineticist"
  },
  "forcefield-generation": {
    label: "METANTHROPES.METAPOWER.forcefield-generation",
    group: "controller"
  },
  "meta-intelligence": {
    label: "METANTHROPES.METAPOWER.meta-intelligence",
    group: "utilitarian"
  },
  "atomokinesis": {
    label: "METANTHROPES.METAPOWER.atomokinesis",
    group: "kineticist"
  },
  "aether-projection": {
    label: "METANTHROPES.METAPOWER.aether-projection",
    group: "cosmonaut"
  },
  "planetary-powers": {
    label: "METANTHROPES.METAPOWER.planetary-powers",
    group: "hammer"
  },
  "invisibility": {
    label: "METANTHROPES.METAPOWER.invisibility",
    group: "aegis"
  },
  "time-bending": {
    label: "METANTHROPES.METAPOWER.time-bending",
    group: "arbiter"
  },
  "flight": {
    label: "METANTHROPES.METAPOWER.flight",
    group: "cosmonaut"
  },
  "ancestral-connection": {
    label: "METANTHROPES.METAPOWER.ancestral-connection",
    group: "utilitarian"
  },
  "animal-powers": {
    label: "METANTHROPES.METAPOWER.animal-powers",
    group: "hammer"
  },
  "meta-cognition": {
    label: "METANTHROPES.METAPOWER.meta-cognition",
    group: "clairvoyant"
  },
  "pyrokinesis": {
    label: "METANTHROPES.METAPOWER.pyrokinesis",
    group: "kineticist"
  },
  "meta-reflexes": {
    label: "METANTHROPES.METAPOWER.meta-reflexes",
    group: "hammer"
  },
  "meta-vision": {
    label: "METANTHROPES.METAPOWER.meta-vision",
    group: "clairvoyant"
  },
  "light-projection": {
    label: "METANTHROPES.METAPOWER.light-projection",
    group: "cosmonaut"
  },
  "warp-reality": {
    label: "METANTHROPES.METAPOWER.warp-reality",
    group: "arbiter"
  },
  "meta-constitution": {
    label: "METANTHROPES.METAPOWER.meta-constitution",
    group: "aegis"
  },
  "sizeshift": {
    label: "METANTHROPES.METAPOWER.sizeshift",
    group: "hammer"
  },
  "regeneration": {
    label: "METANTHROPES.METAPOWER.regeneration",
    group: "aegis"
  }
}
/** @type {Record<string, MetapowerConfig>} */
config.metapowers = new ConfigObject(metapowers);

/* -------------------------------------------------- */

export default config;
