////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the Actor document for the Metanthropes RPG System for FoundryVTT.
//? This controls how Actors are created and what they can do.
//todo: Enable basic functionality
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
	// trying to set default actor token stuff
	async _preCreate(data, options, user) {
		await super._preCreate(data, options, user);
		let createData = {};
		let defaultToken = game.settings.get("core", "defaultToken");
		// Configure Display Bars & Name Visibility
		if (!data.prototypeToken)
			mergeObject(createData, {
				"prototypeToken.bar1": { attribute: "system.Vital.Life.Value" },
				"prototypeToken.bar2": { attribute: "system.Vital.Destiny.Value" },
				"prototypeToken.displayName": defaultToken?.displayName || CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER, // Default display name to be on owner hover
				"prototypeToken.displayBars": defaultToken?.displayBars || CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER, // Default display bars to be on owner hover
				"prototypeToken.disposition": defaultToken?.disposition || CONST.TOKEN_DISPOSITIONS.NEUTRAL, // Default disposition to neutral
				"prototypeToken.name": data.name, // Set token name to actor name
			});
		else if (data.prototypeToken) createData.prototypeToken = data.prototypeToken;

		// Set custom default tokens
		if (!data.img || data.img == "icons/svg/mystery-man.svg") {
			createData.img = "systems/metanthrope-system/artwork/tokens/token-utilitarian.webp";
			if (data.type == "Vehicle") createData.img = "systems/metanthrope-system/artwork/tokens/token-aegis.webp";
		}

		// Default characters to HasVision = true and Link Data = true
		if (data.type == "MetaTherion") {
			if (!createData.prototypeToken) createData.prototypeToken = {}; // Fix for Token Attacher / CF Import

			createData.prototypeToken.sight = { enabled: true };
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
		// removed all processing from prepareBaseData to see if it affects the bug
		// const actorData = this;
		// using one function for all types of actors without any characteristics or stats in prepareBaseData
		// this._prepareBaseNonCharacteristicsData(actorData);
		//this._prepareBaseHumanoidData(actorData);
		//this._prepareBaseMetanthropeData(actorData);
		//this._prepareBaseProtagonistData(actorData);
		//this._prepareBaseMetaTherionData(actorData);
		//this._prepareBaseAnimalData(actorData);
		//this._prepareBaseArtificialData(actorData);
		//this._prepareBaseAnimatedObjectData(actorData);
		//this._prepareBaseAnimatedHumanoidData(actorData);
		//this._prepareBaseVehicleData(actorData);
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
	//	_prepareBaseHumanoidData(actorData) {
	//		if (actorData.type !== 'Humanoid') return;
	//		const systemData = actorData.system;
	//		const flags = actorData.flags.metanthropes || {};
	//		console.log("========================================================================");
	//		console.log("Metanthropes RPG Reading Starting Values for", this.type, "Actor:", this.name);
	//		console.log("========================================================================");
	//	}
	//	_prepareBaseMetanthropeData(actorData) {
	//		if (actorData.type !== 'Metanthrope') return;
	//		const systemData = actorData.system;
	//		const flags = actorData.flags.metanthropes || {};
	//		console.log("========================================================================");
	//		console.log("Metanthropes RPG Reading Starting Values for", this.type, "Actor:", this.name);
	//		console.log("========================================================================");
	//	}
	//	_prepareBaseProtagonistData(actorData) {
	//		if (actorData.type !== 'Protagonist') return;
	//		const systemData = actorData.system;
	//		const flags = actorData.flags.metanthropes || {};
	//		console.log("========================================================================");
	//		console.log("Metanthropes RPG Reading Starting Values for", this.type, "Actor:", this.name);
	//		console.log("========================================================================");
	//	}
	//	_prepareBaseMetaTherionData(actorData) {
	//		if (actorData.type !== 'MetaTherion') return;
	//		const systemData = actorData.system;
	//		const flags = actorData.flags.metanthropes || {};
	//		console.log("========================================================================");
	//		console.log("Metanthropes RPG Reading Starting Values for", this.type, "Actor:", this.name);
	//		console.log("========================================================================");
	//	}
	//	_prepareBaseAnimalData(actorData) {
	//		if (actorData.type !== 'Animal') return;
	//		const systemData = actorData.system;
	//		const flags = actorData.flags.metanthropes || {};
	//		console.log("========================================================================");
	//		console.log("Metanthropes RPG Reading Starting Values for", this.type, "Actor:", this.name);
	//		console.log("========================================================================");
	//	}
	//	_prepareBaseArtificialData(actorData) {
	//		if (actorData.type !== 'Artificial') return;
	//		const systemData = actorData.system;
	//		const flags = actorData.flags.metanthropes || {};
	//		console.log("========================================================================");
	//		console.log("Metanthropes RPG Reading Starting Values for", this.type, "Actor:", this.name);
	//		console.log("========================================================================");
	//	}
	//	_prepareBaseAnimatedObjectData(actorData) {
	//	if (actorData.type !== 'Animated-Object') return;
	//	const systemData = actorData.system;
	//	const flags = actorData.flags.metanthropes || {};
	//	console.log("========================================================================");
	//	console.log("Metanthropes RPG Reading Starting Values for", this.type, "Actor:", this.name);
	//	console.log("========================================================================");
	//	}
	//	_prepareBaseAnimatedHumanoidData(actorData) {
	//		if (actorData.type !== 'Animated-Humanoid') return;
	//		const systemData = actorData.system;
	//		const flags = actorData.flags.metanthropes || {};
	//		console.log("========================================================================");
	//		console.log("Metanthropes RPG Reading Starting Values for", this.type, "Actor:", this.name);
	//		console.log("========================================================================");
	//	}
	//_prepareBaseVehicleData(actorData) {
	//	if (actorData.type !== 'Vehicle') return;
	//	const systemData = actorData.system;
	//	const flags = actorData.flags.metanthropes || {};
	//	console.log("========================================================================");
	//	console.log("Metanthropes RPG Reading Starting Values for", this.type, "Actor:", this.name);
	//	console.log("========================================================================");
	//}
	//
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
			(systemData.Vital.Life.Max =
				Number(systemData.Vital.Life.Initial) + Number(systemData.Characteristics.Body.Stats.Endurance.Roll))
		);
		console.log("Metanthropes RPG New Life Maximum:", systemData.Vital.Life.Max);
		console.log("=============================================================================================");
		console.log("Metanthropes RPG", this.type, "-", this.name, "is ready for Action!");
		console.log("=============================================================================================");

		//	console.log("========================================================================");
		//	console.log("Metanthropes RPG Calculating Characteristics: Base + Buffs - Conditions");
		//	console.log("========================================================================");
		//	//body
		//	const bodyBuffs = systemData.characteristics.body.buffs.hardened.value * 5;
		//	const bodyConditions = systemData.characteristics.body.conditions.burned.value * 5;
		//	const bodyTotal = bodyBase + bodyBuffs - bodyConditions;
		//	console.log("Body Buffs", bodyBuffs);
		//	console.log("Body Conditions", bodyConditions);
		//	console.log("Body Total", bodyTotal);
		//	//mind
		//	const mindBuffs = systemData.characteristics.mind.buffs.sharpened.value * 5;
		//	const mindConditions = systemData.characteristics.mind.conditions.disconnected.value * 5;
		//	const mindTotal = mindBase + mindBuffs - mindConditions;
		//	console.log("Mind Buffs", mindBuffs);
		//	console.log("Mind Conditions", mindConditions);
		//	console.log("Mind Total", mindTotal);
		//	//soul
		//	const soulBuffs = systemData.characteristics.soul.buffs.enlightened.value * 5;
		//	const soulConditions = systemData.characteristics.soul.conditions.tormented.value * 5;
		//	const soulTotal = soulBase + soulBuffs - soulConditions;
		//	console.log("Soul Buffs", soulBuffs);
		//	console.log("Soul Conditions", soulConditions);
		//	console.log("Soul Total", soulTotal);
		//	console.log("========================================================================");
		//	console.log("Metanthropes RPG Calculating Current Stats: Base + Buffs - Conditions");
		//	console.log("========================================================================");
		//	//bodystats
		//endurance
		//	const enduranceBuffs = systemData.characteristics.body.stats.endurance.buffs.fortified.value * 5;
		//	const enduranceConditions = systemData.characteristics.body.stats.endurance.conditions.boneinjury.value * 5;
		//	const enduranceCurrent = enduranceBase + enduranceBuffs - enduranceConditions;
		//	console.log("Endurance Buffs", enduranceBuffs);
		//	console.log("Endurance Conditions", enduranceConditions);
		//	console.log("Endurance Current", enduranceCurrent);
		//	//power
		//	const powerBuffs = systemData.characteristics.body.stats.power.buffs.empowered.value * 5;
		//	const powerConditions = systemData.characteristics.body.stats.power.conditions.muscleinjury.value * 5;
		//	const powerCurrent = powerBase + powerBuffs - powerConditions;
		//	console.log("Power Buffs", powerBuffs);
		//	console.log("Power Conditions", powerConditions);
		//	console.log("Power Current", powerCurrent);
		//	//reflexes
		//	const reflexesBuffs = systemData.characteristics.body.stats.reflexes.buffs.hastened.value * 5;
		//	const reflexesConditions = systemData.characteristics.body.stats.reflexes.conditions.skininjury.value * 5;
		//	const reflexesCurrent = reflexesBase + reflexesBuffs - reflexesConditions;
		//	console.log("Reflexes Buffs", reflexesBuffs);
		//	console.log("Reflexes Conditions", reflexesConditions);
		//	console.log("Reflexes Current", reflexesCurrent);
		//	console.log("------------------------------------------------------------------------------------");
		//	//mindstats
		//	//perception
		//	const perceptionBuffs = systemData.characteristics.mind.stats.perception.buffs.alerted.value * 5;
		//	const perceptionConditions = systemData.characteristics.mind.stats.perception.conditions.disoriented.value * 5;
		//	const perceptionCurrent = perceptionBase + perceptionBuffs - perceptionConditions;
		//	console.log("Perception Buffs", perceptionBuffs);
		//	console.log("Perception Conditions", perceptionConditions);
		//	console.log("Perception Current", perceptionCurrent);
		//	//manipulation
		//	const manipulationBuffs = systemData.characteristics.mind.stats.manipulation.buffs.articulated.value * 5;
		//	const manipulationConditions = systemData.characteristics.mind.stats.manipulation.conditions.confused.value * 5;
		//	const manipulationCurrent = manipulationBase + manipulationBuffs - manipulationConditions;
		//	console.log("Manipulation Buffs", manipulationBuffs);
		//	console.log("Manipulation Conditions", manipulationConditions);
		//	console.log("Manipulation Current", manipulationCurrent);
		//	//creativity
		//	const creativityBuffs = systemData.characteristics.mind.stats.creativity.buffs.inspired.value * 5;
		//	const creativityConditions = systemData.characteristics.mind.stats.creativity.conditions.wobbly.value * 5;
		//	const creativityCurrent = creativityBase + creativityBuffs - creativityConditions;
		//	console.log("Creativity Buffs", creativityBuffs);
		//	console.log("Creativity Conditions", creativityConditions);
		//	console.log("Creativity Current", creativityCurrent);
		//	console.log("------------------------------------------------------------------------------------");
		//	//soulstats
		//	//willpower
		//	//	const willpowerBuffs = systemData.characteristics.soul.stats.willpower.buffs.determined.value * 5;
		//	const willpowerConditions = systemData.characteristics.soul.stats.willpower.conditions.terrorized.value * 5;
		//	const willpowerCurrent = willpowerBase + willpowerBuffs - willpowerConditions;
		//	console.log("Willpower Buffs", willpowerBuffs);
		//	console.log("Willpower Conditions", willpowerConditions);
		//	console.log("Willpower Current", willpowerCurrent);
		//	//consciousness
		//	const consciousnessBuffs = systemData.characteristics.soul.stats.consciousness.buffs.awakened.value * 5;
		//	const consciousnessConditions =
		//		systemData.characteristics.soul.stats.consciousness.conditions.demented.value * 5;
		//	const consciousnessCurrent = consciousnessBase + consciousnessBuffs - consciousnessConditions;
		//	console.log("Consciousness Buffs", consciousnessBuffs);
		//	console.log("Consciousness Conditions", consciousnessConditions);
		//	console.log("Consciousness Current", consciousnessCurrent);
		//	//awareness
		//	const awarenessBuffs = systemData.characteristics.soul.stats.awareness.buffs.focused.value * 5;
		//	const awarenessConditions = systemData.characteristics.soul.stats.awareness.conditions.bewildered.value * 5;
		//	const awarenessCurrent = awarenessBase + awarenessBuffs - awarenessConditions;
		//	console.log("Awareness Buffs", awarenessBuffs);
		//	console.log("Awareness Conditions", awarenessConditions);
		//	console.log("Awareness Current", awarenessCurrent);
		//	console.log("========================================================================");
		//	console.log("Metanthropes RPG Finalizing Stats for Rolls: Current + Characteristic");
		//	console.log("========================================================================");
		//	const enduranceRoll = enduranceCurrent + bodyTotal;
		//	const powerRoll = powerCurrent + bodyTotal;
		//	const reflexesRoll = reflexesCurrent + bodyTotal;
		//	const perceptionRoll = perceptionCurrent + mindTotal;
		//	const manipulationRoll = manipulationCurrent + mindTotal;
		//	const creativityRoll = creativityCurrent + mindTotal;
		//	const willpowerRoll = willpowerCurrent + soulTotal;
		//	const consciousnessRoll = consciousnessCurrent + soulTotal;
		//	const awarenessRoll = awarenessCurrent + soulTotal;
		//	console.log("Final Endurance for Rolls:", enduranceRoll);
		//	console.log("Final Power for Rolls:", powerRoll);
		//	console.log("Final Reflexes for Rolls:", reflexesRoll);
		//	console.log("-----------------------------------------------------");
		//	console.log("Final Perception for Rolls:", perceptionRoll);
		//	console.log("Final Manipulation for Rolls:", manipulationRoll);
		//	console.log("Final Creativity for Rolls:", creativityRoll);
		//	console.log("-----------------------------------------------------");
		//	console.log("Final Willpower for Rolls:", willpowerRoll);
		//	console.log("Final Consciousness for Rolls:", consciousnessRoll);
		//	console.log("Final Awareness for Rolls:", awarenessRoll);
		//	console.log("========================================================================");
		//	console.log("Metanthropes RPG New Life Maximum: Initial Life + Current Endurance");
		//	systemData.vital.life.max = systemData.vital.life.initial + enduranceCurrent;
		//	console.log("Metanthropes RPG New Life Maximum", systemData.vital.life.max);
		//	console.log("========================================================================");
		//	console.log("Metanthropes RPG Finished Calculating Characteristics & Stats for", this.type, "-", this.name);
		//	console.log("========================================================================");
	}
	////
	/*
	//? Table of Contents
	//*
	//? 1. Extend the base Actor entity
	//? 2. Prepare Actor Characteristics and Stats Data
	//! 3. Prepare Actor Roll Data
	////
	
		getRollData() {
			const data = super.getRollData();
	
			// Prepare character roll data.
			//todo: qp preparing for template switch
			//this._prepareHumanoidRollData(data);
			//this._prepareMetanthropeRollData(data);
			this._prepareProtagonistRollData(data);
			//this._prepareMetaTherionRollData(data);
			//this._prepareAnimalRollData(data);
			//this._prepareArtificialRollData(data);
	
			//todo: I need to do the _getCharacterRollData changes below
			this._getProtagonistRollData(data);
			this._getHumanoidRollData(data);
	
			return data;
		}
		_getCharacterRollData(data) {
			if (this.type !== 'Protagonist') return;
	
			// Copy the ability scores to the top level, so that Rolls: can use
			// formulas like `@str.mod + 4`.
			//todo: qp preparing for template switch - or not? maybe this section is not needed????
			//? is this where the numbering bug is coming from?
			//! test this
			//if (data.stats) {
			//	for (let [k, v] of Object.entries(data.stats)) {
			//		data[k] = foundry.utils.deepClone(v);
			//	}
		}
		// Add level for easier access, or fall back to 0.
		// if (data.attributes.level) {
		// 	data.lvl = data.attributes.level.value ?? 0;
		// }
		_getHumanoidRollData(data) {
			if (this.type !== 'Humanoid') return;
	
			// Process additional NPC data here.
		}
	fg
	}
	*/
}
