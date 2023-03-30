export default class MetaCombatTracker extends CombatTracker {
	//purely ai generated code the below from copilot
	// Override the _getEntryContextOptions function
	_getEntryContextOptions(combatant) {
		const options = super._getEntryContextOptions(combatant);
		// Add a new option to the context menu
		options.push({
			name: "Roll Initiative",
			icon: '<i class="fa-solid fa-dice-d10"></i><i class="fa-light fa-dice-d10"></i>',
			condition: game.user.isGM,
			callback: li => {
				// Get the actor from the combatant
				const actor = combatant.actor;
				// Call the MetaInitiative function
				MetaInitiative(actor);
			}
		});
		return options;
	}
}