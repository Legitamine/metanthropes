import { MetaRoll } from "../metanthropes/metaroll.mjs";
import { metaLog } from "../helpers/metahelpers.mjs";
/**
 * HandleMetaRolls - A utility function to handle various types of meta rolls for the Metanthropes system.
 *
 * This function processes the roll request based on the roll type specified in the dataset of the event target.
 * It supports different roll types such as "StatRoll", "Metapower", and "Possession". Depending on the roll type,
 * it engages the MetaRoll function with the appropriate parameters.
 *
 * @param {Event} event - The triggering event, typically a button click.
 * @param {Object} metaSheet - The sheet (actor or item) from which the roll is initiated.
 * @param {boolean} [isCustomRoll=false] - A flag to determine if the roll is a custom roll (e.g., initiated via right-click).
 *
 * @returns {void}
 *
 * Usage:
 * - For standard rolls: HandleMetaRolls(event, actorSheet);
 * - For custom rolls: HandleMetaRolls(event, actorSheet, true);
 */

export async function HandleMetaRolls(event, metaSheet, isCustomRoll = false) {
	event.preventDefault();
	const element = event.currentTarget;
	//? Disable the element for 3 seconds to prevent double-clicking
	element.disabled = true;
	setTimeout(() => {
		element.disabled = false;
	}, 3000);
	const dataset = element.dataset;
	metaLog(3, "HandleMetaRolls", "Engaged via right-click:", isCustomRoll);
	//? Handle all types of rolls here based on the rollType (data-roll-type)
	if (dataset.rollType) {
		const actor = metaSheet.actor;
		const action = dataset.rollType;
		const stat = dataset.stat;
		const destinyCost = Number(dataset.destinyCost) ?? 0; //? Destiny Cost is optional, so if it's not defined, set it to 0
		const itemName = dataset.itemName || ""; //? Item Name is optional, so if it's not defined, set it to ""
		if (dataset.rollType == "StatRoll") {
			metaLog(3, "HandleMetaRolls", "Engaging MetaRoll for:", actor.name + "'s", action, "with", stat);
			await MetaRoll(actor, action, stat, isCustomRoll, destinyCost, itemName);
			metaLog(3, "HandleMetaRolls", "Finished Rolling for StatRoll");
		} else if (dataset.rollType == "Metapower") {
			metaLog(
				3,
				"HandleMetaRolls",
				"Engaging MetaRoll for:",
				actor.name + "'s",
				action,
				"Metapower:",
				itemName,
				"Destiny Cost:",
				destinyCost,
				"with:",
				stat
			);
			await MetaRoll(actor, action, stat, isCustomRoll, destinyCost, itemName);
			metaLog(3, "HandleMetaRolls", "Finished Rolling for Metapower");
		} else if (dataset.rollType == "Possession") {
			metaLog(
				3,
				"HandleMetaRolls",
				"Engaging MetaRoll for:",
				actor.name + "'s",
				action,
				"Possession:",
				itemName,
				"with:",
				stat
			);
			await MetaRoll(actor, action, stat, isCustomRoll, 0, itemName);
			metaLog(3, "HandleMetaRolls", "Finished Rolling for Possession");
		} else {
			metaLog(2, "HandleMetaRolls", "ERROR: not defined rollType", dataset.rollType);
			return;
		}
	}
	//? After doing a meta roll, re-render the actor or item sheet.
	metaLog(3, "HandleMetaRolls", "Finished, re-rendering the actor/item sheet");
	metaSheet.render(true);
}
