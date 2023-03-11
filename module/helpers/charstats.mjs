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

CHARSTATS.base = {
	bodyBase: 0,
	mindBase: 0,
	soulBase: 0,
	enduranceBase: 0,
	powerBase: 0,
	reflexesBase: 0,
	perceptionBase: 0,
	manipulationBase: 0,
	creativityBase: 0,
	willpowerBase: 0,
	consciousnessBase: 0,
	awarenessBase: 0,
};

CHARSTATS.buffs = {
	bodyBuffs: 0,
	mindBuffs: 0,
	soulBuffs: 0,
	enduranceBuffs: 0,
	powerBuffs: 0,
	reflexesBuffs: 0,
	perceptionBuffs: 0,
	manipulationBuffs: 0,
	creativityBuffs: 0,
	willpowerBuffs: 0,
	consciousnessBuffs: 0,
	awarenessBuffs: 0,
};

CHARSTATS.conditions = {
	bodyConditions: 0,
	mindConditions: 0,
	soulConditions: 0,
	enduranceConditions: 0,
	powerConditions: 0,
	reflexesConditions: 0,
	perceptionConditions: 0,
	manipulationConditions: 0,
	creativityConditions: 0,
	willpowerConditions: 0,
	consciousnessConditions: 0,
	awarenessConditions: 0,
};

CHARSTATS.total = {
	bodyTotal: 0,
	mindTotal: 0,
	soulTotal: 0,
};

CHARSTATS.current = {
	enduranceCurrent: 0,
	powerCurrent: 0,
	reflexesCurrent: 0,
	perceptionCurrent: 0,
	manipulationCurrent: 0,
	creativityCurrent: 0,
	willpowerCurrent: 0,
	consciousnessCurrent: 0,
	awarenessCurrent: 0,
};

CHARSTATS.roll = {
	enduranceRoll: 0,
	powerRoll: 0,
	reflexesRoll: 0,
	perceptionRoll: 0,
	manipulationRoll: 0,
	creativityRoll: 0,
	willpowerRoll: 0,
	consciousnessRoll: 0,
	awarenessRoll: 0,
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
