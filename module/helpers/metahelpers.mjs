//? Import Classes
import { metaFilePicker } from "../metanthropes/metaclasses.mjs";
/**
 *
 * metaLog function controls how console logging happens.
 * metaLog 0 (console.log), 1 (console.warn), 2 (console.error) show up in the console by default
 * metaLog 3 (console.log), 4 (console.warn), 5 (console.error) show up in the console if the advanced logging setting is enabled in the system settings
 * metaLog advanced logging is disabled by default and is designed to be used for troubleshooting and debugging
 *
 * @param {Number} logType
 * @param  {...any} variables
 * @returns
 */
export function metaLog(logType = 0, ...variables) {
	const metaAdvancedLogging = game.settings.get("metanthropes-system", "metaAdvancedLogging");
	if (!metaAdvancedLogging && logType > 2) {
		return;
	}
	let logFunction = console.log;
	let logMessage = `%cMetanthropes | `;
	let logStyle = "background-color: #5C16C5; color: #fff";
	let altLogStyle = "background-color: #00695c; color: #fff";
	switch (logType) {
		case 1:
		case 4:
			logFunction = console.warn;
			break;
		case 2:
		case 5:
			logFunction = console.error;
			break;
	}
	let styles = [logStyle];
	let logStrings = [logMessage];
	let logObjects = [];
	variables.forEach((variable, index) => {
		if (variable !== null && variable !== undefined) {
			let style = index % 2 === 0 ? logStyle : altLogStyle;
			if (typeof variable === "object") {
				logStrings.push("%c[See Below the Object returned]");
				logObjects.push(variable);
			} else {
				logStrings.push(`%c${variable}`);
			}
			styles.push(style);
			if (index !== variables.length - 1) {
				logStrings.push("%c | ");
				styles.push(logStyle);
			}
		}
	});
	logFunction(logStrings.join(""), ...styles, ...logObjects);
}

/**
 *
 * Helper function to print the currently open Document to the console
 * Kindly provided by TyphonJS(Michael) from the FoundryVTT Discord
 * Inspired by a similar functionality from DevMode (https://foundryvtt.com/packages/_dev-mode)
 *
 * @param {*} app
 * @param {*} buttons
 */
export function metaLogDocument(app, buttons) {
	//? Will only run if the 'Enable Advanced Logging' setting is enabled
	if (game.settings.get("metanthropes-system", "metaAdvancedLogging")) {
		buttons.unshift({
			icon: "fas fa-terminal",
			class: "metalog-doc",
			onclick: async () => {
				const uuid = app?.object?.uuid;
				if (typeof uuid === "string") {
					const doc = await globalThis.fromUuid(uuid);
					if (doc) {
						console.log(doc);
					}
				}
			},
		});
	}
}

/**
 *
 * Helper function to extract the number of d10 dice from a given value
 *
 * @param {String} value
 * @returns integer
 */
export async function metaExtractNumberOfDice(value) {
	const match = value.match(/^(\d+)d10$/);
	if (match) {
		return parseInt(match[1], 10); // Convert the captured string to an integer
	}
	return null; // Return null if the string doesn't match the expected format
}

/**
 *
 * Helper function to refresh the actor sheet
 * This is needed to ensure the Stat Scores display correctly in the Metapowers and Possessions tabs of the actor sheet
 *
 * @param {*} actor
 */
export function metaSheetRefresh(actor) {
	const sheet = actor.sheet;
	//todo: make it so that it will only refresh if the sheet is not minimized etc
	if (sheet && sheet.rendered) {
		sheet.render(true);
	}
}

/**
 *
 * Helper function to check if a Metapower with a given name is equipped by an actor
 * Returns true/false
 *
 * @param {*} actor - Object of the actor
 * @param {*} metapower - String of the metapower name
 * @returns true/false
 *
 * Note that this checks for the MetapowerName property, not the name of the individual metapower level ability
 *
 */
export async function metaIsMetapowerEquipped(actor, metapower) {
	const equippedItems = actor.items;
	const isMetapowerEquipped = equippedItems.some((item) => item.system.MetapowerName === metapower);
	return isMetapowerEquipped;
}

/**
 *
 * Helper function to change the portrait of an actor
 * Presents a metaFilePicker Image browser to the user to select the image
 * The browser opens up at a specific folder based on the actor type
 * This function places the selected image as the actor.img and the actor.prototypeToken.texture.src
 * todo: configure a logic to handle non-linked tokens that will have wildcards in prototypeToken.texture.src
 *
 * @param {*} actor - Object of the actor
 *
 */
export async function metaChangePortrait(actor) {
	//? Based on the actor's type, set the current directory
	const baseDir = "systems/metanthropes-system/artwork/portraits/";
	const actorType = actor.type.toLowerCase();
	const currentDir = baseDir + actorType + "/";
	const fp = new metaFilePicker({
		resource: "data",
		current: currentDir,
		displayMode: "tiles",
		callback: async (selection) => {
			await actor.update({ img: selection });
			const prototype = actor.prototypeToken || false;
			if (prototype) {
				//? Update Iterate over all scenes
				for (const scene of game.scenes) {
					let tokensToUpdate = [];
					//? Find tokens that represent the actor
					for (const token of scene.tokens.contents) {
						if (token.actorId === actor.id) {
							tokensToUpdate.push({ _id: token.id, "texture.src": selection });
						}
					}
					//? Update the tokens
					if (tokensToUpdate.length > 0) {
						try {
							await scene.updateEmbeddedDocuments("Token", tokensToUpdate);
						} catch (error) {
							metaLog(
								2,
								"metaChangePortrait",
								"Error updating token:",
								error,
								"tokens to update:",
								tokensToUpdate
							);
						}
					}
				}
				await actor.update({ "prototypeToken.texture.src": selection });
			} else {
				//? Update only the current token if this was called from the canvas instead of the sidebar
				const token = actor.token;
				await token.update({ "texture.src": selection });
			}
		},
	});
	return fp.browse();
}

/**
 * ! confirm usage
 * Helper function to check if an item with a given name is equipped by an actor
 * Returns true/false
 *
 * @param {*} actor - Object of the actor
 * @param {*} itemName  - String of the item name
 * @returns true/false
 */
export async function metaIsItemEquipped(actor, itemName) {
	const equippedItems = actor.items;
	const isEquipped = equippedItems.some((item) => item.name === itemName);
	return isEquipped;
}

/**
 * ! confirm usage
 * Helper function to get the maximum level of a Metapower equipped by an actor
 * @param {*} actor - Object of the actor
 * @param {*} metapower - String of the metapower name
 * @returns integer
 *
 */
export async function metaGetMaxMetapowerLevel(actor, metapower) {
	const equippedItems = actor.items.filter((item) => item.system.MetapowerName === metapower);
	if (equippedItems.length === 0) return 0; //? Return 0 if no such metapower is equipped
	const levels = equippedItems.map((item) => item.system.Level);
	const maxLevel = Math.max(...levels);
	return maxLevel;
}

/**
 *! unused
 * Helper function to extract data from a form element
 *
 * @param {*} formElement
 * @returns
 */
export function metaExtractFormData(formElement) {
	const formData = new FormData(formElement);
	let extractedData = {};
	for (let [key, value] of formData.entries()) {
		extractedData[key] = value;
	}
	return extractedData;
}
