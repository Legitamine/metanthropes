// import { Combat } from "../../../../systems/foundryvtt/src/module/combat.mjs";

export class MetanthropesCombat extends Combat {
	_sortCombatants(a, b) {
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
}
