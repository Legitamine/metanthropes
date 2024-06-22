import { metaInitiative } from "../metarollers/metainitiative.mjs";
import { metaLog } from "../helpers/metahelpers.mjs";

/**
 * Metanthropes Action Scene Class
 * Extends the base Combat class to implement additional Metanthropes-specific Combat features
 *
 * @extends {Combat}
 *
 */
export class MetanthropesCombat extends Combat {
	/** @override */
	prepareDerivedData() {
		super.prepareDerivedData();
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
		//const currentId = this.combatant?.id;
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
					"All Combatants must have rolled for Initiative before starting Combat Encounter!"
				);
				return;
			}
		}
		//? Create Chat Message
		await ChatMessage.create({
			content: `Combat Encounter Begins!<br><br>`,
			speaker: { alias: "Metanthropes Action Scene" },
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
				//? Chat message
				const combatCycle = Math.ceil(this.round / 2) ?? 0;
				const combatRound = this.round ?? 0;
				const combatCycleMessage = `${combatCycle} Cycle${combatCycle === 1 ? "" : "s"}`;
				const combatRoundMessage = `${combatRound} Round${combatRound === 1 ? "" : "s"}`;
				await ChatMessage.create({
					content: `Combat Encounter Ended after:<br><br>${combatRoundMessage} and ${combatCycleMessage}!<br><br>`,
					speaker: { alias: "Metanthropes Action Scene" },
				});
				//? End the combat
				this.delete();
			},
		});
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
		if (!this.started)
			return ui.notifications.warn("You must begin the encounter before reverting to the previous turn!");
		if (!this.turn) return ui.notifications.warn("You can't go back to a Previous Turn at this time");
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
	 * Rewind the combat to the previous round
	 * @returns {Promise<Combat>}
	 */
	async previousRound() {
		if (!this.started)
			return ui.notifications.warn("You must begin the encounter before reverting to the previous Round!");
		if (!this.turn) return ui.notifications.warn("You can't go back to a Previous Round at this time");
		super.previousRound();
	}
	/**
	 * Advance the combat to the next round
	 * @returns {Promise<Combat>}
	 */
	async nextRound() {
		metaLog(3, "Combat", "nextRound", "Engaged");
		if (!this.started) {
			metaLog(3, "Combat", "nextRound", "Did not Run", "Combat has not started");
			ui.notifications.warn("You must begin the encounter before progressing to the next Round!");
			return;
		}
		//? Cycle concept
		const nextRound = this.round + 1;
		//? Reset Initiative if we are heading into a new Cycle
		if (nextRound % 2 !== 0) {
			//? Reset Initiative
			await this.resetAll();
		}
		let turn = this.turn === null ? null : 0; // Preserve the fact that it's no-one's turn currently.
		if (this.settings.skipDefeated && turn !== null) {
			turn = this.turns.findIndex((t) => !t.isDefeated);
			if (turn === -1) {
				ui.notifications.warn("COMBAT.NoneRemaining", { localize: true });
				turn = 0;
			}
		}
		let advanceTime = Math.max(this.turns.length - this.turn, 0) * CONFIG.time.turnTime;
		advanceTime += CONFIG.time.roundTime;
		// Update the document, passing data through a hook first
		const updateData = { round: nextRound, turn };
		const updateOptions = { advanceTime, direction: 1 };
		Hooks.callAll("combatRound", this, updateData, updateOptions);
		metaLog(3, "Combat", "nextRound", "Finished");
		return this.update(updateData, updateOptions);
	}
	/**
	 * A workflow that occurs at the end of each Combat Round.
	 * This workflow occurs after the Combat document update, prior round information exists in this.previous.
	 * This can be overridden to implement system-specific combat tracking behaviors.
	 * This method only executes for one designated GM user. If no GM users are present this method will not be called.
	 * @returns {Promise<void>}
	 * @protected
	 */
	async _onEndRound() {
		metaLog(4, "Combat", "_onEndRound", "Previous Round:", this.previous.round, "Current Round:", this.round);
		//* Apply End of Round Effects
		if (this.previous.round >= 1) {
			metaLog(3, "Combat", "_onEndRound", "Applying End of Round", this.round, "Effects");
			await this.metaApplyEndOfRoundEffects();
		}
		metaLog(4, "Combat", "_onEndRound", "Finished, calling super._onEndRound");
		await super._onEndRound();
	}
	/**
	 * A workflow that occurs at the start of each Combat Round.
	 * This workflow occurs after the Combat document update, new round information exists in this.current.
	 * This can be overridden to implement system-specific combat tracking behaviors.
	 * This method only executes for one designated GM user. If no GM users are present this method will not be called.
	 * @returns {Promise<void>}
	 * @protected
	 */
	async _onStartRound() {
		metaLog(
			4,
			"Combat",
			"_onStartRound",
			"Previous Round",
			this.previous.round,
			"Current Round",
			this.current.round,
			"This Round:",
			this.round
		);
		//* Add Cycle
		const nextCycle = Math.ceil(this.round / 2);
		if (this.round > 2 && this.round % 2 !== 0) {
			//? Create a chat message indicating the new Cycle and a new Initiative Roll
			metaLog(3, "Combat", "_onStartRound", "Initiative Reset for Round:", this.round);
			await ChatMessage.create({
				content: `New Round & New Cycle!<br><br>Round: ${this.round} - Cycle: ${nextCycle}<br><br>Roll Inititiative!<br><br>`,
				speaker: {
					alias: "Metanthropes Action Scene",
				},
			});
			await this.setupTurns();
		} else {
			if (this.round === 1) {
				metaLog(3, "Combat", "_onStartRound", "First Round:", this.round);
				await ChatMessage.create({
					content: `Round: ${this.round} - Cycle: ${nextCycle}<br><br>`,
					speaker: {
						alias: "Metanthropes Action Scene",
					},
				});
			} else {
				metaLog(3, "Combat", "_onStartRound", "Round:", this.round);
				await ChatMessage.create({
					content: `New Round!<br><br>Round: ${this.round} - Cycle: ${nextCycle}<br><br>`,
					speaker: {
						alias: "Metanthropes Action Scene",
					},
				});
			}
		}
		metaLog(4, "Combat", "_onStartRound", "Finished, calling super._onStartRound");
		await super._onStartRound();
	}
	/**
	 * metaApplyEndOfRoundEffects is a crude proof of concept for applying various effects at the end of each combat round
	 *
	 */
	async metaApplyEndOfRoundEffects() {
		if (this.previous.round >= 1) {
			//? Accumulate messages for the chat
			let chatContent = `Round ${this.previous.round} concluded.<br><br>Applying End of Round Effects.<br><br>`;
			//? Iterate over Combatants
			for (let combatant of this.combatants.values()) {
				//? Get the actor for the combatant
				const actor = combatant.actor;
				let combatantMessage = `<b>${actor.name}</b>:<br>`;
				//* Active Effect Expiration
				let expiredEffects = actor.effects.filter((e) => e.duration.label === "None");
				await Promise.all(expiredEffects.map((e) => e.update({ disabled: true })));
				//* Unconscious Condition
				const unconsciousLevel = actor.system.Characteristics.Soul.CoreConditions.Unconscious;
				if (unconsciousLevel > 0) {
					const unconsciousEffects = [
						"The Character enters a semi-awake state of narcolepsy, @UUID[Compendium.metanthropes-introductory.introductory.Adventure.YdClwNoSYgTmG6Y5]{Install Introductory}",
						"The Character slowly loses their standing and falls asleep for some minutes...",
						"The Character slowly loses their standing and falls into a deep, passed-out sleep for some hours...",
						"The Character collapses into a comatose state for days...",
						"The Character collapses into a deep coma for an unknown amount of time...",
					];
					if (unconsciousLevel > 0 && unconsciousLevel <= 5) {
						combatantMessage += `Unconscious Level ${unconsciousLevel}: ${
							unconsciousEffects[unconsciousLevel - 1]
						}<br>`;
					} else {
						metaLog(2, "Combat", "nextRound", "Unconscious Level is out of bounds:", unconsciousLevel);
					}
				}
				//* Asphyxiation Condition
				const asphyxiationLevel = actor.system.Characteristics.Body.CoreConditions.Asphyxiation;
				if (asphyxiationLevel > 0) {
					const asphyxiationEffects = [
						"At Asphyxiation 1 the Character has trouble breathing. The Character collapse into the floor for a couple of minutes...",
						"At Asphyxiation 2 the Character's brain is not being properly oxygenized...",
						"At Asphyxiation 3 the Character will being chocking and gasping for air...",
						"At Asphyxiation 4 the Character is suffocating...",
						"At Asphyxiation 5 the Character is receiving brain damage due to lack of oxygen...",
					];
					if (asphyxiationLevel > 0 && asphyxiationLevel <= 5) {
						combatantMessage += `Asphyxiation Level ${asphyxiationLevel}: ${
							asphyxiationEffects[asphyxiationLevel - 1]
						}<br>`;
					} else {
						metaLog(2, "Combat", "nextRound", "Asphyxiation Level is out of bounds:", asphyxiationLevel);
					}
				}
				//* Fatigue Condition
				const fatigueLevel = actor.system.Characteristics.Mind.CoreConditions.Fatigue;
				if (fatigueLevel > 0) {
					const fatigueEffects = [
						"You are tired, you cannot attempt any Focused Actions until you rest.",
						"You are worn out, you cannot attempt any Focused Actions or Extra Actions until you rest.",
						"You are weary, you cannot attempt any Focused Actions, Extra Actions or Reactions until you rest.",
						"You are exhausted, you cannot attempt any Focused Actions, Extra Actions, Reactions or Movement until you rest...",
						"You are collapsing, you cannot attempt any Focused Actions, Extra Actions, Reactions, Movement or Main Actions until you rest...",
					];
					if (fatigueLevel > 0 && fatigueLevel <= 5) {
						combatantMessage += `Fatigue Level ${fatigueLevel}: ${fatigueEffects[fatigueLevel - 1]}<br>`;
					} else {
						metaLog(2, "Combat", "nextRound", "Fatigue Level is out of bounds:", fatigueLevel);
					}
				}
				//* Bleeding Condition
				const bleedingLevel = actor.system.Characteristics.Body.CoreConditions.Bleeding;
				if (bleedingLevel > 0) {
					const currentLife = actor.system.Vital.Life.value;
					let lifeLoss;
					let newLife;
					const metaHomebrew = await game.settings.get("metanthropes", "metaHomebrew");
					if (metaHomebrew) {
						const homebrewBleeding =
							(await game.settings.get("metanthropes-homebrew", "metaBleeding")) ?? 1;
						const homebrewName =
							(await game.settings.get("metanthropes-homebrew", "metaHomebrewName")) ?? "error - Homebrew Name not defined properly";
						lifeLoss = Number(bleedingLevel) * Number(homebrewBleeding);
						newLife = Number(currentLife) - lifeLoss;
						if (homebrewBleeding !== 1)
							combatantMessage += `Lost ${lifeLoss} ❤️ Life due to ${homebrewName} for Bleeding Condition ${bleedingLevel}.<br>`;
						else
							combatantMessage += `Lost ${lifeLoss} ❤️ Life due to Bleeding Condition ${bleedingLevel}.<br>`;
					} else {
						lifeLoss = Number(bleedingLevel);
						newLife = Number(currentLife) - lifeLoss;
						combatantMessage += `Lost ${lifeLoss} ❤️ Life due to Bleeding Condition ${bleedingLevel}.<br>`;
					}
					await actor.update({ "system.Vital.Life.value": newLife });
				}
				//? Add combatant message to the overall chat content if there are any effects
				if (combatantMessage !== `<b>${actor.name}</b>:<br>`) {
					chatContent += `${combatantMessage}<br>`;
				}
			}
			//? Create the chat message
			await ChatMessage.create({
				content: chatContent,
				speaker: ChatMessage.getSpeaker({ alias: "Metanthropes Action Scene" }),
			});
		}
	}
	//todo Keeping this until we finalize the Journal text
	// async metaApplyEndOfRoundEffects() {
	// 	if (this.previous.round >= 1) {
	// 		//? Announce the End of Round effects
	// 		await ChatMessage.create({
	// 			content: `Round ${this.previous.round} concluded.<br><br>Applying End of Round ${this.previous.round} Effects.<br><br>`,
	// 			speaker: ChatMessage.getSpeaker({ alias: "Metanthropes Action Scene" }),
	// 		});
	// 		//? Iterate over Combatants
	// 		for (let combatant of this.combatants.values()) {
	// 			//? get the actor for the combatant
	// 			const actor = combatant.actor;
	// 			//* Active Effect Expiration
	// 			//? Fetch Active Effects with a duration of 'None' and toggle them off
	// 			let expiredEffects = [];
	// 			let effects = actor.effects.filter((e) => e.duration.label === "None");
	// 			expiredEffects.push(...effects);
	// 			await Promise.all(expiredEffects.map((e) => e.update({ disabled: true })));
	// 			//todo Core Conditions should be made into objects (vs arrays) in the template
	// 			//todo this will allow to have a single function that controls this, using .label and .effectdescr etc and simplify the code
	// 			//* Unconscious Condition
	// 			const unconsciousLevel = actor.system.Characteristics.Soul.CoreConditions.Unconscious;
	// 			if (unconsciousLevel > 0) {
	// 				let unconsciousEffect = "";
	// 				switch (unconsciousLevel) {
	// 					case 1:
	// 						unconsciousEffect =
	// 							"The Character enters a semi-awake state of narcolepsy, and possibly might fall asleep standing for a few seconds. A Character who is sleeping or has passed out, cannot attempt any Actions or Movement, and neither is aware of their surroundings.The Character can attempt to awake in case of something moves them a bit, or in case of any loud noises. At the end of each Round, the unconscious Character attempting to wake up might attempt an Endurance roll (Free Roll), and if successful they wake up.";
	// 						break;
	// 					case 2:
	// 						unconsciousEffect =
	// 							"The Character slowly loses their standing and falls asleep for some minutes. The Character further receives the Condition: Knocked Down. A Character who is sleeping or has passed out, cannot attempt any Actions or Movement, and neither is aware of their surroundings. The Character can attempt to awake in case of something heavily shakes them, or in case of hearing loud noises from up close. At the end of each Round, the unconscious Character attempting to wake up might attempt an Endurance roll (Free Roll), and if successful they wake up.";
	// 						break;
	// 					case 3:
	// 						unconsciousEffect =
	// 							"The Character slowly loses their standing and falls into a deep, passed-out sleep for some hours. A Character who is sleeping or has passed out, cannot attempt any Actions or Movement, and neither is aware of their surroundings. The Character further receives the Condition: Knocked Down. The Character can attempt to awake in case of free-falling, or in case of hearing extremely loud noises from up close. At the end of each Round, the unconscious Character attempting to wake up might attempt an Endurance roll (Free Roll), and if successful they wake up.";
	// 						break;
	// 					case 4:
	// 						unconsciousEffect =
	// 							"The Character collapses into a comatose state for days. A Character who is sleeping or has passed out, cannot attempt any Actions or Movement, and neither is aware of their surroundings. The Character further receives the Condition: Knocked Down. The Character must spend 1 * 🤞 Destiny to attempt to be awakened from the coma. At the end of each Round, the unconscious Character attempting to wake up might attempt an Endurance roll (Free Roll), and if successful they wake up.";
	// 						break;
	// 					case 5:
	// 						unconsciousEffect =
	// 							"The Character collapses into a deep coma for an unknown amount of time. A Character who is sleeping or has passed out, cannot attempt any Actions or Movement, and neither is aware of their surroundings. The Character further receives the Condition: Knocked Down. The Character must spend 2 * 🤞 Destiny to attempt to be awakened from the coma. At the end of each Round, the unconscious Character attempting to wake up might attempt an Endurance roll (Free Roll), and if successful they wake up.";
	// 						break;
	// 					default:
	// 						metaLog(2, "Combat", "nextRound", "Unconscious Level is out of bounds:", unconsciousLevel);
	// 						break;
	// 				}
	// 				//? Create a chat message indicating the Unconscious effect
	// 				await ChatMessage.create({
	// 					content: `Is affected by the Unconscious Condition Level ${unconsciousLevel}, with the following effect:<br><br><p>${unconsciousEffect}</p><br><br>`,
	// 					speaker: ChatMessage.getSpeaker({ actor: actor }),
	// 				});
	// 			}
	// 			//* Asphyxiation Condition
	// 			const asphyxiationLevel = actor.system.Characteristics.Body.CoreConditions.Asphyxiation;
	// 			if (asphyxiationLevel > 0) {
	// 				let asphyxiationEffect = "";
	// 				switch (asphyxiationLevel) {
	// 					case 1:
	// 						asphyxiationEffect =
	// 							"A Character who cannot breathe oxygen is asphyxiating. At Asphyxiation 1 the Character has trouble breathing. The Character collapse into the floor for a couple of minutes. At the end of each Round, the asphyxiating Character must attempt an Endurance roll (Free Roll). Failure on that roll causes the Character to increase the Condition to Asphyxiation 2.";
	// 						break;
	// 					case 2:
	// 						asphyxiationEffect =
	// 							"A Character who cannot breathe oxygen is asphyxiating. At Asphyxiation 2 the Character's brain is not being properly oxygenized. The Character may enter a comatose state for days. At the end of each Round, the asphyxiating Character must attempt an Endurance roll (Free Roll). Failure on that roll causes the Character to receive the Conditions: Knocked Down and Unconscious 2, up until the Character receives oxygen again.";
	// 						break;
	// 					case 3:
	// 						asphyxiationEffect =
	// 							"A Character who cannot breathe oxygen is asphyxiating. At Asphyxiation 3 the Character will being chocking and gasping for air. The Character may enter a comatose state for days. At the end of each Round, the asphyxiating Character must attempt an Endurance roll (Free Roll). Failure on that roll causes the Character to receive 2 Elemental Damage and the Conditions: Confused 2, Disoriented 2, Knocked Down and Unconscious 3, up until the Character receives oxygen again.";
	// 						break;
	// 					case 4:
	// 						asphyxiationEffect =
	// 							"A Character who cannot breathe oxygen is asphyxiating. At Asphyxiation 4 the Character is suffocating. The Character may enter a comatose state for days. At the end of each Round, the asphyxiating Character must attempt an Endurance roll (Free Roll). Failure on that roll causes the Character to receive 4d10 + 40 Psychic Damage the Conditions: Knocked Down and Unconscious 4, up until the Character receives oxygen again.";
	// 						break;
	// 					case 5:
	// 						asphyxiationEffect =
	// 							"A Character who cannot breathe oxygen is asphyxiating. At Asphyxiation 4 the Character is receiving brain damage due to lack of oxygen. The Character may enter a comatose state for days. At the end of each Round, the asphyxiating Character must attempt an Endurance roll (Free Roll). Failure on that roll causes the Character to receive 6d10 + 60 Psychic Damage the Conditions: Disconnected 4, Knocked Down and Unconscious 4, up until the Character receives oxygen again.";
	// 						break;
	// 					default:
	// 						metaLog(
	// 							2,
	// 							"Combat",
	// 							"nextRound",
	// 							"Asphyxiation Level is out of bounds:",
	// 							asphyxiationLevel
	// 						);
	// 						break;
	// 				}
	// 				//? Create a chat message indicating the Asphyxiation effect
	// 				await ChatMessage.create({
	// 					content: `Is affected by the Asphyxiation Condition Level ${asphyxiationLevel}, with the following effect:<br><br><p>${asphyxiationEffect}</p><br><br>`,
	// 					speaker: ChatMessage.getSpeaker({ actor: actor }),
	// 				});
	// 			}
	// 			//* Fatigue Condition
	// 			const fatigueLevel = actor.system.Characteristics.Mind.CoreConditions.Fatigue;
	// 			if (fatigueLevel > 0) {
	// 				let fatigueEffect = "";
	// 				switch (fatigueLevel) {
	// 					case 1:
	// 						fatigueEffect = "You are tired, you cannot attempt any Focused Actions until you rest.";
	// 						break;
	// 					case 2:
	// 						fatigueEffect =
	// 							"You are worn out, you cannot attempt any Focused Actions or Extra Actions until you rest.";
	// 						break;
	// 					case 3:
	// 						fatigueEffect =
	// 							"You are weary, you cannot attempt any Focused Actions, Extra Actions or Reactions until you rest.";
	// 						break;
	// 					case 4:
	// 						fatigueEffect =
	// 							"You are exhausted, you cannot attempt any Focused Actions, Extra Actions, Reactions or Movement until you rest. You can still forgo your Main Action slot to gain another Movement.";
	// 						break;
	// 					case 5:
	// 						fatigueEffect =
	// 							"You are collapsing, you cannot attempt any Focused Actions, Extra Actions, Reactions, Movement or Main Actions until you rest. You can only utter a few words and crawl 1 Hexagon per Turn.";
	// 						break;
	// 					default:
	// 						metaLog(2, "Combat", "nextRound", "Fatigue Level is out of bounds:", fatigueLevel);
	// 						break;
	// 				}
	// 				//? Create a chat message indicating the Unconscious effect
	// 				await ChatMessage.create({
	// 					content: `Is affected by the Fatigue Condition Level ${fatigueLevel}, with the following effect:<br><br><p>${fatigueEffect}</p><br><br>`,
	// 					speaker: ChatMessage.getSpeaker({ actor: actor }),
	// 				});
	// 			}
	// 			//* Bleeding Condition
	// 			const bleedingLevel = actor.system.Characteristics.Body.CoreConditions.Bleeding;
	// 			if (bleedingLevel > 0) {
	// 				const currentLife = actor.system.Vital.Life.value;
	// 				const newLife = Number(currentLife) - Number(bleedingLevel);
	// 				await actor.update({ "system.Vital.Life.value": newLife });
	// 				//? Create a chat message indicating the Bleeding effect
	// 				await ChatMessage.create({
	// 					content: `Lost ${bleedingLevel} ❤️ Life due to Bleeding Condition ${bleedingLevel}.<br><br>`,
	// 					speaker: ChatMessage.getSpeaker({ actor: actor }),
	// 				});
	// 			}
	// 		}
	// 	}
	// }
}
