import { MetaInitiative } from "../helpers/metainitiative.mjs";
export class MetanthropesCombat extends Combat {
	//adding the concept of Cycles to the combat system
	constructor(data, context) {
		super(data, context);
		this.cycle = 1;
		this.cycleRound = 1;
	}
	async _sortCombatants(a, b) {
		const ia = Number.isNumeric(a.initiative) ? a.initiative : -Infinity;
		const ib = Number.isNumeric(b.initiative) ? b.initiative : -Infinity;
		const astatValue = a.actor.getFlag("metanthropes-system", "initiative")?.statValue ?? -Infinity;
		const bstatValue = b.actor.getFlag("metanthropes-system", "initiative")?.statValue ?? -Infinity;
		console.log("Metanthropes RPG - from within sortCombatants  === +++ === +++ ===");
		console.log("a:", a);
		console.log("b:", b);
		console.log("a.initiative:", a.initiative);
		console.log("b.initiative:", b.initiative);
		console.log("astatValue:", astatValue);
		console.log("bstatValue:", bstatValue);
		console.log("ia:", ia);
		console.log("ib:", ib);
		console.log("ib - ia:", ib - ia);
		console.log("astatValue > bstatValue:", astatValue > bstatValue);
		// sort by initiative first, then sort by statValue if the initiative is the same
		return ib - ia || (astatValue > bstatValue ? -1 : 1);
	}
		// If initiative result level is the same, sort by statValue
		// this particular line is checking first to see if we have already started the initiative (the flags would exist and would be set, otherwise undefined) and if not set it to -Infinity so the combatant can be added to the combat tracker.
		//	const astatValue = a.actor.getFlag("metanthropes-system", "initiative")?.statValue ?? -Infinity;
		//	const bstatValue = b.actor.getFlag("metanthropes-system", "initiative")?.statValue ?? -Infinity;
		//
		//	return bstatValue - astatValue || (a.id > b.id ? 1 : -1);
	
	//todo: award Destiny and re-roll initiative if tied both in Initiative and statValue
	//	if (astatValue !== undefined && bstatValue !== undefined) {
	//		if (astatValue == bstatValue) {
	//			let aDestiny = a.actor.system.Vital.Destiny.value;
	//			let bDestiny = b.actor.system.Vital.Destiny.value;
	//			//a.initiative = 0;
	//			//b.initiative = 0;
	//			console.log(
	//				"Metanthropes RPG - Actors tied in initiative",
	//				a.actor.name,
	//				a.initiative,
	//				astatValue,
	//				"aDestiny:",
	//				aDestiny,
	//				"&",
	//				b.actor.name,
	//				b.initiative,
	//				bstatValue,
	//				"bDestiny:",
	//				bDestiny
	//			);
	//			//todo: give them a destiny point and roll again
	//			//await MetaInitiative(a);
	//			//await MetaInitiative(b);
	//			return bstatValue - astatValue || (a.id > b.id ? 1 : -1);
	//		} else {
	//			return bstatValue - astatValue || (a.id > b.id ? 1 : -1);
	//		}
	//	}
	/**
	 * Roll initiative for one or multiple Combatants within the Combat document
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
		console.log("=======++++++++++++++============");
		console.log("Metanthropes RPG inside rollInitiative");
		console.log("=======++++++++++++++============");
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
			const roll = await MetaInitiative(combatant);
			console.log("=======++++++++++++++============");
			console.log("Metanthropes RPG using metainitiative:", roll, "combatant:", combatant);
			console.log("=======++++++++++++++============");
			const initiativeData = combatant.actor.getFlag("metanthropes-system", "initiative");
			const initiativeResult = initiativeData.initiativeValue;
			updates.push({ _id: id, initiative: initiativeResult });
			//	// Construct chat message data
			//	let messageData = foundry.utils.mergeObject(
			//		{
			//			speaker: ChatMessage.getSpeaker({
			//				actor: combatant.actor,
			//				token: combatant.token,
			//				alias: combatant.name,
			//			}),
			//			flavor: game.i18n.format("COMBAT.RollsInitiative", { name: combatant.name }),
			//			flags: { "core.initiativeRoll": true },
			//		},
			//		messageOptions
			//	);
			//! warning: I am not taking into account hidding combatants
			//todo: need to figure out a way to pass this into the metainitiative
			//	const chatData = await roll.toMessage(messageData, { create: false });
			//
			//	// If the combatant is hidden, use a private roll unless an alternative rollMode was explicitly requested
			//	chatData.rollMode =
			//		"rollMode" in messageOptions
			//			? messageOptions.rollMode
			//			: combatant.hidden
			//			? CONST.DICE_ROLL_MODES.PRIVATE
			//			: chatRollMode;
			//	figure out how to play 1 sound for all initiative rolls?
			//	// Play 1 sound for the whole rolled set
			//	if (i > 0) chatData.sound = null;
			//	messages.push(chatData);
		}
		if (!updates.length) return this;
		// Update multiple combatants
		await this.updateEmbeddedDocuments("Combatant", updates);
		// Ensure the turn order remains with the same combatant
		if (updateTurn && currentId) {
			await this.update({ turn: this.turns.findIndex((t) => t.id === currentId) });
		}
		// Create multiple chat messages
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
