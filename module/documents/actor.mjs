////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the Actor document for the Metanthropes RPG System for FoundryVTT.
//? This controls how Actors are created and what they can do.
//todo: Enable basic functionality
//* 
////

export class MetanthropesActor extends Actor {


	/** @override */
	prepareData() {
		// Prepare data for the actor. Calling the super version of this executes
		// the following, in order: data reset (to clear active effects),
		// prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
		// prepareDerivedData().
		super.prepareData();

	}

	// initial (rolled or via template)
	// progressed (spent xp to increase)
	// base (initial + progressed)
	// charstat (characteristic + stat base totals)
	// I will need to calculate the charstat in prepareBaseData as it's value will be used for effects calculations

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
		console.log("Metanthropes RPG starting BASE calculations for Humanoid Actors");
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
		console.log("Metanthropes RPG finished BASE calculations for Humanoid Actors");
		console.log("========================================================================");
		console.log("========================================================================");
		console.log("Metanthropes RPG starting BUFFS and CONDITIONS calculations");
		console.log("========================================================================");
		console.log("========================================================================");
		console.log("Metanthropes RPG finished BUFFS and CONDITIONS calculations");
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
		console.log("Metanthropes RPG starting BASE calculations for Metanthrope Actors");
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
		console.log("Metanthropes RPG finished BASE calculations for Metanthrope Actors");
		console.log("========================================================================");
	}
	_prepareDerivedProtagonistData(actorData) {
		if (actorData.type !== 'Protagonist') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG starting BASE calculations for Protagonist Actors");
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
		console.log("Metanthropes RPG finished BASE calculations for Protagonist Actors");
		console.log("========================================================================");
	}

	_prepareDerivedMetaTherionData(actorData) {
		if (actorData.type !== 'MetaTherion') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG starting BASE calculations for MetaTherion Actors");
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
		console.log("Metanthropes RPG finished BASE calculations for MetaTherion Actors");
		console.log("========================================================================");
	}

	_prepareDerivedAnimalData(actorData) {
		if (actorData.type !== 'Animal') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG starting BASE calculations for Animal Actors");
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
		console.log("Metanthropes RPG finished BASE calculations for Animal Actors");
		console.log("========================================================================");
	}

	_prepareDerivedArtificialData(actorData) {
		if (actorData.type !== 'Artificial') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG starting BASE calculations for Artificial Actors");
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
		console.log("Metanthropes RPG finished BASE calculations for Artificial Actors");
		console.log("========================================================================");
	}

	_prepareDerivedAnimatedObjectData(actorData) {
		if (actorData.type !== 'Animated Object') return;
		const systemData = actorData.system;
		console.log("========================================================================");
		console.log("Metanthropes RPG starting BASE calculations for Animated Object Actors");
		console.log("========================================================================");
		console.log("========================================================================");
		console.log("Metanthropes RPG finished BASE calculations for Animated Object Actors");
		console.log("========================================================================");
	}

	_prepareDerivedAnimatedHumanoidData(actorData) {
		if (actorData.type !== 'Animated Humanoid') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
		console.log("========================================================================");
		console.log("Metanthropes RPG starting BASE calculations for Animated Humanoid Actors");
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
		console.log("Metanthropes RPG finished BASE calculations for Animated Humanoid Actors");
		console.log("========================================================================");
	}

	_prepareDerivedVehicleData(actorData) {
		if (actorData.type !== 'Vehicle') return;
		const systemData = actorData.system;
		console.log("========================================================================");
		console.log("Metanthropes RPG starting BASE calculations for Vehicle Actors");
		console.log("========================================================================");
		console.log("========================================================================");
		console.log("Metanthropes RPG finished BASE calculations for Vehicle Actors");
		console.log("========================================================================");
	}









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