//* Progression dialog for spending XP.

//* Progression Dialog Class
export class ProgressionDialog extends Dialog {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			template: "systems/metanthropes-system/templates/progression/progression-dialog.hbs",
			classes: ["metanthropes", "progression"],
			width: 1012,
			height: 680,
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

	getData(options={}) {
		//? Retrieve base data structure.
		const context = super.getData(options);
		//? Explicitly define the structure of the data for the template
        return {
            content: context.content,
            buttons: context.buttons,
            actor: this.data.actorData.actor
        };
	}

	activateListeners(html) {
		super.activateListeners(html);
		// Add any event listeners specific to this dialog here.
		// For example, handling tab switching, button clicks, etc.
	}

	// ... any other methods specific to this dialog
}

//* Main function for creating and managing the dialog
export async function openProgressionDialog(actorData) {
	//? Define the dialog content
	const dialogContent = "sample dialog content";
	//? Define the dialog buttons
	const dialogButtons = {
		confirm: {
			label: "Confirm 📈 Progression",
			callback: async (html) => {
				//? Gather changes
				const changes = {
					//? gather changes
				}
				//? Update the actor with the changes
				await actorData.actor.update(changes);
			},
		},
		cancel: {
			label: "Cancel",
			//? Do nothing on Cancel
			callback: () => {}
		}
	};
	//? Define the dialog options
	const dialogOptions = {
		title: `${actorData.actor.name}'s 📈 Progression`,
		content: dialogContent,
    };
	const dialogData = {
		actorData: actorData,
		buttons: dialogButtons
	};
	const progressionDialog = new ProgressionDialog(dialogData, dialogOptions);
	progressionDialog.render(true);
}
	//	//? Generate the initial dialog content
	//	//? This could involve calling the appropriate function to generate the content for the currently selected tab
	//	const dialogContent = await renderTemplate(
	//	    "systems/metanthropes-system/templates/progression/progression-dialog.hbs",
	//	    actorData
	//	);
	//	//? Dialog options
	//	let dialogOptions = {
	//		width: 600,
	//		height: 400,
	//		resizable: true,
	//	};
	//	//!?let dialogContent = generateOverviewContent(actor);
	//	//? Create the dialog
	//	new Dialog(
	//		{
	//			title: `${actor.name}'s 📈 Progression`,
	//			content: dialogContent,
	//			buttons: {
	//				confirm: {
	//					label: "Confirm 📈 Progression",
	//					callback: async (html) => {
	//						//? Gather changes
	//						const changes = {
	//							//? gather changes
	//						}
	//						//? Update the actor with the changes
	//						await actor.update(changes);
	//					},
	//				},
	//				cancel: {
	//					label: "Cancel",
	//					//? Do nothing on Cancel
	//					callback: () => {}
	//				}
	//			}
	//		}, dialogOptions).render(true);

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

//	import { renderTemplate } from "./templateHelper.mjs";
//
//	// Import the handlebar templates
//	import overviewTemplate from "../templates/overview.hbs";
//	import perksTemplate from "../templates/perks.hbs";
//	import metapowersTemplate from "../templates/metapowers.hbs";

//	export async function openProgressionDialog(actor) {
//	    // Create a deep copy of the actor data
//	    let actorDataCopy = foundry.utils.deepClone(actor.data);
//
//	    // Generate the initial dialog content
//	    let dialogContent = await generateOverviewContent(actorDataCopy);
//
//	    // Create the dialog
//	    let dialog = new Dialog({
//	        title: `Progression for ${actor.name}`,
//	        content: dialogContent,
//	        buttons: {
//	            confirm: {
//	                label: "Confirm Progression",
//	                callback: async (html) => {
//	                    // Apply the changes to the actor data
//	                    await applyChanges(actor, actorDataCopy, html);
//	                },
//	            },
//	            cancel: {
//	                label: "Cancel",
//	                callback: () => { /* Do nothing */ },
//	            },
//	        },
//	        default: "confirm",
//	        render: (html) => {
//	            // Handle interactions for the Overview tab
//	            handleOverviewInteractions(actorDataCopy, html);
//	        },
//	    });
//
//	    // Render the dialog
//	    dialog.render(true);
//	}
//

//	async function generateOverviewContent(actorData) {
//		// Render the Overview tab content using the handlebar template
//		return await renderTemplate(overviewTemplate, { actor: actorData });
//	}
//
//	function handleOverviewInteractions(actorData, html) {
//		// Handle interactions for the Overview tab
//		// ...
//	}
//
//	async function applyChanges(actor, actorDataCopy, html) {
//		// Calculate the changes based on the actorDataCopy and the current state of the dialog
//		let changes = calculateChanges(actorDataCopy, html);
//
//		// Apply the changes to the actor
//		await actor.update(changes);
//	}
//
//	function calculateChanges(actorDataCopy, html) {
//		// Calculate the changes based on the actorDataCopy and the current state of the dialog
//		// ...
//
//		return changes;
//	}
//
