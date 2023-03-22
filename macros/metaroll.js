//chat-gpt3.5 reply
let metaroller = game.user.character;
console.log(metaroller);

if (!metaroller) {
	ui.notifications.error("You must have an active character!");
	return;
}

let statOptions = "";
	for (let [stat, value] of Object.entries(metaroller)) {
		//if (typeof value === "number" && stat !== "stat") {
			statOptions += `<option value="${stat}">${stat}</option>`;
		//}
	}


let d = new Dialog({
	title: "MetaRoll",
	content: `
    <div>
    	<p>Select a Stat:</p>
    	<<select id="stat">${statOptions}</select>
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
				let selectedChar = html.find("#char").val();
				let multiAction = html.find("#multiAction").val() === "yes";
				let statRollValue = metaroller[selectedStat].Roll;
				let modifier = 0;
				if (multiAction) {
					let multiActionOptions = "";
					for (let i = 2; i <= 10; i++) {
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

function rollDice(stat, statRollValue, modifier) {
	let roll = new Roll("1d100").roll().total;
	let success = roll <= statRollValue + modifier;
	let levelsOfSuccess = Math.floor((statRollValue + modifier - roll) / 10);
	let levelsOfFailure = Math.floor((roll - statRollValue - modifier) / 10);
	let criticalSuccess = roll === 1;
	let criticalFailure = roll === 100;
	if (criticalSuccess) {
		levelsOfSuccess = 10;
		if (statRollValue < 100) {
			levelsOfSuccess += 1;
		} else {
			levelsOfSuccess += Math.floor((statRollValue - 100) / 10) + 1;
		}
	}
	if (criticalFailure) {
		levelsOfFailure = 10;
	}
	let result = success ? "Success" : "Failure";
	if (criticalSuccess) {
		result = "Critical Success";
	} else if (criticalFailure) {
		result = "Critical Failure";
	}
	let message = `${metaroller.name} rolled ${stat}.${statRollValue} with a modifier of ${modifier} and got ${result} with a roll of ${roll}.`;
	if (levelsOfSuccess > 0) {
		message += ` ${metaroller.name} had ${levelsOfSuccess} level(s) of success.`;
	}
	if (levelsOfFailure > 0) {
		message += ` ${metaroller.name} had ${levelsOfFailure} level(s) of failure.`;
	}
	ChatMessage.create({ content: message });
}

d.render(true);
