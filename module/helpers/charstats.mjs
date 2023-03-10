////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the charstats helper for the Metanthropes RPG System for FoundryVTT.
//? This helper reads the character's attributes and returns them in a format that can be used by the sheets.
//todo: Enable basic functionality
//* 
////

//this is used to help localize the values

export const CHARSTATS = {};

CHARSTATS.characteristics = {
	"body": "Body",
	"mind": "Mind",
	"soul": "Soul"
};

CHARSTATS.stats = {
	"endurance": "Endurance",
	"power": "Power",
	"reflexes": "Reflexes",
	"perception": "Perception",
	"manipulation": "Manipulation",
	"creativity": "Creativity",
	"willpower": "Willpower",
	"consciousness": "Consciousness",
	"awareness": "Awareness"
};


/*
export class CharStatsHelper {


// this will go through a class and change the data type of the various 
// attributes to be more useful for the sheets - not sure if this is needed
// from simple worldbuilding


	static getCharStatsData(data) {
		for (let cs of Object.values(data.system.characteristics)) {
			if ( cs.dtype ) {
				cs.isCheckbox = cs.dtype === "Boolean";
				cs.isResource = cs.dtype === "Resource";
				cs.isFormula = cs.dtype === "Formula";
			}
		}





	}
}
*/	
