//? Import dependencies
import { MetaRoll } from "../metanthropes/metaroll.mjs";
/**
 * MetaInitiative handles Initiative rolls for a given combatant.
 *
 * This function determines the best stat to use for Initiative based on the combatant's Metapowers.
 * It then calls the MetaRoll function for that stat and updates the combatant's Initiative value with the result.
 * todo: I should manipulate here the Initiative result based on the combatant's Metapowers
 * The function works for both linked and unlinked actors.
 *
 * @param {Object} combatant - The combatant making the initiative roll.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * MetaInitiative(combatant);
 */
export async function MetaInitiative(combatant) {
	//? Check to see if this is a linked actor
	let actor = null;
	if (combatant.token.actorLink) {
		//? If it is, get data directly from the actor document
		let actorId = combatant.actorId;
		actor = game.actors.get(actorId);
	} else {
		//? If it's not linked, get data from the token document
		actor = combatant.token.actor;
	}
	console.log("Metanthropes RPG System | MetaInitiative | Engaged for", actor.type + ":", actor.name);
	//? Check for alternate Stat to use for Initiative
	const reflexesStat = "Reflexes";
	const awarenessStat = "Awareness";
	const perceptionStat = "Perception";
	const reflexesValue = actor.system.RollStats[reflexesStat];
	const awarenessValue = actor.system.RollStats[awarenessStat];
	const perceptionValue = actor.system.RollStats[perceptionStat];
	let initiativeStat;
	//? Check for metapowers that allow other Initiative stat than Reflexes
	const metapowers = actor.items.filter((item) => item.type === "Metapower");
	const hasDangerSense = metapowers.some((metapower) => metapower.name === "Danger Sense");
	const hasTemporalAwareness = metapowers.some((metapower) => metapower.name === "Temporal Awareness");
	//? Evaluate the best available stat to use for Initiative
	let initiativeStats = [{ name: reflexesStat, value: reflexesValue }];
	if (hasDangerSense) {
		initiativeStats.push({ name: awarenessStat, value: awarenessValue });
	}
	if (hasTemporalAwareness) {
		initiativeStats.push({ name: perceptionStat, value: perceptionValue });
	}
	//? Sort the stats array in descending order based on the stat value
	initiativeStats.sort((a, b) => b.value - a.value);
	//? The initiativeStat is the name of the stat with the highest value
	initiativeStat = initiativeStats[0].name;
	//? Call MetaRoll
	let action = "Initiative";
	console.log(
		"Metanthropes RPG System | MetaInitiative | Engaging MetaRoll for",
		actor.name + "'s Initiative with",
		initiativeStat
	);
	//? Initialize the actor's RollStat table before calling MetaRoll
	await actor.getRollData();
	await MetaRoll(actor, action, initiativeStat);
	//? Update the combatant with the new initiative value
	let checkResult = await actor.getFlag("metanthropes-system", "lastrolled").Initiative;
	console.log(
		"Metanthropes RPG System | MetaInitiative | MetaRoll Result for",
		actor.name + "'s Initiative with",
		initiativeStat,
		"was:",
		checkResult
	);
	await combatant.update({ initiative: checkResult });
}

/**
 * MetaInitiativeReRoll handles the re-roll of a previously evaluated Initiative roll by spending Destiny.
 *
 * This function is triggered when the "Spend Destiny to reroll" button is clicked in the chat.
 * It reduces the actor's Destiny by 1 and then calls the MetaInitiative function to recalculate the initiative.
 * The button is only visible to the owner of the actor or a GM.
 *
 * @param {Event} event - The event object from the button click.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * This function is typically called via an event listener and not directly.
 */

export async function MetaInitiativeReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actorUUID = button.dataset.actoruuid;
	const actor = await fromUuid(actorUUID);
	const combatant = game.combat.getCombatantByActor(actor);
	console.log("Metanthropes RPG  System | MetaInitiativeReRoll | Engaged for combatant:", combatant);
	let currentDestiny = actor.system.Vital.Destiny.value;
	//? Reduce Destiny.value by 1
	//todo if we know we have enough destiny to spend, don't need to check here as well
	if (currentDestiny > 0) {
		currentDestiny -= 1;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		//? Update re-roll button visibility
		const message = game.messages.get(button.dataset.messageId);
		if (message) {
			message.render();
		}
		//! depending on how Core Conditions are handled, this might need to be changed, as now we'll go over MetaRoll Evaluations again before we actually roll for Initiative a second time
		await MetaInitiative(combatant);
		console.log("Metanthropes RPG System | MetaInitiativeReRoll | MetaInitiative finished, no reason to exist?");
	}
}
