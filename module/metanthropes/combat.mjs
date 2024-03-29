import { metaInitiative } from "../metarollers/metainitiative.mjs";
import { metaLog } from "../helpers/metahelpers.mjs";

/**
 * Metanthropes Combat Class
 * Extends the base Combat class to implement additional Metanthropes-specific Combat features
 *
 * @extends {Combat}
 *
 */
export class MetanthropesCombat extends Combat {
	/** @override */
	prepareDerivedData() {
		super.prepareDerivedData();
		//? adding the concept of Cycles & Rounds to the Combat system
		let cycle = this.getFlag("metanthropes", "cycle") || 1;
		//? embed the Cycle and Round values into the Combat document for use in the Combat Tracker
		this.cycle = cycle;
		metaLog(3, "Combat", "prepareDerivedData", "Cycle:", cycle, "Round:", this.round);
	}
	/** @override */
	_sortCombatants(a, b) {
		//todo: review an error when a combat is not active? requires investigation in a clean world
		//todo: do we need a check here to proceed only if certain conditions are met like is the combat active?
		const ia = Number.isNumeric(a.initiative) ? a.initiative : -Infinity;
		const ib = Number.isNumeric(b.initiative) ? b.initiative : -Infinity;
		//? Get actor for a
		let aActor = null;
		if (a.token.actorLink) {
			const actorId = a.actorId;
			aActor = game.actors.get(actorId);
		} else {
			aActor = a.token.actor;
		}
		//? Get actor for b
		let bActor = null;
		if (b.token.actorLink) {
			const actorId = b.actorId;
			bActor = game.actors.get(actorId);
		} else {
			bActor = b.token.actor;
		}
		//? Check if we have a valid actor for both combatants
		if (!aActor || !bActor) {
			metaLog(4, "Combat", "_sortCombatants has Invalid Actors", "aActor:", aActor, "bActor:", bActor);
			return;
		}
		//? Prep the statScore values
		let aStatScore = null;
		let bStatScore = null;
		//? Proceed only if actors are valid AND NOT Duplicate or Animated
		if (
			a.initiative &&
			b.initiative &&
			!a.name.includes("Duplicate") &&
			!b.name.includes("Duplicate") &&
			!aActor.type.includes("Animated") &&
			!bActor.type.includes("Animated")
		) {
			aStatScore = aActor.getFlag("metanthropes", "lastrolled")?.InitiativeStatScore ?? -Infinity;
			bStatScore = bActor.getFlag("metanthropes", "lastrolled")?.InitiativeStatScore ?? -Infinity;
			//? Check to see if we have a perfect tie
			if (ia === ib && aStatScore === bStatScore) {
				//todo: award 1 Destiny and re-roll initiative if tied both in Initiative and statScore
				metaLog(4, "Combat", "_sortCombatants", "Perfect Tie between combatants:", a.name, "and:", b.name);
			}
		}
		//? We will sort by initiative first, then sort by statScore if the initiative is the same
		return ib - ia || (aStatScore > bStatScore ? -1 : 1);
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
		metaLog(3, "Combat", "rollInitiative", "Engaged");
		//? Structure input data
		ids = typeof ids === "string" ? [ids] : ids;
		//? Iterate over Combatants, performing an initiative roll for each
		const updates = [];
		for (let [i, id] of ids.entries()) {
			//? Get Combatant data (non-strictly)
			const combatant = this.combatants.get(id);
			if (!combatant?.isOwner) continue;
			//? Produce an initiative roll for the Combatant
			metaLog(3, "Combat", "rollInitiative", "Engaging metaInitiative for combatant:", combatant);
			await metaInitiative(combatant);
			let initiativeResult = combatant.actor.getFlag("metanthropes", "lastrolled").Initiative;
			metaLog(
				3,
				"Combat",
				"rollInitiative",
				"metaInitiative result for combatant:",
				combatant,
				"is:",
				initiativeResult
			);
			updates.push({ _id: id, initiative: initiativeResult });
		}
		if (!updates.length) return this;
		//? Update multiple combatants
		await this.updateEmbeddedDocuments("Combatant", updates);
		return this;
	}
	/**
	 * Return to the previous turn in the turn order
	 * Checks to see if the combat has been started before reversing the turn
	 *
	 * @override
	 *
	 * @returns {Promise<Combat>}
	 */
	async previousTurn() {
		metaLog(3, "Combat", "previousTurn", "Engaged");
		if (!this.started)
			return ui.notifications.warn("You must begin the encounter before reversing to previous turn!");
		super.previousTurn();
	}
	/**
	 * Advance the combat to the next turn
	 * Checks to see if the combat has been started before advancing the turn
	 *
	 * @override
	 *
	 * @returns {Promise<Combat>}
	 */
	async nextTurn() {
		if (!this.started) return ui.notifications.warn("You must begin the encounter before progressing the turn!");
		if (this.round % 2 !== 0) {
			//? Check if all combatants have an initiative value
			for (let combatant of this.combatants) {
				if (combatant.initiative === null || combatant.initiative === undefined) {
					ui.notifications.warn(
						"All combatants must have rolled for Initiative before progressing the Turn!"
					);
					return;
				}
			}
		}
		super.nextTurn();
	}
	/**
	 * Return to the previous Round in the combat encounter
	 * Checks to see if the combat has been started before reversing the Round
	 * todo: need to review the Cycle / Round assignment when reversing
	 *
	 * @override
	 *
	 * @returns {Promise<Combat>}
	 */
	async previousRound() {
		metaLog(3, "Combat", "previousRound", "Engaged");
		if (!this.started)
			return ui.notifications.warn("You must begin the encounter before reversing to previous Round!");
		super.previousRound();
	}
	/**
	 * Previous Round reverts the combat to a previous round
	 * todo: need to review the Cycle / Round assignment when reversing
	 * Checks to see if the combat has been started before reversing the Round
	 *
	 * @override
	 *
	 * @returns {Promise<Combat>}
	 */
	async nextRound() {
		metaLog(3, "Combat", "nextRound", "Engaged");
		if (!this.started)
			return ui.notifications.warn("You must begin the encounter before progressing to the next Round!");
		if (this.round % 2 !== 0) {
			//? Check if all combatants have an initiative value
			for (let combatant of this.combatants) {
				if (combatant.initiative === null || combatant.initiative === undefined) {
					ui.notifications.warn(
						"All combatants must have rolled for Initiative before progressing the Turn!"
					);
					return;
				}
			}
		}
		//todo: we should not be calling super here cause it will cause a return and update of the combat document,
		//todo: instead we should integrate what foundry does and replace as needed
		await super.nextRound();
		//* End of Round Effects
		//? Iterate over Combatants
		for (let combatant of this.combatants.values()) {
			//? get the actor for the combatant
			const actor = combatant.actor;
			//* Active Effect Expiration
			//? Fetch Active Effects with a duration of 'None' and toggle them off
			let expiredEffects = [];
			let effects = actor.effects.filter((e) => e.duration.label === "None");
			expiredEffects.push(...effects);
			await Promise.all(expiredEffects.map((e) => e.update({ disabled: true })));
			//todo Core Conditions should be made into objects (vs arrays) in the template
			//todo this will allow to have a single function that controls this, using .label and .effectdescr etc and simplify the code
			//* Unconscious Condition
			const unconsciousLevel = actor.system.Characteristics.Soul.CoreConditions.Unconscious;
			if (unconsciousLevel > 0) {
				let unconsciousEffect = "";
				switch (unconsciousLevel) {
					case 1:
						unconsciousEffect =
							"The Character enters a semi-awake state of narcolepsy, and possibly might fall asleep standing for a few seconds. A Character who is sleeping or has passed out, cannot attempt any Actions or Movement, and neither is aware of their surroundings.The Character can attempt to awake in case of something moves them a bit, or in case of any loud noises. At the end of each Round, the unconscious Character attempting to wake up might attempt an Endurance roll (Free Roll), and if successful they wake up.";
						break;
					case 2:
						unconsciousEffect =
							"The Character slowly loses their standing and falls asleep for some minutes. The Character further receives the Condition: Knocked Down. A Character who is sleeping or has passed out, cannot attempt any Actions or Movement, and neither is aware of their surroundings. The Character can attempt to awake in case of something heavily shakes them, or in case of hearing loud noises from up close. At the end of each Round, the unconscious Character attempting to wake up might attempt an Endurance roll (Free Roll), and if successful they wake up.";
						break;
					case 3:
						unconsciousEffect =
							"The Character slowly loses their standing and falls into a deep, passed-out sleep for some hours. A Character who is sleeping or has passed out, cannot attempt any Actions or Movement, and neither is aware of their surroundings. The Character further receives the Condition: Knocked Down. The Character can attempt to awake in case of free-falling, or in case of hearing extremely loud noises from up close. At the end of each Round, the unconscious Character attempting to wake up might attempt an Endurance roll (Free Roll), and if successful they wake up.";
						break;
					case 4:
						unconsciousEffect =
							"The Character collapses into a comatose state for days. A Character who is sleeping or has passed out, cannot attempt any Actions or Movement, and neither is aware of their surroundings. The Character further receives the Condition: Knocked Down. The Character must spend 1 * 🤞 Destiny to attempt to be awakened from the coma. At the end of each Round, the unconscious Character attempting to wake up might attempt an Endurance roll (Free Roll), and if successful they wake up.";
						break;
					case 5:
						unconsciousEffect =
							"The Character collapses into a deep coma for an unknown amount of time. A Character who is sleeping or has passed out, cannot attempt any Actions or Movement, and neither is aware of their surroundings. The Character further receives the Condition: Knocked Down. The Character must spend 2 * 🤞 Destiny to attempt to be awakened from the coma. At the end of each Round, the unconscious Character attempting to wake up might attempt an Endurance roll (Free Roll), and if successful they wake up.";
						break;
					default:
						metaLog(2, "Combat", "nextRound", "Unconscious Level is out of bounds:", unconsciousLevel);
						break;
				}
				//? Create a chat message indicating the Unconscious effect
				await ChatMessage.create({
					content: `Is affected by the Unconscious Condition Level ${unconsciousLevel}, with the following effect:<br><br><p>${unconsciousEffect}</p><br><br>`,
					speaker: ChatMessage.getSpeaker({ actor: actor }),
				});
			}
			//* Asphyxiation Condition
			const asphyxiationLevel = actor.system.Characteristics.Body.CoreConditions.Asphyxiation;
			if (asphyxiationLevel > 0) {
				let asphyxiationEffect = "";
				switch (asphyxiationLevel) {
					case 1:
						asphyxiationEffect =
							"A Character who cannot breathe oxygen is asphyxiating. At Asphyxiation 1 the Character has trouble breathing. The Character collapse into the floor for a couple of minutes. At the end of each Round, the asphyxiating Character must attempt an Endurance roll (Free Roll). Failure on that roll causes the Character to increase the Condition to Asphyxiation 2.";
						break;
					case 2:
						asphyxiationEffect =
							"A Character who cannot breathe oxygen is asphyxiating. At Asphyxiation 2 the Character's brain is not being properly oxygenized. The Character may enter a comatose state for days. At the end of each Round, the asphyxiating Character must attempt an Endurance roll (Free Roll). Failure on that roll causes the Character to receive the Conditions: Knocked Down and Unconscious 2, up until the Character receives oxygen again.";
						break;
					case 3:
						asphyxiationEffect =
							"A Character who cannot breathe oxygen is asphyxiating. At Asphyxiation 3 the Character will being chocking and gasping for air. The Character may enter a comatose state for days. At the end of each Round, the asphyxiating Character must attempt an Endurance roll (Free Roll). Failure on that roll causes the Character to receive 2 Elemental Damage and the Conditions: Confused 2, Disoriented 2, Knocked Down and Unconscious 3, up until the Character receives oxygen again.";
						break;
					case 4:
						asphyxiationEffect =
							"A Character who cannot breathe oxygen is asphyxiating. At Asphyxiation 4 the Character is suffocating. The Character may enter a comatose state for days. At the end of each Round, the asphyxiating Character must attempt an Endurance roll (Free Roll). Failure on that roll causes the Character to receive 4d10 + 40 Psychic Damage the Conditions: Knocked Down and Unconscious 4, up until the Character receives oxygen again.";
						break;
					case 5:
						asphyxiationEffect =
							"A Character who cannot breathe oxygen is asphyxiating. At Asphyxiation 4 the Character is receiving brain damage due to lack of oxygen. The Character may enter a comatose state for days. At the end of each Round, the asphyxiating Character must attempt an Endurance roll (Free Roll). Failure on that roll causes the Character to receive 6d10 + 60 Psychic Damage the Conditions: Disconnected 4, Knocked Down and Unconscious 4, up until the Character receives oxygen again.";
						break;
					default:
						metaLog(2, "Combat", "nextRound", "Asphyxiation Level is out of bounds:", asphyxiationLevel);
						break;
				}
				//? Create a chat message indicating the Asphyxiation effect
				await ChatMessage.create({
					content: `Is affected by the Asphyxiation Condition Level ${asphyxiationLevel}, with the following effect:<br><br><p>${asphyxiationEffect}</p><br><br>`,
					speaker: ChatMessage.getSpeaker({ actor: actor }),
				});
			}
			//* Fatigue Condition
			const fatigueLevel = actor.system.Characteristics.Mind.CoreConditions.Fatigue;
			if (fatigueLevel > 0) {
				let fatigueEffect = "";
				switch (fatigueLevel) {
					case 1:
						fatigueEffect = "You are tired, you cannot attempt any Focused Actions until you rest.";
						break;
					case 2:
						fatigueEffect =
							"You are worn out, you cannot attempt any Focused Actions or Extra Actions until you rest.";
						break;
					case 3:
						fatigueEffect =
							"You are weary, you cannot attempt any Focused Actions, Extra Actions or Reactions until you rest.";
						break;
					case 4:
						fatigueEffect =
							"You are exhausted, you cannot attempt any Focused Actions, Extra Actions, Reactions or Movement until you rest. You can still forgo your Main Action slot to gain another Movement.";
						break;
					case 5:
						fatigueEffect =
							"You are collapsing, you cannot attempt any Focused Actions, Extra Actions, Reactions, Movement or Main Actions until you rest. You can only utter a few words and crawl 1 Hexagon per Turn.";
						break;
					default:
						metaLog(2, "Combat", "nextRound", "Fatigue Level is out of bounds:", fatigueLevel);
						break;
				}
				//? Create a chat message indicating the Unconscious effect
				await ChatMessage.create({
					content: `Is affected by the Fatigue Condition Level ${fatigueLevel}, with the following effect:<br><br><p>${fatigueEffect}</p><br><br>`,
					speaker: ChatMessage.getSpeaker({ actor: actor }),
				});
			}
			//* Bleeding Condition
			const bleedingLevel = actor.system.Characteristics.Body.CoreConditions.Bleeding;
			if (bleedingLevel > 0) {
				const currentLife = actor.system.Vital.Life.value;
				const newLife = Number(currentLife) - Number(bleedingLevel);
				await actor.update({ "system.Vital.Life.value": newLife });
				//? Create a chat message indicating the Bleeding effect
				await ChatMessage.create({
					content: `Lost ${bleedingLevel} ❤️ Life due to Bleeding Condition ${bleedingLevel}.<br><br>`,
					speaker: ChatMessage.getSpeaker({ actor: actor }),
				});
			}
		}
		//* Update the Cycle and Round values
		//? Get the most recent Cycle and Round values from the Combat document
		let cycle = (await this.getFlag("metanthropes", "cycle")) || 1;
		switch (this.round) {
			case 1:
				cycle = 1;
				break;
			case 2:
				cycle = 1;
				break;
			case 3:
				cycle = 2;
				console.log("case3");
				break;
			default:
				if (this.round > 2 && (this.round - 1) % 2 === 0) {
					cycle++;
				}
				break;
		}
		//? Set cycle as part of Combat document
		this.cycle = cycle;
		//? Set cycle as a flag in the Combat document
		await this.setFlag("metanthropes", "cycle", cycle);
		//? Reroll initiative for all combatants at the start of a new Cycle
		if (cycle > 1 && this.round % 2 !== 0) {
			await this.resetAll();
			this.setupTurns();
			await ChatMessage.create({
				content: `<br>New Cycle: ${cycle} Round: ${this.round}<br><br>Roll Inititiative!<br><br>`,
				speaker: {
					alias: "Metanthropes Combat",
				},
			});
		} else {
			//? Create a chat message indicating the new Round
			await ChatMessage.create({
				content: `<br>Cycle: ${cycle} Round: ${this.round}<br><br>`,
				speaker: {
					alias: "Metanthropes Combat",
				},
			});
		}
		metaLog(3, "Combat", "nextRound", "Finished");
		return this;
	}
	/**
	 * Show a chat message when Combat Begins
	 * Also ensures that all Combatants have rolled for initiative before starting the Encounter
	 *
	 * @override
	 *
	 * @returns {Promise<Combat>}
	 */
	async startCombat() {
		//? Check if Combat is already active
		if (this.started) return ui.notifications.warn("Combat Encounter has already started!");
		//? Check if all combatants have an initiative value
		for (let combatant of this.combatants) {
			if (combatant.initiative === null || combatant.initiative === undefined) {
				ui.notifications.warn(
					"All combatants must have rolled for Initiative before starting Combat Encounter!"
				);
				return;
			}
		}
		await ChatMessage.create({
			content: `<br>Combat Encounter Begins!<br><br>`,
			speaker: { alias: "Metanthropes Combat" },
		});
		return super.startCombat();
	}
	/**
	 * Show a chat message when Combat Ends
	 *
	 * @override
	 *
	 * @returns {Promise<Combat>}
	 */
	async endCombat() {
		return Dialog.confirm({
			title: game.i18n.localize("COMBAT.EndTitle"),
			content: `<p>${game.i18n.localize("COMBAT.EndConfirmation")}</p>`,
			yes: async () => {
				const combatCycle = await this.getFlag("metanthropes", "cycle");
				const combatRound = this.round;
				const combatCycleMessage = `${combatCycle} Cycle${combatCycle === 1 ? "" : "s"}`;
				const combatRoundMessage = `${combatRound} Round${combatRound === 1 ? "" : "s"}`;
				await ChatMessage.create({
					content: `<br>Combat Encounter Ended after ${combatCycleMessage} and ${combatRoundMessage}!<br><br>`,
					speaker: { alias: "Metanthropes Combat" },
				});
				//? End the combat
				this.delete();
			},
		});
	}
}
