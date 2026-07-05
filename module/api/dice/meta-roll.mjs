/**
 * metaRoll - Handles rolling d100 dice for Metanthropes
 *
 * This function checks various Core Conditions (e.g., unconsciousness, hunger, disease).
 * Also allows for a Custom Roll where manual inputs for multi-Actions/bonus/penalty/reductions can be applied.
 * Finally it calls the metaEvaluate function to calculate the result of the roll.
 *
 * @export
 * @async
 * @param {object} options
 * @property {string} actorUUID - The UUID of the Actor making the roll.
 * @property {string} action - The type of action being rolled.
 * @property {string} stat - The type of action being performed (e.g., "StatRoll", "Metapower", "Possession" etc).
 * @property {null|string} [itemUUID=null] - The UUID of the Item involved in the roll.
 * @property {boolean} [isCustomRoll=false] - Custom rolls show a dialog to manually add Bonus/Penalties/etc.
 * @property {number} [destinyCost=0] - The destiny cost of the action. Expected to be a positive number.
 * @property {null|string} [messageId=null] - The message ID of the chat message for the reroll, if any.
 * @property {boolean} [reroll=false] - If true, it will update the chat message, instead of creating a new one.
 * @property {number} [rerollCounter=0] - The number of total rerolls completed.
 * @returns {Promise<void>} - .
 */
export async function metaRoll({
	actorUUID,
	action,
	stat,
	itemUUID = null,
	isCustomRoll = false,
	destinyCost = 0,
	messageId = null,
	reroll = false,
	rerollCounter = 0,
}) {
	const mL = metanthropes.utils.metaLog;
	//? Initialize the actor's RollStat array before proceeding
	const actor = await fromUuid(actorUUID);
	await actor.getRollData();
	const item = (await fromUuid(itemUUID)) ?? null;
	const itemName = item?.name ?? null;
	const statScore = actor.system.RollStats[stat];
	mL(
		3,
		"metaRoll",
		"Engaged for",
		actor.type + ":",
		actor.name + "'s",
		action,
		"with",
		stat,
		"ItemName",
		itemName,
		"itemUUID",
		itemUUID,
	);
	//* Go through a series of tests and checks before actually rolling any dice
	//? Check if we are ok to do the roll stat-wise
	if (statScore <= 0) {
		ui.notifications.error(
			_loc("METANTHROPES.UI.NOTIFICATIONS.META_ROLL.CannotRoll") +
				actor.name +
				_loc("METANTHROPES.UI.NOTIFICATIONS.META_ROLL.ActorS") +
				stat +
				_loc("METANTHROPES.UI.NOTIFICATIONS.META_ROLL.ZeroStatScore"),
		);
		return;
	}
	//? Check for always active item activation
	if (item) {
		const actionSlot = item.system.Execution.ActionSlot.value;
		if (actionSlot === "Always Active") {
			ui.notifications.info(
				actor.name +
					_loc("METANTHROPES.UI.NOTIFICATIONS.META_ROLL.ActorS") +
					itemName +
					_loc("METANTHROPES.UI.NOTIFICATIONS.META_ROLL.AlwaysActive"),
			);
			return;
		}
	}
	//? Check for Fatigue
	// currently only mentioned in Combat Chat, no further automation
	//? Check if we are unconscious
	// currently only mentioned in Combat Chat, no further automation
	//* Check for Bonuses
	// space intentionally left blank
	//* Check for Penalties
	//? Pain is passed to metaEvaluate
	const pain = actor.system.Characteristics.Mind.CoreConditions.Pain;
	//? Check for Disease
	let diseasePenalty = 0;
	const diseaseLevel = actor.system.Characteristics.Body.CoreConditions.Diseased;
	if (diseaseLevel > 0) {
		//? Set diseasePenalty according to the Disease level
		if (diseasePenalty > -(diseaseLevel * 10)) diseasePenalty = -(diseaseLevel * 10);
	}
	//* Check for Reductions
	let perkReduction = 0;
	//? Check for Reduction due to missing Perk Skill Levels
	if (item && action === "Possession") {
		const requiredPerk = item.system.RequiredPerk.value;
		mL(3, "metaRoll", "Required Perk for", item.name, "is", requiredPerk);
		if (requiredPerk !== "None") {
			const requiredPerkLevel = item.system.RequiredPerkLevel.value;
			const actorPerkLevel = actor.system.Perks.Skills[requiredPerk].value;
			const levelDifference = requiredPerkLevel - actorPerkLevel;
			if (levelDifference > 0) {
				perkReduction = levelDifference * -10;
				mL(1, "metaRoll", "Perk Penalty for", actor.name, "is", perkReduction);
			}
		}
	}
	//? Check for Reduction due to Aiming
	//* Check if we have custom options (right-click)
	let bonus = 0;
	let penalty = 0;
	let multiAction = 0;
	let reduction = 0;
	let aimingReduction = 0;
	if (isCustomRoll) {
		//? First check if the Actor already has custom roll params configured (probably from a Hunger check)
		mL(3, "metaRoll", "Custom Roll Detected");
		let customRollResult = actor.getFlag("metanthropes", "customRollResult") ?? false;
		if (!customRollResult) {
			customRollResult = await metaRollCustomDialog(actor, action, stat, statScore, itemName); //!todo
			if (!customRollResult) return mL(3, "metaRoll", "Custom Roll Dialog canceled by user");
			await actor.setFlag("metanthropes", "customRollResult", customRollResult);
		}
		const { customMultiAction, customBonus, customPenalty, customReduction, customAimingReduction } =
			customRollResult;
		//? Check to see if null or undefined values were returned and change to 0 instead
		multiAction = customMultiAction || 0;
		bonus = customBonus || 0;
		penalty = customPenalty || 0;
		reduction = customReduction || 0;
		aimingReduction = customAimingReduction || 0;
		mL(3, "metaRoll", "Using Custom Roll Results:", multiAction, bonus, penalty, reduction, aimingReduction);
		//? Check if Custom Penalty is smaller than Disease penalty (values are expected to be negatives)
		penalty = Math.min(penalty, diseasePenalty);
		mL(
			3,
			"metaRoll",
			"Penalty from Disease / Custom Roll Penalty / Penalty value used",
			diseasePenalty,
			customPenalty,
			penalty,
		);
	} else {
		penalty = diseasePenalty;
	}

	//* Hunger Check
	const hungerLevel = actor.system.Characteristics.Mind.CoreConditions.Hunger;
	//? Check for Hunger: We must beat the Hunger check before doing our action (Initiative is exempt)
	hungerCheck: if (hungerLevel > 0 && action !== "Initiative") {
		//? Check if actor has already overcome hunger
		const hungerRollResult = (await actor.getFlag("metanthropes", "hungerRollResult")) || false;
		if (hungerRollResult) {
			//? If the flag exists, means we beat hunger check, so we clear it and break hungerCheck to go to the calling metaEvaluate step
			await actor.unsetFlag("metanthropes", "hungerRollResult");
			mL(3, "metaRoll", "Hunger Check Passed, moving on");
			//todo: perhaps I should minimize the sheet while the hunger check is happening?
			break hungerCheck;
		} else {
			//? we need to do a hunger check, so we set the flag with the player intended action, so it will roll it without player interaction again, once we pass hunger check
			await actor.setFlag("metanthropes", "MetaRollBeforeHungerCheck", {
				action: action,
				stat: stat,
				isCustomRoll: isCustomRoll,
				destinyCost: destinyCost,
				itemUUID: itemUUID,
			});
			mL(3, "metaRoll", "Hunger Check required, Engaging Hunger Roll");
			await metanthropes.dice.metaHungerRoll({ actorUUID: actorUUID, hungerLevel: hungerLevel });
			return;
		}
	}

	//* Calling metaEvaluate
	mL(
		3,
		"metaRoll",
		"Engaging metaEvaluate for:",
		actor.name + "'s Custom",
		action,
		"with",
		stat,
		statScore,
		"Multi-Action:",
		multiAction,
		"Perk Reduction:",
		perkReduction,
		"Aiming Reduction:",
		aimingReduction,
		"Reduction:",
		reduction,
		"Bonus:",
		bonus,
		"Penalty:",
		penalty,
		"Pain:",
		pain,
		"Destiny Cost:",
		destinyCost,
		"Item Name:",
		itemName, //!todo
		"Message ID:",
		messageId,
	);
	await metanthropes.dice.metaEvaluate({
		actorUUID,
		action,
		stat,
		statScore,
		multiAction,
		perkReduction,
		aimingReduction,
		reduction,
		bonus,
		penalty,
		pain,
		destinyCost,
		itemName,
		messageId,
		reroll,
		rerollCounter,
		itemUUID,
	});

	//* Post-Evaluate-roll actions
	await actor.unsetFlag("metanthropes", "customRollResult"); //? making sure we clear this
	//? metaRoll Finished
	mL(3, "metaRoll", "Finished");
}

/**
 * metaRollCustomDialog - Handles custom roll dialog options for Metanthropes
 *
 * Handles MetaRoll's custom roll dialog options using the an Application V2 Dialog.
 * Used to test the new DialogV2 API along with Fields API and Multilanguage support.
 *
 * This function is intended to be called when the user 'right-clicks' for a roll,
 * allowing for more complex roll configurations. It provides a dialog for the user to
 * select multi-actions, bonuses, penalties, etc. & then returns those values to metaRoll.
 *
 * @export
 * @async
 * @param {object} actor - The actor making the roll. //todo actorUUID instead
 * @param {string} action - The type of action being performed (e.g., "StatRoll", "Metapower").
 * @param {string} stat - The stat being rolled against.
 * @param {number} statScore - The score of the stat being rolled.
 * @param {string} [itemName=null] - The name of the Metapower, Possession, or Combo being used. //todo itemUUID instead
 * @returns {Promise<object>} A promise that resolves with roll modifiers: multiAction, bonus, customPenalty, customReduction, aimingReduction.
 */
export async function metaRollCustomDialog(actor, action, stat, statScore, itemName = null) {
	const mL = metanthropes.utils.metaLog;
	return new Promise(async (resolve) => {
		//* Get Game Variables
		const isBetaTesting = metanthropes.utils.metaCheckSetting("core", "metaBetaTesting");
		//* Determine the maximum number of multi-actions possible based on the statScore value
		const maxMultiActions = Math.max(Math.floor((statScore - 1) / 10), 0);
		const multiActionOptions = Array.from({ length: maxMultiActions - 1 }, (_, i) => i + 2);
		//* Leverage the Field API to create the Dialog content
		const fields = foundry.applications.fields;
		///* Bonus
		const bonusInput = fields.createNumberInput({
			name: "bonus",
			classes: ["style-buffs"],
			value: 0,
			step: 1,
		});
		const bonusInputGroup = fields.createFormGroup({
			input: bonusInput,
			classes: ["style-buffs"],
			label: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Bonus"),
			units: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Units"),
			hint: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.BonusHint"),
		});
		///* Penalty
		const penaltyInput = fields.createNumberInput({
			name: "penalty",
			classes: ["style-conditions"],
			value: 0,
			step: 1,
		});
		const penaltyInputGroup = fields.createFormGroup({
			input: penaltyInput,
			classes: ["style-conditions"],
			label: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Penalty"),
			units: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Units"),
			hint: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.PenaltyHint"),
		});
		///* Custom Reduction
		const customReductionInput = fields.createNumberInput({
			name: "customReduction",
			classes: ["style-conditions"],
			value: 0,
			step: 1,
		});
		const customReductionInputGroup = fields.createFormGroup({
			input: customReductionInput,
			classes: ["style-conditions"],
			label: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.CustomReduction"),
			units: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Units"),
			hint: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.CustomReductionHint"),
		});
		///* Aiming Reduction
		const aimingReductionInput = fields.createNumberInput({
			name: "aimingReduction",
			classes: ["style-conditions"],
			value: 0,
			step: 1,
		});
		const aimingReductionInputGroup = fields.createFormGroup({
			input: aimingReductionInput,
			classes: ["style-conditions"],
			label: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.AimingReduction"),
			units: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Units"),
			hint: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.AimingReductionHint"),
		});
		///* Multi-Action Count
		const multiActionCountInput = fields.createSelectInput({
			name: "multiActionCount",
			options: [
				{ value: "no", label: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.None") },
				...multiActionOptions.map((n) => ({ value: n, label: String(n) })),
			],
			required: true,
		});
		const multiActionCountSelectGroup = fields.createFormGroup({
			input: multiActionCountInput,
			label: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.MultiActionCount"),
			units: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.MultiActionCountUnits"),
			hint: _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.MultiActionCountHint"),
		});
		//* Create the content for the Dialog
		let content = `${multiActionCountSelectGroup.outerHTML}
			${bonusInputGroup.outerHTML}
			${penaltyInputGroup.outerHTML}
			${customReductionInputGroup.outerHTML}`;
		//todo needs more clarification on when the aiming reduction is applied
		// if (action !== "StatRoll" && isBetaTesting) {
		// 	content += `${aimingReductionInputGroup.outerHTML}`;
		// }
		//* Create the Dialog Title and Buttons
		let dialogTitle = `${actor.name}`;
		dialogTitle += _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Title");
		let dialogButtonLabel;
		let dialogIcon;
		//todo actions should be in CONFIG
		if (action === "StatRoll") {
			dialogTitle += `${stat}`;
			dialogTitle += _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Stat");
			dialogButtonLabel = _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.StatRoll");
			dialogButtonLabel += `${stat}`;
			dialogIcon = "fa-solid fa-chart-simple";
		} else if (action === "Metapower") {
			dialogTitle += _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Metapower");
			dialogButtonLabel = _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.MetapowerRoll");
			dialogButtonLabel += `${itemName}`;
			dialogIcon = "fa-kit fa-metanthropes";
		} else if (action === "Possession") {
			dialogTitle += _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Possession");
			dialogButtonLabel = _loc("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.PossessionRoll");
			dialogButtonLabel += `${itemName}`;
			dialogIcon = "fa-solid fa-backpack";
		} //todo add some error handling
		//* Prompt the Dialog and define the options
		const customDialogResults = await foundry.applications.api.DialogV2.prompt({
			id: "metanthropes-meta-roll-custom",
			//!not valid icon: "fa-solid fa-dice-d10",
			window: { title: dialogTitle },
			position: { width: 500, height: "auto" },
			classes: ["metanthropes", "style-metaroll-dialog"],
			content: content,
			modal: false,
			ok: {
				icon: dialogIcon,
				label: dialogButtonLabel,
				//? using the callback function to get the values from the form using FormDataExtended
				callback: (event, button, dialog) => new foundry.applications.ux.FormDataExtended(button.form).object,
			},
			rejectClose: false, //? Defaults true in V12, false in V13
		});
		//* Parse the Dialog Results
		if (!customDialogResults) {
			mL(3, "metaRoll", "Custom Roll Dialog Closed, Roll Canceled");
			return;
		}
		let customMultiAction;
		//todo do we need this kind of validation with fields?
		if (
			customDialogResults.multiActionCount === "no" ||
			customDialogResults.multiActionCount == undefined ||
			customDialogResults.multiActionCount == null
		) {
			customMultiAction = 0;
		} else {
			customMultiAction = customDialogResults.multiActionCount * -10;
		}
		let customBonus = customDialogResults.bonus;
		let customPenalty = -customDialogResults.penalty;
		let customReduction = -customDialogResults.customReduction;
		let customAimingReduction = -customDialogResults.aimingReduction || 0; //? aiming is not always part of the result
		//* Resolve the Promise & return data  to metaRoll
		mL(
			3,
			"metaRollCustomDialog",
			"Custom Dialog Results:",
			customMultiAction,
			customBonus,
			customPenalty,
			customReduction,
			customAimingReduction,
		);
		resolve({ customMultiAction, customBonus, customPenalty, customReduction, customAimingReduction });
	});
}
