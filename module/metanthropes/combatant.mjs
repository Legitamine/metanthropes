import { MetaInitiative } from "../helpers/metainitiative.mjs";

export class MetaCombatant extends Combatant {
    getInitiativeRoll(formula) {
        // Call your MetaInitiative function with the custom combatant instance
		console.log("MetaCombatant - combatant or formula?:", this);
        const roll = new Roll(async () => {
            await MetaInitiative(this);
			console.log("MetaCombatant - are we waiting for a roll result??");
            // Retrieve the initiative value from the actor's flags (assuming you have set the flag in MetaInitiative)
            const initiativeData = this.actor.getFlag("metanthropes-system", "initiative");
            const initiativeValue = initiativeData.initiativeValue;
            return initiativeValue.toString();
        });

        return roll;
    }
}
