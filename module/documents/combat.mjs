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
		//todo: should simply change to let aActor = a.actor; utilizing the getter of the combatant
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
			metanthropes.utils.metaLog(
				4,
				"Combat",
				"_sortCombatants has Invalid Actors",
				"aActor:",
				aActor,
				"bActor:",
				bActor,
			);
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
				metanthropes.utils.metaLog(
					1,
					"Combat",
					"_sortCombatants",
					"'Perfect Tie' between combatants:",
					a.name,
					"and:",
					b.name,
				);
				//ui.notifications.warn(`'Perfect Tie' between combatants: ${a.name} & ${b.name}`);
				//a.combat.rollInitiative([a._id, b._id]);
				//todo: want to set the a.inititaive value
				//aActor.applyDestinyChange(1);
				//bActor.applyDestinyChange(1);
				//todo: instead of the below resetAll, do for only the affected combatants?
				// 				  async resetAll({updateTurn=true}={}) {
				//     const currentId = this.combatant?.id;
				//     for ( const c of this.combatants ) c.updateSource({initiative: null});
				//     this.setupTurns();
				//     const update = {combatants: this.combatants.toObject()};
				//     if ( updateTurn && currentId ) update.turn = this.turns.findIndex(t => t.id === currentId);
				//     await this.update(update, {turnEvents: false, diff: false});
				//   }
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
		metanthropes.utils.metaLog(3, "Combat", "rollInitiative", "Engaged");
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
			metanthropes.utils.metaLog(
				3,
				"Combat",
				"rollInitiative",
				"Engaging metaInitiative for combatant:",
				combatant.name,
			);
			await metanthropes.dice.metaInitiative({combatant});
			let initiativeResult = combatant.actor.getFlag("metanthropes", "lastrolled").Initiative;
			metanthropes.utils.metaLog(
				3,
				"Combat",
				"rollInitiative",
				"metaInitiative result for combatant:",
				combatant.name,
				initiativeResult,
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
					"All Combatants must have rolled for Initiative before starting Combat Encounter!",
				);
				return;
			}
		}
		//? Create Chat Message
		await metanthropes.applications.MetaChatMessage.create({
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
			title: _loc("COMBAT.EndTitle"),
			content: `<p>${_loc("COMBAT.EndConfirmation")}</p>`,
			yes: async () => {
				//? Chat message
				const combatCycle = Math.ceil(this.round / 2) ?? 0;
				const combatRound = this.round ?? 0;
				const combatCycleMessage = `${combatCycle} Cycle${combatCycle === 1 ? "" : "s"}`;
				const combatRoundMessage = `${combatRound} Round${combatRound === 1 ? "" : "s"}`;
				await metanthropes.applications.MetaChatMessage.create({
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
						"All combatants must have rolled for Initiative before progressing the Turn!",
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
		metanthropes.utils.metaLog(3, "Combat", "nextRound", "Engaged");
		if (!this.started) {
			metanthropes.utils.metaLog(3, "Combat", "nextRound", "Did not Run", "Combat has not started");
			ui.notifications.warn("You must begin the encounter before progressing to the next Round!");
			return;
		}
		//* Cycle concept
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
		metanthropes.utils.metaLog(3, "Combat", "nextRound", "Finished, updating Combat");
		this.setFlag("metanthropes", "applyEffectsForRound", this.round);
		Hooks.callAll("combatRound", this, updateData, updateOptions);
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
		metanthropes.utils.metaLog(4, "Combat", "_onEndRound", "Engaged for end of Round:", this.previous.round);
		//* Apply End of Round Effects
		//? Need to check that previous.round is at least 1 before going further
		if (this.previous.round < 1) return await super._onEndRound();
		//? Read the flag for the last round where effects were applied
		const applyEffectsForRound = (await this.getFlag("metanthropes", "applyEffectsForRound")) ?? 0;
		if (!applyEffectsForRound)
			metanthropes.utils.metaLog(5, "Combat", "_onEndRound", "No apply Effects For Round Flag Found");
		metanthropes.utils.metaLog(
			3,
			"Combat",
			"_onEndRound",
			"Apply Effects for Round:",
			applyEffectsForRound,
			"while this is for Round:",
			this.round,
		);
		if (Number(applyEffectsForRound) < this.round) {
			metanthropes.utils.metaLog(
				3,
				"Combat",
				"_onEndRound",
				"Applying End of Round:",
				this.previous.round,
				"Effects",
			);
			await this.metaApplyEndOfRoundEffects();
			metanthropes.utils.metaLog(
				3,
				"Combat",
				"_onEndRound",
				"Finished applying end of Round",
				this.previous.round,
				"Effects",
			);
		} else {
			metanthropes.utils.metaLog(
				5,
				"Combat",
				"_onEndRound",
				"End of Round Effects already applied for Round:",
				applyEffectsForRound,
				"while this is for Round:",
				this.round,
			);
		}
		metanthropes.utils.metaLog(3, "Combat", "_onEndRound", "Finished");
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
		metanthropes.utils.metaLog(4, "Combat", "_onStartRound", "Engaged for new Round:", this.round);
		//* Add Cycle
		const nextCycle = Math.ceil(this.round / 2);
		if (this.round > 2 && this.round % 2 !== 0) {
			//? Create a chat message indicating the new Cycle and a new Initiative Roll
			metanthropes.utils.metaLog(3, "Combat", "_onStartRound", "Initiative Reset for Round:", this.round);
			await metanthropes.applications.MetaChatMessage.create({
				content: `New Round & New Cycle!<br><br>Round: ${this.round} - Cycle: ${nextCycle}<br><br>Roll for Inititiative!<br><br>`,
				speaker: {
					alias: "Metanthropes Action Scene",
				},
			});
			await this.setupTurns();
		} else {
			if (this.round === 1) {
				if (this.previous.round !== 0)
					return metanthropes.utils.metaLog(
						5,
						"Combat",
						"_onStartRound",
						"First Round did not have a Previous Round of 0",
					);
				metanthropes.utils.metaLog(3, "Combat", "_onStartRound", "First Round:", this.round);
				await metanthropes.applications.MetaChatMessage.create({
					content: `Round: ${this.round} - Cycle: ${nextCycle}<br><br>`,
					speaker: {
						alias: "Metanthropes Action Scene",
					},
				});
			} else {
				metanthropes.utils.metaLog(3, "Combat", "_onStartRound", "Round:", this.round);
				await metanthropes.applications.MetaChatMessage.create({
					content: `New Round!<br><br>Round: ${this.round} - Cycle: ${nextCycle}<br><br>`,
					speaker: {
						alias: "Metanthropes Action Scene",
					},
				});
			}
		}
		metanthropes.utils.metaLog(4, "Combat", "_onStartRound", "Finished for Round:", this.round);
		await super._onStartRound();
	}
	/**
	 * metaApplyEndOfRoundEffects is a crude proof of concept for applying various effects at the end of each combat round
	 *
	 */
	async metaApplyEndOfRoundEffects() {
		//? Check if we are past the first round
		if (this.previous.round < 1) return;
		metanthropes.utils.metaLog(
			3,
			"Combat",
			"metaApplyEndOfRoundEffects",
			"Engaged for Round:",
			this.previous.round,
		);
		//? Accumulate messages for the chat
		let chatContent = `Round ${this.previous.round} concluded.<br><br>Applying End of Round Effects.<br><br>`;
		//? Iterate over Combatants
		for (let combatant of this.combatants.values()) {
			//? Get the actor for the combatant
			const actor = combatant.actor;
			const chars = actor.system.Characteristics;
			let combatantMessage = `<b>${actor.name}</b>:<br>`;
			//* Active Effect Expiration
			let expiredEffects = actor.effects.filter((e) => e.duration.label === "None");
			await Promise.all(expiredEffects.map((e) => e.update({ disabled: true })));
			//* Unconscious Condition
			const unconsciousLevel = chars.Soul.CoreConditions.Unconscious;
			if (unconsciousLevel > 0) {
				const unconsciousEffects = [
					"METANTHROPES.COMBAT.Unconscious.level1",
					"METANTHROPES.COMBAT.Unconscious.level2",
					"METANTHROPES.COMBAT.Unconscious.level3",
					"METANTHROPES.COMBAT.Unconscious.level4",
					"METANTHROPES.COMBAT.Unconscious.level5",
				];
				if (unconsciousLevel > 0 && unconsciousLevel <= 5) {
					const label = _loc("METANTHROPES.COMBAT.Unconscious.label");
					const message = _loc(unconsciousEffects[unconsciousLevel - 1]);
					combatantMessage += `${label} ${unconsciousLevel}:<br>${message}<br><br>`;
				} else {
					metanthropes.utils.metaLog(
						2,
						"Combat",
						"nextRound",
						"Unconscious Level is out of bounds:",
						unconsciousLevel,
					);
				}
			}
			//* Asphyxiation Condition
			const asphyxiationLevel = chars.Body.CoreConditions.Asphyxiation;
			if (asphyxiationLevel > 0) {
				const asphyxiationEffects = [
					"METANTHROPES.COMBAT.Asphyxiation.level1",
					"METANTHROPES.COMBAT.Asphyxiation.level2",
					"METANTHROPES.COMBAT.Asphyxiation.level3",
					"METANTHROPES.COMBAT.Asphyxiation.level4",
					"METANTHROPES.COMBAT.Asphyxiation.level5",
				];
				if (asphyxiationLevel > 0 && asphyxiationLevel <= 5) {
					const label = _loc("METANTHROPES.COMBAT.Asphyxiation.label");
					const message = _loc(asphyxiationEffects[asphyxiationLevel - 1]);
					combatantMessage += `${label} ${asphyxiationLevel}:<br>${message}<br><br>`;
				} else {
					metanthropes.utils.metaLog(
						2,
						"Combat",
						"nextRound",
						"Asphyxiation Level is out of bounds:",
						asphyxiationLevel,
					);
				}
			}
			//* Fatigue Condition
			const fatigueLevel = chars.Mind.CoreConditions.Fatigue;
			if (fatigueLevel > 0) {
				const fatigueEffects = [
					"METANTHROPES.COMBAT.Fatigue.level1",
					"METANTHROPES.COMBAT.Fatigue.level2",
					"METANTHROPES.COMBAT.Fatigue.level3",
					"METANTHROPES.COMBAT.Fatigue.level4",
					"METANTHROPES.COMBAT.Fatigue.level5",
				];
				if (fatigueLevel <= 5) {
					const label = _loc("METANTHROPES.COMBAT.Fatigue.label");
					const message = _loc(fatigueEffects[fatigueLevel - 1]);
					combatantMessage += `${label} ${fatigueLevel}:<br>${message}<br><br>`;
				} else {
					metanthropes.utils.metaLog(
						2,
						"Combat",
						"nextRound",
						"Fatigue Level is out of bounds:",
						fatigueLevel,
					);
				}
			}
			//* Bleeding Condition
			const bleedingLevel = chars.Body.CoreConditions.Bleeding;
			if (bleedingLevel > 0) {
				const currentLife = actor.system.Vital.Life.value;
				let lifeLoss;
				let newLife;
				const metaHomebrew = metanthropes.utils.metaCheckSetting("homebrew", "metaHomebrew");
				if (metaHomebrew) {
					const homebrewBleeding = game.settings.get("metanthropes-homebrew", "metaBleeding") ?? 1;
					const homebrewName =
						game.settings.get("metanthropes-homebrew", "metaHomebrewName") ??
						"Error: Custom Homebrew Name not defined properly, please fix in the Settings";
					lifeLoss = Number(bleedingLevel) * Number(homebrewBleeding);
					newLife = Number(currentLife) - lifeLoss;
					if (homebrewBleeding !== 1)
						combatantMessage += `Lost ${lifeLoss} <i class="fa-solid fa-heart"></i> Life due to ${homebrewName} for Bleeding Condition ${bleedingLevel}.<br>`;
					else
						combatantMessage += `Lost ${lifeLoss} <i class="fa-solid fa-heart"></i> Life due to Bleeding Condition ${bleedingLevel}.<br>`;
				} else {
					lifeLoss = Number(bleedingLevel);
					newLife = Number(currentLife) - lifeLoss;
					combatantMessage += `Lost ${lifeLoss} <i class="fa-solid fa-heart"></i> Life due to Bleeding Condition ${bleedingLevel}.<br>`;
				}
				await actor.update({ "system.Vital.Life.value": newLife });
			}
			//? Add combatant message to the overall chat content if there are any effects
			if (combatantMessage !== `<b>${actor.name}</b>:<br>`) {
				chatContent += `${combatantMessage}<br>`;
			}
		}
		//? Create the chat message
		await metanthropes.applications.MetaChatMessage.create({
			content: chatContent,
			speaker: ChatMessage.getSpeaker({ alias: "Metanthropes Action Scene" }),
		});
		metanthropes.utils.metaLog(
			3,
			"Combat",
			"metaApplyEndOfRoundEffects",
			"Finished applying effects for Round:",
			this.previous.round,
		);
	}
}
