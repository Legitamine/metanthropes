// import { Combat } from "../../../../systems/foundryvtt/src/module/combat.mjs";

export class MetanthropesCombat extends Combat {
	_sortCombatants(a, b) {
		console.log("from within sortCombatants  === +++ === +++ === ");
		const aActor = game.actors.get(a.actorId);
		const bActor = game.actors.get(b.actorId);

		const aInitiativeData = aActor.getFlag("metanthropes-system", "initiative");
		const bInitiativeData = bActor.getFlag("metanthropes-system", "initiative");

		// First, sort by levelsOfSuccess (descending)
		if (aInitiativeData.levelsOfSuccess > bInitiativeData.levelsOfSuccess) return -1;
		if (aInitiativeData.levelsOfSuccess < bInitiativeData.levelsOfSuccess) return 1;

		// Next, sort by resultLevel (ascending)
		if (aInitiativeData.resultLevel < bInitiativeData.resultLevel) return -1;
		if (aInitiativeData.resultLevel > bInitiativeData.resultLevel) return 1;

		// Finally, sort by levelsOfFailure (ascending)
		if (aInitiativeData.levelsOfFailure < bInitiativeData.levelsOfFailure) return -1;
		if (aInitiativeData.levelsOfFailure > bInitiativeData.levelsOfFailure) return 1;

		// If everything is equal, use the default sorting method
		return super._sortCombatants(a, b);
	}
	// this gets called multiple times throughout the combat
	_prepareCombatant(c, scene, players, settings = {}) {
		console.log("from within prepareCombatant  === +++ === +++ === ");
		const combatant = super._prepareCombatant(c, scene, players, settings);
		const actor = game.actors.get(c.actorId);
		const initiativeData = actor.getFlag("metanthropes-system", "initiative");
		combatant.initiative = initiativeData.initiativeValue;
		return combatant;
	}
	// this decides who's turn it is?
	async rollInitiative(ids, formulaopt, updateTurnopt, messageOptionopt) {
		console.log("from within async rollInitiative  === +++ === +++ === ");
		await super.rollInitiative(ids, formulaopt, updateTurnopt, messageOptionopt);
		return this.update({turn: 0});
	}
	// start combat button - here i should initialize what I need
	async startCombat() {
		await this.setupTurns();
		return super.startCombat();
	}
	// Next turn button when moving from one combatant to the next
	// this should include some logic on what happens when this is the last combatant and the Round is about to end?
	// this should also be used to advance time (see https://youtu.be/OlagJzZsEew?list=PLFV9z59nkHDccUbRXVt623UdloPTclIrz&t=592)
	//async nextTurn() {}
	//async previousTurn() {}
	async nextRound() {
		//this should re-enable rolling for initiative
		await this.resetAll();
	}
	//async previousRound() {}
	// this should replace the default roll initiative
	//! edw einai - ayto psanxei formula, enw egw exw allo function to do that
	async _getInitiativeFormula(combatant) {
		console.log("got to change the initiative formula === +++ === +++ === ");
		await MetaInitiative(combatant);
	}
}