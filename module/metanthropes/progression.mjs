//* Progression Dialog Class
export class ProgressionDialog extends Dialog {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			template: "systems/metanthropes-system/templates/progression/progression-dialog.hbs",
			classes: ["metanthropes", "progression"],
			width: 1012,
			height: 700,
			tabs: [
				{
					navSelector: ".progressionnavselector",
					contentSelector: ".progressionnavtabs",
					initial: "progression-overview",
				},
			],
			closeOnSubmit: true,
			submitOnChange: false,
			submitOnClose: false,
			resizable: true,
		});
	}
	//* Get the Data for actor - the data provided is a copy of the actual actor document, so we are not working on the stored values
	getData(options = {}) {
		//? Retrieve base data structure.
		const context = super.getData(options);
		//? Explicitly define the structure of the data for the template
		return {
			content: context.content,
			buttons: context.buttons,
			actor: this.data.actorData.actor,
		};
	}
	//* Activate listeners
	activateListeners(html) {
		super.activateListeners(html);
		// Add any event listeners specific to this dialog here.
		// For example, handling tab switching, button clicks, etc.
	}
	//* Handle changes to the form ???
	calculateOverviewExperience(actorData) {
		const systemData = actorData.system;
		let experienceSpent = 0;
		let characteristicExperienceSpent = 0;
		let statExperienceSpent = 0;
		let progressionCount = 0;
		let ifCharacteristicBecomesZeroPenalty = 0;
		for (const [CharKey, CharValue] of Object.entries(systemData.Characteristics)) {
			//? reset ifCharacteristicBecomesZeroPenalty to 0
			ifCharacteristicBecomesZeroPenalty = 0;
			//? Calculate the progression count based on the characteristic's progressed value
			progressionCount = Number(CharValue.Progressed);
			//? Calculate the experience spent on this characteristic
			characteristicExperienceSpent = 0;
			for (let i = 0; i < progressionCount; i++) {
				characteristicExperienceSpent += Number((Number(CharValue.Initial) + Number(i * 5)) * 10);
			}
			//? Add the experience spent on this characteristic to the total experience spent, only if Progressed is >0
			if (progressionCount > 0) {
				experienceSpent += characteristicExperienceSpent;
			}
			for (const [StatKey, StatValue] of Object.entries(CharValue.Stats)) {
				//? Calculate the progression count based on the characteristic's progressed value
				progressionCount = Number(StatValue.Progressed);
				//? Calculate the experience spent on this characteristic
				statExperienceSpent = 0;
				for (let i = 0; i < progressionCount; i++) {
					statExperienceSpent += Number(
						(Number(StatValue.Initial) + Number(CharValue.Base) + Number(i * 5)) * 3
					);
				}
				//? Add the experience spent on this characteristic to the total experience spent, only if Progressed is >0
				if (progressionCount > 0) {
					experienceSpent += statExperienceSpent;
				}
			}
		}
		systemData.Vital.Experience.Spent = Number(experienceSpent);
		systemData.Vital.Experience.Stored = Number(
			Number(systemData.Vital.Experience.Total) -
				Number(experienceSpent) -
				Number(systemData.Vital.Experience.Manual)
		);
		return {
			spent: systemData.Vital.Experience.Spent,
			stored: systemData.Vital.Experience.Stored,
		};
	}
	//* ... any other methods specific to this dialog
}
//* Main function for creating and managing the dialog
export async function openProgressionDialog(actorData) {
	//? Define the dialog content
	const dialogContent = "Make sure that your Stored XP is not negative before confirming!";
	//? Define the dialog buttons
	const dialogButtons = {
		confirm: {
			label: "Confirm 📈 Progression",
			callback: async (html) => {
				//? Gather changes
				const changes = {
					//? gather changes
				};
				//? Update the actor with the changes
				await actorData.actor.update(changes);
			},
		},
		cancel: {
			label: "Cancel",
			//? Do nothing on Cancel
			callback: () => {},
		},
	};
	//? Define the dialog options
	const dialogOptions = {
		//? Placeholder for future use
	};
	const dialogData = {
		actorData: actorData,
		buttons: dialogButtons,
		content: dialogContent,
		title: `${actorData.actor.name}'s 📈 Progression`,
	};
	const progressionDialog = new ProgressionDialog(dialogData, dialogOptions);
	progressionDialog.render(true);
}

//* Function for generating the content of the Overview tab
function generateOverviewContent(actor) {
	return `
    <div class="tab-content-overview">
        <p>Overview content for ${actor.name} goes here.</p>
    </div>
    `;
}

//* Function for handling user interactions within the Overview tab
function handleOverviewInteractions(actor, html) {
	//? Add event listeners and handle user interactions within the Overview tab
}

//* Function for generating the content of the Perks tab
function generatePerksContent(actor) {
	//? Generate and return the HTML content for the Perks tab
}

//* Function for handling user interactions within the Perks tab
function handlePerksInteractions(actor, html) {
	//? Add event listeners and handle user interactions within the Perks tab
}

//* Function for generating the content of the Metapowers tab
function generateMetapowersContent(actor) {
	//? Generate and return the HTML content for the Metapowers tab
}

//* Function for validating the form input
function validateFormInput(actor, formData) {
	//? Validate the form input and return any errors
}
