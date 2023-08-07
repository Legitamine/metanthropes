//* MetaInitiative function handles Initiative rolls
/*
//* Used primarly for determing if special effects apply to the initiative roll
*/
import { MetaRoll } from "../metanthropes/metaroll.mjs";
export async function MetaInitiative(combatant) {
	//? Check to see if this is a linked actor
	let actor = null;
	if (combatant.token.actorLink) {
		//? If it is, get data directly from the actor document
		let actorId = combatant.actorId;
		actor = game.actors.get(actorId);
		// actor = combatant.actor;
		} else {
		//? If it's not linked, get data from the token document
		actor = combatant.token.actor;
		}
	console.log("Metanthropes RPG System | MetaInitiative | Engaged for", actor.type + ":", actor.name);
	//? Check for alternate Stat to use for Initiative
	const reflexesStat = "Reflexes";
	const awarenessStat = "Awareness";
	let initiativeStat = reflexesStat;
	//? Check if the actor has the metapower "Danger Sense" equipped
	const metapowers = actor.items.filter((item) => item.type === "Metapower");
	const hasDangerSense = metapowers.some((metapower) => metapower.name === "Danger Sense");
	if (hasDangerSense) {
		//? Apply the alternate stat values if the actor has Danger Sense
		initiativeStat = awarenessStat;
	}
	//? Call MetaEvaluate
	let action = "Initiative";
	console.log(
		"Metanthropes RPG System | MetaInitiative | Engaging MetaRoll for",
		actor.name + "'s Initiative with",
		initiativeStat
	);
	await actor.getRollData();
	//not this await MetaEvaluate (actor, action, initiativeStat, initiativeStatValue, 0, 0, 0);
	await MetaRoll(actor, action, initiativeStat);
	// Update the combatant with the new initiative value
	let checkresult = await actor.getFlag("metanthropes-system", "initiative").initiativeValue;
	console.log(
		"Metanthropes RPG System | MetaInitiative | MetaRoll Result for",
		actor.name + "'s Initiative with",
		initiativeStat,
		//initiativeStatValue,
		"was:",
		checkresult
	);
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
	const actorUUID = button.dataset.actoruuid;
	const actor = await fromUuid(actorUUID);
	const combatant = game.combat.getCombatantByActor(actor);
	console.log("Metanthropes RPG  System | Rerolling MetaInitiative for combatant:", combatant);
	//! maybe split this off to another function?
	//! should I have a promise if this fails to work?
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
			//! do I need metainitiative here or should I just send it back to metaroll or metaevaluate?
			//! core condition step process should dictate this
			//! if I have to re-check for hunger, disease, pain, etc. then I need to send it back to metaroll that checks for these
			MetaInitiative(combatant);
		}
	}
}
