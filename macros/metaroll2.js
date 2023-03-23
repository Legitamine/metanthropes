// Define the `rollDice` function for rolling the dice and displaying the results in chat
async function rollDice(actor, statRollValue, isMultiAction) {
	let roll = await Roll.create("1d100").evaluate({ async: true });
	let modifier = isMultiAction ? -10 * parseInt(prompt("Enter number of Multi-Actions (2-10):", 2)) : 0;
	let result = roll.total <= statRollValue + modifier ? "Success" : "Failure";
	let levelsOfSuccess = Math.floor((statRollValue + modifier - roll.total) / 10);
	let levelsOfFailure = Math.floor((roll.total - statRollValue - modifier) / 10);
	let criticalSuccess = roll.total === 1;
	let criticalFailure = roll.total === 100;
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
	let message = `${actor.name} rolled ${statRollValue} with a modifier of ${modifier} and got ${result} with a roll of ${roll.total}.`;
	if (levelsOfSuccess > 0) {
		message += ` ${actor.name} had ${levelsOfSuccess} level(s) of success.`;
	}
	if (levelsOfFailure > 0) {
		message += ` ${actor.name} had ${levelsOfFailure} level(s) of failure.`;
	}
	ChatMessage.create({ content: message });
}

// Define the `showMetaRollDialog` function for displaying the stat and multi-action selection dialog
async function showMetaRollDialog(actor, characteristics) {
	let d = new Dialog({
		title: "MetaRoll",
		content: `
		<div>
		  <p>Select a stat:</p>
		  <div class="flexrow">
			${Object.keys(characteristics[actor.data.data.meta.characteristic].stats)
				.map(
					(stat) => `
			  <button class="dialog-button" data-stat="${stat}">${stat}.${
						characteristics[actor.data.data.meta.characteristic].stats[stat].roll
					}</button>
			`
				)
				.join("")}
		  </div>
		  <br/>
		  <p>Is this a multi-action?</p>
		  <div class="flexrow">
			<button class="dialog-button" data-multi-action="true">Yes</button>
			<button class="dialog-button" data-multi-action="false">No</button>
		  </div>
		</div>
	  `,
		buttons: {},
		default: "roll",
		close: () => {},
	});

	d.render(true);

	// Add event listener for button clicks
	d.element.find(".dialog-button").click((ev) => {
		// Get the selected stat and multi-action values
		let stat = $(ev.currentTarget).data("stat");
		let isMultiAction = $(ev.currentTarget).data("multi-action") === "true";

		// Roll the dice using the selected stat and multi-action values
		rollDice(actor, characteristics[actor.data.data.meta.characteristic].stats[stat].roll, isMultiAction);

		// Close the dialog
		d.close();
	});
}
// Define the `MetaRoll` macro for triggering the stat and multi-action selection dialog
let MetaRoll = (async () => {
	let actor = game.actors.entities.find(
		(a) => a.data.type === "metanthrope" && a.data.name === game.user.character.name
	);
	if (!actor) {
		ui.notifications.warn("No metanthrope character found for the current user.");
		return;
	}

	let characteristics = actor.data.data.meta.characteristics;

	if (!characteristics) {
		ui.notifications.warn("Metanthrope character does not have any characteristics defined.");
		return;
	}

	// Define the `showMetaRollDialog` function for displaying the stat and multi-action selection dialog
	async function showMetaRollDialog() {
		let d = new Dialog({
			title: "MetaRoll",
			content: `
		  <div>
			<p>Select a stat:</p>
			<div class="flexrow">
			  ${Object.keys(characteristics[actor.data.data.meta.characteristic].stats)
					.map(
						(stat) => `
				<button class="dialog-button" data-stat="${stat}">${stat}.${
							characteristics[actor.data.data.meta.characteristic].stats[stat].roll
						}</button>
			  `
					)
					.join("")}
			</div>
			<br/>
			<p>Is this a multi-action?</p>
			<div class="flexrow">
			  <button class="dialog-button" data-multi-action="true">Yes</button>
			  <button class="dialog-button" data-multi-action="false">No</button>
			</div>
		  </div>
		`,
			buttons: {},
			default: "roll",
			close: () => {},
		});

		d.render(true);

		// Add event listener for button clicks
		d.element.find(".dialog-button").click((ev) => {
			// Get the selected stat and multi-action values
			let stat = $(ev.currentTarget).data("stat");
			let isMultiAction = $(ev.currentTarget).data("multi-action") === "true";

			// Roll the dice using the selected stat and multi-action values
			rollDice(actor, characteristics[actor.data.data.meta.characteristic].stats[stat].roll, isMultiAction);

			// Close the dialog
			d.close();
		});
	}

	// Define the rollDice function for rolling the dice and displaying the results in chat
	async function rollDice(actor, statRollValue, isMultiAction) {
		let roll = await new Roll("1d100").roll({ async: true });
		let modifier = isMultiAction ? -10 * parseInt(prompt("Enter number of Multi-Actions (2-10):", 2)) : 0;
		let result = roll.total <= statRollValue + modifier ? "Success" : "Failure";
		let levelsOfSuccess = Math.floor((statRollValue + modifier - roll.total) / 10);
		let levelsOfFailure = Math.floor((roll.total - statRollValue - modifier) / 10);
		let criticalSuccess = roll.total === 1;
		let criticalFailure = roll.total === 100;
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
		let message = `${actor.name} rolled ${statRollValue} with a modifier of ${modifier} and got ${result} with a roll of ${roll.total}.`;
		if (levelsOfSuccess > 0) {
			message += ` ${actor.name} had ${levelsOfSuccess} level(s) of success.`;
		}
		if (levelsOfFailure > 0) {
			message += ` ${actor.name} had ${levelsOfFailure} level(s) of failure.`;
		}
		ChatMessage.create({ content: message });
	}

	// Display the stat and multi-action selection dialog
	await showMetaRollDialog();
})();

// Register the MetaRoll macro with Foundry VTT
Macro.create({
	name: "MetaRoll",
	actorId: "",
	scope: "global",
	img: "icons/svg/d10-grey.svg",
	command: MetaRoll,
	hasTarget: false,
});
