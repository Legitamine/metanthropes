/**
 * metaRoll - Handles rolling d100 dice for Metanthropes
 *
 * This function checks various Core Conditions (e.g., unconsciousness, hunger, disease)
 * before proceeding with the roll. It then calls the metaEvaluate function to
 * calculate the result of the roll.
 *
 * @param {Object} actor - The actor making the roll. Expected to be an Actor object.
 * @param {String} action - The type of action being performed (e.g., "StatRoll", "Metapower", etc).
 * @param {String} stat - The stat being rolled against. Expected to be a string.
 * @param {Boolean} isCustomRoll - Whether the roll is custom or not. Expected to be a boolean.
 * @param {Number} destinyCost - The destiny cost of the action. Expected to be a positive number.
 * @param {String} itemName - The name of the Metapower, Possession or Combo being used. Expected to be a string.
 * @param {String} messageId - The message ID of the chat message for the reroll, if any. Expected to be a string.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * Rolling a simple stat
 * metaRoll(actor, "StatRoll", "Power");
 */
export async function metaRoll(
	actor,
	action,
	stat,
	isCustomRoll = false,
	destinyCost = 0,
	itemName = null,
	messageId = null,
	reroll = false,
	rerollCounter = 0
) {
	//? Initialize the actor's RollStat array before proceeding
	await actor.getRollData();
	const statScore = actor.system.RollStats[stat];
	metanthropes.utils.metaLog(3, "metaRoll", "Engaged for", actor.type + ":", actor.name + "'s", action, "with", stat);
	//* Go through a series of tests and checks before actually rolling the dice
	//? Check if we are ok to do the roll stat-wise
	if (statScore <= 0) {
		ui.notifications.error(
			game.i18n.localize("METANTHROPES.UI.NOTIFICATIONS.META_ROLL.CannotRoll") +
				actor.name +
				game.i18n.localize("METANTHROPES.UI.NOTIFICATIONS.META_ROLL.ActorS") +
				stat +
				game.i18n.localize("METANTHROPES.UI.NOTIFICATIONS.META_ROLL.ZeroStatScore")
		);
		return;
	}
	//? Check for always active item activation
	if (itemName) {
		const actionSlot = actor.items.getName(itemName).system.Execution.ActionSlot.value;
		if (actionSlot === "Always Active") {
			ui.notifications.info(
				actor.name +
					game.i18n.localize("METANTHROPES.UI.NOTIFICATIONS.META_ROLL.ActorS") +
					itemName +
					game.i18n.localize("METANTHROPES.UI.NOTIFICATIONS.META_ROLL.AlwaysActive")
			);
			return;
		}
	}
	//? Check for Hunger: We must beat the Hunger check before doing our action (Initiative is exempt)
	const hungerLevel = actor.system.Characteristics.Mind.CoreConditions.Hunger;
	hungerCheck: if (hungerLevel > 0 && action !== "Initiative") {
		//? Check if actor has already overcome hunger
		const hungerRollResult = (await actor.getFlag("metanthropes", "hungerRollResult")) || false;
		if (hungerRollResult) {
			//? If the flag exists, we clear it and resume running the rest of the checks
			await actor.unsetFlag("metanthropes", "hungerRollResult");
			metanthropes.utils.metaLog(3, "metaRoll", "Hunger Check Passed, moving on");
			//todo: perhaps I should minimize the sheet while the hunger check is happening?
			break hungerCheck;
		} else {
			//? Engage the Hunger Roll
			await actor.setFlag("metanthropes", "MetaRollBeforeHungerCheck", {
				action: action,
				stat: stat,
				isCustomRoll: isCustomRoll,
				destinyCost: destinyCost,
				itemName: itemName,
			});
			metanthropes.utils.metaLog(3, "metaRoll", "Hunger Check Failed, Engaging Hunger Roll");
			await metanthropes.dice.metaHungerRoll(actor, hungerLevel);
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
		if (diseasePenalty > -(diseaseLevel * 10)) {
			diseasePenalty = -(diseaseLevel * 10);
		}
	}
	//* Check for Reductions
	//? Check for Reduction due to missing Perk Skill Levels
	let perkReduction = 0;
	if (itemName && action === "Possession") {
		const requiredPerk = actor.items.getName(itemName).system.RequiredPerk.value;
		metanthropes.utils.metaLog(3, "metaRoll", "Required Perk for", itemName, "is", requiredPerk);
		if (requiredPerk !== "None") {
			const requiredPerkLevel = actor.items.getName(itemName).system.RequiredPerkLevel.value;
			const actorPerkLevel = actor.system.Perks.Skills[requiredPerk].value;
			const levelDifference = requiredPerkLevel - actorPerkLevel;
			if (levelDifference > 0) {
				perkReduction = levelDifference * -10;
				metanthropes.utils.metaLog(2, "metaRoll", "Perk Penalty for", actor.name, "is", perkReduction);
			}
		}
	}
	//? Check for Reduction due to Aiming
	//* ready to call metaEvaluate, but first we check if we have custom options
	let bonus = 0;
	let penalty = 0;
	let multiAction = 0;
	let reduction = 0;
	let aimingReduction = 0;
	if (isCustomRoll) {
		metanthropes.utils.metaLog(3, "metaRoll", "Custom Roll Detected");
		let { customMultiAction, customBonus, customPenalty, customReduction, customAimingReduction } =
			await metaRollCustomDialog(actor, action, stat, statScore, itemName);
		//? Check to see if null or undefined values were returned and change to 0 instead
		multiAction = customMultiAction || 0;
		bonus = customBonus || 0;
		penalty = customPenalty || 0;
		reduction = customReduction || 0;
		aimingReduction = customAimingReduction || 0;
		metanthropes.utils.metaLog(
			3,
			"metaRoll",
			"Using Custom Roll Results:",
			multiAction,
			bonus,
			penalty,
			reduction,
			aimingReduction
		);
		//? Check if Custom Penalty is smaller than Disease penalty (values are expected to be negatives)
		//todo add a new function to compare values for bonus and penalty - this way we can do the disease and perk check the same way without caring about the order in which we do them
		if (customPenalty < diseasePenalty) {
			penalty = customPenalty;
			metanthropes.utils.metaLog(
				3,
				"metaRoll",
				"Penalty from Disease is lower than Custom Roll Penalty, using the latter",
				diseasePenalty,
				customPenalty
			);
		} else {
			penalty = diseasePenalty;
			metanthropes.utils.metaLog(
				3,
				"metaRoll",
				"Penalty from Disease is higher than Custom Roll Penalty, using the former",
				diseasePenalty,
				customPenalty
			);
		}
		metanthropes.utils.metaLog(
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
			itemName,
			"Message ID:",
			messageId
		);
		await metanthropes.dice.metaEvaluate(
			actor,
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
			rerollCounter
		);
	} else {
		penalty = diseasePenalty;
		await metanthropes.dice.metaEvaluate(
			actor,
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
			rerollCounter
		);
	}
	//* Post-Evaluate-roll actions
	// intentionally left blank
	//? metaRoll Finished
	metanthropes.utils.metaLog(3, "metaRoll", "Finished");
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
 * @param {Object} actor - The actor making the roll.
 * @param {string} action - The type of action being performed (e.g., "StatRoll", "Metapower").
 * @param {string} stat - The stat being rolled against.
 * @param {number} statScore - The score of the stat being rolled.
 * @param {string} [itemName=null] - The name of the Metapower, Possession, or Combo being used.
 * @returns {Promise<Object>} A promise that resolves with roll modifiers: multiAction, bonus, customPenalty, customReduction, aimingReduction.
 */
export async function metaRollCustomDialog(actor, action, stat, statScore, itemName = null) {
	return new Promise(async (resolve) => {
		//* Get Game Variables
		const isBetaTesting = game.settings.get("metanthropes", "metaBetaTesting");
		//* Determine the maximum number of multi-actions possible based on the statScore value
		const maxMultiActions = Math.max(Math.floor((statScore - 1) / 10), 0);
		const multiActionOptions = Array.from({ length: maxMultiActions - 1 }, (_, i) => i + 2);
		//* Leverage the Field API to create the Dialog content
		const fields = foundry.applications.fields;
		//? Bonus
		const bonusInput = fields.createNumberInput({
			name: "bonus",
			classes: ["style-buffs"],
			value: 0,
			step: 1,
		});
		const bonusInputGroup = fields.createFormGroup({
			input: bonusInput,
			classes: ["style-buffs"],
			label: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Bonus"),
			units: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Units"),
			hint: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.BonusHint"),
		});
		//? Penalty
		const penaltyInput = fields.createNumberInput({
			name: "penalty",
			classes: ["style-conditions"],
			value: 0,
			step: 1,
		});
		const penaltyInputGroup = fields.createFormGroup({
			input: penaltyInput,
			classes: ["style-conditions"],
			label: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Penalty"),
			units: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Units"),
			hint: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.PenaltyHint"),
		});
		//? Custom Reduction
		const customReductionInput = fields.createNumberInput({
			name: "customReduction",
			classes: ["style-conditions"],
			value: 0,
			step: 1,
		});
		const customReductionInputGroup = fields.createFormGroup({
			input: customReductionInput,
			classes: ["style-conditions"],
			label: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.CustomReduction"),
			units: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Units"),
			hint: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.CustomReductionHint"),
		});
		//? Aiming Reduction
		const aimingReductionInput = fields.createNumberInput({
			name: "aimingReduction",
			classes: ["style-conditions"],
			value: 0,
			step: 1,
		});
		const aimingReductionInputGroup = fields.createFormGroup({
			input: aimingReductionInput,
			classes: ["style-conditions"],
			label: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.AimingReduction"),
			units: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Units"),
			hint: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.AimingReductionHint"),
		});
		//* Multi-Action Count
		const multiActionCountInput = fields.createSelectInput({
			name: "multiActionCount",
			options: [
				{ value: "no", label: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.None") },
				...multiActionOptions.map((n) => ({ value: n, label: String(n) })),
			],
			required: true,
		});
		const multiActionCountSelectGroup = fields.createFormGroup({
			input: multiActionCountInput,
			label: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.MultiActionCount"),
			units: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.MultiActionCountUnits"),
			hint: game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.MultiActionCountHint"),
		});
		//* Create the content for the Dialog
		let content = `${multiActionCountSelectGroup.outerHTML}
			${bonusInputGroup.outerHTML}
			${penaltyInputGroup.outerHTML}
			${customReductionInputGroup.outerHTML}`;
		if (action !== "StatRoll" && isBetaTesting) {
			content += `${aimingReductionInputGroup.outerHTML}`;
		}
		//* Create the Dialog Title and Buttons
		let dialogTitle = `${actor.name}`;
		dialogTitle += game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Title");
		let dialogButtonLabel;
		let dialogIcon;
		if (action === "StatRoll") {
			dialogTitle += `${stat}`;
			dialogTitle += game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Stat");
			dialogButtonLabel = game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.StatRoll");
			dialogButtonLabel += `${stat}`;
			dialogIcon = "fa-sharp-duotone fa-chart-simple"
		} else if (action === "Metapower") {
			dialogTitle += game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Metapower");
			dialogButtonLabel = game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.MetapowerRoll");
			dialogButtonLabel += `${itemName}`;
			dialogIcon = "fa-kit fa-metanthropes"
		} else if (action === "Possession") {
			dialogTitle += game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.Possession");
			dialogButtonLabel = game.i18n.localize("METANTHROPES.UI.APPS.META_ROLL_OPTIONS.PossessionRoll");
			dialogButtonLabel += `${itemName}`;
			dialogIcon = "fa-sharp-duotone fa-backpack"
		}
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
			metanthropes.utils.metaLog(3, "metaRoll", "Custom Roll Dialog Closed, Roll Canceled");
			return;
		}
		let customMultiAction;
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
		//* Return the parsed results to the metaRoll function
		metanthropes.utils.metaLog(
			3,
			"metaRollCustomDialog",
			"Custom Dialog Results:",
			customMultiAction,
			customBonus,
			customPenalty,
			customReduction,
			customAimingReduction
		);
		//? Resolve the Promise & return the data we collected to the metaRoll function
		resolve({ customMultiAction, customBonus, customPenalty, customReduction, customAimingReduction });
	});
}
