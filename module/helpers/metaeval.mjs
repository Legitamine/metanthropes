export async function MetaEvaluate(actor, action, stat, statValue, multiAction = 0, bonus = 0, penalty = 0) {
	let result = null;
	let resultLevel = null;
	const roll = await new Roll("1d100").evaluate({ async: true });
	const total = roll.total;
	//* bonus is expected to be a positive number and multiAction and penalty are expected to be negative numbers
	let levelsOfSuccess = Math.floor((statValue + bonus + penalty + multiAction - total) / 10);
	let levelsOfFailure = Math.floor((total - statValue - bonus - multiAction - penalty) / 10);
	const criticalSuccess = total === 1;
	const criticalFailure = total === 100;
	let currentDestiny = actor.system.Vital.Destiny.value;
	// this kicks-off the calculation, assuming that is is a failure
	if (total - multiAction - penalty > statValue + bonus) {
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
	if (criticalSuccess) {
		result = `🟩 Critical Success 🟩, rewarding ${actor.name} with +1 * 🤞`; //todo: add color and bold to crititals
		currentDestiny += 1;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		levelsOfSuccess = 10;
		levelsOfFailure = 0;
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
		levelsOfSuccess = 0;
	}
	//* Beggining of the message to be printed to chat
	let message = null;
	if (action === "StatRoll") {
		message = `Attempts a roll with ${stat} score of ${statValue}%`;
	} else if (action === "Initiative") {
		message = `Rolls for Initiative with ${stat} score of ${statValue}%`;
	}
	//? if we have a bonus or penalty, add it to the message
	if (bonus > 0) {
		message += `, a Bonus of +${bonus}%`;
	}
	if (penalty < 0) {
		message += `, a Penalty of ${penalty}%`;
	}
	//? if we have multi-action reduction, add it to the message
	if (multiAction < 0) {
		message += `, a Multi-Action reduction of ${multiAction}%`;
	}
	message += ` and the result is ${total}.<br><br>It is a ${result}`;
	//! Here is the typical calculation for the final results
	//? if we have levels of success or failure, add them to the message
	if (levelsOfSuccess > 0) {
		message += `, accumulating: ${levelsOfSuccess} * ✔️.<br><br>${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>`;
		resultLevel = levelsOfSuccess;
	} else if (levelsOfFailure > 0) {
		message += `, accumulating: ${levelsOfFailure} * ❌.<br><br>${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>`;
		resultLevel = -levelsOfFailure;
	} else {
		message += `.<br><br>${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>`;
	}
	//?add re-roll button to message, only if it's not a Critical and only if they have at least 1 destiny or more
	if (!criticalSuccess && !criticalFailure && currentDestiny > 0) {
		message += `<div class="hide-button hidden"><br><button class="metaeval-reroll" data-idactor="${actor.id}"
			data-stat="${stat}" data-statvalue="${statValue}" data-multiaction="${multiAction}"
			data-bonus="${bonus}" data-penalty="${penalty}" data-action="${action}"
			>Spend 🤞 Destiny to reroll</button><br><br></div>`;
	}
	//	if (action === "Initiative") {
	//		message += `<div class="hide-button hidden"><button class="keep-initiative" data-idactor="${actor.id}"
	//			data-stat="${stat}" data-statvalue="${statValue}" data-multiaction="${multiAction}"
	//			data-bonus="${bonus}" data-penalty="${penalty}" data-action="${action}"
	//			>Keep Initiative of: ${resultLevel}</button><br><br></div>`;
	//	}
	console.log(
		"Metanthropes RPG System |",
		"MetaEval Results for:",
		actor.name,
		"Action:",
		action,
		stat,
		":",
		statValue,
		"Roll:",
		total,
		"Multi-Action:",
		multiAction,
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
		"Current Destiny:",
		currentDestiny
	);
	//set flags for the actor to be used as the lastrolled values of your most recent roll.
	// the idea is to use these later in metapowers to spend your levels of success.
	//? Setting Flags with results
	await actor.setFlag("metanthropes-system", "lastrolled", {
		action: action,
		//!I should change to follow this format:
		metaEvaluate: resultLevel,
	});
	if (action === "Initiative") {
	await actor.setFlag("metanthropes-system", "initiative", {
		initiativeValue: resultLevel,
	});
}
	//print message to chat and enable Dice So Nice to roll the dice and display the message
	//? Printing the results to chat
	//if (action === "StatRoll") {
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
		//! I will need to figure out if I want to pass the combatant from metainitiative if I need to do that
	//	} else if (action === "Initiative") {
	//		//! not sure what's really different here, I should test some more
	//		roll.toMessage({
	//			speaker: ChatMessage.getSpeaker({
	//				actor: actor,
	//				token: combatant.token,
	//				alias: combatant.name,
	//			}),
	//			flavor: message,
	//			rollMode: game.settings.get("core", "rollMode"),
	//			flags: { "metanthropes-system": { actorId: actor.id } },
	//		});
	//	}
}
//* This is the function that is called when the destiny re-roll button is clicked
export async function MetaEvaluateReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.idactor;
	const stat = button.dataset.stat;
	const statValue = parseInt(button.dataset.statvalue);
	const multiAction = parseInt(button.dataset.multiaction);
	const bonus = parseInt(button.dataset.bonus);
	const penalty = parseInt(button.dataset.penalty);
	const actor = game.actors.get(actorId);
	const action = button.dataset.action;
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
			MetaEvaluate(actor, action, stat, statValue, multiAction, bonus, penalty);
		}
	}
}
