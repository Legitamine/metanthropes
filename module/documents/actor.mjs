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
		console.log("========================================================================");
		console.log("Metanthropes RPG Preparing Characteristics & Stats for", this.type, ":", this.name);
		console.log("========================================================================");
		//manual instead of a loop cause I want to ensure the bug doesn't come from the loop itself.
		// think I figured it out, the below .base is never declared, so it can't store the value long term.
		// so maybe I'll be naming these in a way that can be easily accessed by the character sheet while I am at it.
		for (const [charName, charData] of Object.entries(systemData.characteristics)) {
			console.log(systemData.characteristics[charName].label, systemData.characteristics[charName].base.label, systemData.characteristics[charName].base.value);
			//const initialValue = charData.initial.value;
			//const progressedValue = charData.progressed.value;
			//const baseValue = initialValue + progressedValue;
			systemData.characteristics[charName].base.value = Number(charData.initial.value) + Number(charData.progressed.value);
			console.log("New", systemData.characteristics[charName].label, systemData.characteristics[charName].base.label, systemData.characteristics[charName].base.value);

			for (const [statName, statData] of Object.entries(systemData.characteristics[charName].stats)) {
				console.log(systemData.characteristics[charName].stats[statName].label, systemData.characteristics[charName].stats[statName].base.label, systemData.characteristics[charName].stats[statName].base.value);
				//const initialValue = statData.initial.value;
				//const progressedValue = statData.progressed.value;
				//const baseValue = initialValue + progressedValue;
				systemData.characteristics[charName].stats[statName].base.value = Number(statData.initial.value) + Number(statData.progressed.value);
				console.log("New", systemData.characteristics[charName].stats[statName].label, systemData.characteristics[charName].stats[statName].base.label, systemData.characteristics[charName].stats[statName].base.value);
			}
		}
		//	const bodyBase = systemData.characteristics.body.initial.value + systemData.characteristics.body.progressed.value;
		//	const mindBase = systemData.characteristics.mind.initial.value + systemData.characteristics.mind.progressed.value;
		//	const soulBase = systemData.characteristics.soul.initial.value + systemData.characteristics.soul.progressed.value;
		//	const enduranceBase = systemData.characteristics.body.stats.endurance.initial.value + systemData.characteristics.body.stats.endurance.progressed.value;
		//	const powerBase = systemData.characteristics.body.stats.power.initial.value + systemData.characteristics.body.stats.power.progressed.value;
		//	const reflexesBase = systemData.characteristics.body.stats.reflexes.initial.value + systemData.characteristics.body.stats.reflexes.progressed.value;
		//	const perceptionBase = systemData.characteristics.mind.stats.perception.initial.value + systemData.characteristics.mind.stats.perception.progressed.value;
		//	const manipulationBase = systemData.characteristics.mind.stats.manipulation.initial.value + systemData.characteristics.mind.stats.manipulation.progressed.value;
		//	const creativityBase = systemData.characteristics.mind.stats.creativity.initial.value + systemData.characteristics.mind.stats.creativity.progressed.value;
		//	const willpowerBase = systemData.characteristics.soul.stats.willpower.initial.value + systemData.characteristics.soul.stats.willpower.progressed.value;
		//	const consciousnessBase = systemData.characteristics.soul.stats.consciousness.initial.value + systemData.characteristics.soul.stats.consciousness.progressed.value;
		//	const awarenessBase = systemData.characteristics.soul.stats.awareness.initial.value + systemData.characteristics.soul.stats.awareness.progressed.value;
		//	//
		//	console.log("Metanthropes RPG Calculating Base Values: Initial + Progressed");
		//	console.log("========================================================================");
		//	console.log("Body Base", bodyBase);
		//	console.log("Mind Base", mindBase);
		//	console.log("Soul Base", soulBase);
		//	console.log("Endurance Base", enduranceBase);
		//	console.log("Power Base", powerBase);
		//	console.log("Reflexes Base", reflexesBase);
		//	console.log("Perception Base", perceptionBase);
		//	console.log("Manipulation Base", manipulationBase);
		//	console.log("Creativity Base", creativityBase);
		//	console.log("Willpower Base", willpowerBase);
		//	console.log("Consciousness Base", consciousnessBase);
		//	console.log("Awareness Base", awarenessBase);
		console.log("========================================================================");
		console.log("Metanthropes RPG Calculating Characteristics: Base + Buffs - Conditions");
		console.log("========================================================================");
		//body
		const bodyBuffs = systemData.characteristics.body.buffs.hardened.value * 5;
		const bodyConditions = systemData.characteristics.body.conditions.burned.value * 5;
		const bodyTotal = bodyBase + bodyBuffs - bodyConditions;
		console.log("Body Buffs", bodyBuffs);
		console.log("Body Conditions", bodyConditions);
		console.log("Body Total", bodyTotal);
		//mind
		const mindBuffs = systemData.characteristics.mind.buffs.sharpened.value * 5;
		const mindConditions = systemData.characteristics.mind.conditions.disconnected.value * 5;
		const mindTotal = mindBase + mindBuffs - mindConditions;
		console.log("Mind Buffs", mindBuffs);
		console.log("Mind Conditions", mindConditions);
		console.log("Mind Total", mindTotal);
		//soul
		const soulBuffs = systemData.characteristics.soul.buffs.enlightened.value * 5;
		const soulConditions = systemData.characteristics.soul.conditions.tormented.value * 5;
		const soulTotal = soulBase + soulBuffs - soulConditions;
		console.log("Soul Buffs", soulBuffs);
		console.log("Soul Conditions", soulConditions);
		console.log("Soul Total", soulTotal);
		console.log("========================================================================");
		console.log("Metanthropes RPG Calculating Current Stats: Base + Buffs - Conditions");
		console.log("========================================================================");
		//bodystats
		//endurance
		const enduranceBuffs = systemData.characteristics.body.stats.endurance.buffs.fortified.value * 5;
		const enduranceConditions = systemData.characteristics.body.stats.endurance.conditions.boneinjury.value * 5;
		const enduranceCurrent = enduranceBase + enduranceBuffs - enduranceConditions;
		console.log("Endurance Buffs", enduranceBuffs);
		console.log("Endurance Conditions", enduranceConditions);
		console.log("Endurance Current", enduranceCurrent);
		//power
		const powerBuffs = systemData.characteristics.body.stats.power.buffs.empowered.value * 5;
		const powerConditions = systemData.characteristics.body.stats.power.conditions.muscleinjury.value * 5;
		const powerCurrent = powerBase + powerBuffs - powerConditions;
		console.log("Power Buffs", powerBuffs);
		console.log("Power Conditions", powerConditions);
		console.log("Power Current", powerCurrent);
		//reflexes
		const reflexesBuffs = systemData.characteristics.body.stats.reflexes.buffs.hastened.value * 5;
		const reflexesConditions = systemData.characteristics.body.stats.reflexes.conditions.skininjury.value * 5;
		const reflexesCurrent = reflexesBase + reflexesBuffs - reflexesConditions;
		console.log("Reflexes Buffs", reflexesBuffs);
		console.log("Reflexes Conditions", reflexesConditions);
		console.log("Reflexes Current", reflexesCurrent);
		console.log("------------------------------------------------------------------------------------");
		//mindstats
		//perception
		const perceptionBuffs = systemData.characteristics.mind.stats.perception.buffs.alerted.value * 5;
		const perceptionConditions = systemData.characteristics.mind.stats.perception.conditions.disoriented.value * 5;
		const perceptionCurrent = perceptionBase + perceptionBuffs - perceptionConditions;
		console.log("Perception Buffs", perceptionBuffs);
		console.log("Perception Conditions", perceptionConditions);
		console.log("Perception Current", perceptionCurrent);
		//manipulation
		const manipulationBuffs = systemData.characteristics.mind.stats.manipulation.buffs.articulated.value * 5;
		const manipulationConditions = systemData.characteristics.mind.stats.manipulation.conditions.confused.value * 5;
		const manipulationCurrent = manipulationBase + manipulationBuffs - manipulationConditions;
		console.log("Manipulation Buffs", manipulationBuffs);
		console.log("Manipulation Conditions", manipulationConditions);
		console.log("Manipulation Current", manipulationCurrent);
		//creativity
		const creativityBuffs = systemData.characteristics.mind.stats.creativity.buffs.inspired.value * 5;
		const creativityConditions = systemData.characteristics.mind.stats.creativity.conditions.wobbly.value * 5;
		const creativityCurrent = creativityBase + creativityBuffs - creativityConditions;
		console.log("Creativity Buffs", creativityBuffs);
		console.log("Creativity Conditions", creativityConditions);
		console.log("Creativity Current", creativityCurrent);
		console.log("------------------------------------------------------------------------------------");
		//soulstats
		//willpower
		const willpowerBuffs = systemData.characteristics.soul.stats.willpower.buffs.determined.value * 5;
		const willpowerConditions = systemData.characteristics.soul.stats.willpower.conditions.terrorized.value * 5;
		const willpowerCurrent = willpowerBase + willpowerBuffs - willpowerConditions;
		console.log("Willpower Buffs", willpowerBuffs);
		console.log("Willpower Conditions", willpowerConditions);
		console.log("Willpower Current", willpowerCurrent);
		//consciousness
		const consciousnessBuffs = systemData.characteristics.soul.stats.consciousness.buffs.awakened.value * 5;
		const consciousnessConditions =
			systemData.characteristics.soul.stats.consciousness.conditions.demented.value * 5;
		const consciousnessCurrent = consciousnessBase + consciousnessBuffs - consciousnessConditions;
		console.log("Consciousness Buffs", consciousnessBuffs);
		console.log("Consciousness Conditions", consciousnessConditions);
		console.log("Consciousness Current", consciousnessCurrent);
		//awareness
		const awarenessBuffs = systemData.characteristics.soul.stats.awareness.buffs.focused.value * 5;
		const awarenessConditions = systemData.characteristics.soul.stats.awareness.conditions.bewildered.value * 5;
		const awarenessCurrent = awarenessBase + awarenessBuffs - awarenessConditions;
		console.log("Awareness Buffs", awarenessBuffs);
		console.log("Awareness Conditions", awarenessConditions);
		console.log("Awareness Current", awarenessCurrent);
		console.log("========================================================================");
		console.log("Metanthropes RPG Finalizing Stats for Rolls: Current + Characteristic");
		console.log("========================================================================");
		const enduranceRoll = enduranceCurrent + bodyTotal;
		const powerRoll = powerCurrent + bodyTotal;
		const reflexesRoll = reflexesCurrent + bodyTotal;
		const perceptionRoll = perceptionCurrent + mindTotal;
		const manipulationRoll = manipulationCurrent + mindTotal;
		const creativityRoll = creativityCurrent + mindTotal;
		const willpowerRoll = willpowerCurrent + soulTotal;
		const consciousnessRoll = consciousnessCurrent + soulTotal;
		const awarenessRoll = awarenessCurrent + soulTotal;
		console.log("Final Endurance for Rolls:", enduranceRoll);
		console.log("Final Power for Rolls:", powerRoll);
		console.log("Final Reflexes for Rolls:", reflexesRoll);
		console.log("-----------------------------------------------------");
		console.log("Final Perception for Rolls:", perceptionRoll);
		console.log("Final Manipulation for Rolls:", manipulationRoll);
		console.log("Final Creativity for Rolls:", creativityRoll);
		console.log("-----------------------------------------------------");
		console.log("Final Willpower for Rolls:", willpowerRoll);
		console.log("Final Consciousness for Rolls:", consciousnessRoll);
		console.log("Final Awareness for Rolls:", awarenessRoll);
		console.log("========================================================================");
		console.log("Metanthropes RPG New Life Maximum: Initial Life + Current Endurance");
		systemData.vital.life.max = systemData.vital.life.initial + enduranceCurrent;
		console.log("New Life Maximum", systemData.vital.life.max);
		console.log("========================================================================");
		console.log("Metanthropes RPG Finished Calculating Characteristics & Stats for", this.type, ":", this.name);
		console.log("========================================================================");
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
