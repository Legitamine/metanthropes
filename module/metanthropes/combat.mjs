import { MetaInitiative } from "../helpers/metainitiative.mjs";
import { metaLog } from "../helpers/metahelpers.mjs";

/**
 * Metanthropes Combat Class
 * Extends the base Combat class to implement additional Metanthropes-specific Combat features
 * 
 * @extends {Combat}
 * 
 */
export class MetanthropesCombat extends Combat {
	//? adding the concept of Cycles & Rounds to the Combat system
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
		metaLog(3, "Combat", "prepareDerivedData", "Cycle:", cycle, "Round:", cycleRound);
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
				metaLog(4, "Combat", "_sortCombatants", "Perfect Tie between combatants:", a.name, "and:", b.name);
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
			metaLog(3, "Combat", "rollInitiative", "Engaging MetaInitiative for combatant:", combatant);
			await MetaInitiative(combatant);
			let initiativeResult = combatant.actor.getFlag("metanthropes-system", "lastrolled").Initiative;
			metaLog(
				3,
				"Combat",
				"rollInitiative",
				"MetaInitiative result for combatant:",
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
	async nextRound() {
		metaLog(3, "Combat", "nextRound", "Engaged");
		await super.nextRound();
		//* End of Round Effects
		//? Iterate over Combatants
		for (let combatant of this.combatants.values()) {
			//? get the actor for the combatant
			const actor = combatant.actor;
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
					content: `Is affected by the Unconscious Condition Level ${unconsciousLevel}, with the following effect:<br><br>${unconsciousEffect}`,
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
					content: `Is affected by the Asphyxiation Condition Level ${asphyxiationLevel}, with the following effect:<br><br>${asphyxiationEffect}`,
					speaker: ChatMessage.getSpeaker({ actor: actor }),
				});
			}
			//* Fatigue Condition
			const fatigueLevel = actor.system.Characteristics.Mind.CoreConditions.Fatigue;
			if (fatigueLevel > 0) {
				let fatigueEffect = "";
				switch (fatigueLevel) {
					case 1:
						fatigueEffect =
							"You are tired, you cannot attempt any Focused Actions until you rest.";
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
					content: `Is affected by the Fatigue Condition Level ${fatigueLevel}, with the following effect:<br><br>${fatigueEffect}`,
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
					content: `Lost ${bleedingLevel} ❤️ Life due to Bleeding Condition!`,
					speaker: ChatMessage.getSpeaker({ actor: actor }),
				});
			}
		}
		//* Update the Cycle and Round values
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
		//? Reroll initiative for all combatants at the start of a new Cycle
		if (cycle > 1 && cycleRound === 1) {
			await this.resetAll();
			this.setupTurns();
			await ChatMessage.create({
				content: `<br><br>New Cycle: ${cycle} Round: ${cycleRound}<br><br>Roll Inititiative!<br>`,
				speaker: {
					alias: "Metanthropes Combat",
				},
			});
		} else {
			//? Create a chat message indicating the new Round
			await ChatMessage.create({
				content: `<br><br>Cycle: ${cycle} Round: ${cycleRound}<br>`,
				speaker: {
					alias: "Metanthropes Combat",
				},
			});
		}
		metaLog(3, "Combat", "nextRound", "Finished");
		return this;
	}
}
