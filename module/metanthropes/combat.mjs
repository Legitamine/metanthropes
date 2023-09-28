import { MetaInitiative } from "../helpers/metainitiative.mjs";
export class MetanthropesCombat extends Combat {
	//? adding the concept of Cycles & Rounds to the combat system
	prepareDerivedData() {
		super.prepareDerivedData();
		let cycle = this.getFlag("metanthropes-system", "cycle") || 1;
		let cycleRound = this.getFlag("metanthropes-system", "cycleRound") || 1;
		//? set the flags to be used later
		this.setFlag("metanthropes-system", "cycle", cycle);
		this.setFlag("metanthropes-system", "cycleRound", cycleRound);
		//? embed the Cycle and Round values into the Combat document for use in the Combat Tracker
		this.cycle = cycle;
		this.cycleRound = cycleRound;
		console.log("Metanthropes RPG System | Combat | prepareDerivedData | Cycle:", cycle, "Round:", cycleRound);
	}
	_sortCombatants(a, b) {
		const ia = Number.isNumeric(a.initiative) ? a.initiative : -Infinity;
		const ib = Number.isNumeric(b.initiative) ? b.initiative : -Infinity;
		const astatScore = a.actor.getFlag("metanthropes-system", "lastrolled")?.InitiativeStatScore ?? -Infinity;
		const bstatScore = b.actor.getFlag("metanthropes-system", "lastrolled")?.InitiativeStatScore ?? -Infinity;
		//? sort by initiative first, then sort by statScore if the initiative is the same
		//? first check to see if we have a perfect tie
		if (a.initiative && b.initiative) {
			if (ia === ib && astatScore === bstatScore) {
				//todo: award 1 Destiny and re-roll initiative if tied both in Initiative and statScore
				console.warn(
					"Metanthropes RPG System | Combat | _sortCombatants | Perfect Tie between combatants:",
					a.name,
					"and:",
					b.name
				);
			}
		}
		return ib - ia || (astatScore > bstatScore ? -1 : 1);
	}

	/**
	 * Roll Initiative for one or multiple Combatants within the Combat document
	 * @param {string|string[]} ids     A Combatant id or Array of ids for which to roll
	 * @param {object} [options={}]     Additional options which modify how initiative rolls are created or presented.
	 * @param {string|null} [options.formula]         A non-default initiative formula to roll. Otherwise, the system
	 *                                                default is used.
	 * @param {boolean} [options.updateTurn=true]     Update the Combat turn after adding new initiative scores to
	 *                                                keep the turn on the same Combatant.
	 * @param {object} [options.messageOptions={}]    Additional options with which to customize created Chat Messages
	 * @returns {Promise<Combat>}       A promise which resolves to the updated Combat document once updates are complete.
	 */
	async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
		console.log("Metanthropes RPG System | Combat | rollInitiative Engaged");
		//? Structure input data
		ids = typeof ids === "string" ? [ids] : ids;
		//? Iterate over Combatants, performing an initiative roll for each
		const updates = [];
		for (let [i, id] of ids.entries()) {
			//? Get Combatant data (non-strictly)
			const combatant = this.combatants.get(id);
			if (!combatant?.isOwner) continue;
			//? Produce an initiative roll for the Combatant
			console.log(
				"Metanthropes RPG System | Combat | rollInitiative | Engaging MetaInitiative for combatant:",
				combatant
			);
			await MetaInitiative(combatant);
			let initiativeResult = combatant.actor.getFlag("metanthropes-system", "lastrolled").Initiative;
			console.log(
				"Metanthropes RPG System | Combat | rollInitiative | MetaInitiative finished, updating combatant with new initiative:",
				initiativeResult
			);
			updates.push({ _id: id, initiative: initiativeResult });
		}
		if (!updates.length) return this;
		//? Update multiple combatants
		await this.updateEmbeddedDocuments("Combatant", updates);
		return this;
	}
	async nextRound() {
		console.warn("Metanthropes RPG System | Combat | nextRound | Engaged");
		await super.nextRound();
		//todo Bleeding - assuming this function runs at the end of every Round, bleeding goes here
		//! I should probably do something similar for previous round
		//? Calculate the Cycle and Round values
		//? Get the most recent Cycle and Round values from the Combat document
		let cycle = await this.getFlag("metanthropes-system", "cycle");
		let cycleRound = await this.getFlag("metanthropes-system", "cycleRound");
		switch (this.round) {
			case 1:
				cycle = 1;
				cycleRound = 1;
				break;
			case 2:
				cycle = 1;
				cycleRound = 2;
				break;
			case 3:
				cycle = 2;
				cycleRound = 1;
				break;
			default:
				if (this.round > 2 && (this.round - 1) % 2 === 0) {
					cycle++;
					cycleRound = 1;
				} else {
					cycleRound = 2;
				}
				break;
		}
		this.cycle = cycle;
		this.cycleRound = cycleRound;
		await this.setFlag("metanthropes-system", "cycle", cycle);
		await this.setFlag("metanthropes-system", "cycleRound", cycleRound);
		//? Reroll initiative for all combatants at the start of a new Cycle (every odd cycleRound)
		if (cycle > 1 && cycleRound === 1) {
			await this.resetAll();
			this.setupTurns();
		}
		console.warn("Metanthropes RPG System | Combat | nextRound | Finished");
		return this;
	}
}
