//? Import dependencies
import { MetaRoll } from "../metanthropes/metaroll.mjs";
/**
 * MetaInitiative handles Initiative rolls for a given combatant.
 *
 * This function determines the best stat to use for Initiative based on the combatant's Metapowers.
 * It then calls the MetaRoll function for that stat and updates the combatant's Initiative score with the result.
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
	console.log(
		"Metanthropes RPG System | MetaInitiative | Engaged for combatant:",
		combatant,
		"and preparing actor data"
	);
	//? Check to see if this is a linked actor
	let actor = null;
	//! not working for v10
	if (combatant.token.actorLink) {
		//? If it is, get data directly from the actor document
		let actorId = combatant.actorId;
		actor = game.actors.get(actorId);
	} else {
		//? If it's not linked, get data from the token document
		actor = combatant.token.actor;
	}
	//? Initialize the actor's RollStat table before proceeding
	await actor.getRollData();
	console.log("Metanthropes RPG System | MetaInitiative | Engaged for", actor.type + ":", actor.name);
	//? Check for alternate Stat to use for Initiative
	const reflexesStat = "Reflexes";
	const awarenessStat = "Awareness";
	const perceptionStat = "Perception";
	const reflexesScore = actor.system.RollStats[reflexesStat];
	const awarenessScore = actor.system.RollStats[awarenessStat];
	const perceptionScore = actor.system.RollStats[perceptionStat];
	let initiativeStat;
	//? Check for metapowers that allow other Initiative stat than Reflexes
	const metapowers = actor.items.filter((item) => item.type === "Metapower");
	const hasDangerSense = metapowers.some((metapower) => metapower.name === "Danger Sense");
	const hasTemporalAwareness = metapowers.some((metapower) => metapower.name === "Temporal Awareness");
	//? Evaluate the best available stat to use for Initiative
	let initiativeStats = [{ name: reflexesStat, score: reflexesScore }];
	if (hasDangerSense) {
		initiativeStats.push({ name: awarenessStat, score: awarenessScore });
	}
	if (hasTemporalAwareness) {
		initiativeStats.push({ name: perceptionStat, score: perceptionScore });
	}
	//? Sort the stats array in descending order based on the stat score
	initiativeStats.sort((a, b) => b.score - a.score);
	//? The initiativeStat is the name of the stat with the highest score
	initiativeStat = initiativeStats[0].name;
	//? Call MetaRoll
	let action = "Initiative";
	console.log(
		"Metanthropes RPG System | MetaInitiative | Engaging MetaRoll for",
		actor.name + "'s Initiative with",
		initiativeStat
	);
	await MetaRoll(actor, action, initiativeStat);
	//todo have to decide how core conditions are going to be evaluated
	//? Update the combatant with the new initiative score
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
	currentDestiny -= 1;
	await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
	await MetaInitiative(combatant);
	//? Refresh the actor sheet if it's open
	const sheet = actor.sheet;
	if (sheet && sheet.rendered) {
		sheet.render(true);
	}
	console.log("Metanthropes RPG System | MetaInitiativeReRoll | MetaInitiative finished, no reason to exist?");
}
