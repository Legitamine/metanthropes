//* MetaEvaluate is the function that calculates the results of a roll and prints it to chat
//* inputs like bonus is expected to be a positive number and multiAction and penalty are expected to be negative numbers
export async function MetaEvaluate(actor, action, stat, statValue, multiAction = 0, bonus = 0, penalty = 0) {
	//! We have to determine if this is a real actor or a token - or should I do that in the MetaRoll function?
	console.log("Metanthropes RPG System | MetaEvaluate | Engaged for:", actor.name, action, stat, statValue, "Multi-Action:", multiAction, "Bonus:", bonus, "Penalty:", penalty)
	//? evaluate the result of the roll
	let result = null;
	let resultLevel = null;
	const roll = await new Roll("1d100").evaluate({ async: true });
	const total = roll.total;
	let levelsOfSuccess = Math.floor((statValue + bonus + penalty + multiAction - total) / 10);
	let levelsOfFailure = Math.floor((total - statValue - bonus - multiAction - penalty) / 10);
	const criticalSuccess = total === 1;
	const criticalFailure = total === 100;
	let currentDestiny = actor.system.Vital.Destiny.value;
	//? this kicks-off the calculation, assuming that is is a failure
	if (total - multiAction - penalty > statValue + bonus) {
		//? in which case we don't care about what levels of success we have, so we set to 0 to avoid confusion later
		result = "Failure 🟥";
		levelsOfSuccess = 0;
		//? resultlevel is a numerical value to facilitate other functions to use the result of the roll
		resultLevel = 0;
	} else {
		//? if it's a success, similarly as above, we don't care about levels of failure
		result = "Success 🟩";
		levelsOfFailure = 0;
		resultLevel = 0.5;
	}
	//? check for critical success or failure
	if (criticalSuccess) {
		result = `🟩 Critical Success 🟩, rewarding ${actor.name} with +1 * 🤞 Destiny`;
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
		result = `🟥 Critical Failure 🟥, rewarding ${actor.name} with +1 * 🤞 Destiny`;
		currentDestiny += 1;
		await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
		levelsOfFailure = 10;
		levelsOfSuccess = 0;
	}
	//? Create the message to be printed to chat
	let message = null;
	if (action === "StatRoll") {
		message = `Attempts a roll with ${stat} score of ${statValue}%`;
	} else if (action === "Initiative") {
		message = `Rolls for Initiative with ${stat} score of ${statValue}%`;
	} else if (action === "Metapower") {
		message = `Rolls for Metapower with ${stat} score of ${statValue}%`;	
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
	//? Buttons to Re-Roll MetaEvaluate results
	//?add re-roll button to message, only if it's not a Critical and only if they have at least 1 destiny or more
	if (!criticalSuccess && !criticalFailure && currentDestiny > 0) {
		//? Need to have different buttons for the various actions, so the correct function is being re-called by the correct button id and the correct parameters are being passed
		if (action === "StatRoll") {
		message += `<div class="hide-button hidden"><br><button class="metaeval-reroll" data-actoruuid="${actor.uuid}"
			data-stat="${stat}" data-statvalue="${statValue}" data-multiaction="${multiAction}"
			data-bonus="${bonus}" data-penalty="${penalty}" data-action="${action}"
			>Spend 🤞 Destiny to reroll</button><br><br></div>`;
		} else if (action === "Initiative") {
			message += `<div class="hide-button hidden"><br><button class="metainitiative-reroll" data-actoruuid="${actor.uuid}"
				>Spend 🤞 Destiny to reroll</button><br><br></div>`;
		} else if (action === "Metapower") {
			message += `<div class="hide-button hidden"><br><button class="metapower-reroll" data-actoruuid="${actor.uuid}"
				data-stat="${stat}" data-statvalue="${statValue}" data-multiaction="${multiAction}"
				data-bonus="${bonus}" data-penalty="${penalty}" data-action="${action}"
				>Spend 🤞 Destiny to reroll</button><br><br></div>`;
		}
	}
	//? Buttons for Keeping the results of MetaEvalute
	//! I should include a way to proceed if the results are criticals
	if (action === "Metapower") {
		//! I can either have MetaEvaluate take all the necessairy inputs passed down from MetaRoll about the Item, 
		//! or I can start from here to collect his information to pass it along? if so, to whom?
		message += `<div class="hide-button hidden"><button class="metapower-activate" data-actoruuid="${actor.uuid}"
			data-stat="${stat}" data-statvalue="${statValue}" data-multiaction="${multiAction}"
			data-bonus="${bonus}" data-penalty="${penalty}" data-action="${action}"
			>Activate Metapower with: ${resultLevel}</button><br><br></div>`;
	}
	//	if (action === "Initiative") {
	//		message += `<div class="hide-button hidden"><button class="keep-initiative" data-idactor="${actor.id}"
	//			data-stat="${stat}" data-statvalue="${statValue}" data-multiaction="${multiAction}"
	//			data-bonus="${bonus}" data-penalty="${penalty}" data-action="${action}"
	//			>Keep Initiative of: ${resultLevel}</button><br><br></div>`;
	//	}
	console.log(
		"Metanthropes RPG System | MetaEvaluate | Finished for:",
		actor.name,
		"Action:",
		action,
		stat+
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
		currentDestiny,
		"Actor UUID:",
		actor.uuid
	);
	//set flags for the actor to be used as the lastrolled values of your most recent roll.
	// the idea is to use these later in metapowers to spend your levels of success.
	//! do I need to set flags here or maybe it's better to set them in MetaRoll?
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
			speaker: ChatMessage.getSpeaker({ 
				actor: actor,
				//token: combatant.token,
				//alias: combatant.name, 
			}),
			flavor: message,
			rollMode: game.settings.get("core", "rollMode"),
			flags: { "metanthropes-system": { actoruuid: actor.uuid } },
		});
		//! I will need to figure out if(how?) I want to pass the combatant from metainitiative if I need to do that
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

//! mipws tha itan kalytero na analavei to MetaRoll ta reroll???

export async function MetaEvaluateReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actorUUID = button.dataset.actoruuid;
	const stat = button.dataset.stat;
	const statValue = parseInt(button.dataset.statvalue);
	const multiAction = parseInt(button.dataset.multiaction);
	const bonus = parseInt(button.dataset.bonus);
	const penalty = parseInt(button.dataset.penalty);
	const actor = await fromUuid(actorUUID);
	console.log("Metanthropes RPG System | MetaEvaluateReRoll | Engaged for:", actor, actorUUID)
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
