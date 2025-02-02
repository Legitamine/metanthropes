/**
 * metaHandleRolls - A utility function to handle various types of meta rolls for the Metanthropes system.
 *
 * This function is expected to be called via a button or click event in the actor or item sheet, not called directly.
 * This function processes the roll request based on the roll type specified in the dataset of the event target.
 * It supports different roll types such as "StatRoll", "Metapower", and "Possession". Depending on the roll type,
 * it engages the metaRoll function with the appropriate parameters.
 *
 * @param {Event} event - The triggering event, typically a button click.
 * @param {Object} metaSheet - The sheet (actor or item) from which the roll is initiated.
 * @param {boolean} [isCustomRoll=false] - A flag to determine if the roll is a custom roll (e.g., initiated via right-click).
 *
 * @returns {void}
 *
 */
export async function metaHandleRolls(event, metaSheet, isCustomRoll = false) {
	event.preventDefault();
	const element = event.currentTarget;
	//? Disable the element for 3 seconds to prevent double-clicking
	//! Is this required since I disable the buttons now? Does this affect stat rolls? (I don't think so)
	//todo Investigate if this is still required
	element.disabled = true;
	setTimeout(() => {
		element.disabled = false;
	}, 3000);
	const dataset = element.dataset;
	metanthropes.utils.metaLog(3, "metaHandleRolls", "Engaged via right-click:", isCustomRoll);
	//? Handle all types of rolls here based on the rollType (data-roll-type)
	if (dataset.rollType) {
		const actor = metaSheet.actor;
		const action = dataset.rollType;
		const stat = dataset.stat;
		const destinyCost = Number(dataset.destinyCost) || 0; //? Destiny Cost is optional, so if it's not defined, set it to 0
		const itemName = dataset.itemName || null; //? Item Name is optional, so if it's not defined, set it to null
		switch (dataset.rollType) {
			case "StatRoll":
				metanthropes.utils.metaLog(3, "metaHandleRolls", "Engaging metaRoll for:", actor.name + "'s", action, "with", stat);
				await metanthropes.dice.metaRoll(actor, action, stat, isCustomRoll, destinyCost, itemName);
				metanthropes.utils.metaLog(3, "metaHandleRolls", "Finished Rolling for StatRoll");
				break;
			case "Metapower":
				metanthropes.utils.metaLog(
					3,
					"metaHandleRolls",
					"Engaging metaRoll for:",
					actor.name + "'s",
					action,
					"Metapower:",
					itemName,
					"Destiny Cost:",
					destinyCost,
					"with:",
					stat
				);
				await metanthropes.dice.metaRoll(actor, action, stat, isCustomRoll, destinyCost, itemName);
				metanthropes.utils.metaLog(3, "metaHandleRolls", "Finished Rolling for Metapower");
				break;
			case "Possession":
				metanthropes.utils.metaLog(
					3,
					"metaHandleRolls",
					"Engaging metaRoll for:",
					actor.name + "'s",
					action,
					"Possession:",
					itemName,
					"with:",
					stat
				);
				await metanthropes.dice.metaRoll(actor, action, stat, isCustomRoll, 0, itemName);
				metanthropes.utils.metaLog(3, "metaHandleRolls", "Finished Rolling for Possession");
				break;
			default:
				metanthropes.utils.metaLog(2, "metaHandleRolls", "ERROR: not defined rollType", dataset.rollType);
				return;
		}
	}
}
/**
 * HandleCoverRolls - A utility function to handle cover rolls for the Metanthropes system.
 * This Function is called via a button or click event in the actor sheet, not called directly.
 * todo This should be called directly at a later milestone when integrating with the Targeting & Aiming system
 *
 * @param {*} event
 * @param {*} metaSheet
 */
export async function handleCoverRolls(event, metaSheet) {
	event.preventDefault();
	const element = event.currentTarget;
	//? Disable the element for 3 seconds to prevent double-clicking
	element.disabled = true;
	setTimeout(() => {
		element.disabled = false;
	}, 3000);
	const dataset = element.dataset;
	const actor = metaSheet.actor;
	const coverType = dataset.type;
	const coverValue = parseInt(dataset.coverValue);
	metanthropes.dice.metaCoverRoll(actor, coverType, coverValue);
}
