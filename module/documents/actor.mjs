import { metaIsMetapowerEquipped, metaLog } from "../helpers/metahelpers.mjs";

/**
 * The base Actor definition which defines common behavior of actors within the Metanthropes system.
 *
 * @extends {Actor}
 *
 */
export class MetanthropesActor extends Actor {
	/** @override */
	//* Setting default Token configuration for all actors
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		let createData = {};
		let defaultToken = game.settings.get("core", "defaultToken");
		//? Configure Display Bars & Name Visibility
		if (!data.prototypeToken)
			mergeObject(createData, {
				"prototypeToken.bar1": { attribute: "Vital.Destiny" },
				"prototypeToken.bar2": { attribute: "Vital.Life" },
				//* values from https://foundryvtt.com/api/enums/foundry.CONST.TOKEN_DISPLAY_MODES.html
				//? this is controlled via the new actor process - the below are used as a fall-back setting
				//todo double-check how this affects the visible bars for NPCs / Protagonists & make sure it fits the desired behavior
				"prototypeToken.displayName": defaultToken?.displayName || CONST.TOKEN_DISPLAY_MODES.HOVER, //? Default display name to be on hover
				"prototypeToken.displayBars": defaultToken?.displayBars || CONST.TOKEN_DISPLAY_MODES.HOVER, //? Default display bars to be on hover
				"prototypeToken.disposition": defaultToken?.disposition || CONST.TOKEN_DISPOSITIONS.NEUTRAL, //? Default disposition to neutral
				"prototypeToken.name": data.name, //? Set token name to actor name
				"prototypeToken.texture.src": createData.img, //? Set token image to actor image
			});
		else if (data.prototypeToken) createData.prototypeToken = data.prototypeToken;
		//? Set custom default tokens portraits
		//todo Needs Refactoring - this is a mess
		if (!createData.prototypeToken.flags) createData.prototypeToken.flags = {};
		switch (data.type) {
			case "Protagonist":
				if (data.name.includes("New")) {
					createData.img = "systems/metanthropes-system/tokens/defaults/token-hammer.webp";
					createData.prototypeToken.texture.src =
						"systems/metanthropes-system/tokens/defaults/token-hammer.webp";
				}
				//? Splatter blood color for Protagonists
				createData.prototypeToken.flags.splatter = { bloodColor: "#d10000ff" };
				//? Monk's Bloodsplats blood color for Protagonists
				//todo add more settings from new module options
				createData.prototypeToken.flags["monks-bloodsplats"] = {
					"bloodsplat-colour": "#d10000ff",
					"bloodsplat-type": "",
				};
				//? Token Disposition to Friendly for Protagonists
				createData.prototypeToken.disposition = 1;
				//? Monk's Token Bar Inclusion for Protagonists
				createData.prototypeToken.flags["monks-tokenbar"] = { include: "include" };
				//? Make Name & Life/Destiny Bars visible on hover by Anyone for Protagonists
				createData.prototypeToken.displayName = 30;
				createData.prototypeToken.displayBars = 30;
				break;
			case "Metanthrope":
				if (data.name.includes("New")) {
					createData.img = "systems/metanthropes-system/tokens/defaults/token-utilitarian.webp";
					createData.prototypeToken.texture.src =
						"systems/metanthropes-system/tokens/defaults/token-utilitarian.webp";
				}
				//? Splatter blood color for Metanthropes
				createData.prototypeToken.flags.splatter = { bloodColor: "#d10000ff" };
				//? Monk's Bloodsplats blood color for Metanthropes
				//todo add more settings from new module options
				createData.prototypeToken.flags["monks-bloodsplats.bloodsplat-colour"] = "#d10000ff";
				//? Token Disposition to Neutral for Metanthropes
				createData.prototypeToken.disposition = 0;
				//? Monk's Token Bar Exclusion for Metanthropes
				createData.prototypeToken.flags["monks-tokenbar"] = { include: "exclude" };
				//? Make Name & Life/Destiny Bars visible on hover by Owner for Metanthropes
				createData.prototypeToken.displayName = 20;
				createData.prototypeToken.displayBars = 20;
				break;
			case "Human":
				if (data.name.includes("New")) {
					createData.img = "systems/metanthropes-system/tokens/defaults/token-aegis.webp";
					createData.prototypeToken.texture.src =
						"systems/metanthropes-system/tokens/defaults/token-aegis.webp";
				}
				//? Splatter blood color for Humans
				createData.prototypeToken.flags.splatter = { bloodColor: "#d10000ff" };
				//? Monk's Bloodsplats blood color for Humans
				//todo add more settings from new module options
				createData.prototypeToken.flags["monks-bloodsplats.bloodsplat-colour"] = "#d10000ff";
				//? Token Disposition to Neutral for Humans
				createData.prototypeToken.disposition = 0;
				//? Monk's Token Bar Exclusion for Humans
				createData.prototypeToken.flags["monks-tokenbar"] = { include: "exclude" };
				//? Make Name & Life/Destiny Bars visible on hover by Owner for Humans
				createData.prototypeToken.displayName = 20;
				createData.prototypeToken.displayBars = 20;
				break;
			case "Artificial":
				if (data.name.includes("New")) {
					createData.img = "systems/metanthropes-system/tokens/defaults/token-animator.webp";
					createData.prototypeToken.texture.src =
						"systems/metanthropes-system/tokens/defaults/token-animator.webp";
				}
				//? Splatter blood color for Artificials
				createData.prototypeToken.flags.splatter = { bloodColor: "#00BFFF" };
				//? Monk's Bloodsplats blood color for Artificials
				//todo add more settings from new module options
				createData.prototypeToken.flags["monks-bloodsplats.bloodsplat-colour"] = "#00BFFF";
				//? Token Disposition to Hostile for Artificials
				createData.prototypeToken.disposition = -1;
				//? Monk's Token Bar Exclusion for Artificials
				createData.prototypeToken.flags["monks-tokenbar"] = { include: "exclude" };
				//? Make Name & Life/Destiny Bars visible on hover by Owner for Artificials
				createData.prototypeToken.displayName = 20;
				createData.prototypeToken.displayBars = 20;
				break;
			case "Animal":
				if (data.name.includes("New")) {
					createData.img = "systems/metanthropes-system/tokens/defaults/token-kineticist.webp";
					createData.prototypeToken.texture.src =
						"systems/metanthropes-system/tokens/defaults/token-kineticist.webp";
				}
				//? Splatter blood color for Animals
				createData.prototypeToken.flags.splatter = { bloodColor: "#d10000ff" };
				//? Monk's Bloodsplats blood color for Animals
				//todo add more settings from new module options
				createData.prototypeToken.flags["monks-bloodsplats.bloodsplat-colour"] = "#d10000ff";
				//? Token Disposition to Neutral for Animals
				createData.prototypeToken.disposition = 0;
				//? Monk's Token Bar Exclusion for Animals
				createData.prototypeToken.flags["monks-tokenbar"] = { include: "exclude" };
				//? Make Name & Life/Destiny Bars visible on hover by Owner for Animals
				createData.prototypeToken.displayName = 20;
				createData.prototypeToken.displayBars = 20;
				break;
			case "Animated-Plant":
				if (data.name.includes("New")) {
					createData.img = "systems/metanthropes-system/tokens/defaults/token-clairvoyant.webp";
					createData.prototypeToken.texture.src =
						"systems/metanthropes-system/tokens/defaults/token-clairvoyant.webp";
				}
				//? Splatter blood color for Animated-Plants
				createData.prototypeToken.flags.splatter = { bloodColor: "#228B22" };
				//? Monk's Bloodsplats blood color for Animated-Plants
				//todo add more settings from new module options
				createData.prototypeToken.flags["monks-bloodsplats.bloodsplat-colour"] = "#228B22";
				//? Token Disposition to Neutral for Animated-Plants
				createData.prototypeToken.disposition = 0;
				//? Monk's Token Bar Exclusion for Animated-Plants
				createData.prototypeToken.flags["monks-tokenbar"] = { include: "exclude" };
				//? Make Name & Life/Destiny Bars visible on hover by Owner for Animated-Plants
				createData.prototypeToken.displayName = 20;
				createData.prototypeToken.displayBars = 20;
				break;
			case "Animated-Cadaver":
				if (data.name.includes("New")) {
					createData.img = "systems/metanthropes-system/tokens/defaults/token-cosmonaut.webp";
					createData.prototypeToken.texture.src =
						"systems/metanthropes-system/tokens/defaults/token-cosmonaut.webp";
				}
				//? Splatter blood color for Animated-Cadavers
				createData.prototypeToken.flags.splatter = { bloodColor: "#006400" };
				//? Monk's Bloodsplats blood color for Animated-Cadavers
				//todo add more settings from new module options
				createData.prototypeToken.flags["monks-bloodsplats.bloodsplat-colour"] = "#006400";
				//? Token Disposition to Hostile for Animated-Cadavers
				createData.prototypeToken.disposition = -1;
				//? Monk's Token Bar Exclusion for Animated-Cadavers
				createData.prototypeToken.flags["monks-tokenbar"] = { include: "exclude" };
				//? Make Name & Life/Destiny Bars visible on hover by Owner for Animated-Cadavers
				createData.prototypeToken.displayName = 20;
				createData.prototypeToken.displayBars = 20;
				break;
			case "Extraterrestrial":
				if (data.name.includes("New")) {
					createData.img = "systems/metanthropes-system/tokens/defaults/token-arbiter.webp";
					createData.prototypeToken.texture.src =
						"systems/metanthropes-system/tokens/defaults/token-arbiter.webp";
				}
				//? Splatter blood color for Extraterrestrials
				createData.prototypeToken.flags.splatter = { bloodColor: "#800080" };
				//? Monk's Bloodsplats blood color for Extraterrestrials
				//todo add more settings from new module options
				createData.prototypeToken.flags["monks-bloodsplats.bloodsplat-colour"] = "#800080";
				//? Token Disposition to Hostile for Extraterrestrials
				createData.prototypeToken.disposition = -1;
				//? Monk's Token Bar Exclusion for Extraterrestrials
				createData.prototypeToken.flags["monks-tokenbar"] = { include: "exclude" };
				//? Make Name & Life/Destiny Bars visible on hover by Owner for Extraterrestrials
				createData.prototypeToken.displayName = 20;
				createData.prototypeToken.displayBars = 20;
				break;
			case "Extradimensional":
				if (data.name.includes("New")) {
					createData.img = "systems/metanthropes-system/tokens/defaults/token-pink.webp";
					createData.prototypeToken.texture.src =
						"systems/metanthropes-system/tokens/defaults/token-pink.webp";
				}
				//? Splatter blood color for Extradimensionals
				createData.prototypeToken.flags.splatter = { bloodColor: "#FF69B4" };
				//? Monk's Bloodsplats blood color for Extradimensionals
				//todo add more settings from new module options
				createData.prototypeToken.flags["monks-bloodsplats.bloodsplat-colour"] = "#FF69B4";
				//? Token Disposition to Hostile for Extradimensionals
				createData.prototypeToken.disposition = -1;
				//? Monk's Token Bar Exclusion for Extradimensionals
				createData.prototypeToken.flags["monks-tokenbar"] = { include: "exclude" };
				//? Make Name & Life/Destiny Bars visible on hover by Owner for Extradimensionals
				createData.prototypeToken.displayName = 20;
				createData.prototypeToken.displayBars = 20;
				break;
			case "MetaTherion":
				if (data.name.includes("New")) {
					createData.img = "systems/metanthropes-system/tokens/defaults/token-manipulator.webp";
					createData.prototypeToken.texture.src =
						"systems/metanthropes-system/tokens/defaults/token-manipulator.webp";
				}
				//? Splatter blood color for MetaTherions
				createData.prototypeToken.flags.splatter = { bloodColor: "#FF1493" };
				//? Monk's Bloodsplats blood color for MetaTherions
				//todo add more settings from new module options
				createData.prototypeToken.flags["monks-bloodsplats.bloodsplat-colour"] = "#FF1493";
				//? Token Disposition to Hostile for MetaTherions
				createData.prototypeToken.disposition = -1;
				//? Monk's Token Bar Exclusion for MetaTherions
				createData.prototypeToken.flags["monks-tokenbar"] = { include: "exclude" };
				//? Make Name & Life/Destiny Bars visible on hover by Owner for MetaTherions
				createData.prototypeToken.displayName = 20;
				createData.prototypeToken.displayBars = 20;
				break;
			case "Vehicle":
				if (data.name.includes("New")) {
					createData.img = "systems/metanthropes-system/tokens/defaults/token-controller.webp";
					createData.prototypeToken.texture.src =
						"systems/metanthropes-system/tokens/defaults/token-controller.webp";
				}
				//? Splatter blood color for Vehicles
				createData.prototypeToken.flags.splatter = { bloodColor: "#808080" };
				//? Monk's Bloodsplats blood color for Vehicles
				//todo add more settings from new module options
				createData.prototypeToken.flags["monks-bloodsplats.bloodsplat-colour"] = "#808080";
				//? Token Disposition to Neutral for Vehicles
				createData.prototypeToken.disposition = 0;
				//? Monk's Token Bar Exclusion for Vehicles
				createData.prototypeToken.flags["monks-tokenbar"] = { include: "exclude" };
				//? Make Name & Life/Destiny Bars visible on hover by Owner for Vehicles
				createData.prototypeToken.displayName = 20;
				createData.prototypeToken.displayBars = 20;
				break;
			default:
				if (data.name.includes("New")) {
					createData.img = "systems/metanthropes-system/tokens/defaults/token-border.webp";
					createData.prototypeToken.texture.src =
						"systems/metanthropes-system/tokens/defaults/token-border.webp";
				}
				break;
		}
		//? Fix for Token Attacher / CF Import - from wh4e
		if (!createData.prototypeToken) createData.prototypeToken = {};
		//? Enable vision for all actors except vehicles
		if (data.type !== "Vehicle") {
			createData.prototypeToken.sight = { enabled: true };
		}
		//* We control Unique (linked/unlined) from here
		//* we can control token sizes, and along with newActor similar finishing touches,
		//* control like splatter blood color, auras, visions and perhaps even more
		//! need to revise with Actor v3 changes
		if (data.type == "Protagonist" || data.type == "Metanthrope") {
			if (!(data.name.includes("Copy") || data.name.includes("Duplicate"))) {
				//? Enable Linked Tokens for Protagonists & Metanthropes without 'Duplicate' or 'Copy' in their name
				createData.prototypeToken.actorLink = true;
				createData.prototypeToken.prependAdjective = false;
			}
		}
		//? Make the size of the token reflect a typical humanoid relative to the grid
		createData.prototypeToken.height = 1;
		createData.prototypeToken.width = 1;
		createData.prototypeToken.texture.scaleX = 0.73;
		createData.prototypeToken.texture.scaleY = 0.73;
		this.updateSource(createData);
	}
	/** @override */
	prepareData() {
		//* Prepare data for the actor. Calling the super version of this executes
		//* the following, in order: data reset (to clear active effects),
		//* prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
		//* prepareDerivedData().
		//! I should never do an update during this step, as it will cause an infinite loop
		super.prepareData();
	}
	/** @override */
	prepareBaseData() {
		//* Data modifications in this step occur before processing embedded
		//* documents or derived data.
		//? Setting Humans to have starting life of 50 instead of 100
		if (this.type === "Human") {
			this.system.Vital.Life.Initial = 50;
		}
		//? for Protagonists set the metanthropes-logo as default icon for metapower, if no metapower is selected
		if (this.hasEnterMeta) {
			if (
				!this.primeimg ||
				this.primeimg == `systems/metanthropes-system/artwork/ui/logos/metanthropes-logo.webp` ||
				this.primeimg == `systems/metanthropes-system/artwork/metanthropes-logo.webp`
			) {
				metaLog(3, "MetanthropesActor", "prepareBaseData", "Updating Prime Metapower Image for:", this.name);
				//? for Protagonists without a prime metapower defined, make it the metanthropes-logo
				if (!this.system.entermeta.primemetapower.value) {
					this.primeimg = `systems/metanthropes-system/artwork/ui/logos/metanthropes-logo.webp`;
				} else {
					//? for Protagonists with a prime metapower defined, make it their respective metapower icon
					const primemetapowerimage = this.system.entermeta.primemetapower.value;
					this.primeimg = `systems/metanthropes-system/artwork/metapowers/${primemetapowerimage}.webp`;
				}
			}
		}
	}
	/** @override */
	prepareDerivedData() {
		//* Augment the basic actor data with additional dynamic data. Typically,
		//* you'll want to handle most of your calculated/derived data in this step.
		//* Data calculated in this step should generally not exist in template.json
		//* (such as ability modifiers rather than ability scores) and should be
		//* available both inside and outside of character sheets (such as if an actor
		//* is queried and has a roll executed directly from it).
		//* This function is called after prepareBaseData() and prepareEmbeddedDocuments().
		const actorData = this;
		this._prepareDerivedCharacteristicsData(actorData);
		if (actorData.name.includes("Duplicate")) {
			this._prepareDerivedDuplicateData(actorData);
		}
		this._prepareDerivedMovementData(actorData);
		this._prepareDerivedVitalData(actorData);
		//? Check to see if this actor has been Progressed
		//todo Deprecate this after we finalize the Progression system (v0.9)
		const progressionFlag = this.getFlag("metanthropes-system", "Progression");
		const isProgressing =
			progressionFlag && progressionFlag.isProgressing !== undefined ? progressionFlag.isProgressing : false;
		if (isProgressing) {
			//? Do the progression Calculations
			this._prepareCharacteristicsProgression(actorData);
		}
		const hasProgressed =
			progressionFlag && progressionFlag.hasProgressed !== undefined ? progressionFlag.hasProgressed : false;
		if (hasProgressed) {
			metaLog(
				4,
				"MetanthropesActor",
				"_prepareDerivedCharacteristicsXPData",
				actorData.name,
				"hasProgressed:",
				hasProgressed
			);
			return;
		}
		this._prepareDerivedCharacteristicsXPData(actorData);
		this._prepareDerivedPerkXPData(actorData);
	}
	_prepareDerivedDuplicateData(actorData) {
		const systemData = actorData.system;
		//? Remove all Conditions and Buffs
		systemData.Characteristics.Body.Condition.Current = 0;
		systemData.Characteristics.Body.Buff.Current = 0;
		systemData.Characteristics.Mind.Condition.Current = 0;
		systemData.Characteristics.Mind.Buff.Current = 0;
		systemData.Characteristics.Soul.Condition.Current = 0;
		systemData.Characteristics.Soul.Buff.Current = 0;
		systemData.Characteristics.Body.Stats.Endurance.Condition.Current = 0;
		systemData.Characteristics.Body.Stats.Endurance.Buff.Current = 0;
		systemData.Characteristics.Body.Stats.Reflexes.Condition.Current = 0;
		systemData.Characteristics.Body.Stats.Reflexes.Buff.Current = 0;
		systemData.Characteristics.Body.Stats.Power.Condition.Current = 0;
		systemData.Characteristics.Body.Stats.Power.Buff.Current = 0;
		systemData.Characteristics.Mind.Stats.Creativity.Condition.Current = 0;
		systemData.Characteristics.Mind.Stats.Creativity.Buff.Current = 0;
		systemData.Characteristics.Mind.Stats.Manipulation.Condition.Current = 0;
		systemData.Characteristics.Mind.Stats.Manipulation.Buff.Current = 0;
		systemData.Characteristics.Mind.Stats.Perception.Condition.Current = 0;
		systemData.Characteristics.Mind.Stats.Perception.Buff.Current = 0;
		systemData.Characteristics.Soul.Stats.Consciousness.Condition.Current = 0;
		systemData.Characteristics.Soul.Stats.Consciousness.Buff.Current = 0;
		systemData.Characteristics.Soul.Stats.Awareness.Condition.Current = 0;
		systemData.Characteristics.Soul.Stats.Awareness.Buff.Current = 0;
		systemData.Characteristics.Soul.Stats.Willpower.Condition.Current = 0;
		systemData.Characteristics.Soul.Stats.Willpower.Buff.Current = 0;
		systemData.Characteristics.Body.CoreConditions.Asphyxiation = 0;
		systemData.Characteristics.Body.CoreConditions.Bleeding = 0;
		systemData.Characteristics.Body.CoreConditions.Diseased = 0;
		systemData.Characteristics.Body.CoreConditions.Maimed = 0;
		systemData.Characteristics.Mind.CoreConditions.Fatigue = 0;
		systemData.Characteristics.Mind.CoreConditions.Hunger = 0;
		systemData.Characteristics.Mind.CoreConditions.Pain = 0;
		systemData.Characteristics.Mind.CoreConditions["Sense-Lost"] = 0;
		systemData.Characteristics.Soul.CoreConditions.Amnesia = 0;
		systemData.Characteristics.Soul.CoreConditions.Probed = 0;
		systemData.Characteristics.Soul.CoreConditions.Infiltrated = 0;
		systemData.Characteristics.Soul.CoreConditions.Unconscious = 0;
		systemData.physical.size.Buffs.enlarged.value = 0;
		systemData.physical.size.Conditions.shrunken.value = 0;
		systemData.physical.weight.Buffs.lightened.value = 0;
		systemData.physical.weight.Conditions.encumbered.value = 0;
		systemData.physical.speed.Buffs.accelerated.value = 0;
		systemData.physical.speed.Conditions.slowed.value = 0;
	}
	_prepareDerivedCharacteristicsData(actorData) {
		if (actorData.type == "Vehicle") return;
		const systemData = actorData.system;
		let ifCharacteristicBecomesZeroPenalty;
		for (const [CharKey, CharValue] of Object.entries(systemData.Characteristics)) {
			//? reset ifCharacteristicBecomesZeroPenalty to 0
			ifCharacteristicBecomesZeroPenalty = 0;
			//? Calculate the Base score for this Characteristic (Initial + Progressed)
			parseInt((CharValue.Base = Number(CharValue.Initial) + Number(Number(CharValue.Progressed) * 5)));
			//? Calculate the Current score for this Characteristic (Base + Buff - Condition)
			parseInt(
				(CharValue.Current =
					Number(CharValue.Base) +
					Number(Number(CharValue.Buff.Current) * 5) -
					Number(Number(CharValue.Condition.Current) * 5))
			);
			//? Determine if the Characteristic has dropped to 0
			if (CharValue.Current <= 0) {
				ifCharacteristicBecomesZeroPenalty = CharValue.Current;
				CharValue.Current = 0;
				metaLog(
					1,
					"MetanthropesActor",
					"_prepareDerivedCharacteristicsData",
					this.name + "'s",
					CharKey,
					"has dropped to 0!"
				);
			}
			for (const [StatKey, StatValue] of Object.entries(CharValue.Stats)) {
				//? Calculate the Base score for this Stat (Initial + Progressed)
				parseInt((StatValue.Base = Number(StatValue.Initial) + Number(Number(StatValue.Progressed) * 5)));
				//? Calculate the Current score for this Stat (Base + Buff - Condition)
				parseInt(
					(StatValue.Current =
						Number(StatValue.Base) +
						Number(Number(StatValue.Buff.Current) * 5) -
						Number(Number(StatValue.Condition.Current) * 5))
				);
				//? Calculate the Roll score for this Stat (Current + Characteristic + ifCharacteristicBecomesZeroPenalty)
				parseInt(
					(StatValue.Roll =
						Number(StatValue.Current) +
						Number(CharValue.Current) +
						Number(ifCharacteristicBecomesZeroPenalty))
				);
				//? Determine if the Stat has dropped to 0
				if (StatValue.Roll <= 0) {
					StatValue.Roll = 0;
					metaLog(
						1,
						"MetanthropesActor",
						"_prepareDerivedCharacteristicsData",
						this.name + "'s",
						StatKey,
						"has dropped to 0!"
					);
				}
			}
		}
	}
	_prepareDerivedCharacteristicsXPData(actorData) {
		if (actorData.type == "Vehicle") return;
		const systemData = actorData.system;
		let experienceSpent = 0;
		let characteristicExperienceSpent = 0;
		let statExperienceSpent = 0;
		let progressionCount = 0;
		let ifCharacteristicBecomesZeroPenalty = 0;
		for (const [CharKey, CharValue] of Object.entries(systemData.Characteristics)) {
			//? reset ifCharacteristicBecomesZeroPenalty to 0
			ifCharacteristicBecomesZeroPenalty = 0;
			//? Calculate the progression count based on the characteristic's progressed value
			progressionCount = Number(CharValue.Progressed);
			//? Calculate the experience spent on this characteristic
			characteristicExperienceSpent = 0;
			for (let i = 0; i < progressionCount; i++) {
				characteristicExperienceSpent += Number((Number(CharValue.Initial) + Number(i * 5)) * 10);
			}
			//? Add the experience spent on this characteristic to the total experience spent, only if Progressed is >0
			if (progressionCount > 0) {
				experienceSpent += characteristicExperienceSpent;
			}
			for (const [StatKey, StatValue] of Object.entries(CharValue.Stats)) {
				//? Calculate the progression count based on the characteristic's progressed value
				progressionCount = Number(StatValue.Progressed);
				//? Calculate the experience spent on this characteristic
				statExperienceSpent = 0;
				for (let i = 0; i < progressionCount; i++) {
					statExperienceSpent += Number(
						(Number(StatValue.Initial) + Number(CharValue.Base) + Number(i * 5)) * 3
					);
				}
				//? Add the experience spent on this characteristic to the total experience spent, only if Progressed is >0
				if (progressionCount > 0) {
					experienceSpent += statExperienceSpent;
				}
			}
		}
		//? Store experienceSpent in systemData.Vital.Experience.Spent
		parseInt((systemData.Vital.Experience.Spent = Number(experienceSpent)));
		parseInt(
			(systemData.Vital.Experience.Stored = Number(
				Number(systemData.Vital.Experience.Total) -
					Number(experienceSpent) -
					Number(systemData.Vital.Experience.Manual)
			))
		);
	}
	_prepareDerivedPerkXPData(actorData) {
		if (
			actorData.type == "Vehicle" ||
			actorData.type == "Animal" ||
			actorData.type == "Animated-Plant" ||
			actorData.type == "MetaTherion"
		)
			return;
		const systemData = actorData.system;
		let startingPerks = Number(systemData.Perks.Details.Starting.value);
		let experienceAlreadySpent = Number(systemData.Vital.Experience.Spent);
		let experienceSpent = 0;
		let progressionCount = 0;
		let perkExperienceSpent = 0;
		//? Calculate the experience spent on Knowledge Perks
		for (const [KnowPerkKey, KnowPerkValue] of Object.entries(systemData.Perks.Knowledge)) {
			// Calculate the progression count based on the perk's progressed value
			progressionCount = Number(KnowPerkValue.value);
			// Calculate the experience spent based on the perks's progressed value
			perkExperienceSpent = progressionCount * 100;
			// Add the experience spent on this perk to the total experience spent
			experienceSpent += perkExperienceSpent;
			//	clog("Experience Spent to Progress", KnowPerkKey, "Perk:", perkExperienceSpent);
		}
		//? Calculate the experience spent on Skills Perks
		for (const [SkillPerkKey, SkillPerkValue] of Object.entries(systemData.Perks.Skills)) {
			//? Calculate the progression count based on the perk's progressed value
			progressionCount = Number(SkillPerkValue.value);
			//? Calculate the experience spent based on the perks's progressed value
			perkExperienceSpent = progressionCount * 100;
			//? Add the experience spent on this perk to the total experience spent
			experienceSpent += perkExperienceSpent;
			//	clog("Experience Spent to Progress", SkillPerkKey, "Perk:", perkExperienceSpent);
		}
		//? Calculate total Experience Spent Progressing Perks & Characteristics & Stats
		//? test if we have spent enough xp on the starting perks
		if (experienceSpent < startingPerks * 100) {
			// clog("Metanthropes | Actor Prep |", this.name, "has not spent enough XP on starting perks!");
			// clog("Metanthropes | Actor Prep |", this.name, "has spent", experienceSpent, "XP on perks");
			metaLog(
				2,
				"MetanthropesActor",
				"_prepareDerivedPerkXPData",
				this.name,
				"needs to spend",
				startingPerks * 100,
				"total XP on perks"
			);
		}
		//	clog("Total Experience Spent automagically for", this.name, "Perks:", experienceSpent);
		//? Update Experience Spent for Perks with exiting in systemData.Vital.Experience.Spent
		//? adding this to remove the xp calculated for spent xp on the starting perks
		parseInt(
			(systemData.Vital.Experience.Spent =
				Number(experienceSpent) + Number(experienceAlreadySpent) - Number(startingPerks * 100))
		);
		parseInt(
			(systemData.Vital.Experience.Stored = Number(
				Number(systemData.Vital.Experience.Total) -
					Number(experienceSpent) -
					Number(experienceAlreadySpent) -
					Number(systemData.Vital.Experience.Manual) +
					//? here we are adding the cost of free starting perks to the stored xp
					Number(startingPerks) * 100
			))
		);
		if (systemData.Vital.Experience.Stored < 0) {
			metaLog(
				2,
				"MetanthropesActor",
				"_prepareDerivedPerkXPData",
				"WARNING: Stored Experience is Negative for:",
				this.name
			);
			//! the below either .info or .error will cause an exception? This should also affect v0.7.xx builds
			//! ui.notifications.info(this.name + "'s Stored Experience is Negative!");
		}
	}
	_prepareDerivedMovementData(actorData) {
		//! this section needs to be updated with camelCase
		//todo when implementing vehicles, we'll have to revise how movement is calcualated, right now Vehicles don't have Characteristics and so they can't have movement either as it's tied to the Wobbly Calculation - perhaps just skip that for vehicles? We'll see exactly how, when it's time to implement Vehicles
		if (actorData.type == "Vehicle") return;
		const systemData = actorData.system;
		//? first we will calculate the current values from buffs and conditions, then we take their modifiers and calculate the movement value
		const speedinitial = Number(systemData.physical.speed.initial);
		const weightinitial = Number(systemData.physical.weight.initial);
		const sizeinitial = Number(systemData.physical.size.initial);
		const speedbuff = Number(systemData.physical.speed.Buffs.accelerated.value);
		const speedcondition = Number(systemData.physical.speed.Conditions.slowed.value);
		const weightbuff = Number(systemData.physical.weight.Buffs.lightened.value);
		const weightcondition = Number(systemData.physical.weight.Conditions.encumbered.value);
		const sizebuff = Number(systemData.physical.size.Buffs.enlarged.value);
		const sizecondition = Number(systemData.physical.size.Conditions.shrunken.value);
		const sizecurrent = sizeinitial + sizebuff - sizecondition;
		const weightcurrent = weightinitial - weightbuff + weightcondition;
		const speedcurrent = speedinitial + speedbuff - speedcondition;
		systemData.physical.size.value = sizecurrent;
		systemData.physical.weight.value = weightcurrent;
		systemData.physical.speed.value = speedcurrent;
		const speedModifiers = {
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
		};
		const weightModifiers = {
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
		};
		const sizeModifiers = {
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
		};
		//? in addition to the modifiers, Wobbly also affects final movemement value
		const wobblyModifier = Number(systemData.Characteristics.Mind.Stats.Creativity.Condition.Current);
		//? movement value is always rounded up
		const movementvalue = Math.ceil(
			speedModifiers[speedcurrent] * weightModifiers[weightcurrent] * sizeModifiers[sizecurrent] - wobblyModifier
		);
		systemData.physical.movement.value = movementvalue;
		systemData.physical.movement.additional = movementvalue;
		systemData.physical.movement.sprint = movementvalue * 5;
		metaLog(
			3,
			"MetanthropesActor",
			"_prepareDerivedMovementData",
			this.name + "'s",
			"Movement:",
			movementvalue,
			"Additional:",
			movementvalue,
			"Sprint:",
			movementvalue * 5
		);
	}
	_prepareDerivedVitalData(actorData) {
		if (actorData.type == "Vehicle") return;
		const systemData = actorData.system;
		if (!this.name.includes("Duplicate")) {
			//? Apply Max Life according to Body + Endurance
			parseInt(
				(systemData.Vital.Life.max =
					Number(systemData.Vital.Life.Initial) +
					Number(systemData.Characteristics.Body.Stats.Endurance.Roll))
			);
			//? If current Life is higher than max Life, set current Life to max Life
			if (systemData.Vital.Life.value > systemData.Vital.Life.max) {
				parseInt((systemData.Vital.Life.value = Number(systemData.Vital.Life.max)));
			}
		} else {
			//? Apply Max Life for Duplicates from the Duplicate Self Metapower Activation value
			const duplicateSelfActivated = this.getFlag("metanthropes-system", "duplicateSelf");
			//? Check if the actor has activated Duplicate Self Metapower
			if (!duplicateSelfActivated) {
				ui.notifications.error(
					this.type +
						" " +
						this.name +
						" hasn't activated Duplicate Self Metapower and should not be duplicated!"
				);
				metaLog(
					2,
					"MetanthropesActor",
					"_prepareDerivedVitalData",
					this.name,
					"hasn't activated Duplicate Self Metapower and should not be duplicated!"
				);
				return;
			} else {
				const duplicateMaxLife = Number(this.getFlag("metanthropes-system", "duplicateSelf").maxLife);
				parseInt((systemData.Vital.Life.max = duplicateMaxLife));
				const duplicateCurrentLife = systemData.Vital.Life.value;
				if (duplicateCurrentLife > duplicateMaxLife) {
					parseInt((systemData.Vital.Life.value = duplicateMaxLife));
				}
			}
		}
		metaLog(
			3,
			"MetanthropesActor",
			"_prepareDerivedVitalData",
			this.name + "'s",
			"New Life Maximum:",
			systemData.Vital.Life.max
		);
	}
	//* Calculate the Scores used in Progression
	_prepareCharacteristicsProgression(actorData) {
		if (actorData.type == "Vehicle") return;
		metaLog(3, "MetanthropesActorProgression", "_prepareCharacteristicsProgression", "actorData:", actorData);
		const systemData = actorData.system;
		for (const [CharKey, CharValue] of Object.entries(systemData.Characteristics)) {
			//? Calculate the Base score for this Characteristic (Initial + Progressed)
			parseInt(
				(CharValue.ProgressionBase = Number(CharValue.Initial) + Number(Number(CharValue.Progressed) * 5))
			);
			for (const [StatKey, StatValue] of Object.entries(CharValue.Stats)) {
				//? Calculate the Base score for this Stat (Initial + Progressed)
				parseInt(
					(StatValue.ProgressionBase = Number(StatValue.Initial) + Number(Number(StatValue.Progressed) * 5))
				);
				//? Calculate the Score used for Progression for this Stat (Base + Characteristic_Base)
				parseInt(
					(StatValue.ProgressionRoll = Number(StatValue.ProgressionBase) + Number(CharValue.ProgressionBase))
				);
			}
		}
	}
	//* Getters
	/** @override */
	getRollData() {
		if (this.type == "Vehicle") return;
		const data = super.getRollData();
		if (!data.Characteristics) {
			metaLog(2, "MetanthropesActor", "getRollData", this.name, "has no Characteristics!");
			return;
		}
		data.RollStats = {};
		for (let [char, charName] of Object.entries(data.Characteristics)) {
			for (let [stat, statName] of Object.entries(charName.Stats)) {
				data.RollStats[stat] = statName.Roll;
			}
		}
		return data;
	}
	get hasCharacteristics() {
		return Boolean(this.system.Characteristics);
	}
	get hasPerks() {
		return Boolean(this.system.Perks);
	}
	get hasEnterMeta() {
		return Boolean(this.system.entermeta && this.system.entermeta.primemetapower);
	}
	get hasPossessions() {
		return !["Animal", "MetaTherion", "Animated-Plant"].includes(this.type);
	}
	get isSynthetic() {
		return Boolean(this.system.Synthetic);
	}
	get isPremade() {
		return Boolean(this.name.includes("Premade") || this.name.includes(this.type));
	}
	get isNewActor() {
		if (this.type === "Vehicle" && this.name.includes("New Actor")) return true;
		if (!this.hasCharacteristics) return false;
		const charBody = this.system.Characteristics.Body;
		const charMind = this.system.Characteristics.Mind;
		const charSoul = this.system.Characteristics.Soul;
		const charBodyStatValues =
			charBody.Stats.Power.Initial + charBody.Stats.Reflexes.Initial + charBody.Stats.Endurance.Initial;
		const charMindStatValues =
			charMind.Stats.Creativity.Initial + charMind.Stats.Perception.Initial + charMind.Stats.Manipulation.Initial;
		const charSoulStatValues =
			charSoul.Stats.Consciousness.Initial + charSoul.Stats.Willpower.Initial + charSoul.Stats.Awareness.Initial;
		const charStatValues = charBodyStatValues + charMindStatValues + charSoulStatValues;
		return Boolean(this.name.includes("New Actor") || charStatValues <= 20);
	}
	get isDuplicate() {
		return Boolean(this.name.includes("Duplicate"));
	}
	get isHumanoid() {
		return Boolean(this.system.humanoids);
	}
	get isDuplicatingSelf() {
		if (metaIsMetapowerEquipped(this, "Duplicate Self")) {
			return Boolean(this.getFlag("metanthropes-system", "duplicateSelf"));
		} else {
			return false;
		}
	}
}
