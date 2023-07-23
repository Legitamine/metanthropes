//* Progression dialog for spending XP.

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

//* Function for generating the content of the Summary tab
function generateSummaryContent(actor) {
    return `
    <div class="tab-content-summary">
        <p>Summary content for ${actor.name} goes here.</p>
    </div>
    `;
}

//* Function for handling user interactions within the Summary tab
function handleSummaryInteractions(actor, html) {
    //? Add event listeners and handle user interactions within the Summary tab
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

//! do we need one for combos?

//* Function for validating the form input
function validateFormInput(actor, formData) {
    //? Validate the form input and return any errors
}

//* Main function for creating and managing the dialog
export async function openProgressionDialog(actor) {
    //? Generate the initial dialog content
    //? This could involve calling the appropriate function to generate the content for the currently selected tab
    let dialogContent = `
    <span class="tab-navigation">
        <button class="tab-navigation-button" data-tab="overview">Overview</button>
        <button class="tab-navigation-button" data-tab="summary">Summary</button>
        <button class="tab-navigation-button" data-tab="perks">Perks</button>
        <button class="tab-navigation-button" data-tab="metapowers">Metapowers</button>
    </span>
    <div id="tab-content">
        ${generateOverviewContent(actor)}
    </div>
    `;
// Dialog options
let dialogOptions = {
	width: 600,
	height: 400,
	index: 1000,
};

	//!?let dialogContent = generateOverviewContent(actor);

    // Create the dialog
    let dialog = new Dialog({
        title: `${actor.name} Progression`,
        content: dialogContent,
        buttons: {
            confirm: {
                label: "Confirm Progression",
                callback: async (html) => {
                    // Extract the form data
                    let formData = new FormData(html.find("form")[0]);

                    // Validate the form input
                    let errors = validateFormInput(actor, formData);
                    if (errors.length > 0) {
                        // Display the errors to the user
                        // You could use ui.notifications.error for this
                        return;
                    }

                    // Apply the changes to the actor
                    // This would involve updating the actor's data based on the form input
                },
            },
            cancel: {
                label: "Cancel",
				callback: () => {},
            },
        },
        default: "confirm",
        render: (html) => {
            // Handle user interactions within the dialog

            // Add event listeners for the tab navigation buttons
            html.find(".tab-navigation-button").click((event) => {
                // Determine which tab was clicked
                let tab = $(event.currentTarget).data("tab");

				let newContent = "";
				switch (tab) {
					case "overview":
						newContent = generateOverviewContent(actor);
						break;
					case "summary":
						newContent = generateSummaryContent(actor);
						break;
					case "perks":
						newContent = generatePerksContent(actor);
						break;
					case "metapowers":
						newContent = generateMetapowersContent(actor);
						break;
				}
				html.find("#tab-content").html(newContent);
			});
		},
	},
	dialogOptions
);

    //? Render the dialog
    dialog.render(true);
}

import { renderTemplate } from './templateHelper.mjs';

// Import the handlebar templates
import overviewTemplate from '../templates/overview.hbs';
import summaryTemplate from '../templates/summary.hbs';
import perksTemplate from '../templates/perks.hbs';
import metapowersTemplate from '../templates/metapowers.hbs';

export async function openProgressionDialog(actor) {
    // Create a deep copy of the actor data
    let actorDataCopy = foundry.utils.deepClone(actor.data);

    // Generate the initial dialog content
    let dialogContent = await generateOverviewContent(actorDataCopy);

    // Create the dialog
    let dialog = new Dialog({
        title: `Progression for ${actor.name}`,
        content: dialogContent,
        buttons: {
            confirm: {
                label: "Confirm Progression",
                callback: async (html) => {
                    // Apply the changes to the actor data
                    await applyChanges(actor, actorDataCopy, html);
                },
            },
            cancel: {
                label: "Cancel",
                callback: () => { /* Do nothing */ },
            },
        },
        default: "confirm",
        render: (html) => {
            // Handle interactions for the Overview tab
            handleOverviewInteractions(actorDataCopy, html);
        },
    });

    // Render the dialog
    dialog.render(true);
}

async function generateOverviewContent(actorData) {
    // Render the Overview tab content using the handlebar template
    return await renderTemplate(overviewTemplate, { actor: actorData });
}

function handleOverviewInteractions(actorData, html) {
    // Handle interactions for the Overview tab
    // ...
}

async function applyChanges(actor, actorDataCopy, html) {
    // Calculate the changes based on the actorDataCopy and the current state of the dialog
    let changes = calculateChanges(actorDataCopy, html);

    // Apply the changes to the actor
    await actor.update(changes);
}

function calculateChanges(actorDataCopy, html) {
    // Calculate the changes based on the actorDataCopy and the current state of the dialog
    // ...

    return changes;
}
