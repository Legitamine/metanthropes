export class MetaCombatTracker extends CombatTracker {
	//? replace the default combat tracker with our custom, showing Cycles & Rounds
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.template = "systems/metanthropes-system/templates/metanthropes/combat-tracker.html";
		return options;
	}
}
