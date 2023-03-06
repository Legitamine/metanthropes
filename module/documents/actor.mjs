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
////
	/** @override */
	prepareData() {
		// Prepare data for the actor. Calling the super version of this executes
		// the following, in order: data reset (to clear active effects),
		// prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
		// prepareDerivedData().
		super.prepareData();
	}
	/** @override */
	prepareDerivedData() {
		const actorData = this;
		this._prepareDerivedHumanoidData(actorData);
		this._prepareDerivedMetanthropeData(actorData);
		this._prepareDerivedProtagonistData(actorData);
		this._prepareDerivedMetaTherionData(actorData);
		this._prepareDerivedAnimalData(actorData);
		this._prepareDerivedArtificialData(actorData);
		this._prepareDerivedAnimatedObjectData(actorData);
		this._prepareDerivedAnimatedHumanoidData(actorData);
		this._prepareDerivedVehicleData(actorData);
	}
	_prepareDerivedHumanoidData(actorData) {
		if (actorData.type !== 'Humanoid') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG Preparing Data for Actor", this.name);
		console.log("========================================================================");
		console.log("========================================================================");
		console.log("Metanthropes RPG Starting BASE calculations for Humanoid Actors");
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
		console.log("Metanthropes RPG Finished BASE calculations for Humanoid Actors");
		console.log("========================================================================");
		console.log("========================================================================");
		console.log("Metanthropes RPG Starting BUFFS and CONDITIONS calculations");
		console.log("========================================================================");
		//doing it directly instead of a for loop for faster results - cant code shit
		//body
		console.log("Body Base", systemData.characteristics.body.base);
		console.log("Body Hardened Value", systemData.characteristics.body.buffs.hardened.value);
		//todo: change the hardcoded 5 to a variable that acts as the buff multiplier - same for all the rest below
		systemData.characteristics.body.buffs.total = (systemData.characteristics.body.buffs.hardened.value*5);
		console.log("Body Buffs Total", systemData.characteristics.body.buffs.total);
		console.log("Body Burned Value", systemData.characteristics.body.conditions.burned.value)
		systemData.characteristics.body.conditions.total = (systemData.characteristics.body.conditions.burned.value*5);
		console.log("Body Conditions Total", systemData.characteristics.body.conditions.total);
		systemData.characteristics.body.current = (systemData.characteristics.body.base + systemData.characteristics.body.buffs.total - systemData.characteristics.body.conditions.total);
		console.log("Body Current", systemData.characteristics.body.current);
		//bodystats
		//endurance
		console.log("Endurance Base", systemData.characteristics.body.stats.endurance.base);
		console.log("Endurance Fortified Value", systemData.characteristics.body.stats.endurance.buffs.fortified.value);
		systemData.characteristics.body.stats.endurance.buffs.total = (systemData.characteristics.body.stats.endurance.buffs.fortified.value*5);
		console.log("Endurance Buffs Total", systemData.characteristics.body.stats.endurance.buffs.total);
		console.log("Endurance Bone-Injury Value", systemData.characteristics.body.stats.endurance.conditions.bone-injury.value);
		systemData.characteristics.body.stats.endurance.conditions.total = (systemData.characteristics.body.stats.endurance.conditions.bone-injury.value*5);
		console.log("Endurance Conditions Total", systemData.characteristics.body.stats.endurance.conditions.total);
		systemData.characteristics.body.stats.endurance.current = (systemData.characteristics.body.stats.endurance.base + systemData.characteristics.body.stats.endurance.buffs.total - systemData.characteristics.body.stats.endurance.conditions.total);
		console.log("Endurance Current", systemData.characteristics.body.stats.endurance.current);
		systemData.characteristics.body.stats.endurance.rollme = (systemData.characteristics.body.stats.endurance.current + systemData.characteristics.body.current);
		console.log("Final Endurance for rolls", systemData.characteristics.body.stats.endurance.rollme);

		//mind
		console.log("Mind Base", systemData.characteristics.mind.base);
		console.log("Mind Sharpened Value", systemData.characteristics.mind.buffs.sharpened.value);
		systemData.characteristics.mind.buffs.total = (systemData.characteristics.mind.buffs.sharpened.value*5);
		console.log("Mind Buffs Total", systemData.characteristics.mind.buffs.total);
		console.log("Mind Disconnected Value", systemData.characteristics.mind.conditions.disconnected.value)
		systemData.characteristics.mind.conditions.total = (systemData.characteristics.mind.conditions.disconnected.value*5);
		console.log("Mind Conditions Total", systemData.characteristics.mind.conditions.total);
		systemData.characteristics.mind.current = (systemData.characteristics.mind.base + systemData.characteristics.mind.buffs.total - systemData.characteristics.mind.conditions.total);
		console.log("Mind Current", systemData.characteristics.mind.current);
		//soul
		console.log("Soul Base", systemData.characteristics.soul.base);
		console.log("Soul Enlightened Value", systemData.characteristics.soul.buffs.enlightened.value);
		systemData.characteristics.soul.buffs.total = (systemData.characteristics.soul.buffs.enlightened.value*5);
		console.log("Soul Buffs Total", systemData.characteristics.soul.buffs.total);
		console.log("Soul Tormented Value", systemData.characteristics.soul.conditions.tormented.value)
		systemData.characteristics.soul.conditions.total = (systemData.characteristics.soul.conditions.tormented.value*5);
		console.log("Soul Conditions Total", systemData.characteristics.soul.conditions.total);
		systemData.characteristics.soul.current = (systemData.characteristics.soul.base + systemData.characteristics.soul.buffs.total - systemData.characteristics.soul.conditions.total);
		console.log("Soul Current", systemData.characteristics.soul.current);
		

		console.log("========================================================================");
		console.log("Metanthropes RPG Finished BUFFS and CONDITIONS calculations");
		console.log("========================================================================");
		console.log("========================================================================");
		console.log("Metanthropes RPG Finished Preparing Data for Actor", this.name);
		console.log("========================================================================");
	}
	_prepareDerivedMetanthropeData(actorData) {
		if (actorData.type !== 'Metanthrope') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG Starting BASE calculations for Metanthrope Actors");
		console.log("========================================================================");
		for (let [key, chars] of Object.entries(systemData.characteristics)) {
			console.log('Working on', chars.label);
			console.log(chars.initial.label, chars.initial.value);
			console.log(chars.progressed.label, chars.progressed.value);
			chars.base = (chars.initial.value + chars.progressed.value);
			console.log('New', chars.label, 'BASE', chars.base);
			for (let [innerkey, statistics] of Object.entries(chars.stats)) {
				console.log('Working on', chars.label, statistics.label);
				console.log(statistics.initial.label, statistics.initial.value);
				console.log(statistics.progressed.label, statistics.progressed.value);
				statistics.base = (statistics.initial.value + statistics.progressed.value);
				console.log('New', statistics.label, 'BASE', statistics.base);
				statistics.cs = (chars.base + statistics.base);
				console.log('New', statistics.label, 'CS', statistics.cs);
			}
		}
		console.log("========================================================================");
		console.log("Metanthropes RPG Finished BASE calculations for Metanthrope Actors");
		console.log("========================================================================");
	}
	_prepareDerivedProtagonistData(actorData) {
		if (actorData.type !== 'Protagonist') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG Starting BASE calculations for Protagonist Actors");
		console.log("========================================================================");
		for (let [key, chars] of Object.entries(systemData.characteristics)) {
			console.log('Working on', chars.label);
			console.log(chars.initial.label, chars.initial.value);
			console.log(chars.progressed.label, chars.progressed.value);
			chars.base = (chars.initial.value + chars.progressed.value);
			console.log('New', chars.label, 'BASE', chars.base);
			for (let [innerkey, statistics] of Object.entries(chars.stats)) {
				console.log('Working on', chars.label, statistics.label);
				console.log(statistics.initial.label, statistics.initial.value);
				console.log(statistics.progressed.label, statistics.progressed.value);
				statistics.base = (statistics.initial.value + statistics.progressed.value);
				console.log('New', statistics.label, 'BASE', statistics.base);
				statistics.cs = (chars.base + statistics.base);
				console.log('New', statistics.label, 'CS', statistics.cs);
			}
		}
		console.log("========================================================================");
		console.log("Metanthropes RPG Finished BASE calculations for Protagonist Actors");
		console.log("========================================================================");
	}
	_prepareDerivedMetaTherionData(actorData) {
		if (actorData.type !== 'MetaTherion') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG Starting BASE calculations for MetaTherion Actors");
		console.log("========================================================================");
		for (let [key, chars] of Object.entries(systemData.characteristics)) {
			console.log('Working on', chars.label);
			console.log(chars.initial.label, chars.initial.value);
			console.log(chars.progressed.label, chars.progressed.value);
			chars.base = (chars.initial.value + chars.progressed.value);
			console.log('New', chars.label, 'BASE', chars.base);
			for (let [innerkey, statistics] of Object.entries(chars.stats)) {
				console.log('Working on', chars.label, statistics.label);
				console.log(statistics.initial.label, statistics.initial.value);
				console.log(statistics.progressed.label, statistics.progressed.value);
				statistics.base = (statistics.initial.value + statistics.progressed.value);
				console.log('New', statistics.label, 'BASE', statistics.base);
				statistics.cs = (chars.base + statistics.base);
				console.log('New', statistics.label, 'CS', statistics.cs);
			}
		}
		console.log("========================================================================");
		console.log("Metanthropes RPG Finished BASE calculations for MetaTherion Actors");
		console.log("========================================================================");
	}
	_prepareDerivedAnimalData(actorData) {
		if (actorData.type !== 'Animal') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG Starting BASE calculations for Animal Actors");
		console.log("========================================================================");
		for (let [key, chars] of Object.entries(systemData.characteristics)) {
			console.log('Working on', chars.label);
			console.log(chars.initial.label, chars.initial.value);
			console.log(chars.progressed.label, chars.progressed.value);
			chars.base = (chars.initial.value + chars.progressed.value);
			console.log('New', chars.label, 'BASE', chars.base);
			for (let [innerkey, statistics] of Object.entries(chars.stats)) {
				console.log('Working on', chars.label, statistics.label);
				console.log(statistics.initial.label, statistics.initial.value);
				console.log(statistics.progressed.label, statistics.progressed.value);
				statistics.base = (statistics.initial.value + statistics.progressed.value);
				console.log('New', statistics.label, 'BASE', statistics.base);
				statistics.cs = (chars.base + statistics.base);
				console.log('New', statistics.label, 'CS', statistics.cs);
			}
		}
		console.log("========================================================================");
		console.log("Metanthropes RPG Finished BASE calculations for Animal Actors");
		console.log("========================================================================");
	}
	_prepareDerivedArtificialData(actorData) {
		if (actorData.type !== 'Artificial') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG Starting BASE calculations for Artificial Actors");
		console.log("========================================================================");
		for (let [key, chars] of Object.entries(systemData.characteristics)) {
			console.log('Working on', chars.label);
			console.log(chars.initial.label, chars.initial.value);
			console.log(chars.progressed.label, chars.progressed.value);
			chars.base = (chars.initial.value + chars.progressed.value);
			console.log('New', chars.label, 'BASE', chars.base);
			for (let [innerkey, statistics] of Object.entries(chars.stats)) {
				console.log('Working on', chars.label, statistics.label);
				console.log(statistics.initial.label, statistics.initial.value);
				console.log(statistics.progressed.label, statistics.progressed.value);
				statistics.base = (statistics.initial.value + statistics.progressed.value);
				console.log('New', statistics.label, 'BASE', statistics.base);
				statistics.cs = (chars.base + statistics.base);
				console.log('New', statistics.label, 'CS', statistics.cs);
			}
		}
		console.log("========================================================================");
		console.log("Metanthropes RPG Finished BASE calculations for Artificial Actors");
		console.log("========================================================================");
	}
	_prepareDerivedAnimatedObjectData(actorData) {
		if (actorData.type !== 'Animated Object') return;
		const systemData = actorData.system;
		console.log("========================================================================");
		console.log("Metanthropes RPG Starting BASE calculations for Animated Object Actors");
		console.log("========================================================================");
		console.log("========================================================================");
		console.log("Metanthropes RPG Finished BASE calculations for Animated Object Actors");
		console.log("========================================================================");
	}
	_prepareDerivedAnimatedHumanoidData(actorData) {
		if (actorData.type !== 'Animated Humanoid') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG Starting BASE calculations for Animated Humanoid Actors");
		console.log("========================================================================");
		for (let [key, chars] of Object.entries(systemData.characteristics)) {
			console.log('Working on', chars.label);
			console.log(chars.initial.label, chars.initial.value);
			console.log(chars.progressed.label, chars.progressed.value);
			chars.base = (chars.initial.value + chars.progressed.value);
			console.log('New', chars.label, 'BASE', chars.base);
			for (let [innerkey, statistics] of Object.entries(chars.stats)) {
				console.log('Working on', chars.label, statistics.label);
				console.log(statistics.initial.label, statistics.initial.value);
				console.log(statistics.progressed.label, statistics.progressed.value);
				statistics.base = (statistics.initial.value + statistics.progressed.value);
				console.log('New', statistics.label, 'BASE', statistics.base);
				statistics.cs = (chars.base + statistics.base);
				console.log('New', statistics.label, 'CS', statistics.cs);
			}
		}
		console.log("========================================================================");
		console.log("Metanthropes RPG Finished BASE calculations for Animated Humanoid Actors");
		console.log("========================================================================");
	}
	_prepareDerivedVehicleData(actorData) {
		if (actorData.type !== 'Vehicle') return;
		const systemData = actorData.system;
		console.log("========================================================================");
		console.log("Metanthropes RPG Starting BASE calculations for Vehicle Actors");
		console.log("========================================================================");
		console.log("========================================================================");
		console.log("Metanthropes RPG Finished BASE calculations for Vehicle Actors");
		console.log("========================================================================");
	}

////
//*
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
		this._prepareHumanoidRollData(data);
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

		// Copy the ability scores to the top level, so that rolls can use
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
}