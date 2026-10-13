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
config.metapowers = new ConfigObject({
  "acidokinesis": {
    label: "METANTHROPES.METAPOWER.acidokinesis",
    group: "kineticist"
  },
  "adaptiveImitation": {
    label: "METANTHROPES.METAPOWER.adaptiveImitation",
    group: "aegis"
  },
  "aerokinesis": {
    label: "METANTHROPES.METAPOWER.aerokinesis",
    group: "kineticist"
  },
  "aetherProjection": {
    label: "METANTHROPES.METAPOWER.aetherProjection",
    group: "cosmonaut"
  },
  "alterEnergy": {
    label: "METANTHROPES.METAPOWER.alterEnergy",
    group: "utilitarian"
  },
  "alterSound": {
    label: "METANTHROPES.METAPOWER.alterSound",
    group: "utilitarian"
  },
  "ancestralConnection": {
    label: "METANTHROPES.METAPOWER.ancestralConnection",
    group: "utilitarian"
  },
  "animalPowers": {
    label: "METANTHROPES.METAPOWER.animalPowers",
    group: "hammer"
  },
  "animateObjects": {
    label: "METANTHROPES.METAPOWER.animateObjects",
    group: "animator"
  },
  "animatePlants": {
    label: "METANTHROPES.METAPOWER.animatePlants",
    group: "animator"
  },
  "antikinesis": {
    label: "METANTHROPES.METAPOWER.antikinesis",
    group: "kineticist"
  },
  "astralProjection": {
    label: "METANTHROPES.METAPOWER.astralProjection",
    group: "cosmonaut"
  },
  "atomokinesis": {
    label: "METANTHROPES.METAPOWER.atomokinesis",
    group: "kineticist"
  },
  "augmentMetapower": {
    label: "METANTHROPES.METAPOWER.augmentMetapower",
    group: "arbiter"
  },
  "biomorphicPowers": {
    label: "METANTHROPES.METAPOWER.biomorphicPowers",
    group: "hammer"
  },
  "chaosBending": {
    label: "METANTHROPES.METAPOWER.chaosBending",
    group: "arbiter"
  },
  "controlDarkMatter": {
    label: "METANTHROPES.METAPOWER.controlDarkMatter",
    group: "controller"
  },
  "controlDensity": {
    label: "METANTHROPES.METAPOWER.controlDensity",
    group: "controller"
  },
  "controlEarth": {
    label: "METANTHROPES.METAPOWER.controlEarth",
    group: "controller"
  },
  "controlGravity": {
    label: "METANTHROPES.METAPOWER.controlGravity",
    group: "controller"
  },
  "controlKineticEnergy": {
    label: "METANTHROPES.METAPOWER.controlKineticEnergy",
    group: "controller"
  },
  "controlMagnetism": {
    label: "METANTHROPES.METAPOWER.controlMagnetism",
    group: "controller"
  },
  "controlMatter": {
    label: "METANTHROPES.METAPOWER.controlMatter",
    group: "controller"
  },
  "controlWeather": {
    label: "METANTHROPES.METAPOWER.controlWeather",
    group: "controller"
  },
  "craftDisease": {
    label: "METANTHROPES.METAPOWER.craftDisease",
    group: "animator"
  },
  "craftToxin": {
    label: "METANTHROPES.METAPOWER.craftToxin",
    group: "animator"
  },
  "darkEnergyProjection": {
    label: "METANTHROPES.METAPOWER.darkEnergyProjection",
    group: "cosmonaut"
  },
  "detectMatter": {
    label: "METANTHROPES.METAPOWER.detectMatter",
    group: "clairvoyant"
  },
  "detectMetapower": {
    label: "METANTHROPES.METAPOWER.detectMetapower",
    group: "clairvoyant"
  },
  "duplicateObjects": {
    label: "METANTHROPES.METAPOWER.duplicateObjects",
    group: "animator"
  },
  "duplicateSelf": {
    label: "METANTHROPES.METAPOWER.duplicateSelf",
    group: "animator"
  },
  "elasticity": {
    label: "METANTHROPES.METAPOWER.elasticity",
    group: "hammer"
  },
  "electrokinesis": {
    label: "METANTHROPES.METAPOWER.electrokinesis",
    group: "kineticist"
  },
  "flight": {
    label: "METANTHROPES.METAPOWER.flight",
    group: "cosmonaut"
  },
  "forcefieldGeneration": {
    label: "METANTHROPES.METAPOWER.forcefieldGeneration",
    group: "controller"
  },
  "hydrokinesis": {
    label: "METANTHROPES.METAPOWER.hydrokinesis",
    group: "kineticist"
  },
  "hypnoticManipulation": {
    label: "METANTHROPES.METAPOWER.hypnoticManipulation",
    group: "manipulator"
  },
  "illusionManipulation": {
    label: "METANTHROPES.METAPOWER.illusionManipulation",
    group: "manipulator"
  },
  "immortality": {
    label: "METANTHROPES.METAPOWER.immortality",
    group: "utilitarian"
  },
  "innerDimension": {
    label: "METANTHROPES.METAPOWER.innerDimension",
    group: "cosmonaut"
  },
  "intangibility": {
    label: "METANTHROPES.METAPOWER.intangibility",
    group: "aegis"
  },
  "invisibility": {
    label: "METANTHROPES.METAPOWER.invisibility",
    group: "aegis"
  },
  "invulnerability": {
    label: "METANTHROPES.METAPOWER.invulnerability",
    group: "aegis"
  },
  "lifeRestoration": {
    label: "METANTHROPES.METAPOWER.lifeRestoration",
    group: "aegis"
  },
  "lightProjection": {
    label: "METANTHROPES.METAPOWER.lightProjection",
    group: "cosmonaut"
  },
  "luckBending": {
    label: "METANTHROPES.METAPOWER.luckBending",
    group: "arbiter"
  },
  "lunarConnection": {
    label: "METANTHROPES.METAPOWER.lunarConnection",
    group: "utilitarian"
  },
  "memoryManipulation": {
    label: "METANTHROPES.METAPOWER.memoryManipulation",
    group: "manipulator"
  },
  "metaCharisma": {
    label: "METANTHROPES.METAPOWER.metaCharisma",
    group: "manipulator"
  },
  "metaCognition": {
    label: "METANTHROPES.METAPOWER.metaCognition",
    group: "clairvoyant"
  },
  "metaConstitution": {
    label: "METANTHROPES.METAPOWER.metaConstitution",
    group: "aegis"
  },
  "metaEmpathy": {
    label: "METANTHROPES.METAPOWER.metaEmpathy",
    group: "manipulator"
  },
  "metaEvocation": {
    label: "METANTHROPES.METAPOWER.metaEvocation",
    group: "utilitarian"
  },
  "metaHearing": {
    label: "METANTHROPES.METAPOWER.metaHearing",
    group: "clairvoyant"
  },
  "metaIngenuity": {
    label: "METANTHROPES.METAPOWER.metaIngenuity",
    group: "animator"
  },
  "metaIntelligence": {
    label: "METANTHROPES.METAPOWER.metaIntelligence",
    group: "utilitarian"
  },
  "metaReflexes": {
    label: "METANTHROPES.METAPOWER.metaReflexes",
    group: "hammer"
  },
  "metaSmell": {
    label: "METANTHROPES.METAPOWER.metaSmell",
    group: "clairvoyant"
  },
  "metaSpeed": {
    label: "METANTHROPES.METAPOWER.metaSpeed",
    group: "hammer"
  },
  "metaStrength": {
    label: "METANTHROPES.METAPOWER.metaStrength",
    group: "hammer"
  },
  "metaTaste": {
    label: "METANTHROPES.METAPOWER.metaTaste",
    group: "clairvoyant"
  },
  "metaTouch": {
    label: "METANTHROPES.METAPOWER.metaTouch",
    group: "utilitarian"
  },
  "metaVision": {
    label: "METANTHROPES.METAPOWER.metaVision",
    group: "clairvoyant"
  },
  "metaWillpower": {
    label: "METANTHROPES.METAPOWER.metaWillpower",
    group: "aegis"
  },
  "mindControl": {
    label: "METANTHROPES.METAPOWER.mindControl",
    group: "manipulator"
  },
  "mindSwap": {
    label: "METANTHROPES.METAPOWER.mindSwap",
    group: "manipulator"
  },
  "mirrorMetapower": {
    label: "METANTHROPES.METAPOWER.mirrorMetapower",
    group: "arbiter"
  },
  "negateMetapower": {
    label: "METANTHROPES.METAPOWER.negateMetapower",
    group: "arbiter"
  },
  "netherProjection": {
    label: "METANTHROPES.METAPOWER.netherProjection",
    group: "cosmonaut"
  },
  "orderBending": {
    label: "METANTHROPES.METAPOWER.orderBending",
    group: "arbiter"
  },
  "pheromoneManipulation": {
    label: "METANTHROPES.METAPOWER.pheromoneManipulation",
    group: "manipulator"
  },
  "planetaryPowers": {
    label: "METANTHROPES.METAPOWER.planetaryPowers",
    group: "hammer"
  },
  "portalProjection": {
    label: "METANTHROPES.METAPOWER.portalProjection",
    group: "cosmonaut"
  },
  "precognition": {
    label: "METANTHROPES.METAPOWER.precognition",
    group: "clairvoyant"
  },
  "pyrokinesis": {
    label: "METANTHROPES.METAPOWER.pyrokinesis",
    group: "kineticist"
  },
  "quantumProjection": {
    label: "METANTHROPES.METAPOWER.quantumProjection",
    group: "cosmonaut"
  },
  "radiokinesis": {
    label: "METANTHROPES.METAPOWER.radiokinesis",
    group: "kineticist"
  },
  "randomMetapower": {
    label: "METANTHROPES.METAPOWER.randomMetapower",
    group: "utilitarian"
  },
  "reanimation": {
    label: "METANTHROPES.METAPOWER.reanimation",
    group: "animator"
  },
  "regeneration": {
    label: "METANTHROPES.METAPOWER.regeneration",
    group: "aegis"
  },
  "retrocognition": {
    label: "METANTHROPES.METAPOWER.retrocognition",
    group: "clairvoyant"
  },
  "seismokinesis": {
    label: "METANTHROPES.METAPOWER.seismokinesis",
    group: "kineticist"
  },
  "shapeshift": {
    label: "METANTHROPES.METAPOWER.shapeshift",
    group: "utilitarian"
  },
  "singularityPowers": {
    label: "METANTHROPES.METAPOWER.singularityPowers",
    group: "hammer"
  },
  "sixthSense": {
    label: "METANTHROPES.METAPOWER.sixthSense",
    group: "clairvoyant"
  },
  "sizeshift": {
    label: "METANTHROPES.METAPOWER.sizeshift",
    group: "hammer"
  },
  "solarImitation": {
    label: "METANTHROPES.METAPOWER.solarImitation",
    group: "aegis"
  },
  "spiritManipulation": {
    label: "METANTHROPES.METAPOWER.spiritManipulation",
    group: "manipulator"
  },
  "substanceGeneration": {
    label: "METANTHROPES.METAPOWER.substanceGeneration",
    group: "controller"
  },
  "substanceImitation": {
    label: "METANTHROPES.METAPOWER.substanceImitation",
    group: "aegis"
  },
  "technopathy": {
    label: "METANTHROPES.METAPOWER.technopathy",
    group: "animator"
  },
  "telekinesis": {
    label: "METANTHROPES.METAPOWER.telekinesis",
    group: "kineticist"
  },
  "telepathy": {
    label: "METANTHROPES.METAPOWER.telepathy",
    group: "manipulator"
  },
  "teleport": {
    label: "METANTHROPES.METAPOWER.teleport",
    group: "cosmonaut"
  },
  "thermalPowers": {
    label: "METANTHROPES.METAPOWER.thermalPowers",
    group: "hammer"
  },
  "timeBending": {
    label: "METANTHROPES.METAPOWER.timeBending",
    group: "arbiter"
  },
  "transferMetapower": {
    label: "METANTHROPES.METAPOWER.transferMetapower",
    group: "arbiter"
  },
  "warpReality": {
    label: "METANTHROPES.METAPOWER.warpReality",
    group: "arbiter"
  },
  "weakenMetapower": {
    label: "METANTHROPES.METAPOWER.weakenMetapower",
    group: "arbiter"
  },
  "zoopathy": {
    label: "METANTHROPES.METAPOWER.zoopathy",
    group: "animator"
  }
});

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
