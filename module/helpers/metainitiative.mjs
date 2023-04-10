// MetaInitiative function handles Initiative rolls
export async function MetaInitiative(combatant) {
	console.log("Metanthropes RPG MetaInitiative for combatant:", combatant);
	const actor = combatant.actor;
	console.log("Metanthropes RPG MetaInitiative called for actor: ", actor.name);
	const reflexesStat = "Reflexes";
	const awarenessStat = "Awareness";
	const reflexesValue = actor.system.Characteristics.Body.Stats.Reflexes.Roll;
	console.log("Metanthropes RPG MetaInitiative - reflexesValue:", reflexesValue, "for actor:", actor.name);
	const awarenessValue = actor.system.Characteristics.Soul.Stats.Awareness.Roll;
	console.log("Metanthropes RPG MetaInitiative - awarenessValue:", awarenessValue, "for actor:", actor.name);
	let initiativeStat = reflexesStat;
	let statValue = reflexesValue;
	// Check if the actor has the metapower "Danger Sense" equipped
	const metapowers = actor.items.filter((item) => item.type === "Metapower");
	const hasDangerSense = metapowers.some((metapower) => metapower.name === "Danger Sense");
	// If the actor has "Danger Sense", use Awareness for Initiative
	if (hasDangerSense) {
		initiativeStat = awarenessStat;
		statValue = awarenessValue;
	}
	console.log("Metanthropes RPG MetaInitiative passed the Danger Sense for", actor, initiativeStat, statValue);
	let result = null;
	let resultLevel = null;
	await actor.setFlag("metanthropes-system", "initiative", {
		initiativeValue: resultLevel,
	});
	if (statValue <= 0) {
		ui.notifications.error(
			actor.name + " can't Roll for Initiative with " + initiativeStat + " Current value of 0!"
		);
		// Update the combatant with the new initiative value
		await combatant.update({ initiative: resultLevel });
		return;
	}
	const roll = await new Roll("1d100").evaluate({ async: true });
	const total = roll.total;
	let levelsOfSuccess = Math.floor((statValue - total) / 10);
	let levelsOfFailure = Math.floor((total - statValue) / 10);
	const criticalSuccess = total === 1;
	const criticalFailure = total === 100;
	let currentDestiny = actor.system.Vital.Destiny.value;
	// this kicks-off the calculation, assuming that is is a failure
	if (total > statValue) {
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
	let message = `Rolls for Initiative with ${initiativeStat} score of ${statValue}%`;
	message += ` and the result is ${total}. Therefore it is a ${result}`;
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
	//add re-roll button to message
	message += `<div><button class="hide-button layout-hide metainitiative-re-roll" data-actor-id="${actor.id}">🤞</button></div>`;
	//console log for debugging
	console.log(
		"Metainitiative Results:",
		"Stat:",
		initiativeStat,
		"Value:",
		statValue,
		"Roll:",
		total,
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
	// I will take these values and store them inside an initiative flag on the actor
	await actor.setFlag("metanthropes-system", "initiative", {
		initiativeValue: resultLevel,
	});
	// Update the combatant with the new initiative value
	await combatant.update({ initiative: resultLevel });
}
//! remove excess bonus / penalty / modifier if not needed at all for initiative
// MetaInitiativeRollStat function is used to roll a stat and get the levels of success/failure and print the message to chat
// export async function MetaInitiativeRollStat(actor, stat, statValue, modifier = 0, bonus = 0, penalty = 0) {

//}
// Function to handle re-roll for destiny
export async function MetaInitiativeReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const actor = game.actors.get(actorId);
	const combatant = game.combat.getCombatantByActor(actorId);
	console.log("Metanthropes RPG do we get the correct combatant data?", combatant);
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
			MetaInitiative(combatant);
		}
	}
}
