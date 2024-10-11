/**
 * Extend the basic CombatTracker with some very simple modifications to support Cycle and Cycle-Round instead of just Round
 * @extends {CombatTracker}
 */
export class MetaCombatTracker extends CombatTracker {
	//? replace the default combat tracker with our custom, showing Cycles & Rounds
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.template = "systems/metanthropes/templates/metanthropes/combat-tracker.html";
		return options;
	}
}
