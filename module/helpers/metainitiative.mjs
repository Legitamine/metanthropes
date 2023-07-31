//* MetaInitiative function handles Initiative rolls
/*
//* Used primarly for determing if special effects apply to the initiative roll
*/
import { MetaEvaluate } from "./metaeval.mjs";
import { MetaRoll } from "../metanthropes/metaroll.mjs";
export async function MetaInitiative(combatant) {
	const actor = combatant.actor;
	console.log("Metanthropes RPG System | MetaInitiative called for", actor.type, ":", actor.name);
	//? Check for alternate Stat to use for Initiative
	const reflexesStat = 'Reflexes';
	const awarenessStat = 'Awareness';
	const reflexesValue = actor.system.Characteristics.Body.Stats.Reflexes.Roll;
	const awarenessValue = actor.system.Characteristics.Soul.Stats.Awareness.Roll;
	let initiativeStat = reflexesStat;
	let initiativeStatValue = reflexesValue;
	//? Check if the actor has the metapower "Danger Sense" equipped
	const metapowers = actor.items.filter((item) => item.type === "Metapower");
	const hasDangerSense = metapowers.some((metapower) => metapower.name === "Danger Sense");
	//? Apply the alternate stat if the actor has Danger Sense
	if (hasDangerSense) {
		initiativeStat = awarenessStat;
		initiativeStatValue = awarenessValue;
	}
	//? Call MetaEvaluate
	let action = "Initiative";
	//! do I need to reset the value in advance?
	//	await actor.setFlag("metanthropes-system", "initiative", {
	//		initiativeValue: resultLevel,
	//	});
	console.log("Metanthropes RPG System |", actor.name, "is rolling for Initiative with:", initiativeStat, initiativeStatValue);
	//not this await MetaEvaluate (actor, action, initiativeStat, initiativeStatValue, 0, 0, 0);
	await MetaRoll (actor, action, initiativeStat);
	// Update the combatant with the new initiative value
	let checkresult = await actor.getFlag("metanthropes-system", "lastrolled").metaInitiative;
	await combatant.update({ initiative: checkresult });

	// This is to check for hidden combatants and display a different message for them in chat
	// Construct chat message data
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
	//	const chatData = await roll.toMessage(messageData, { create: false });
	//	// If the combatant is hidden, use a private roll unless an alternative rollMode was explicitly requested
	//	chatData.rollMode =
	//		"rollMode" in messageOptions
	//			? messageOptions.rollMode
	//			: combatant.hidden
	//			? CONST.DICE_ROLL_MODES.PRIVATE
	//			: chatRollMode;
	//!figure out how to play 1 sound for all initiative rolls?
	// I will take these values and store them inside an initiative flag on the actor
}
//! remove excess bonus / penalty / modifier if not needed at all for initiative
// MetaInitiativeRollStat function is used to roll a stat and get the levels of success/failure and print the message to chat
// export async function MetaInitiativeRollStat(actor, stat, statValue, modifier = 0, bonus = 0, penalty = 0) {

//}
// Function to handle re-roll for destiny
export async function MetaInitiativeReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.idactor;
	const actor = game.actors.get(actorId);
	const combatant = game.combat.getCombatantByActor(actorId);
	console.log("Metanthropes RPG  System | Do we get the correct combatant data?", combatant);
	let currentDestiny = actor.system.Vital.Destiny.value;
	// make this function only available to the owner of the actor
	if ((actor && actor.isOwner) || game.user.isGM) {
		// Reduce Destiny.value by 1
		if (currentDestiny > 0) {
			currentDestiny -= 1;
			await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
			// Update re-roll button visibility
			const message = game.messages.get(button.dataset.messageId);
			if (message) {
				message.render();
			}
			MetaInitiative(combatant);
		}
	}
}
