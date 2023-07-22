//* This is the base class for all Actors which represent the protagonists, metanthropes, vehicles, and other entities within the world.
//! To Do: New Debug logging method
//?import MetaInitiative for combat
import { MetaInitiative } from "../helpers/metainitiative.mjs";
export class MetanthropesActor extends Actor {
	// Setting default Token configuration for all actors
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		let createData = {};
		let defaultToken = game.settings.get("core", "defaultToken");
		// Configure Display Bars & Name Visibility
		if (!data.prototypeToken)
			mergeObject(createData, {
				"prototypeToken.bar1": { attribute: "Vital.Destiny" },
				"prototypeToken.bar2": { attribute: "Vital.Life" },
				// values from https://foundryvtt.com/api/enums/foundry.CONST.TOKEN_DISPLAY_MODES.html
				"prototypeToken.displayName": defaultToken?.displayName || CONST.TOKEN_DISPLAY_MODES.NONE, // Default display name to be off
				"prototypeToken.displayBars": defaultToken?.displayBars || CONST.TOKEN_DISPLAY_MODES.HOVER, // Default display bars to be on hover
				"prototypeToken.disposition": defaultToken?.disposition || CONST.TOKEN_DISPOSITIONS.NEUTRAL, // Default disposition to neutral
				"prototypeToken.name": data.name, // Set token name to actor name
			});
		else if (data.prototypeToken) createData.prototypeToken = data.prototypeToken;
		// Set custom default tokens portraits
		if (!data.img || data.img == "icons/svg/mystery-man.svg") {
			createData.img = "systems/metanthropes-system/artwork/tokens/token-utilitarian.webp";
			if (data.type == "Vehicle") createData.img = "systems/metanthropes-system/artwork/tokens/token-hammer.webp";
			if (data.type == "MetaTherion")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-manipulator.webp";
			if (data.type == "Protagonist")
				createData.img = "systems/metanthropes-system/artwork/tokens/portraits/Select Portrait.webp";
			if (data.type == "Metanthrope")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-arbiter.webp";
			if (data.type == "Artificial")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-controller.webp";
			if (data.type == "Human")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-clairvoyant.webp";
			if (data.type == "Animated-Plant")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-pink.webp";
			if (data.type == "Animated-Cadaver")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-animator.webp";
			if (data.type == "Animal")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-kineticist.webp";
			if (data.type == "Extraterrestrial")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-aegis.webp";
			if (data.type == "Extradimensional")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-cosmonaut.webp";
		}
		//? Fix for Token Attacher / CF Import - from wh4e
		if (!createData.prototypeToken) createData.prototypeToken = {};
		//? Link Actor data and enable vision only for Protagonists
		if (data.type !== "Vehicle") {
			createData.prototypeToken.sight = { enabled: true };
			//! Adding this here so all actors have prototypeToken.actorLink = true until I figure out how to do it for tokens and not actors
			createData.prototypeToken.actorLink = true;
		}
		//	if (data.type == "Protagonist") {
		//		createData.prototypeToken.actorLink = true;
		//	}
		this.updateSource(createData);
	}
	/** @override */
	prepareData() {
		// Prepare data for the actor. Calling the super version of this executes
		// the following, in order: data reset (to clear active effects),
		// prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
		// prepareDerivedData().
		super.prepareData();
	}
	// Override base values for each type of actor here.
	prepareBaseData() {
		if (this.type == "Human") {
			//console.log("====================");
			//console.log("Metanthropes RPG Preparing Base Data for", this.type, "-", this.name);
			//console.log("Metanthropes RPG current Initial Life:", this.system.Vital.Life.Initial);
			this.system.Vital.Life.Initial = 50;
			//console.log("Metanthropes RPG New Initial Life:", this.system.Vital.Life.Initial);
			//console.log("====================");
		}
		//? for Protagonists set the metanthropes-logo as default icon for metapower, if no metapower is selected
		if (this.type == "Protagonist") {
			if (!this.primeimg || this.primeimg == "systems/metanthropes-system/artwork/.png") {
				//? for Protagonists without a prime metapower defined, make it the metanthropes-logo
				if (!this.system.entermeta.primemetapower.value) {
				this.primeimg = `systems/metanthropes-system/artwork/metapowers/Choose Prime Metapower.png`;
				} else {
				//? for Protagonists with a prime metapower defined, make it their respective metapower icon
				let primemetapowerimage = this.system.entermeta.primemetapower.value;
				this.primeimg = `systems/metanthropes-system/artwork/metapowers/${primemetapowerimage}.png`;
			}
		}
	}
		// I should enable this section if I need to add modifications for non-Characteristics actors
		// Currently we only care about actors with characteristics so we don't use this section
		// this._prepareBaseNonCharacteristicsData(actorData);
	}
	// Override Derived values for Characteristic and Stat calculations here.
	// using one function for all types of actors with characteristics and stats in prepareDerivedData
	/** @override */
	prepareDerivedData() {
		const actorData = this;
		this._prepareDerivedCharacteristicsData(actorData);
		this._prepareDerivedPerksData(actorData);
		this._prepareDerivedMovementData(actorData);
	}
	_prepareDerivedCharacteristicsData(actorData) {
		//	we take all actors that have characteristics and prepare their data for rolling, as well as calculte max life, movement and XP spent.
		if (actorData.type == "Vehicle") return;
		const systemData = actorData.system;
		//! notice here we use .metanthropes instead of metanthropes-system - I would need to review this later in this code as well
		//it should probably be metanthropes-system
		const flags = actorData.flags.metanthropes || {};
		let experienceSpent = 0;
		let characteristicExperienceSpent = 0;
		let statExperienceSpent = 0;
		let advancementCount = 0;
		let charzerofullpenalty = 0;
		console.log("====================");
		console.log("Metanthropes RPG Preparing Characteristics & Stats for", this.type, "-", this.name);
		for (const [CharKey, CharValue] of Object.entries(systemData.Characteristics)) {
			//	console.log("Metanthropes RPG Calculating", CharKey, "Base: Initial + Progressed");
			//	console.log(
			//		CharKey,
			//		"Base:",
			//		CharValue.Base,
			//		"Initial:",
			//		CharValue.Initial,
			//		"Progressed:",
			//		CharValue.Progressed
			//	);
			//? reset charzerofullpenalty to 0
			charzerofullpenalty = 0;
			//? Calculate the advancement count based on the characteristic's progressed value
			advancementCount = Number(CharValue.Progressed);
			//? Calculate the experience spent on this characteristic
			characteristicExperienceSpent = 0;
			for (let i = 0; i < advancementCount; i++) {
				characteristicExperienceSpent += Number((Number(CharValue.Initial) + Number(i * 5)) * 10);
			}
			//? Add the experience spent on this characteristic to the total experience spent, only if Progressed is >0
			if (advancementCount > 0) {
				experienceSpent += characteristicExperienceSpent;
				console.log("Experience Spent to Progress", CharKey, "Characteristic:", characteristicExperienceSpent);
			}
			parseInt((CharValue.Base = Number(CharValue.Initial) + Number(Number(CharValue.Progressed) * 5)));
			//	console.log("Metanthropes RPG New", CharKey, "Base:", CharValue.Base);
			//	console.log("Metanthropes RPG Calculating", CharKey, "Buff:", CharValue.Buff.Name, CharValue.Buff.Current);
			//	console.log(
			//		"Metanthropes RPG Calculating",
			//		CharKey,
			//		"Condition:",
			//		CharValue.Condition.Name,
			//		CharValue.Condition.Current
			//	);
			//	console.log("Metanthropes RPG Calculating", CharKey, "Current: Base + Buff - Condition");
			parseInt(
				(CharValue.Current =
					Number(CharValue.Base) +
					Number(Number(CharValue.Buff.Current) * 5) -
					Number(Number(CharValue.Condition.Current) * 5))
			);
			if (CharValue.Current <= 0) {
				charzerofullpenalty = CharValue.Current;
				CharValue.Current = 0;
				ui.notifications.error(this.name + "'s " + CharKey + " has dropped to 0!");
				console.log("Metanthropes RPG", CharKey, "has dropped to 0!");
			}
			//	console.log("Metanthropes RPG New", CharKey, "Current:", CharValue.Current);
			//	console.log("------------------------------------------------------------------------");
			for (const [StatKey, StatValue] of Object.entries(CharValue.Stats)) {
				//	console.log("Metanthropes RPG Calculating", StatKey, "Base: Initial + Progressed");
				//	console.log(
				//		StatKey,
				//		"Base:",
				//		StatValue.Base,
				//		"Initial:",
				//		StatValue.Initial,
				//		"Progressed:",
				//		StatValue.Progressed
				//	);
				//? Calculate the advancement count based on the characteristic's progressed value
				advancementCount = Number(StatValue.Progressed);
				//? Calculate the experience spent on this characteristic
				statExperienceSpent = 0;
				for (let i = 0; i < advancementCount; i++) {
					statExperienceSpent += Number(
						(Number(StatValue.Initial) + Number(CharValue.Base) + Number(i * 5)) * 3
					);
				}
				//? Add the experience spent on this characteristic to the total experience spent, only if Progressed is >0
				if (advancementCount > 0) {
					experienceSpent += statExperienceSpent;
					//console.log("Experience Spent to Progress", StatKey, "Stat:", statExperienceSpent);
				}
				parseInt((StatValue.Base = Number(StatValue.Initial) + Number(Number(StatValue.Progressed) * 5)));
				//console.log("Metanthropes RPG New", StatKey, "Base:", StatValue.Base);
				//	console.log(
				//		"Metanthropes RPG Calculating",
				//		StatKey,
				//		"Buff:",
				//		StatValue.Buff.Name,
				//		StatValue.Buff.Current
				//	);
				//	console.log(
				//		"Metanthropes RPG Calculating",
				//		StatKey,
				//		"Condition:",
				//		StatValue.Condition.Name,
				//		StatValue.Condition.Current
				//	);
				// console.log("Metanthropes RPG Calculating", StatKey, "Current: Base + Buff - Condition");
				parseInt(
					(StatValue.Current =
						Number(StatValue.Base) +
						Number(Number(StatValue.Buff.Current) * 5) -
						Number(Number(StatValue.Condition.Current) * 5))
				);
				// console.log("Metanthropes RPG New", StatKey, "Current:", StatValue.Current);
				//	console.log(
				//		"Metanthropes RPG Calculating",
				//		StatKey,
				//		"for Rolls:",
				//		StatKey,
				//		"Current +",
				//		CharKey,
				//		"Current"
				//	);
				parseInt(
					(StatValue.Roll =
						Number(StatValue.Current) + Number(CharValue.Current) + Number(charzerofullpenalty))
				);
				if (StatValue.Roll <= 0) {
					StatValue.Roll = 0;
					ui.notifications.error(this.name + "'s " + StatKey + " has dropped to 0!");
					// console.log("Metanthropes RPG", StatKey, "has dropped to 0!");
				}
				// console.log("Metanthropes RPG Final", StatKey, "for Rolls:", StatValue.Roll);
				//	console.log(
				//		"============================================================================================="
				//	);
			}
		}
		//	console.log("Metanthropes RPG New Life Maximum: Initial Life + Endurance for Rolls");
		parseInt(
			(systemData.Vital.Life.max =
				Number(systemData.Vital.Life.Initial) + Number(systemData.Characteristics.Body.Stats.Endurance.Roll))
		);
		//	console.log("Metanthropes RPG New Life Maximum:", systemData.Vital.Life.max);
		//	console.log("====================");
		//	console.log("Metanthropes RPG Calculating Movement");
		parseInt((systemData.physical.movement.additional = Number(systemData.physical.movement.initial)));
		parseInt((systemData.physical.movement.sprint = Number(Number(systemData.physical.movement.initial) * 5)));
		//! do the update await thing!!!!FFS
		//	console.log(
		//		"Metanthropes RPG New Movement Value:",
		//		systemData.physical.movement.initial,
		//		"Additional:",
		//		systemData.physical.movement.additional,
		//		"Sprint:",
		//		systemData.physical.movement.sprint
		//	);
		//? Calculate total Experience Spent Progressing Perks & Characteristics & Stats
		//	console.log(
		//		"Total Experience Spent automagically for",
		//		this.name,
		//		"Progressing Characteristics & Stats:",
		//		experienceSpent
		//	);
		//? Store experienceSpent in systemData.Vital.Experience.Spent
		parseInt((systemData.Vital.Experience.Spent = Number(experienceSpent)));
		parseInt(
			(systemData.Vital.Experience.Stored = Number(
				Number(systemData.Vital.Experience.Total) -
					Number(experienceSpent) -
					Number(systemData.Vital.Experience.Manual)
			))
		);
		//if (systemData.Vital.Experience.Stored < 0) {
		//	ui.notifications.warn(this.name + "'s Stored Experience is Negative!");
		//	console.log(
		//		"============================================================================================="
		//	);
		//	console.log("Metanthropes RPG WARNING: Stored Experience is Negative!");
		//	console.log(
		//		"============================================================================================="
		//	);
		//}
		//	console.log(this.name, "Has", systemData.Vital.Experience.Stored, "Stored Experience Remaining");
		console.log("Metanthropes RPG", this.type, "-", this.name, "is Ready to Roll!");
		console.log("====================");
	}
	_prepareDerivedPerksData(actorData) {
		if (actorData.type == "Vehicle") return;
		else if (actorData.type == "Animal") return;
		else if (actorData.type == "Animated-Plant") return;
		else if (actorData.type == "MetaTherion") return;
		const systemData = actorData.system;
		//! notice here we use .metanthropes instead of metanthropes-system - I would need to review this later in this code as well
		//! doing ^this caused an issue with all charstats for all actors to 0!
		//see similar above
		const flags = actorData.flags.metanthropes || {};
		let startingPerks = Number(systemData.Perks.Details.Starting.value);
		let experienceAlreadySpent = Number(systemData.Vital.Experience.Spent);
		let experienceSpent = 0;
		let advancementCount = 0;
		let perkExperienceSpent = 0;
		console.log("====================");
		console.log("Metanthropes RPG Preparing Perks for", this.type, "-", this.name);
		//	console.log("Experience Spent before Perks:", experienceAlreadySpent);
		//? Calculate the experience spent on Knowledge Perks
		for (const [KnowPerkKey, KnowPerkValue] of Object.entries(systemData.Perks.Knowledge)) {
			// Calculate the advancement count based on the perk's progressed value
			advancementCount = Number(KnowPerkValue.value);
			// Calculate the experience spent based on the perks's progressed value
			perkExperienceSpent = advancementCount * 100;
			// Add the experience spent on this perk to the total experience spent
			experienceSpent += perkExperienceSpent;
			//	console.log("Experience Spent to Progress", KnowPerkKey, "Perk:", perkExperienceSpent);
		}
		//? Calculate the experience spent on Skills Perks
		for (const [SkillPerkKey, SkillPerkValue] of Object.entries(systemData.Perks.Skills)) {
			//? Calculate the advancement count based on the perk's progressed value
			advancementCount = Number(SkillPerkValue.value);
			//? Calculate the experience spent based on the perks's progressed value
			perkExperienceSpent = advancementCount * 100;
			//? Add the experience spent on this perk to the total experience spent
			experienceSpent += perkExperienceSpent;
			//	console.log("Experience Spent to Progress", SkillPerkKey, "Perk:", perkExperienceSpent);
		}
		//? Calculate total Experience Spent Progressing Perks & Characteristics & Stats
		//? test if we have spent enough xp on the starting perks
		if (experienceSpent < startingPerks * 100) {
			console.log("Metanthropes RPG", this.name, "has not spent enough XP on starting perks!");
			console.log("Metanthropes RPG", this.name, "has spent", experienceSpent, "XP on perks");
			console.log("Metanthropes RPG", this.name, "needs to spend", startingPerks * 100, "total XP on perks");
		}
		//	console.log("Total Experience Spent automagically for", this.name, "Perks:", experienceSpent);
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
					Number(startingPerks * 100)
			))
		);
		if (systemData.Vital.Experience.Stored < 0) {
			ui.notifications.warn(this.name + "'s Stored Experience is Negative!");
			console.log(
				"============================================================================================="
			);
			console.log("Metanthropes RPG WARNING: Stored Experience is Negative!");
			console.log(
				"============================================================================================="
			);
		}
		//	console.log(this.name, "Has", systemData.Vital.Experience.Stored, "Stored Experience Remaining");
		console.log("Metanthropes RPG", this.type, "-", this.name, "is ready for Action!");
		console.log("====================");
	}
	_prepareDerivedMovementData(actorData) {
		const systemData = actorData.system;
		console.log("====================");
		console.log("Metanthropes RPG Preparing Movement for", this.type, "-", this.name);
		//*first we will calculate the current values from buffs and conditions, then we take their modifiers and calculate the movement value
		let speedinitial = Number(systemData.physical.speed.initial);
		let weightinitial = Number(systemData.physical.weight.initial);
		let sizeinitial = Number(systemData.physical.size.initial);
		let speedbuff = Number(systemData.physical.speed.Buffs.accelerated.value);
		let speedcondition = Number(systemData.physical.speed.Conditions.slowed.value);
		let weightbuff = Number(systemData.physical.weight.Buffs.lightened.value);
		let weightcondition = Number(systemData.physical.weight.Conditions.encumbered.value);
		let sizebuff = Number(systemData.physical.size.Buffs.enlarged.value);
		let sizecondition = Number(systemData.physical.size.Conditions.shrunken.value);
		let sizecurrent = sizeinitial + sizebuff - sizecondition;
		let weightcurrent = weightinitial - weightbuff + weightcondition;
		let speedcurrent = speedinitial + speedbuff - speedcondition;
		this.update({ "system.physical.size.value": sizecurrent });
		this.update({ "system.physical.weight.value": weightcurrent });
		this.update({ "system.physical.speed.value": speedcurrent });
		let speedModifiers = {
			"0": 0,
			"1": 0,
			"2": 0,
			"3": 0,
			"4": 0,
			"5": 1,
			"6": 2,
			"7": 4,
			"8": 6,
			"9": 8,
			"10": 10,
			"11": 20,
			"12": 50,
			"13": 100,
			"14": 250,
			"15": 500,
			"16": 1000,
			"17": 2000,
			"18": 5000,
			"19": 10000,
			"20": 20000,
		}
		let weightModifiers = {
			"0": 200,
			"1": 100,
			"2": 50,
			"3": 20,
			"4": 10,
			"5": 5,
			"6": 4,	
			"7": 3,
			"8": 2,
			"9": 1.5,
			"10": 1,
			"11": 0.8,
			"12": 0.6,
			"13": 0.4,
			"14": 0.2,
			"15": 0.1,
			"16": 0.02,
			"17": 0.01,
			"18": 0.002,
			"19": 0.001,
			"20": 0.0002,
		}
		let sizeModifiers = {
			"0": 0.0002,
			"1": 0.001,
			"2": 0.002,
			"3": 0.01,
			"4": 0.02,
			"5": 0.1,
			"6": 0.2,
			"7": 0.4,
			"8": 0.6,
			"9": 0.8,
			"10": 1,
			"11": 2,
			"12": 3,
			"13": 9,
			"14": 27,
			"15": 81,
			"16": 243,
			"17": 729,
			"18": 2187,
			"19": 6561,
			"20": 19683,
		}
		//? in addition to the modifiers, Wobbly also affects final movemement value
		let wobblyModifier = Number(systemData.Characteristics.Mind.Stats.Creativity.Condition.Current);
		//? movement value is always rounded up
		let movementvalue = Math.ceil((speedModifiers[speedcurrent] * weightModifiers[weightcurrent] * sizeModifiers[sizecurrent]) - wobblyModifier);
		this.update ({ "system.physical.movement.value": movementvalue });
		//! for some reason these updates didn't work as intented, why is that?
		this.update ({ "system.physical.movement.additional": movementvalue });
		this.update ({ "system.physical.movement.sprint": movementvalue * 5 });
		console.log ("Metanthropes RPG Movement Value:", movementvalue, "Additional:", movementvalue, "Sprint:", movementvalue * 5);
		console.log("Metanthropes RPG", this.name, "is ready to Move!");
		console.log("====================");
	}
	getRollData() {
		const data = super.getRollData();
		// Prepare character roll data.
		this._prepareCharacteristicsRollData(data);
		return data;
	}
	_prepareCharacteristicsRollData(data) {
		//? do the following in order to quickly see the actor's data structure to use in rolls
		// 	const actor = game.actors.getName("My Character Name");
		//	console.log(actor.getRollData());
		//! I don't need the below if I am going to call @Characteristics.Body.Stats. etc
		//* this will add stats used in rolls to the top level of the system.RollStats so it can be easily accessed for the macros etc
		if (data.Characteristics) {
			data.RollStats = {};
			for (let [charslot, charslotvalue] of Object.entries(data.Characteristics)) {
				for (let [k, v] of Object.entries(charslotvalue.Stats)) {
					data.RollStats[k] = v.Roll; // instead of foundry.utils.deepClone(v); that would clone the whole object
					//	console.log("Metanthropes RPG RollStats", k, data.RollStats[k]);
				}
			}
		}
	}
	//!this is not really used ever - is it?
	async _onRollInitiative(event) {
		event.preventDefault();
		// Check if the actor is in a combat
		const combatant = this.combatant;
		console.log("inside onRollInitiative", combatant);
		if (!combatant) return;

		//? Call the MetaInitiative function
		//! do I need this right? hm
		//	console.log("====================");
		//	console.log("Metanthropes RPG we are inside actor _onRollInitiative - calling MetaInitiative", this);
		//	console.log("====================");
		await MetaInitiative(this);

		// Retrieve the initiative data from the actor's flags
		const initiativeData = this.getFlag("metanthropes-system", "initiative");

		// Extract the values you need
		//! here I want to pass something to the setInititative function - I need to understand how setInitiative works
		const resultLevel = initiativeData.resultLevel;
		const initiativeValue = initiativeData.initiativeValue;

		// Set the initiative value for the combatant
		await combatant.setInitiative(initiativeValue);
	}
}
