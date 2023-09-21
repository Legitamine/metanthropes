import { MetaInitiative } from "../helpers/metainitiative.mjs";
export class MetanthropesCombat extends Combat {
	//? adding the concept of Cycles & Rounds to the combat system
	async prepareDerivedData() {
        super.prepareDerivedData();
        let cycle = this.getFlag("metanthropes-system", "cycle") || 1;
        let cycleRound = this.getFlag("metanthropes-system", "cycleRound") || 1;
		console.log("Metanthropes RPG System | Combat | prepareDerivedData | Cycle:", cycle, "Round:", cycleRound);
		//? set the flags to be used later
		await this.setFlag("metanthropes-system", "cycle", cycle);
		await this.setFlag("metanthropes-system", "cycleRound", cycleRound);
		this.cycle = cycle;
		this.cycleRound = cycleRound;
    }
	_sortCombatants(a, b) {
		const ia = Number.isNumeric(a.initiative) ? a.initiative : -Infinity;
		const ib = Number.isNumeric(b.initiative) ? b.initiative : -Infinity;
		const astatScore = a.actor.getFlag("metanthropes-system", "lastrolled")?.InitiativestatScore ?? -Infinity;
		const bstatScore = b.actor.getFlag("metanthropes-system", "initiative")?.InitiativestatScore ?? -Infinity;
		//? sort by initiative first, then sort by statScore if the initiative is the same
		return ib - ia || (astatScore > bstatScore ? -1 : 1);
	}
	//todo: award Destiny and re-roll initiative if tied both in Initiative and statScore
	//! gia na paixei to full ruleset, prepei na kanw 'confirm initiative'

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
		// Structure input data
		ids = typeof ids === "string" ? [ids] : ids;
		const currentId = this.combatant?.id;
		// Iterate over Combatants, performing an initiative roll for each
		const updates = [];
		const messages = [];
		for (let [i, id] of ids.entries()) {
			// Get Combatant data (non-strictly)
			const combatant = this.combatants.get(id);
			if (!combatant?.isOwner) continue;
			// Produce an initiative roll for the Combatant
			console.log("Metanthropes RPG System | Combat | Engaging MetaInitiative for combatant:", combatant);
			await MetaInitiative(combatant);
			let initiativeResult = combatant.actor.getFlag("metanthropes-system", "lastrolled").Initiative;
			console.log(
				"Metanthropes RPG System | Combat | MetaInitiative finished, updating combatant with new initiative:",
				initiativeResult
			);
			updates.push({ _id: id, initiative: initiativeResult });
			//! warning: I am not taking into account hidding combatants, making private rolls where needed
		}
		if (!updates.length) return this;
		//? Update multiple combatants
		await this.updateEmbeddedDocuments("Combatant", updates);
		//! do we need this?
		//? Ensure the turn order remains with the same combatant
		if (updateTurn && currentId) {
			await this.update({ turn: this.turns.findIndex((t) => t.id === currentId) });
		}
		//! do we need this?
		//? Create multiple chat messages
		await ChatMessage.implementation.create(messages);
		return this;
	}
	/**
	 * Assign initiative for a single Combatant within the Combat encounter.
	 * Update the Combat turn order to maintain the same combatant as the current turn.
	 * @param {string} id         The combatant ID for which to set initiative
	 * @param {number} value      A specific initiative value to set
	 */
	async setInitiative(id, value) {
		const combatant = this.combatants.get(id, { strict: true });
		await combatant.update({ initiative: value });
		console.log("=======++++++++++++++============");
		console.log("Metanthropes RPG DELETE ME setInitiative");
		console.log("=======++++++++++++++============");
	}
	//! edw einai ?? - ayto psanxei formula, enw egw exw allo function to do that
	async _getInitiativeFormula(combatant) {
		console.log("Metanthropes RPG inside _getInitiativeFormula  === +++ DELETE ME +++ === ");
		await MetaInitiative(combatant);
	}
	async nextRound() {
		await super.nextRound();
		//! I should probably do something similar for previous round
		//? Calculate the Cycle and Round values
		//? Get the most recent Cycle and Round values from the Combat document
		let cycle = await this.getFlag("metanthropes-system", "cycle");
		let cycleRound = await this.getFlag("metanthropes-system", "cycleRound");
		if (this.round === 1) {
			cycle = 1;
			cycleRound = 1;
		} else if (this.round === 2) {
			cycle = 1;
			cycleRound = 2;
		} else if (this.round === 3) {
			cycle = 2;
			cycleRound = 1;
		} else if (this.round > 2 && (this.round - 1) % 2 === 0) {
			cycle++;
			cycleRound = 1;
		} else {
			cycleRound = 2;
		}
		this.cycle = cycle;
		this.cycleRound = cycleRound;
		await this.setFlag("metanthropes-system", "cycle", cycle);
		await this.setFlag("metanthropes-system", "cycleRound", cycleRound);
		console.log("Metanthropes RPG System | Combat | nextRound | Cycle:", cycle, "Round:", cycleRound);
		//? Reroll initiative for all combatants at the start of a new Cycle (every odd cycleRound)
		if (cycle > 1 && cycleRound === 1) {
			await this.resetAll();
		}
		return this;
	}
}
