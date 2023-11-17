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
 * Helper function to check if a Metapower with a given name is equipped by an actor
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

/**
 *! unused - not working yet
 * Helper function to help in resizing elements based on the window size for a Responsive UI
 * To be used in Actor Sheets to start, will extend and addapt it down the line for Item & Effect Sheets
 *
 * @param {*} event
 * @param {*} element
 *
 */
export function metaHandleResize(event, element, currentWidth) {
	const windowSize = determineWindowSize(currentWidth);
	let uiTargets = element ? $(element).find(".meta-ui-responsive") : this.element.find(".meta-ui-responsive");

	function determineWindowSize(currentWidth) {
		if (currentWidth <= 280) return "singleColumn";
		if (currentWidth > 280 && currentWidth <= 450) return "small";
		if (currentWidth > 450 && currentWidth <= 750) return "medium";
		if (currentWidth > 750 && currentWidth <= 1190) return "default";
		if (currentWidth > 1190) return "extended";
	}

	function responsiveUIChanges(target, windowSize) {
		const classToggles = {
			singleColumn: {
				"meta-ui-hidden": ["style-cs-rolls", "meta-ui-extra-fields"],
				"meta-ui-single-column-font": ["style-cs-chars-label", "style-cs-stats-label"],
				"meta-ui-small-font": false,
				"meta-ui-medium-font": false,
				"layout-container-outer-charstats-single-column": "layout-container-outer-charstats",
				"style-cs-rolls-single-column": "style-cs-rolls",
			},
			small: {
				"meta-ui-hidden": ["meta-ui-hide-at-minimum"],
				"meta-ui-small-font": ["style-cs-chars-label", "style-cs-stats-label"],
				"meta-ui-medium-font": false,
				"meta-ui-single-column-font": false,
				"layout-container-outer-charstats-minimum": "layout-container-outer-charstats",
			},
			// Define other size categories following the same pattern...
		};

		// Apply the toggles based on the current window size category
		const toggles = classToggles[windowSize];
		for (const [toggleClass, affectedClasses] of Object.entries(toggles)) {
			if (Array.isArray(affectedClasses)) {
				affectedClasses.forEach((cls) => target.classList.toggle(cls, toggleClass === true));
			} else {
				target.classList.toggle(toggleClass, affectedClasses);
			}
		}
	}

	// Loop through the uiTargets and apply the appropriate class changes
	for (let target of uiTargets) {
		responsiveUIChanges(target, windowSize);
	}
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
	if (sheet && sheet.rendered) {
		sheet.render(true);
	}
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
 * Helper class to extend the FilePicker class for a custom MetaDialog usage
 * Primarily we want to use this to render a 'select your portrait' dialog for the User
 * Minimizing the additional functionality and controls that FilePicker provides
 *
 * @param {*} app
 * @param {*} buttons
 */
export class metaFilePicker extends FilePicker {
	/** @override */
	constructor(options = {}) {
		super(options);
		this.displayMode = options.displayMode || "tiles";
	}
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/metanthropes-system/templates/metanthropes/filepicker.html",
			classes: ["filepicker"],
			width: 520,
			tabs: [{ navSelector: ".tabs" }],
			dragDrop: [{ dragSelector: ".file", dropSelector: ".filepicker-body" }],
			tileSize: false,
			filters: [{ inputSelector: 'input[name="filter"]', contentSelector: ".filepicker-body" }],
		});
	}
	/** @override */
	render(force, options) {
		if (game.world && !game.user.can("FILES_BROWSE")) return this;
		this.position.height = null;
		//* Ensure the dialog is rendered above the MetaDialog
		const newZIndex = this.position.zIndex + 100;
		this.element.css({ height: "" });
		this.element.css({ zIndex: newZIndex });
		//! which one works?
		this.position.zIndex = newZIndex;
		this._tabs[0].active = this.activeSource;
		if (!this._loaded) {
			this.browse();
			return this;
		} else return super.render(force, options);
	}
	//* custom function to be called via the New Actor/Finalize process
	//todo this is similar to actor-sheet function, should consolidate
	async onSelectPortrait(selection, actorUuid) {
		metaLog(1, "MetaDialog", "FilePicker Selection:", selection, "actor:", actorUuid);
		const actor = await fromUuid(actorUuid);
		metaLog(1, "MetaDialog", "this, Actor:", this, actor);
		const path = selection;
		//? Update the Actor image + Prototype token image
		//todo need to evaluate how this works with non-linked tokens & actors
		await actor.update({ img: path });
		const prototype = actor.prototypeToken || false;
		if (prototype) {
			await actor.update({ "prototypeToken.texture.src": path });
		}
		//? Update Iterate over all scenes
		for (const scene of game.scenes) {
			let tokensToUpdate = [];
			//? Find tokens that represent the actor
			for (const token of scene.tokens.contents) {
				if (token.actorId === actor.id) {
					tokensToUpdate.push({ _id: token.id, "texture.src": path });
				}
			}
			//? Update the token images
			if (tokensToUpdate.length > 0) {
				await scene.updateEmbeddedDocuments("Token", tokensToUpdate);
			}
		}
	}
}
