////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the Actor document for the Metanthropes RPG System for FoundryVTT.
//? This controls how Actors are created and what they can do.
//todo: Enable Rolls
//*
////
////
//*
//? Table of Contents
//*
//! 1. Extend the base Actor entity
//? 2. Prepare Actor Characteristics and Stats Data
//? 3. Prepare Actor Roll Data
////
export class MetanthropesActor extends Actor {
	// Setting default Token configuration for all actors
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		let createData = {};
		let defaultToken = game.settings.get("core", "defaultToken");
		// Configure Display Bars & Name Visibility
		if (!data.prototypeToken)
			mergeObject(createData, {
				"prototypeToken.bar1": { attribute: "Vital.Life" },
				"prototypeToken.bar2": { attribute: "Vital.Destiny" },
				"prototypeToken.displayName": defaultToken?.displayName || CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER, // Default display name to be on owner hover
				"prototypeToken.displayBars": defaultToken?.displayBars || CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER, // Default display bars to be on owner hover
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
				createData.img = "systems/metanthropes-system/artwork/tokens/token-aegis.webp";
			if (data.type == "Metanthrope")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-arbiter.webp";
			if (data.type == "Artificial")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-controller.webp";
			if (data.type == "Human")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-clairvoyant.webp";
			if (data.type == "Humanoid")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-cosmonaut.webp";
			if (data.type == "Animated-Humanoid")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-animator.webp";
			if (data.type == "Animal")
				createData.img = "systems/metanthropes-system/artwork/tokens/token-kineticist.webp";
		}
		// Enable Vision and Link Data for all actors
		if (!createData.prototypeToken) createData.prototypeToken = {}; // Fix for Token Attacher / CF Import
		createData.prototypeToken.sight = { enabled: true };
		// Link Actor data only for Protagonists
		if (data.type == "Protagonist") {
			createData.prototypeToken.actorLink = true;
		}
		this.updateSource(createData);
	}
	////
	//*
	//? Table of Contents
	//*
	//? 1. Extend the base Actor entity
	//! 2. Prepare Actor Characteristics and Stats Data
	//? 3. Prepare Actor Roll Data
	///
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
		// I should enable this section if I need to add modifications for non-Characteristics actors
		// Currently we only care about actors with characteristics so we don't use this section
		// this._prepareBaseNonCharacteristicsData(actorData);
	}
	// Override base values for each type of actor here.
	//	_prepareBaseNonCharacteristicsData(actorData) {
	//		// the below should only work for non-charstats actors
	//		if (actorData.type == "Humanoid") return;
	//		else if (actorData.type == "Animated-Humanoid") return;
	//		else if (actorData.type == "Artificial") return;
	//		else if (actorData.type == "Metanthrope") return;
	//		else if (actorData.type == "Protagonist") return;
	//		else if (actorData.type == "Animal") return;
	//		else if (actorData.type == "MetaTherion") return;
	//		const systemData = actorData.system;
	//		const flags = actorData.flags.metanthropes || {};
	//		console.log("========================================================================");
	//		console.log("Metanthropes RPG Preparing Data for", this.type, "Actor:", this.name);
	//		console.log("========================================================================");
	//	}
	//todo: TOC
	// Override Derived values for Characteristic and Stat calculations here.
	// using one function for all types of actors with characteristics and stats in prepareDerivedData
	/** @override */
	prepareDerivedData() {
		const actorData = this;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		this._prepareDerivedCharacteristicsData(actorData);
	}
	_prepareDerivedCharacteristicsData(actorData) {
		//	we take all actors that have characteristics and prepare their data for rolling, as well as calculte max life.
		if (actorData.type == "Human") return;
		else if (actorData.type == "Animated-Object") return;
		else if (actorData.type == "Vehicle") return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("=============================================================================================");
		console.log("Metanthropes RPG Preparing Characteristics & Stats for", this.type, "-", this.name);
		console.log("=============================================================================================");
		for (const [CharKey, CharValue] of Object.entries(systemData.Characteristics)) {
			console.log("Metanthropes RPG Calculating", CharKey, "Base: Initial + Progressed");
			console.log(
				CharKey,
				"Base:",
				CharValue.Base,
				"Initial:",
				CharValue.Initial,
				"Progressed:",
				CharValue.Progressed
			);
			parseInt((CharValue.Base = Number(CharValue.Initial) + Number(Number(CharValue.Progressed) * 5)));
			console.log("Metanthropes RPG New", CharKey, "Base:", CharValue.Base);
			console.log("Metanthropes RPG Calculating", CharKey, "Buff:", CharValue.Buff.Name, CharValue.Buff.Current);
			console.log(
				"Metanthropes RPG Calculating",
				CharKey,
				"Condition:",
				CharValue.Condition.Name,
				CharValue.Condition.Current
			);
			console.log("Metanthropes RPG Calculating", CharKey, "Current: Base + Buff - Condition");
			parseInt(
				(CharValue.Current =
					Number(CharValue.Base) +
					Number(Number(CharValue.Buff.Current) * 5) -
					Number(Number(CharValue.Condition.Current) * 5))
			);
			console.log("Metanthropes RPG New", CharKey, "Current:", CharValue.Current);
			console.log("------------------------------------------------------------------------");
			for (const [StatKey, StatValue] of Object.entries(CharValue.Stats)) {
				console.log("Metanthropes RPG Calculating", StatKey, "Base: Initial + Progressed");
				console.log(
					StatKey,
					"Base:",
					StatValue.Base,
					"Initial:",
					StatValue.Initial,
					"Progressed:",
					StatValue.Progressed
				);
				parseInt((StatValue.Base = Number(StatValue.Initial) + Number(Number(StatValue.Progressed) * 5)));
				console.log("Metanthropes RPG New", StatKey, "Base:", StatValue.Base);
				console.log(
					"Metanthropes RPG Calculating",
					StatKey,
					"Buff:",
					StatValue.Buff.Name,
					StatValue.Buff.Current
				);
				console.log(
					"Metanthropes RPG Calculating",
					StatKey,
					"Condition:",
					StatValue.Condition.Name,
					StatValue.Condition.Current
				);
				console.log("Metanthropes RPG Calculating", StatKey, "Current: Base + Buff - Condition");
				parseInt(
					(StatValue.Current =
						Number(StatValue.Base) +
						Number(Number(StatValue.Buff.Current) * 5) -
						Number(Number(StatValue.Condition.Current) * 5))
				);
				console.log("Metanthropes RPG New", StatKey, "Current:", StatValue.Current);
				console.log(
					"Metanthropes RPG Calculating",
					StatKey,
					"for Rolls:",
					StatKey,
					"Current +",
					CharKey,
					"Current"
				);
				parseInt((StatValue.Roll = Number(StatValue.Current) + Number(CharValue.Current)));
				console.log("Metanthropes RPG Final", StatKey, "for Rolls:", StatValue.Roll);
				console.log(
					"============================================================================================="
				);
			}
		}
		console.log("Metanthropes RPG New Life Maximum: Initial Life + Endurance for Rolls");
		parseInt(
			(systemData.Vital.Life.max =
				Number(systemData.Vital.Life.Initial) + Number(systemData.Characteristics.Body.Stats.Endurance.Roll))
		);
		console.log("Metanthropes RPG New Life Maximum:", systemData.Vital.Life.max);
		console.log("=============================================================================================");
		console.log("Metanthropes RPG Calculating Movement");
		parseInt((systemData.physical.movement.additional = Number(systemData.physical.movement.initial)));
		parseInt((systemData.physical.movement.sprint = Number(Number(systemData.physical.movement.initial) * 5)));
		console.log(
			"Metanthropes RPG New Movement Value:",
			systemData.physical.movement.initial,
			"Additional:",
			systemData.physical.movement.additional,
			"Sprint:",
			systemData.physical.movement.sprint
		);
		console.log("=============================================================================================");
		console.log("Metanthropes RPG", this.type, "-", this.name, "is ready for Action!");
		console.log("=============================================================================================");
	}
	////
	//? Table of Contents
	//*
	//? 1. Extend the base Actor entity
	//? 2. Prepare Actor Characteristics and Stats Data
	//! 3. Prepare Actor Roll Data
	////
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
		//* this will add stats to the top level of the actor so it can be easily accessed for the macros
		if (data.Characteristics) {
			data.RollStats = {};
			for (let [charslot, charslotvalue] of Object.entries(data.Characteristics)) {
				for (let [k, v] of Object.entries(charslotvalue.Stats)) {
					data.RollStats[k] = foundry.utils.deepClone(v);
					console.log("Metanthropes RPG RollStats", k, data.RollStats[k]);
				}
			}
		}
	}
}
