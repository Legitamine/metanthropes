// MetaRollStat function is used to roll a stat and get the levels of success/failure and print the message to chat
export async function PossessionRollStat(actor, stat, statValue, modifier = 0, bonus = 0, penalty = 0, itemname, attacktype = null, effect = null, targets = null, damage=null, conditions=null) {
	let result = null;
	let resultLevel = null;
	if (statValue <= 0) {
		ui.notifications.error(actor.name+" can't use" +itemname+"with "+stat+" Current value of 0!");
		return;
	}
	const roll = await new Roll("1d100").evaluate({ async: true });
	const total = roll.total;
	let levelsOfSuccess = Math.floor((statValue + bonus + penalty + modifier - total) / 10);
	let levelsOfFailure = Math.floor((total - statValue - bonus - modifier - penalty) / 10);
	const criticalSuccess = total === 1;
	const criticalFailure = total === 100;
	let currentDestiny = actor.system.Vital.Destiny.value;
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
	let message = `Uses their ${itemname} with ${stat} score of ${statValue}%`;
	// if we have a bonus or penalty, add it to the message
	if (bonus > 0) {
		message += `, a Bonus of +${bonus}%`;
	}
	if (penalty < 0) {
		message += `, a Penalty of ${penalty}%`;
	}
	// if we have multi-action reduction, add it to the message
	if (modifier < 0) {
		message += `, a Multi-Action reduction of ${modifier}%`;
	}
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
	message += `<div class="metanthropes hide-button layout-hide">
	<button class="possession-re-roll" data-actorId="${actor.id}" data-stat="${stat}" data-stat-value="${statValue}"
	data-modifier="${modifier}" data-bonus="${bonus}" data-penalty="${penalty}" data-itemname="${itemname}" data-attacktype="${attacktype}"
	data-effect="${effect}" data-targets="${targets}" data-damage="${damage}" data-conditions="${conditions}">
	🤞</button>
	<button class="possession-use" data-actorId="${actor.id}" data-stat="${stat}" data-stat-value="${statValue}"
	data-itemname="${itemname}" data-attacktype="${attacktype}" data-targets="${targets}" data-effect="${effect}"
	data-damage="${damage}" data-conditions="${conditions}" data-modifier="${modifier}" >
	🛠️</button>
	</div>
	`;
	//console log for debugging
	console.log(
		"PosRoll Results:",
		"Stat:",
		stat,
		"Stat Value:",
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
	console.log(
		"Posroll Results cont:",
		"Possession:",
		itemname,
		"Attack Type:",
		attacktype,
		"Targets:",
		targets,
		"Damage:",
		damage,
		"Conditions:",
		conditions
	);
	//set flags for the actor to be used as the lastrolled values of your most recent roll.
	// the idea is to use these later in metapowers to spend your levels of success.
	await actor.setFlag("metanthropes-system", "posused", {
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
export async function PossessionReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const stat = button.dataset.stat;
	const statValue = parseInt(button.dataset.statValue);
	const modifier = parseInt(button.dataset.modifier);
	const bonus = parseInt(button.dataset.bonus);
	const penalty = parseInt(button.dataset.penalty);
	const actor = game.actors.get(actorId);
	const itemname = button.dataset.itemname;
	const attacktype = button.dataset.attacktype;
	const effect = button.dataset.effect;
	const targets = button.dataset.targets;
	const damage = button.dataset.damage;
	const conditions = button.dataset.conditions;
	// get current destiny value
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
			PossessionRollStat(actor, stat, statValue, modifier, bonus, penalty, itemname, attacktype, effect, targets, damage, conditions);
		}
	}
}
