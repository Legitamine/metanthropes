import { MetaInitiative } from "../helpers/metainitiative.mjs";
export class MetanthropesCombat extends Combat {
	//adding the concept of Cycles to the combat system
	constructor(data, context) {
		super(data, context);
		this.cycle = 1;
		this.cycleRound = 1;
	}
	_sortCombatants(a, b) {
		const ia = Number.isNumeric(a.initiative) ? a.initiative : -Infinity;
		const ib = Number.isNumeric(b.initiative) ? b.initiative : -Infinity;
		const astatValue = a.actor.getFlag("metanthropes-system", "lastrolled")?.InitiativeStatValue ?? -Infinity;
		const bstatValue = b.actor.getFlag("metanthropes-system", "initiative")?.InitiativeStatValue ?? -Infinity;
		//? sort by initiative first, then sort by statValue if the initiative is the same
		return ib - ia || (astatValue > bstatValue ? -1 : 1);
	}
	//todo: award Destiny and re-roll initiative if tied both in Initiative and statValue
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
		console.log("Metanthropes RPG inside setInitiative");
		console.log("=======++++++++++++++============");
	}
	//! edw einai ?? - ayto psanxei formula, enw egw exw allo function to do that
	async _getInitiativeFormula(combatant) {
		console.log("Metanthropes RPG inside _getInitiativeFormula  === +++ === +++ === ");
		await MetaInitiative(combatant);
	}
	// The below should help define what a this.cycle is and when to start a new this.cycle (every 2 Rounds)
	/* -------------------------------------------- */

	/**
	 * Advance the combat to the next round
	 * @returns {Promise<Combat>}
	 */
	async nextRound() {
		await super.nextRound();
		console.log("Metanthropes RPG Calculating Next Round Values === +++ === +++ === ");
		console.log("this.round:", this.round, "this.cycle:", this.cycle, "this.cycleRound:", this.cycleRound);
		console.log("this is this", this);
		// Calculate the new this.cycle and this.cycleRound values
		if (this.round === 1) {
			this.cycle = 1;
			this.cycleRound = 1;
		} else if (this.round === 2) {
			this.cycle = 1;
			this.cycleRound = 2;
		} else if (this.round === 3) {
			this.cycle = 2;
			this.cycleRound = 1;
		} else if (this.round > 2 && (this.round - 1) % 2 === 0) {
			this.cycle++;
			this.cycleRound = 1;
		} else {
			this.cycleRound = 2;
		}

		// Update the this.cycle and this.cycleRound values in the combat data
		await this.setFlag("metanthropes-system", "this.cycle", this.cycle);
		await this.setFlag("metanthropes-system", "this.cycleRound", this.cycleRound);

		// Reroll initiative for all combatants at the start of a new this.cycle (every odd this.cycleRound)
		if (this.cycle > 1 && this.cycleRound === 1) {
			console.log("Metanthropes RPG re-rolling initiative for nextRound === +++ === +++ === ");
			console.log("this.round:", this.round, "this.cycle:", this.cycle, "this.cycleRound:", this.cycleRound);
			console.log("this is this", this);
			console.log("this.combatants", this.combatants);
			const combatantIds = this.combatants.map((combatant) => combatant.id);
			// this will have the GM auto-roll all subsequent initiative rolls
			// await this.rollInitiative(combatantIds);
			await this.resetAll();
		}

		return this;
	}

	/* -------------------------------------------- */
}
