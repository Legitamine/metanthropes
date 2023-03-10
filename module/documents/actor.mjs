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
		const actorData = this;
		// using one function for all types of actors without any characteristics or stats in prepareBaseData
		this._prepareBaseNonCharacteristicsData(actorData);
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
	_prepareBaseNonCharacteristicsData(actorData) {
		if (actorData.type == 'Humanoid') return;
		else if (actorData.type == 'Animated-Humanoid') return;
		else if (actorData.type == 'Artificial') return;
		else if (actorData.type == 'Metanthrope') return;
		else if (actorData.type == 'Protagonist') return;
		else if (actorData.type == 'Animal') return;
		else if (actorData.type == 'MetaTherion') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG Preparing Data for", this.type, "Actor:", this.name);
		console.log("========================================================================");
	}
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
		this._prepareDerivedCharacteristicsData(actorData);
	}

	_prepareDerivedCharacteristicsData(actorData) {
		//	we take all actors that have characteristics and prepare their data for rolling, as well as calculte max life.
		if (actorData.type == 'Human') return;
		else if (actorData.type == 'Animated-Object') return;
		else if (actorData.type == 'Vehicle') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG Preparing Characteristics & Stats for", this.type, ":", this.name);
		console.log("========================================================================");
		for (let [key, chars] of Object.entries(systemData.characteristics)) {
			console.log('Working on', chars.label, chars.initial.label, chars.initial.value, chars.progressed.label, chars.progressed.value);
			chars.base = (chars.initial.value + chars.progressed.value);
			console.log('New', chars.label, 'BASE', chars.base);
			for (let [innerkey, statistics] of Object.entries(chars.stats)) {
				console.log('Working on', chars.label, statistics.label, statistics.initial.label, statistics.initial.value, statistics.progressed.label, statistics.progressed.value);
				statistics.base = (statistics.initial.value + statistics.progressed.value);
				console.log('New', statistics.label, 'BASE', statistics.base);
			}
		}
		console.log("========================================================================");
		console.log("Metanthropes RPG Adding Buffs and Conditions to Characteristics & Stats");
		console.log("========================================================================");
		//doing it directly instead of a for loop for faster results - cant code shit
		//body
		console.log("Body Base", systemData.characteristics.body.base);
		console.log("Body Hardened Value", systemData.characteristics.body.buffs.hardened.value);
		//todo: change the hardcoded 5 to a variable that acts as the buff multiplier - same for all the rest below
		systemData.characteristics.body.buffs.total = (systemData.characteristics.body.buffs.hardened.value * 5);
		console.log("Body Buffs Total", systemData.characteristics.body.buffs.total);
		console.log("Body Burned Value", systemData.characteristics.body.conditions.burned.value)
		systemData.characteristics.body.conditions.total = (systemData.characteristics.body.conditions.burned.value * 5);
		console.log("Body Conditions Total", systemData.characteristics.body.conditions.total);
		systemData.characteristics.body.current = (systemData.characteristics.body.base + systemData.characteristics.body.buffs.total - systemData.characteristics.body.conditions.total);
		console.log("Body Current", systemData.characteristics.body.current);
		//bodystats
		//endurance
		console.log("Endurance Base", systemData.characteristics.body.stats.endurance.base);
		console.log("Endurance Fortified Value", systemData.characteristics.body.stats.endurance.buffs.fortified.value);
		systemData.characteristics.body.stats.endurance.buffs.total = (systemData.characteristics.body.stats.endurance.buffs.fortified.value * 5);
		console.log("Endurance Buffs Total", systemData.characteristics.body.stats.endurance.buffs.total);
		console.log("Endurance Bone-Injury Value", systemData.characteristics.body.stats.endurance.conditions.boneinjury.value);
		systemData.characteristics.body.stats.endurance.conditions.total = (systemData.characteristics.body.stats.endurance.conditions.boneinjury.value * 5);
		console.log("Endurance Conditions Total", systemData.characteristics.body.stats.endurance.conditions.total);
		systemData.characteristics.body.stats.endurance.current = (systemData.characteristics.body.stats.endurance.base + systemData.characteristics.body.stats.endurance.buffs.total - systemData.characteristics.body.stats.endurance.conditions.total);
		console.log("Endurance Current", systemData.characteristics.body.stats.endurance.current);
		systemData.characteristics.body.stats.endurance.rollme = (systemData.characteristics.body.stats.endurance.current + systemData.characteristics.body.current);
		console.log("------------------------------------------------------------------------------------");
		console.log("Final Endurance for Rolls:", systemData.characteristics.body.stats.endurance.rollme);
		console.log("------------------------------------------------------------------------------------");
		console.log("------------------------------------------------------------------------------------");
		console.log("Calculating New Life Maximum based off Life Initial Value:", systemData.vital.life.initial);
		console.log("------------------------------------------------------------------------------------");
		systemData.vital.life.max = (systemData.characteristics.body.stats.endurance.current + systemData.vital.life.initial);
		console.log("------------------------------------------------------------------------------------");
		console.log("New Life Maximum Value:", systemData.vital.life.max);
		console.log("------------------------------------------------------------------------------------");
		//power
		console.log("Power Base", systemData.characteristics.body.stats.power.base);
		console.log("Power Empowered Value", systemData.characteristics.body.stats.power.buffs.empowered.value);
		systemData.characteristics.body.stats.power.buffs.total = (systemData.characteristics.body.stats.power.buffs.empowered.value * 5);
		console.log("Power Buffs Total", systemData.characteristics.body.stats.power.buffs.total);
		console.log("Power Muscle Injury Value", systemData.characteristics.body.stats.power.conditions.muscleinjury.value);
		systemData.characteristics.body.stats.power.conditions.total = (systemData.characteristics.body.stats.power.conditions.muscleinjury.value * 5);
		console.log("Power Conditions Total", systemData.characteristics.body.stats.power.conditions.total);
		systemData.characteristics.body.stats.power.current = (systemData.characteristics.body.stats.power.base + systemData.characteristics.body.stats.power.buffs.total - systemData.characteristics.body.stats.power.conditions.total);
		console.log("Power Current", systemData.characteristics.body.stats.power.current);
		systemData.characteristics.body.stats.power.rollme = (systemData.characteristics.body.stats.power.current + systemData.characteristics.body.current);
		console.log("------------------------------------------------------------------------------------");
		console.log("Final Power for Rolls:", systemData.characteristics.body.stats.power.rollme);
		console.log("------------------------------------------------------------------------------------");
		//reflexes
		console.log("Reflexes Base", systemData.characteristics.body.stats.reflexes.base);
		console.log("Reflexes Hastened Value", systemData.characteristics.body.stats.reflexes.buffs.hastened.value);
		systemData.characteristics.body.stats.reflexes.buffs.total = (systemData.characteristics.body.stats.reflexes.buffs.hastened.value * 5);
		console.log("Reflexes Buffs Total", systemData.characteristics.body.stats.reflexes.buffs.total);
		console.log("Reflexes Skin Injury Value", systemData.characteristics.body.stats.reflexes.conditions.skininjury.value);
		systemData.characteristics.body.stats.reflexes.conditions.total = (systemData.characteristics.body.stats.reflexes.conditions.skininjury.value * 5);
		console.log("Reflexes Conditions Total", systemData.characteristics.body.stats.reflexes.conditions.total);
		systemData.characteristics.body.stats.reflexes.current = (systemData.characteristics.body.stats.reflexes.base + systemData.characteristics.body.stats.reflexes.buffs.total - systemData.characteristics.body.stats.reflexes.conditions.total);
		console.log("Reflexes Current", systemData.characteristics.body.stats.reflexes.current);
		systemData.characteristics.body.stats.reflexes.rollme = (systemData.characteristics.body.stats.reflexes.current + systemData.characteristics.body.current);
		console.log("------------------------------------------------------------------------------------");
		console.log("Final Reflexes for Rolls:", systemData.characteristics.body.stats.reflexes.rollme);
		console.log("------------------------------------------------------------------------------------");
		//mind
		console.log("Mind Base", systemData.characteristics.mind.base);
		console.log("Mind Sharpened Value", systemData.characteristics.mind.buffs.sharpened.value);
		systemData.characteristics.mind.buffs.total = (systemData.characteristics.mind.buffs.sharpened.value * 5);
		console.log("Mind Buffs Total", systemData.characteristics.mind.buffs.total);
		console.log("Mind Disconnected Value", systemData.characteristics.mind.conditions.disconnected.value)
		systemData.characteristics.mind.conditions.total = (systemData.characteristics.mind.conditions.disconnected.value * 5);
		console.log("Mind Conditions Total", systemData.characteristics.mind.conditions.total);
		systemData.characteristics.mind.current = (systemData.characteristics.mind.base + systemData.characteristics.mind.buffs.total - systemData.characteristics.mind.conditions.total);
		console.log("Mind Current", systemData.characteristics.mind.current);
		//perception
		console.log("Perception Base", systemData.characteristics.mind.stats.perception.base);
		console.log("Perception Alerted	Value", systemData.characteristics.mind.stats.perception.buffs.alerted.value);
		systemData.characteristics.mind.stats.perception.buffs.total = (systemData.characteristics.mind.stats.perception.buffs.alerted.value * 5);
		console.log("Perception Buffs Total", systemData.characteristics.mind.stats.perception.buffs.total);
		console.log("Perception Disoriented Value", systemData.characteristics.mind.stats.perception.conditions.disoriented.value);
		systemData.characteristics.mind.stats.perception.conditions.total = (systemData.characteristics.mind.stats.perception.conditions.disoriented.value * 5);
		console.log("Perception Conditions Total", systemData.characteristics.mind.stats.perception.conditions.total);
		systemData.characteristics.mind.stats.perception.current = (systemData.characteristics.mind.stats.perception.base + systemData.characteristics.mind.stats.perception.buffs.total - systemData.characteristics.mind.stats.perception.conditions.total);
		console.log("Perception Current", systemData.characteristics.mind.stats.perception.current);
		systemData.characteristics.mind.stats.perception.rollme = (systemData.characteristics.mind.stats.perception.current + systemData.characteristics.mind.current);
		console.log("------------------------------------------------------------------------------------");
		console.log("Final Perception for Rolls:", systemData.characteristics.mind.stats.perception.rollme);
		console.log("------------------------------------------------------------------------------------");
		//manipulation
		console.log("Manipulation Base", systemData.characteristics.mind.stats.manipulation.base);
		console.log("Manipulation Articulated Value", systemData.characteristics.mind.stats.manipulation.buffs.articulated.value);
		systemData.characteristics.mind.stats.manipulation.buffs.total = (systemData.characteristics.mind.stats.manipulation.buffs.articulated.value * 5);
		console.log("Manipulation Buffs Total", systemData.characteristics.mind.stats.manipulation.buffs.total);
		console.log("Manipulation Confused Value", systemData.characteristics.mind.stats.manipulation.conditions.confused.value);
		systemData.characteristics.mind.stats.manipulation.conditions.total = (systemData.characteristics.mind.stats.manipulation.conditions.confused.value * 5);
		console.log("Manipulation Conditions Total", systemData.characteristics.mind.stats.manipulation.conditions.total);
		systemData.characteristics.mind.stats.manipulation.current = (systemData.characteristics.mind.stats.manipulation.base + systemData.characteristics.mind.stats.manipulation.buffs.total - systemData.characteristics.mind.stats.manipulation.conditions.total);
		console.log("Manipulation Current", systemData.characteristics.mind.stats.manipulation.current);
		systemData.characteristics.mind.stats.manipulation.rollme = (systemData.characteristics.mind.stats.manipulation.current + systemData.characteristics.mind.current);
		console.log("------------------------------------------------------------------------------------");
		console.log("Final Manipulation for Rolls:", systemData.characteristics.mind.stats.manipulation.rollme);
		console.log("------------------------------------------------------------------------------------");
		//creativity
		console.log("Creativity Base", systemData.characteristics.mind.stats.creativity.base);
		console.log("Creativity Inspired Value", systemData.characteristics.mind.stats.creativity.buffs.inspired.value);
		systemData.characteristics.mind.stats.creativity.buffs.total = (systemData.characteristics.mind.stats.creativity.buffs.inspired.value * 5);
		console.log("Creativity Buffs Total", systemData.characteristics.mind.stats.creativity.buffs.total);
		console.log("Creativity Wobbly Value", systemData.characteristics.mind.stats.creativity.conditions.wobbly.value);
		systemData.characteristics.mind.stats.creativity.conditions.total = (systemData.characteristics.mind.stats.creativity.conditions.wobbly.value * 5);
		console.log("Creativity Conditions Total", systemData.characteristics.mind.stats.creativity.conditions.total);
		systemData.characteristics.mind.stats.creativity.current = (systemData.characteristics.mind.stats.creativity.base + systemData.characteristics.mind.stats.creativity.buffs.total - systemData.characteristics.mind.stats.creativity.conditions.total);
		console.log("Creativity Current", systemData.characteristics.mind.stats.creativity.current);
		systemData.characteristics.mind.stats.creativity.rollme = (systemData.characteristics.mind.stats.creativity.current + systemData.characteristics.mind.current);
		console.log("------------------------------------------------------------------------------------");
		console.log("Final Creativity for Rolls:", systemData.characteristics.mind.stats.creativity.rollme);
		console.log("------------------------------------------------------------------------------------");
		//soul
		console.log("Soul Base", systemData.characteristics.soul.base);
		console.log("Soul Enlightened Value", systemData.characteristics.soul.buffs.enlightened.value);
		systemData.characteristics.soul.buffs.total = (systemData.characteristics.soul.buffs.enlightened.value * 5);
		console.log("Soul Buffs Total", systemData.characteristics.soul.buffs.total);
		console.log("Soul Tormented Value", systemData.characteristics.soul.conditions.tormented.value)
		systemData.characteristics.soul.conditions.total = (systemData.characteristics.soul.conditions.tormented.value * 5);
		console.log("Soul Conditions Total", systemData.characteristics.soul.conditions.total);
		systemData.characteristics.soul.current = (systemData.characteristics.soul.base + systemData.characteristics.soul.buffs.total - systemData.characteristics.soul.conditions.total);
		console.log("Soul Current", systemData.characteristics.soul.current);
		//willpower
		console.log("Willpower Base", systemData.characteristics.soul.stats.willpower.base);
		console.log("Willpower Determined Value", systemData.characteristics.soul.stats.willpower.buffs.determined.value);
		systemData.characteristics.soul.stats.willpower.buffs.total = (systemData.characteristics.soul.stats.willpower.buffs.determined.value * 5);
		console.log("Willpower Buffs Total", systemData.characteristics.soul.stats.willpower.buffs.total);
		console.log("Willpower Terrorized Value", systemData.characteristics.soul.stats.willpower.conditions.terrorized.value);
		systemData.characteristics.soul.stats.willpower.conditions.total = (systemData.characteristics.soul.stats.willpower.conditions.terrorized.value * 5);
		console.log("Willpower Conditions Total", systemData.characteristics.soul.stats.willpower.conditions.total);
		systemData.characteristics.soul.stats.willpower.current = (systemData.characteristics.soul.stats.willpower.base + systemData.characteristics.soul.stats.willpower.buffs.total - systemData.characteristics.soul.stats.willpower.conditions.total);
		console.log("Willpower Current", systemData.characteristics.soul.stats.willpower.current);
		systemData.characteristics.soul.stats.willpower.rollme = (systemData.characteristics.soul.stats.willpower.current + systemData.characteristics.soul.current);
		console.log("------------------------------------------------------------------------------------");
		console.log("Final Willpower for Rolls:", systemData.characteristics.soul.stats.willpower.rollme);
		console.log("------------------------------------------------------------------------------------");
		//consciousness
		console.log("Consciousness Base", systemData.characteristics.soul.stats.consciousness.base);
		console.log("Consciousness Awakened Value", systemData.characteristics.soul.stats.consciousness.buffs.awakened.value);
		systemData.characteristics.soul.stats.consciousness.buffs.total = (systemData.characteristics.soul.stats.consciousness.buffs.awakened.value * 5);
		console.log("Consciousness Buffs Total", systemData.characteristics.soul.stats.consciousness.buffs.total);
		console.log("Consciousness Demented Value", systemData.characteristics.soul.stats.consciousness.conditions.demented.value);
		systemData.characteristics.soul.stats.consciousness.conditions.total = (systemData.characteristics.soul.stats.consciousness.conditions.demented.value * 5);
		console.log("Consciousness Conditions Total", systemData.characteristics.soul.stats.consciousness.conditions.total);
		systemData.characteristics.soul.stats.consciousness.current = (systemData.characteristics.soul.stats.consciousness.base + systemData.characteristics.soul.stats.consciousness.buffs.total - systemData.characteristics.soul.stats.consciousness.conditions.total);
		console.log("Consciousness Current", systemData.characteristics.soul.stats.consciousness.current);
		systemData.characteristics.soul.stats.consciousness.rollme = (systemData.characteristics.soul.stats.consciousness.current + systemData.characteristics.soul.current);
		console.log("------------------------------------------------------------------------------------");
		console.log("Final Consciousness for Rolls:", systemData.characteristics.soul.stats.consciousness.rollme);
		console.log("------------------------------------------------------------------------------------");
		//awareness
		console.log("Awareness Base", systemData.characteristics.soul.stats.awareness.base);
		console.log("Awareness Focused Value", systemData.characteristics.soul.stats.awareness.buffs.focused.value);
		systemData.characteristics.soul.stats.awareness.buffs.total = (systemData.characteristics.soul.stats.awareness.buffs.focused.value * 5);
		console.log("Awareness Buffs Total", systemData.characteristics.soul.stats.awareness.buffs.total);
		console.log("Awareness Bewildered Value", systemData.characteristics.soul.stats.awareness.conditions.bewildered.value);
		systemData.characteristics.soul.stats.awareness.conditions.total = (systemData.characteristics.soul.stats.awareness.conditions.bewildered.value * 5);
		console.log("Awareness Conditions Total", systemData.characteristics.soul.stats.awareness.conditions.total);
		systemData.characteristics.soul.stats.awareness.current = (systemData.characteristics.soul.stats.awareness.base + systemData.characteristics.soul.stats.awareness.buffs.total - systemData.characteristics.soul.stats.awareness.conditions.total);
		console.log("Awareness Current", systemData.characteristics.soul.stats.awareness.current);
		systemData.characteristics.soul.stats.awareness.rollme = (systemData.characteristics.soul.stats.awareness.current + systemData.characteristics.soul.current);
		console.log("------------------------------------------------------------------------------------");
		console.log("Final Awareness for Rolls:", systemData.characteristics.soul.stats.awareness.rollme);
		console.log("------------------------------------------------------------------------------------");
		//end
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