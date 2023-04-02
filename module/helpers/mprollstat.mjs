// MetaRollStat function is used to roll a stat and get the levels of success/failure and print the message to chat
// import metapower activation function
import { MetapowerActivate } from "./mpactivate.mjs";
export async function MetapowerRollStat(
	actor,
	stat,
	statValue,
	modifier = 0,
	bonus = 0,
	penalty = 0,
	mpname,
	destcost,
	effect
) {
	const roll = await new Roll("1d100").evaluate({ async: true });
	const total = roll.total;
	console.log("Inside MetapowerRollStat - do we have? ", mpname, destcost, effect);
	// const isSuccess = total <= statValue + modifier;
	let result = null; // isSuccess ? "Success 🟩" : "Failure 🟥";
	let resultLevel = null;
	let levelsOfSuccess = Math.floor((statValue + bonus + penalty + modifier - total) / 10);
	let levelsOfFailure = Math.floor((total - statValue - bonus - modifier - penalty) / 10);
	const criticalSuccess = total === 1;
	const criticalFailure = total === 100;
	let currentDestiny = actor.system.Vital.Destiny.value;
	// check if actor has enough destiny to deduct the cost of the meta power activation
	if (currentDestiny < destcost) {
		ui.notifications.error("You don't have enough Destiny to use this Meta Power!");
		return;
	} else {
		currentDestiny -= destcost;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
	}
	// this kicks-off the calculation, assuming that is is a failure
	if (total - modifier - penalty > statValue + bonus) {
		// in which case we don't care about what levels of success we have, so we set to 0 to avoid confusion later
		result = "Failure 🟥";
		levelsOfSuccess = 0;
		// resultlevel is used to help with ordering combatants in initiative order
		resultLevel = 0;
	} else {
		// if the calculation is <= to statValue, it's a success, so we reset the levels of failure to 0
		result = "Success 🟩";
		levelsOfFailure = 0;
		// resultlevel is used to help with ordering combatants in initiative order
		resultLevel = 0.5;
	}
	//check for critical success or failure
	//todo: review how bonuses and penalties should affect criticals
	if (criticalSuccess) {
		result = `🟩 Critical Success 🟩, rewarding ${actor.name} with +1 * 🤞`; //todo: add color and bold to crititals
		currentDestiny += 1;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		levelsOfSuccess = 10;
		if (statValue < 100) {
			levelsOfSuccess += 0;
		} else {
			levelsOfSuccess += Math.floor((statValue - 100) / 10);
		}
	}
	if (criticalFailure) {
		result = `🟥 Critical Failure 🟥, rewarding ${actor.name} with +1 * 🤞`; //todo: add color and bold to crititals
		currentDestiny += 1;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		levelsOfFailure = 10;
	}
	//* Beggining of the message to be printed to chat
	let message = `${actor.name} activates Metapower ${mpname} with ${stat} score of ${statValue}%`;
	// if we have a bonus or penalty, add it to the message
	if (bonus > 0) {
		message += `, a Bonus of +${bonus}%`;
	}
	if (penalty < 0) {
		message += `, a Penalty of ${penalty}%`;
	}
	// if we have multi-action reduction, add it to the message
	if (modifier < 0) {
		message += ` & Multi-Action reduction of ${modifier}%`;
	}
	if (destcost > 0) {
		message += `, while spending ${destcost} * 🤞 to activate`;
	}
	message += ` and the result is ${total}, therefore it is a ${result}`;
	// if we have levels of success or failure, add them to the message
	if (levelsOfSuccess > 0) {
		message += `, accumulating: ${levelsOfSuccess} * ✔️. ${actor.name} has ${currentDestiny} * 🤞 remaining.`;
		resultLevel = levelsOfSuccess;
	} else if (levelsOfFailure > 0) {
		message += `, accumulating: ${levelsOfFailure} * ❌. ${actor.name} has ${currentDestiny} * 🤞 remaining.`;
		resultLevel = -levelsOfFailure;
	} else {
		message += `. ${actor.name} has ${currentDestiny} * 🤞 remaining.`;
	}
	// add metapower effect to message
	message += ` The effect of the Metapower is: ${effect}`;
	//message += effect;
	//message += `${effect}`;
	//add re-roll button to message
	message += `<div class="metanthropes hide-button layout-hide">
	<button class="metapower-re-roll" data-actor-id="${actor.id}" data-stat="${stat}" data-stat-value="${statValue}" data-modifier="${modifier}" data-bonus="${bonus}" data-penalty="${penalty}" data-mpname="${mpname}" data-destcost="${destcost}" data-effect="${effect}" >
	🤞</button>
	<button class="metapower-activate" data-actor-id="${actor.id}" data-stat="${stat}" data-stat-value="${statValue}" data-modifier="${modifier}" data-bonus="${bonus}" data-penalty="${penalty}" data-mpname="${mpname}" data-destcost="${destcost}" data-effect="${effect}" >
	Ⓜ️</button>
	</div>`;
	//set flags for the actor to be used as the lastrolled values of your most recent roll.
	//console log for debugging
	console.log(
		"Metaroll Results: Stat:",
		statValue,
		"Roll:",
		total,
		"Multi-Action mod:",
		modifier,
		"Bonus:",
		bonus,
		"Penalty:",
		penalty,
		"levelsOfSuccess:",
		levelsOfSuccess,
		"levelsOfFailure:",
		levelsOfFailure,
		"Result:",
		result,
		"Result Level:",
		resultLevel,
		"Destiny:",
		currentDestiny
	);
	// the idea is to use these later in metapowers to spend your levels of success.
	await actor.setFlag("metanthropes-system", "lastrolled", {
		resultLevel: resultLevel,
	});
	//print message to chat and enable Dice So Nice to roll the dice and display the message
	roll.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: message,
		rollMode: game.settings.get("core", "rollMode"),
		//I've used the optional chaining operator (?.) to check if effects-metapower exists before trying to access its value. If effects-metapower or its value is not defined, it will fall back to the "error no statrolled found" text using the nullish coalescing operator (??).
		//content: item.system.effects-metapower?.value ?? "error no statrolled found",
		//content: `<button class="custom-button">🤞</button>`,
		//content seems to be overwriten by Dice So Nice, so maybe I can add my button here?
		flags: { "metanthropes-system": { actorId: actor.id } },
	});
}
// Function to handle re-roll for destiny
export async function MetapowerReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const stat = button.dataset.stat;
	const statValue = parseInt(button.dataset.statValue);
	const modifier = parseInt(button.dataset.modifier);
	const bonus = parseInt(button.dataset.bonus);
	const penalty = parseInt(button.dataset.penalty);
	const mpname = button.dataset.mpname;
	const destcost = parseInt(button.dataset.destcost);
	const effect = button.dataset.effect;
	const actor = game.actors.get(actorId);
	let currentDestiny = actor.system.Vital.Destiny.value;
	// make this function only available to the owner of the actor
	if (actor && actor.isOwner) {
		// Reduce Destiny.value by 1
		if (currentDestiny > 0) {
			currentDestiny -= 1;
			await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
			// Update re-roll button visibility
			const message = game.messages.get(button.dataset.messageId);
			if (message) {
				message.render();
			}
			MetapowerRollStat(actor, stat, statValue, modifier, bonus, penalty, mpname, destcost, effect);
		}
	}
}
