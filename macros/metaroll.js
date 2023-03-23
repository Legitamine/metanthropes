//metaroll v2 based off chat-gpt3.5 replies
//todo: add re-roll button with Destiny deduction
//chat gpt 4 ftw btw
let metaroller = game.user.character;
console.log(metaroller);

if (!metaroller) {
	ui.notifications.error(
		"You must have an active character! Right-click on your Player Name and configure the active characters by making sure you select a character before clicking OK."
	);
	return;
}

let statOptions = "";
for (let [stat, value] of Object.entries(metaroller.system)) {
	if (
		stat == "Endurance" ||
		stat == "Power" ||
		stat == "Reflexes" ||
		stat == "Perception" ||
		stat == "Manipulation" ||
		stat == "Creativity" ||
		stat == "Willpower" ||
		stat == "Consciousness" ||
		stat == "Awareness"
	) {
		statOptions += `<option value="${stat}">${stat}</option>`;
	}
}

let d = new Dialog({
	title: "MetaRoll",
	content: `
    <div>
    	<p>Select a Stat:</p>
    	<select id="stat">${statOptions}</select>
    </div>
    <div>
    	<p>Is this part of a Multi-Action?</p>
    	<select id="multiAction">
        <option value="no">No</option>
        <option value="yes">Yes</option>
    	</select>
    </div>
	`,
	buttons: {
		roll: {
			label: "Roll",
			callback: async (html) => {
				let selectedStat = html.find("#stat").val();
				let multiAction = html.find("#multiAction").val() === "yes";
				let statRollValue = metaroller.system[selectedStat].Roll;
				let modifier = 0;
				if (multiAction) {
					let multiActionOptions = "";
					for (let i = 2; i <= Math.floor((statRollValue - 1) / 10); i++) {
						multiActionOptions += `<option value="${i}">${i}</option>`;
					}
					let multiActionDialog = new Dialog({
						title: "Select Multi-Actions",
						content: `
            	<div>
                <p>Select the number of Multi-Actions:</p>
                <select id="multiActionCount">${multiActionOptions}</select>
            	</div>
            `,
						buttons: {
							roll: {
								label: "Roll",
								callback: async (html) => {
									let selectedMultiActions = html.find("#multiActionCount").val();
									modifier = selectedMultiActions * -10;
									rollDice(selectedStat, statRollValue, modifier);
								},
							},
						},
					});
					multiActionDialog.render(true);
				} else {
					rollDice(selectedStat, statRollValue, modifier);
				}
			},
		},
	},
});

async function rollDice(stat, statRollValue, modifier) {
	let roll = await Roll.create("1d100").evaluate({ async: true });
	let result = roll.total <= statRollValue + modifier ? "Success 🟩" : "Failure 🟥";
	let levelsOfSuccess = Math.floor((statRollValue + modifier - roll.total) / 10);
	let levelsOfFailure = Math.floor((roll.total - statRollValue - modifier) / 10);
	let criticalSuccess = roll.total === 1;
	let criticalFailure = roll.total === 100;
	if (roll.total - modifier > statRollValue) {
		levelsOfSuccess = 0;
	} else {
		levelsOfFailure = 0;
	}
	if (criticalSuccess) {
		levelsOfSuccess = 10;
		if (statRollValue < 100) {
			levelsOfSuccess += 0;
		} else {
			levelsOfSuccess += Math.floor((statRollValue - 100) / 10);
		}
	}
	if (criticalFailure) {
		levelsOfFailure = 10;
	}
	if (criticalSuccess) {
		//todo: add color and bold to crititals
		result = "Critical Success";
	} else if (criticalFailure) {
		result = "Critical Failure";
	}
	let message = `${metaroller.name} attempts a roll with ${stat} score of ${statRollValue}%`;
	console.log("modifier", modifier);
	if (modifier < 0) {
		console.log("yrd modifier", modifier, levelsOfSuccess, levelsOfFailure);
		if (levelsOfSuccess > 0) {
			message += ` and with a Multi-Action reduction of ${modifier}% and the result is ${roll.total}, therefore it is a ${result}, accumulating: ${levelsOfSuccess}*✔️.`;
		} else if (levelsOfFailure > 0) {
			message += ` and with a Multi-Action reduction of ${modifier}% and the result is ${roll.total}, therefore it is a ${result}, accumulating: ${levelsOfFailure}*❌.`;
		} else {
			message += ` and with a Multi-Action reduction of ${modifier}% and the result is ${roll.total}, therefore it is a ${result}.`;
		}
	} else if (levelsOfSuccess > 0) {
		message += ` and the result is a ${roll.total}, therefore it is ${result}, accumulating: ${levelsOfSuccess}*✔️.`;
	} else if (levelsOfFailure > 0) {
		message += ` and the result is a ${roll.total}, therefore it is ${result}, accumulating: ${levelsOfFailure}*❌.`;
	} else {
		message += ` and the result is a ${roll.total}, therefore it is ${result}.`;
	}

	roll.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: metaroller }),
		flavor: message,
		rollMode: game.settings.get("core", "rollMode"),
	});
	//adding re-roll capability
	//displayReRollButton(ChatMessage.last, actor, statRollValue, isMultiAction);
	console.log(roll.total);
}

d.render(true);
