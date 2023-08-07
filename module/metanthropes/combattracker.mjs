import { MetaInitiative } from "../helpers/metainitiative.mjs";
export class MetaCombatTracker extends CombatTracker {
	// this should replace the default combat tracker with the one showing Cycles up top
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.template = "systems/metanthropes-system/templates/metanthropes/combat-tracker.html";
		return options;
	}
	//purely ai generated code the below from copilot - this can be used to display my own right click menu option
	// Override the _getEntryContextOptions function
	_getEntryContextOptions(combatant) {
		const options = super._getEntryContextOptions(combatant);
		// Add a new option to the context menu
		options.push({
			name: "Force Roll MetaInitiative",
			icon: '<i class="fa-solid fa-dice-d10"></i><i class="fa-light fa-dice-d10"></i>',
			condition: game.user.isGM,
			callback: (li) => {
				// Call the MetaInitiative function
				MetaInitiative(combatant);
			},
		});
		return options;
	}
}
