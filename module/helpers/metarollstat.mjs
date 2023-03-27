//used to roll a stat and get the levels of success and print the message to chat
export async function MetaRollStat(actor, stat, statValue, modifier = 0, bonus = 0, penalty = 0) {
	const roll = await new Roll("1d100").evaluate({ async: true });
	const total = roll.total;
	// const isSuccess = total <= statValue + modifier;
	let result = null // isSuccess ? "Success 🟩" : "Failure 🟥";
	let levelsOfSuccess = Math.floor((statValue + modifier - total) / 10);
	let levelsOfFailure = Math.floor((total - statValue - modifier) / 10);
	const criticalSuccess = total === 1;
	const criticalFailure = total === 100;
	// this kicks-off the calculation, assuming that is is a failure
	if (total - modifier > statValue) {
		// in which case we don't care about what levels of success we have, so we set to 0 to avoid confusion later
		result  = "Failure 🟥";
		levelsOfSuccess = 0;
	} else {
		// if the calculation is <= to statValue, it's a success, so we reset the levels of failure to 0
		result  = "Success 🟩";
		levelsOfFailure = 0;
	}
	//check for critical success or failure
	if (criticalSuccess) {
		result = "🟩 Critical Success 🟩"; //todo: add color and bold to crititals
		levelsOfSuccess = 10;
		if (statValue < 100) {
			levelsOfSuccess += 0;
		} else {
			levelsOfSuccess += Math.floor((statValue - 100) / 10);
		}
	}
	if (criticalFailure) {
		result = "🟥 Critical Failure 🟥"; //todo: add color and bold to crititals
		levelsOfFailure = 10;
	}
	//format the message to be printed to chat
	let message = `${actor.name} attempts a roll with ${stat} score of ${statValue}%`;
	// if we have multi-action reduction, add it to the message
	if (modifier < 0) {
		message += ` and with a Multi-Action reduction of ${modifier}%`;
	}
	message += ` and the result is ${total}, therefore it is a ${result}`;
	// if we have levels of success or failure, add them to the message
	if (levelsOfSuccess > 0) {
		message += `, accumulating: ${levelsOfSuccess} * ✔️.`;
	} else if (levelsOfFailure > 0) {
		message += `, accumulating: ${levelsOfFailure} * ❌.`;
	} else {
		message += `.`;
	}
	//print message to chat and enable Dice So Nice to roll the dice and display the message
	roll.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: message,
		rollMode: game.settings.get("core", "rollMode"),
	});
}
