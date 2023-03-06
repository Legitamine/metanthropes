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
		console.log("========================================================================");
		console.log("Metanthropes RPG Preparing Data for Actor", this.name);
		console.log("========================================================================");
	}

	// initial (rolled or via template)
	// progressed (spent xp to increase)
	// base (initial + progressed)
	// charstat (characteristic + stat base totals)
	// I will need to calculate the charstat in prepareBaseData as it's value will be used for effects calculations

	/** @override */
	prepareBaseData() {
		console.log("========================================================================");
		console.log("Metanthropes RPG starting BASE & CS Characteristic and Stat calculations");
		console.log("========================================================================");
		const actorData = this;

		this._prepareBaseHumanoidData(actorData);
		this._prepareBaseMetanthropeData(actorData);
		this._prepareBaseProtagonistData(actorData);
		this._prepareBaseMetaTherionData(actorData);
		this._prepareBaseAnimalData(actorData);
		this._prepareBaseArtificialData(actorData);
		this._prepareBaseAnimatedObjectData(actorData);
		this._prepareBaseAnimatedHumanoidData(actorData);
		this._prepareBaseVehicleData(actorData);
		console.log("========================================================================");
		console.log("Metanthropes RPG finished BASE & CS Characteristic and Stat calculations");
		console.log("========================================================================");
	}
	_prepareBaseHumanoidData(actorData) {
		if (actorData.type !== 'Humanoid') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
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
	}
	_prepareBaseMetanthropeData(actorData) {
		if (actorData.type !== 'Metanthrope') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
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
	}
	_prepareBaseProtagonistData(actorData) {
		if (actorData.type !== 'Protagonist') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
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
	}

	_prepareBaseMetaTherionData(actorData) {
		if (actorData.type !== 'MetaTherion') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
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
	}

	_prepareBaseAnimalData(actorData) {
		if (actorData.type !== 'Animal') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
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
	}

	_prepareBaseArtificialData(actorData) {
		if (actorData.type !== 'Artificial') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
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
	}

	_prepareBaseAnimatedObjectData(actorData) {
		if (actorData.type !== 'Animated Object') return;
		const systemData = actorData.system;
	}

	_prepareBaseAnimatedHumanoidData(actorData) {
		if (actorData.type !== 'Animated Humanoid') return;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};
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
	}

	_prepareBaseVehicleData(actorData) {
		if (actorData.type !== 'Vehicle') return;
		const systemData = actorData.system;
	}









	prepareDerivedData() {

		console.log("========================================================================");
		console.log("Metanthropes RPG starting BUFF and CONDITIONS  calculations");
		console.log("========================================================================");
		const actorData = this;
		
		// Make separate methods for each Actor type (character, npc, etc.) to keep
		// things organized.

		this._prepareHumanoidData(actorData);
		this._prepareMetanthropeData(actorData);
		this._prepareProtagonistData(actorData);
		this._prepareMetaTherionData(actorData);
		this._prepareAnimalData(actorData);
		this._prepareArtificialData(actorData);
		this._prepareAnimatedObjectData(actorData);
		this._prepareAnimatedHumanoidData(actorData);
		this._prepareVehicleData(actorData);
	
	}

	_prepareHumanoidData(actorData) {
		if (actorData.type !== 'Humanoid') return;
		const systemData = actorData.system;
		console.log(systemData.characteristics.body.stats.endurance.label, systemData.characteristics.body.stats.endurance.cs);
	}
	_prepareMetanthropeData(actorData) {
		if (actorData.type !== 'Metanthrope') return;
		const systemData = actorData.system;
		console.log(systemData.characteristics.body.stats.endurance.label, systemData.characteristics.body.stats.endurance.cs);
	}
	_prepareProtagonistData(actorData) {
		if (actorData.type !== 'Protagonist') return;
		const systemData = actorData.system;
		console.log(systemData.characteristics.body.stats.endurance.label, systemData.characteristics.body.stats.endurance.cs);
	}

	_prepareMetaTherionData(actorData) {
		if (actorData.type !== 'MetaTherion') return;
		const systemData = actorData.system;
		console.log(systemData.characteristics.body.stats.endurance.label, systemData.characteristics.body.stats.endurance.cs);
	}

	_prepareAnimalData(actorData) {
		if (actorData.type !== 'Animal') return;
		const systemData = actorData.system;
		console.log(systemData.characteristics.body.stats.endurance.label, systemData.characteristics.body.stats.endurance.cs);
	}

	_prepareArtificialData(actorData) {
		if (actorData.type !== 'Artificial') return;
		const systemData = actorData.system;
		console.log(systemData.characteristics.body.stats.endurance.label, systemData.characteristics.body.stats.endurance.cs);
	}

	_prepareAnimatedObjectData(actorData) {
		if (actorData.type !== 'Animated Object') return;
		const systemData = actorData.system;
	}

	_prepareAnimatedHumanoidData(actorData) {
		if (actorData.type !== 'Animated Humanoid') return;
		const systemData = actorData.system;
		console.log(systemData.characteristics.body.stats.endurance.label, systemData.characteristics.body.stats.endurance.cs);
	}

	_prepareVehicleData(actorData) {
		if (actorData.type !== 'Vehicle') return;
		const systemData = actorData.system;
	}
	// should I nest these --- together? what does this do exactly?
	// Make modifications to data here. For example:
	//systemData.xp = (systemData.cr * systemData.cr) * 100;



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