/**
 * Helper function to import functionality from the Core Module
 * !Deprecated in favor of metaImportFromModule
 */

export async function metaImportProgressionFromCoreModule() {
	const metaCoreIsEnabled = await game.settings.get("metanthropes", "metaCore");
	if (metaCoreIsEnabled) {
		try {
			const module = await import("../../../../modules/metanthropes-core/module/progression/metaprogression.mjs");
			metanthropes.utils.metaLog(3, "Metanthropes", "Meta Helpers", "Import Progression From Core Module", module);
			return module.MetaStartProgression;
		} catch (error) {
			metanthropes.utils.metaLog(
				2,
				"Meta Helpers",
				"Import Progression From Core Module",
				"Error importing Metanthropes Core Module",
				error
			);
			return undefined;
		}
	}
	return undefined;
}

/**
 *
 * Helper function to refresh the actor or item sheet
 * This is needed to ensure the Stat Scores display correctly in the Metapowers and Possessions tabs of the actor sheet
 *
 * @param {*} sheet actor or item
 */
//! Is this function needed? now that we used a different lookup method for the Current Score vs refreshing the sheet, it should be deprecated?
export async function metaSheetRefresh(sheet) {
	metanthropes.utils.metaLog(3, "metaSheetRefresh", "Engaged for", "Sheet", sheet);
	//todo: make it so that it will only refresh if the sheet is not minimized etc || test!
	if (sheet.rendered && !sheet._minimized) {
		metanthropes.utils.metaLog(3, "metaSheet", "updating the roll data for the actor");
		const actor = sheet.actor;
		await actor.getRollData();
		metanthropes.utils.metaLog(3, "metaSheet", "done");
	}
	//if (sheet.rendered) {
	//	metaLog(3, "metaSheetRefresh", "Refreshing Sheet");
	//	sheet.render(true);
	//}
	metanthropes.utils.metaLog(3, "metaSheetRefresh", "!!! DEPRECATED - SHOULD NOT BE USED !!!");
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

/**
 * Helper function that takes a string, changes uppercase letters to lowercase and changes spaces, tabs & linebreaks to dashes "-"
 *
 * @param {*} string
 * @returns
 */
export function metaTransformStringForStorage(string) {
	const makeString = `${string}`;
	const newLowerCaseString = makeString.toLowerCase();
	const newCleanStringForStorage = newLowerCaseString.replace(/\s+/g, "-");
	return newCleanStringForStorage;
}
