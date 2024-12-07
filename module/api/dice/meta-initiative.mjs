import { metaSheetRefresh } from "../../helpers/metahelpers.mjs";

/**
 * metaInitiative handles Initiative rolls for a given combatant.
 *
 * This function determines the best stat to use for Initiative based on the combatant's Metapowers.
 * It then calls the metaRoll function for that stat and updates the combatant's Initiative score with the result.
 * !asxeto: sto initiative den ekane reroll to dice so nice
 * todo: I should manipulate here the Initiative result based on the combatant's Metapowers
 * todo: I need to figure out a way to kick combatants off the active encounter if it's their turn to play or to roll for initiative and are unconscious
 * The function works for both linked and unlinked actors.
 *
 * @param {Object} combatant - The combatant making the initiative roll.
 * @param {string} [messageId=null] - The message ID of the chat message for the reroll, if any.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * metaInitiative(combatant);
 */
export async function metaInitiative(combatant, messageId = null) {
	metanthropes.utils.metaLog(3, "metaInitiative", "Engaged for combatant:", combatant.name);
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
	//? Initialize the actor's RollStat array before proceeding
	await actor.getRollData();
	metanthropes.utils.metaLog(3, "metaInitiative", "Engaged for:", actor.name);
	//? Check for alternate Stat to use for Initiative
	const reflexesStat = "Reflexes";
	const awarenessStat = "Awareness";
	const perceptionStat = "Perception";
	const reflexesScore = actor.system.RollStats[reflexesStat];
	const awarenessScore = actor.system.RollStats[awarenessStat];
	const perceptionScore = actor.system.RollStats[perceptionStat];
	let initiativeStatRolled;
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
	//? The initiativeStatRolled becomes the name of the stat with the highest score
	initiativeStatRolled = initiativeStats[0].name;
	//? Call metaRoll
	let action = "Initiative";
	let initiativeResult;
	//* Special Initiative Rules
	if (!(actor.name.includes("Duplicate") || actor.type.includes("Animated"))) {
		//? If the actor is not a Duplicate or Animated, metaRoll for Initiative
		metanthropes.utils.metaLog(
			3,
			"metaInitiative",
			"Engaging metaRoll for:",
			actor.name + "'s",
			action,
			"with",
			initiativeStatRolled,
			"Message ID:",
			messageId
		);
		await metanthropes.dice.metaRoll(actor, action, initiativeStatRolled, false, 0, null, messageId);
		initiativeResult = await actor.getFlag("metanthropes", "lastrolled").Initiative;
	} else {
		//* Logic for Duplicates & Animated
		//? Duplicates from Duplicate Self Metapower get a -11 Initiative, this will ensure they always go last
		//? We account for multiple Actors (Duplicates/Animated), to ensure proper order based on their Reflexes score
		const initiativeStatScore = initiativeStats[0].score;
		let normalizedScore = initiativeStatScore > 300 ? 100 : initiativeStatScore / 5;
		const decimalPart = (100 - normalizedScore).toString().padStart(2, "0");
		initiativeResult = parseFloat(`-11.${decimalPart}`);
		await actor.setFlag("metanthropes", "lastrolled", { Initiative: initiativeResult });
	}
	//todo add Metapowers that affect Initiative results
	//? Update the combatant with the new initiative score
	await combatant.update({ initiative: initiativeResult });
	//? Ensure the turn order is reset after rolling Initiative
	await game.combat.update({ turn: null });
	await game.combat.setupTurns();
	metanthropes.utils.metaLog(
		3,
		"metaInitiative",
		"metaRoll Result for",
		actor.name + "'s Initiative with",
		initiativeStatRolled,
		"was:",
		initiativeResult
	);
}

/**
 * metaInitiativeReRoll handles the re-roll of a previously evaluated Initiative roll by spending Destiny.
 *
 * This function is triggered when the "Spend Destiny to reroll" button is clicked in the chat.
 * It reduces the actor's Destiny by 1 and then calls the metaInitiative function to recalculate the initiative.
 * The button is only visible to the owner of the actor or a GM.
 *
 * @param {Event} event - The event object from the button click.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * This function is typically called via an event listener and not directly.
 */
export async function metaInitiativeReRoll(event) {
	event.preventDefault();
	const button = event.target;
	//? Traverse up the DOM to find the parent <li> element with the data-message-id attribute
	const messageElement = button.closest("li.chat-message");
	if (!messageElement) {
		ui.notifications.warn("Could not find the chat message element.");
		return;
	}
	//? Retrieve the message ID from the data-message-id attribute
	const messageId = messageElement.dataset.messageId;
	if (!messageId) {
		ui.notifications.warn("Could not retrieve the message ID.");
		return;
	}
	const actorUUID = button.dataset.actoruuid;
	const action = button.dataset.action;
	const actor = await fromUuid(actorUUID);
	const combatant = game.combat.getCombatantByActor(actor);
	metanthropes.utils.metaLog(3, "metaInitiativeReRoll", "Engaged for combatant:", combatant);
	let currentDestiny = actor.system.Vital.Destiny.value;
	//? Reduce Destiny.value by 1
	currentDestiny--;
	await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
	metanthropes.utils.metaLog(3, "metaInitiativeReRoll", "Engaging metaInitiative for:", actor.name);
	await metaInitiative(combatant, messageId);
	//? Refresh the actor sheet if it's open
	metaSheetRefresh(actor);
}
