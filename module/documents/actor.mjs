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

	///prepareBaseData() {
	prepareBaseData() {
		console.log("Metanthropes RPG starting prepareBaseData");
		for (let ch of Object.values(this.characteristics)) {
			ch.base = Math.sum(ch.initial, ch.progressed);
			console.log(ch.base);
			for (let st of Object.values(this.stats.ch.characteristics)) {
				st.base = Math.sum(st.initial, st.progressed);
				st.charstat = Math.sum(ch.base, st.base);
				console.log(st.base);
				console.log(st.charstat);
			}
		}
	}


	/**
		 * @override
		 * Augment the basic actor data with additional dynamic data. Typically,
		 * you'll want to handle most of your calculated/derived data in this step.
		 * Data calculated in this step should generally not exist in template.json
		 * (such as ability modifiers rather than ability scores) and should be
		 * available both inside and outside of character sheets (such as if an actor
		 * is queried and has a roll executed directly from it).
		 * qp notes
		 * ==========
		 * this is where we add the body etc to the stats
		 * here we should also add the modifiers see above
		 * copilot go?
		 * 
		 * todo enw edw tha einai as poyme to base + conditions + buffs
		 * 
		 */
	prepareDerivedData() {
		const actorData = this;
		const systemData = actorData.system;
		const flags = actorData.flags.metanthropes || {};

		// Make separate methods for each Actor type (character, npc, etc.) to keep
		// things organized.

		this._prepareHumanoidData(actorData);
		this._prepareMetanthropeData(actorData);
		this._prepareProtagonistData(actorData);
		this._prepareMetaTherionData(actorData);
		this._prepareAnimalData(actorData);
		this._prepareArtificialData(actorData);
		//todo animated objects, humanoids, vehicles, etc
	}


	//todo the below for all the others
	_prepareProtagonistData(actorData) {
	if (actorData.type !== 'Protagonist') return;
	const systemData = actorData.system;
}

_prepareHumanoidData(actorData) {
	if (actorData.type !== 'Humanoid') return;
	const systemData = actorData.system;
	//if (actorData.type !== 'Metanthrope') return;
	//if (actorData.type !== 'Animal') return;
	//if (actorData.type !== 'Artificial') return;
	//if (actorData.type !== 'MetaTherion') return;
	// should I nest these --- together? what does this do exactly?
	// Make modifications to data here. For example:
	//systemData.xp = (systemData.cr * systemData.cr) * 100;
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