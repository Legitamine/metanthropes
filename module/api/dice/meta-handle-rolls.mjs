/**
 * metaHandleRolls - The starting point for handling various types of rolls for the Metanthropes system.
 *
 * This function is expected to be called via a button or click event in the Actor or Item sheet, not called directly.
 * Looks for the roll type specified in the dataset of the event.currentTarget.
 * It supports different roll types such as "StatRoll", "Metapower", and "Possession". Depending on the roll type,
 * it calls the metaRoll function with the appropriate parameters.
 * todo see notes on metahandleCoverRolls below
 *
 * @export
 * @async
 * @param {*} event 
 * @param {*} metaSheet 
 * @param {boolean} [isCustomRoll=false] 
 * @returns {unknown} 
 */
export async function metaHandleRolls(event, metaSheet, isCustomRoll = false) {
	const mL = metanthropes.utils.metaLog;
	// event.preventDefault();
	const element = event.currentTarget;
	//? Disable the element for 3 seconds to prevent double-clicking
	//! Is this required since I disable the buttons now? Does this affect stat rolls? (I don't think so)
	//todo Investigate if this is still required
	//todo implement a better method
	// element.disabled = true;
	// setTimeout(() => {
	// 	element.disabled = false;
	// }, 3000);
	const dataset = element.dataset;
	mL(3, "metaHandleRolls", "Engaged via right-click:", isCustomRoll);
	//? Handle all types of rolls here based on the rollType (data-roll-type) - return if it's not a rollType
	if (!dataset.rollType) {
		mL(2, "metaHandleRolls", "ERROR: dataset does not contain a rollType", dataset);
		return false;
	}

	const actor = metaSheet.actor;
	const action = dataset.rollType;
	const stat = dataset.stat;
	const destinyCost = Number(dataset.destinyCost) || 0; //? Destiny Cost is optional, so if it's not defined, set it to 0
	const itemName = dataset.itemName || null; //? Item Name is optional, so if it's not defined, set it to null
	const actorUUID = actor.uuid;
	const itemID = dataset.itemId ?? null;
	let itemUUID = null;
	if (itemID) itemUUID = actor.items.get(itemID).uuid;
	mL(3, "metaHandleRolls", "Actor UUID", actorUUID, "Item UUID", itemUUID);
	switch (dataset.rollType) {
		case "StatRoll":
			mL(3, "metaHandleRolls", "Engaging metaRoll for:", actor.name + "'s", action, "with", stat);
			await metanthropes.dice.metaRoll({
				actorUUID,
				itemUUID,
				action,
				stat,
				isCustomRoll,
				destinyCost,
			});
			mL(3, "metaHandleRolls", "Finished Rolling for StatRoll");
			return true;
		case "Metapower":
			mL(
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
				stat,
			);
			await metanthropes.dice.metaRoll({
				actorUUID,
				itemUUID,
				action,
				stat,
				isCustomRoll,
				destinyCost,
			});
			mL(3, "metaHandleRolls", "Finished Rolling for Metapower");
			return true;
		case "Possession":
			mL(
				3,
				"metaHandleRolls",
				"Engaging metaRoll for:",
				actor.name + "'s",
				action,
				"Possession:",
				itemName,
				"with:",
				stat,
			);
			await metanthropes.dice.metaRoll({
				actorUUID,
				itemUUID,
				action,
				stat,
				isCustomRoll,
				destinyCost: 0,
			});
			mL(3, "metaHandleRolls", "Finished Rolling for Possession");
			return true;
		default:
			mL(2, "metaHandleRolls", "ERROR: not defined rollType", dataset.rollType);
			return false;
	}
}

/**
 * HandleCoverRolls - A utility function to handle cover rolls for the Metanthropes system.
 * 
 * This Function is called via a button or click event in the actor sheet, not called directly.
 * todo Disable elements properly
 * todo this sould all be handled on the actor sheet AND also be able to be called programmatically in a better way
 * todo This should be called directly at a later milestone when integrating with the Targeting & Aiming system
 * todo better params
 * todo review what is returned from the metaCoverRoll and adjust the flow
 * todo or simply merge with the above metaHandleRolls
 *
 * @export
 * @async
 * @param {*} event
 * @param {*} metaSheet
 * @returns {*}
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
	metanthropes.dice.metaCoverRoll({actorUUID: actor.uuid, coverType, coverValue});
}
