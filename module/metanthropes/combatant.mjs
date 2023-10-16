import { MetaInitiative } from "../helpers/metainitiative.mjs";
import { metaLog } from "../helpers/metahelpers.mjs";

//! I should review if I need this or I can change it to a less complicated step
//todo investigate - does the formula in system.json and metanthropes.mjs have an effect here? for v0.9 combat overhaul
export class MetaCombatant extends Combatant {
	getInitiativeRoll(formula) {
		metaLog(2, "MetaCombatant getInitiativeRoll", "Engaged");
		const roll = new Roll(async () => {
			await MetaInitiative(this);
			metaLog(2, "MetaCombatant getInitiativeRoll", "this:", this);
			//? Retrieve the initiative value from the actor's flags (assuming you have set the flag in MetaInitiative)
			const initiativeData = this.actor.getFlag("metanthropes-system", "initiative");
			const initiativeValue = initiativeData.initiativeValue;
			return initiativeValue.toString();
		});
		return roll;
	}
}
