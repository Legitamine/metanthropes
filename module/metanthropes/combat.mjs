import { MetaInitiative } from "../helpers/metainitiative.mjs";

export class MetanthropesCombat extends Combat {
	//	_sortCombatants(a, b) {
	//		console.log("from within sortCombatants  === +++ === +++ === ");
	//		const aActor = game.actors.get(a.actorId);
	//		const bActor = game.actors.get(b.actorId);
//	
	//		const aInitiativeData = aActor.getFlag("metanthropes-system", "initiative");
	//		const bInitiativeData = bActor.getFlag("metanthropes-system", "initiative");
//	
	//		// First, sort by levelsOfSuccess (descending)
	//		if (aInitiativeData.levelsOfSuccess > bInitiativeData.levelsOfSuccess) return -1;
	//		if (aInitiativeData.levelsOfSuccess < bInitiativeData.levelsOfSuccess) return 1;
//	
	//		// Next, sort by resultLevel (ascending)
	//		if (aInitiativeData.resultLevel < bInitiativeData.resultLevel) return -1;
	//		if (aInitiativeData.resultLevel > bInitiativeData.resultLevel) return 1;
//	
	//		// Finally, sort by levelsOfFailure (ascending)
	//		if (aInitiativeData.levelsOfFailure < bInitiativeData.levelsOfFailure) return -1;
	//		if (aInitiativeData.levelsOfFailure > bInitiativeData.levelsOfFailure) return 1;
//	
	//		// If everything is equal, use the default sorting method
	//		return super._sortCombatants(a, b);
	//	}
	// this gets called multiple times throughout the combat
	//	_prepareCombatant(c, scene, players, settings = {}) {
	//		console.log("from within prepareCombatant  === +++ === +++ === ");
	//		const combatant = super._prepareCombatant(c, scene, players, settings);
	//		const actor = game.actors.get(c.actorId);
	//		const initiativeData = actor.getFlag("metanthropes-system", "initiative");
	//		combatant.initiative = initiativeData.initiativeValue;
	//		return combatant;
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
		const chatRollMode = game.settings.get("core", "rollMode");

		// Iterate over Combatants, performing an initiative roll for each
		const updates = [];
		const messages = [];
		for (let [i, id] of ids.entries()) {
			// Get Combatant data (non-strictly)
			const combatant = this.combatants.get(id);
			if (!combatant?.isOwner) continue;

			//	// Produce an initiative roll for the Combatant
			//	const roll = combatant.getInitiativeRoll(formula);
			//	console.log("=======++++++++++++++============");
			//	console.log("Metanthropes RPG inside combatant.getInitiativeRoll(formula)roll:", roll, "formula:", formula);
			//	console.log("=======++++++++++++++============");
			//	await roll.evaluate({ async: true });
			//	updates.push({ _id: id, initiative: roll.total });

			// Produce an initiative roll for the Combatant
			const roll = await MetaInitiative(combatant);
			console.log("=======++++++++++++++============");
			console.log("Metanthropes RPG using metainitiative:", roll, "combatant:", combatant);
			console.log("=======++++++++++++++============");
			//await roll.evaluate({ async: true });
			const initiativeData = actor.getFlag("metanthropes-system", "initiative");
			//const initiativeData = this.actor.getFlag("metanthropes-system", "initiative");
            const initiativeResult= initiativeData.initiativeValue;
            //return initiativeValue.toString();
			updates.push({ _id: id, initiative: initiativeResult });
			//updates.push({ _id: id, initiative: roll.total });

			// Construct chat message data
			let messageData = foundry.utils.mergeObject(
				{
					speaker: ChatMessage.getSpeaker({
						actor: combatant.actor,
						token: combatant.token,
						alias: combatant.name,
					}),
					flavor: game.i18n.format("COMBAT.RollsInitiative", { name: combatant.name }),
					flags: { "core.initiativeRoll": true },
				},
				messageOptions
			);
			const chatData = await roll.toMessage(messageData, { create: false });

			// If the combatant is hidden, use a private roll unless an alternative rollMode was explicitly requested
			chatData.rollMode =
				"rollMode" in messageOptions
					? messageOptions.rollMode
					: combatant.hidden
					? CONST.DICE_ROLL_MODES.PRIVATE
					: chatRollMode;

			// Play 1 sound for the whole rolled set
			if (i > 0) chatData.sound = null;
			messages.push(chatData);
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

	//	// start combat button - here i should initialize what I need
	//	async startCombat() {
	//		await this.setupTurns();
	//		return super.startCombat();
	//	}
	//	// Next turn button when moving from one combatant to the next
	// this should include some logic on what happens when this is the last combatant and the Round is about to end?
	// this should also be used to advance time (see https://youtu.be/OlagJzZsEew?list=PLFV9z59nkHDccUbRXVt623UdloPTclIrz&t=592)
	//async nextTurn() {}
	//async previousTurn() {}
	//async nextRound() {
		//this should re-enable rolling for initiative
	//	await this.resetAll();
	//}
	//async previousRound() {}
	// this should replace the default roll initiative
	//! edw einai - ayto psanxei formula, enw egw exw allo function to do that
	async _getInitiativeFormula(combatant) {
		console.log("Metanthropes RPG inside _getInitiativeFormula  === +++ === +++ === ");
		await MetaInitiative(combatant);
	}
}
