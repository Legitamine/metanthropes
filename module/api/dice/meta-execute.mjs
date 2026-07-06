/**
 * metaExecute handles the execution of Metapowers and Possessions for a given actor.
 *
 * This function determines the type of action (Metapower or Possession) and executes the corresponding logic.
 * It can be triggered either directly or from a button click event.
 * The function checks for Metapowers that affect explosive d10 dice and applies the corresponding logic.
 * It also constructs and sends a chat message detailing the execution results.
 * todo: this function is currently in the process of being refactored, along with all other dice functions
 *
 * @param {Object} event [event=null] - The button click event, if the function was triggered by a button click. Expected to be null if the function is called directly.
 * @param {String} actorUUID - The UUID of the actor performing the action. Expected to be a string.
 * @param {String} itemUUID - The UUID of the item for the Metapower or Possession being executed. Expected to be a string.
 * @param {String} action - The type of action ("Metapower" or "Possession"). Expected to be a string.
 * @param {Number} multiAction [multiAction=0] - Indicates if multi-Actions are being performed. Expected to be a negative number.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * metaExecute is typically triggered automatically via an event, however you may call it directly by not passing an event or by passing event: null
 * metaExecute({event: null, actorUUID, "Metapower", itemUUID});
 */
export async function metaExecute({ event = null, actorUUID, itemUUID, action, multiAction = 0 }) {
	const mL = metanthropes.utils.metaLog;

	//* Grab & Evaluate Parameters
	//? If we called this from a button click, get the data we need
	const clickedButton = event?.target;
	if (event) {
		actorUUID = clickedButton.dataset.actoruuid;
		itemUUID = clickedButton.dataset.itemuuid;
		action = clickedButton.dataset.action;
		multiAction = parseInt(clickedButton.dataset.multiAction) ?? 0;
	}
	//? Check if we are running in Alpha/Beta Testing mode (available via Homebrew/Core Module respectfuly)
	const alphaTesting = metanthropes.utils.metaCheckSetting("homebrew", "metaAlphaTesting");
	const betaTesting = metanthropes.utils.metaCheckSetting("core", "metaBetaTesting");
	//? Grab the actor & item to use
	const actor = await fromUuid(actorUUID);
	const item = await fromUuid(itemUUID);
	if (!item) return mL(2, "metaExecute", "ERROR: Could not find Item with UUID:", itemUUID);
	const itemName = item.name;
	mL(3, "metaExecute", "Engaged for", actor.name, itemName);
	//? Checking if actor has Metapowers that affect the explosive dice
	const explosiveDice = "x10"; //todo: placeholder for custom explosive dice
	//? Gather all the execution data
	const actionSlot = item.system.Execution.ActionSlot.value;
	const targetsNumber = item.system.Execution.Targets.value;
	const targetsEligible = item.system.Execution.TargetsEligibility.value;
	const targetsType = item.system.Execution.TargetsType.value;
	const duration = item.system.Execution.Duration.value;
	const range = item.system.Execution.Range.value;
	const areaEffect = item.system.Execution.AreaEffect.value;
	const areaType = item.system.Execution.AreaType.value;
	const vsRoll = item.system.Effects.VSStatRoll.value;
	//? Gather all the effect data
	const effectDescription = item.system.Effects.EffectDescription.value;
	const damageBaseCosmic = item.system.Effects.Damage.Cosmic.Base;
	const damageDiceCosmic = item.system.Effects.Damage.Cosmic.Dice;
	const damageBaseElemental = item.system.Effects.Damage.Elemental.Base;
	const damageDiceElemental = item.system.Effects.Damage.Elemental.Dice;
	let damageBaseMaterial = item.system.Effects.Damage.Material.Base || 0; //? ensures we can apply Power to melee & projectiles
	const damageDiceMaterial = item.system.Effects.Damage.Material.Dice || 0; //? ensures we can apply Power to melee & projectiles
	const damageBasePsychic = item.system.Effects.Damage.Psychic.Base;
	const damageDicePsychic = item.system.Effects.Damage.Psychic.Dice;
	const healingBase = item.system.Effects.Healing.Base;
	const healingDice = item.system.Effects.Healing.Dice;
	const specialName = item.system.Effects.Special.SpecialDiceName.value;
	const specialBase = item.system.Effects.Special.Base;
	const specialDice = item.system.Effects.Special.Dice;
	const specialIsHalf = item.system.Effects.Special.isHalf;
	// const buffsPermanent = metaItemData.system.Effects.Buffs.Permanent.value;
	const buffsApplied = item.system.Effects.Buffs.Applied.value;
	const buffsRemoved = item.system.Effects.Buffs.Removed.value;
	const conditionsApplied = item.system.Effects.Conditions.Applied.value;
	const conditionsRemoved = item.system.Effects.Conditions.Removed.value;
	//? Prep possession required variables
	let powerScore;
	let category;
	let attackType;
	let baseActorDamage = null;
	let quantity;
	let requiredPerk;
	let requiredPerkLevel;
	//? Prep chat message variables
	let actionSlotMessage;
	let targetsMessage;
	let targetsNumberDiceMessage;
	let durationMessage;
	let durationDiceMessage;
	let areaEffectMessage;
	let vsMessage;
	let damageCosmicMessage;
	let damageElementalMessage;
	let damageMaterialMessage;
	let damagePsychicMessage;
	let healingMessage;
	let specialMessage;
	// let buffsPermanentMessage;
	let buffsAppliedMessage;
	let buffsRemovedMessage;
	let conditionsAppliedMessage;
	let conditionsRemovedMessage;
	let flavorMessage;
	let contentMessage = ``;
	//? Prep Damage/Healing Roll Results
	let cosmicDamageRollResult;
	let elementalDamageRollResult;
	let materialDamageRollResult;
	let psychicDamageRollResult;
	let healingRollResult;
	//? Prep dice holding variables
	let actionSlotDice;
	let targetsNumberDice;
	let durationDice;
	//? Prep chat message buttons & params
	let actionSlotRerollButton = null;
	let targetsRerollButton = null;
	let durationRerollButton = null;
	let cosmicDamageRollParams = null;
	let elementalDamageRollParams = null;
	let materialDamageRollParams = null;
	let psychicDamageRollParams = null;
	let healingRollParams = null;
	let specialRerollButton = null;
	let targetedActorNames = null;
	let targetedActorLinks = null;
	//? Targeting variables
	let damageSelectedTargets = false;
	let healSelectedTargets = false;
	let targetedActorsUUIDs = [];
	let actionableTargets = false;
	//? Other
	let executeRoll = null;
	const spendingDamage =
		damageDiceCosmic > 0 || damageDiceElemental > 0 || damageDiceMaterial > 0 || damageDicePsychic > 0;
	const spendingHealing = healingDice > 0;
	//? Get the last rolled result
	const rollResult = await actor.getFlag("metanthropes", "lastrolled");

	//* Set the flavor message based on the action
	if (action === "Metapower") {
		//? Check if activation was successfull
		if (rollResult.Metapower <= 0) {
			flavorMessage = `Fails to Activate ${itemName}!<br><br>`;
			executeRoll = false;
		} else {
			//? Activate Metapower
			if (spendingDamage && betaTesting) {
				//todo
			}
			if (spendingHealing && betaTesting) {
				//todo
			}
			flavorMessage = `Activates ${itemName}.<br><br>`;
			executeRoll = true;
		}
	} else if (action === "Possession") {
		//? Possession only properties
		powerScore = actor.system.Characteristics.Body.Stats.Power.Roll;
		category = item.system.Category.value; // currently unused
		attackType = item.system.AttackType.value;
		quantity = item.system.Quantity.value; // currently unused
		requiredPerk = item.system.RequiredPerk.value; // currently unused
		requiredPerkLevel = item.system.RequiredPerkLevel.value; // currently unused
		//? Check if using was successfull
		//todo: work on how to include the gender pronoun in the chat message.
		if (rollResult.Possession <= 0) {
			executeRoll = false;
			if (attackType === "Melee") {
				flavorMessage = `Swings and misses with ${itemName}!<br><br>`;
			} else if (attackType === "Projectile") {
				flavorMessage = `Throws and misses with ${itemName}!<br><br>`;
				//todo affect the quantity
			} else if (attackType === "Firearm") {
				flavorMessage = `Fires and misses with ${itemName}!<br><br>`;
			} else if (attackType === "Explosive") {
				flavorMessage = `Fails to arm ${itemName}!<br><br>`;
			} else {
				flavorMessage = `Fails to use ${itemName}!<br><br>`;
			}
		} else {
			executeRoll = true;
			//? Use Possession
			mL(3, "metaExecute", "Using Possession:", itemName, "with Attack Type:", attackType);
			if (attackType === "Melee") {
				//todo: need to add size modifier to increase the base d10 dice pool for unarmed strikes only
				flavorMessage = `Swings with ${itemName}.<br><br>`;
				if (multiAction < 0) {
					baseActorDamage = powerScore + multiAction;
					damageBaseMaterial = baseActorDamage + damageBaseMaterial;
				} else {
					baseActorDamage = powerScore;
					damageBaseMaterial = baseActorDamage + damageBaseMaterial;
				}
			} else if (attackType === "Projectile") {
				flavorMessage = `Throws ${itemName}.<br><br>`;
				baseActorDamage = Math.ceil((powerScore + multiAction) / 2);
				damageBaseMaterial = baseActorDamage + damageBaseMaterial;
			} else if (attackType === "Firearm") {
				flavorMessage = `Fires ${itemName}.<br><br>`;
			} else if (attackType === "Explosive") {
				flavorMessage = `Arms ${itemName} successfully and throws it.<br><br>`;
			} else {
				flavorMessage = `Uses ${itemName}.<br><br>`;
			}
		}
	} else {
		mL(2, "metaExecute", "ERROR: cannot Execute action:", action);
		return;
	}

	//* Prepare content message constituents
	if (executeRoll) {
		///* check Area Effect
		if (areaEffect !== "None") {
			areaEffectMessage =
				`<span data-tooltip="Area Effect">@METAFA(ruler-combined, null) -</span> ` + areaEffect + `<br>`;
			//? check Area Type
			if (areaType.length > 0) {
				areaEffectMessage +=
					`<span data-tooltip="Area Effect">@METAFA(ruler-combined, null) (Type) -</span> ` +
					areaType +
					`<br>`;
			}
		} else {
			areaEffectMessage = null;
		}
		///* check for VS
		if (vsRoll !== "None") {
			vsMessage = `<span data-tooltip="VS Roll">@METAFA(swords, null) - </span>` + vsRoll + `<br>`;
		}
		///* finalize action slot
		if (actionSlot.includes("Always Active")) {
			//todo should this check have been made back in the roller not in the execute?
			//? always active return
			mL(1, "metaExecute", actor.name + "'s " + itemName, "is Always Active!");
			ui.notifications.info(actor.name + "'s " + itemName + " is Always Active!");
			return;
		} else if (actionSlot.includes("Focused")) {
			//? focused
			actionSlotMessage = `<span data-tooltip="Activation Slot">@METAFA(stopwatch, null) - </span>`;
			if (actionSlot.includes("1d10 Cycles")) {
				//? roll for cycles
				actionSlotDice = 1;
				actionSlotMessage += `Focused Action: <span class="meta-roll-inline-results-small">[[1d10${explosiveDice}[Cycles]]]</span> Cycles<br>`;
				actionSlotRerollButton = `<div class="hide-button hidden">
				<button class="metanthropes-secondary-chat-button action-slot rolld10-reroll" data-itemuuid="${itemUUID}"
				data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${actionSlotDice}"
				data-what="Activation" data-destiny-re-roll="true" data-reroll="false" data-reroll-counter="1">
				Spend @METAFA(hand-fingers-crossed) to reroll @METAFA(stopwatch) Activation</button>
				</div>`;
			} else if (actionSlot.includes("1d10 Hours")) {
				//? roll for hours
				actionSlotDice = 1;
				actionSlotMessage += `Focused Action: <span class="meta-roll-inline-results-small">[[1d10${explosiveDice}[Hours]]]</span> Hours<br>`;
				actionSlotRerollButton = `<div class="hide-button hidden">
				<button class="metanthropes-secondary-chat-button action-slot rolld10-reroll" data-itemuuid="${itemUUID}"
				data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${actionSlotDice}"
				data-what="Activation" data-destiny-re-roll="true" data-reroll="false" data-reroll-counter="1">
				Spend @METAFA(hand-fingers-crossed) to reroll @METAFA(stopwatch) Activation</button>
				</div>`;
			} else {
				actionSlotMessage += actionSlot + `<br>`;
			}
		} else {
			//? normal execution
			actionSlotMessage =
				`<span data-tooltip="Activation Slot">@METAFA(stopwatch, null) - </span>` + actionSlot + `<br>`;
		}
		///* finalize targets
		if (targetsNumber.includes("d10")) {
			//? roll for targets
			if (targetsNumber === "1d10/2") {
				//? roll for 1d10/2
				targetsNumberDiceMessage = `<span class="meta-roll-inline-results-small">[[ceil(1d10${explosiveDice}/2)[Targets]]]</span>`;
				targetsMessage = `<span data-tooltip="METANTHROPES.COMMON.Targets">@METAFA(bullseye, null) -</span> ${targetsNumberDiceMessage} Targets`;
				targetsNumberDice = 1;
				targetsRerollButton = `<div class="hide-button hidden">
			<button class="metanthropes-secondary-chat-button targets rolld10-reroll" data-itemuuid="${itemUUID}"
			data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${targetsNumberDice}"
			data-what="Targets" data-is-half="true" data-destiny-re-roll="true" data-reroll="false"
			data-reroll-counter="1">Spend @METAFA(hand-fingers-crossed) to reroll @METAFA(bullseye) Targets</button></div>`;
			} else {
				//? all other rolls
				targetsNumberDice = await metanthropes.utils.metaExtractNumberOfDice(targetsNumber);
				targetsNumberDiceMessage = `<span class="meta-roll-inline-results-small">[[${targetsNumberDice}d10${explosiveDice}[Targets]]]</span>`;
				targetsMessage = `<span data-tooltip="METANTHROPES.COMMON.Targets">@METAFA(bullseye, null) -</span> ${targetsNumberDiceMessage}`;
				targetsRerollButton = `<div class="hide-button hidden">
			<button class="metanthropes-secondary-chat-button targets rolld10-reroll" data-itemuuid="${itemUUID}"
			data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${targetsNumberDice}"
			data-what="Targets" data-destiny-re-roll="true" data-reroll="false" data-reroll-counter="1">
			Spend @METAFA(hand-fingers-crossed) to reroll @METAFA(bullseye) Targets</button>
			</div>`;
			}
		} else {
			targetsMessage = `<span data-tooltip="METANTHROPES.COMMON.Targets">@METAFA(bullseye, null) -</span> ${targetsNumber}`;
		}
		///* add eligible targets
		if (targetsEligible.length > 0) {
			targetsMessage += ` ` + targetsEligible.join(", ");
		}
		///* add type of targets
		if (targetsType.length > 0) {
			targetsMessage += ` ` + targetsType.join(", ") + `<br>`;
		} else {
			targetsMessage += `<br>`;
		}
		///* finalize duration
		if (duration.includes("d10")) {
			//? roll for duration
			durationDiceMessage = duration.match(/1d10 (.+)/);
			durationDice = 1;
			durationMessage =
				`<span data-tooltip="METANTHROPES.COMMON.Duration">@METAFA(hourglass-start, null) -</span> <span class="meta-roll-inline-results-small">[[1d10${explosiveDice}[${durationDiceMessage[1]}]]]</span> ` +
				durationDiceMessage[1] +
				`<br>`;
			durationRerollButton = `<div class="hide-button hidden">
			<button class="metanthropes-secondary-chat-button duration rolld10-reroll"
			data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${durationDice}" data-itemuuid="${itemUUID}"
			data-what="Duration" data-destiny-re-roll="true" data-reroll="false" data-reroll-counter="1">
			Spend @METAFA(hand-fingers-crossed) to reroll @METAFA(hourglass-start) Duration</button>
			</div>`;
		} else {
			//? fixed duration
			durationMessage =
				`<span data-tooltip="METANTHROPES.COMMON.Duration">@METAFA(hourglass-start, null) -</span> ` +
				duration +
				`<br>`;
		}
		///* effect message
		//todo spending would need a form, not dialog to control the +/- of the spending and inject the results at this step
		if (damageBaseCosmic > 0 || damageDiceCosmic > 0) {
			const cosmicDamageRoll = await metanthropes.dice.metaRolld10({
				actorUUID: actorUUID,
				what: `Cosmic Damage`,
				destinyReRoll: true,
				dice: damageDiceCosmic,
				itemUUID: itemUUID,
				baseNumber: damageBaseCosmic,
				isHalf: false,
				anchor: true,
				reroll: false,
				rerollCounter: 0,
				messageId: null,
			});
			cosmicDamageRollResult = cosmicDamageRoll.dataset.total;
			cosmicDamageRollParams = `data-dice-cosmic="${damageDiceCosmic}" data-base-cosmic="${damageBaseCosmic}"`;
			damageCosmicMessage = `${cosmicDamageRoll.outerHTML}`;
		}
		if (damageBaseElemental > 0 || damageDiceElemental > 0) {
			const elementalDamageRoll = await metanthropes.dice.metaRolld10({
				actorUUID: actorUUID,
				what: `Elemental Damage`,
				destinyReRoll: true,
				dice: damageDiceElemental,
				itemUUID: itemUUID,
				baseNumber: damageBaseElemental,
				isHalf: false,
				anchor: true,
				reroll: false,
				rerollCounter: 0,
				messageId: null,
			});
			elementalDamageRollResult = elementalDamageRoll.dataset.total;
			elementalDamageRollParams = `data-dice-elemental="${damageDiceElemental}" data-base-elemental="${damageBaseElemental}"`;
			damageElementalMessage = `${elementalDamageRoll.outerHTML}`;
		}
		if (damageBaseMaterial > 0 || damageDiceMaterial > 0) {
			const materialDamageRoll = await metanthropes.dice.metaRolld10({
				actorUUID: actorUUID,
				what: `Material Damage`,
				destinyReRoll: true,
				dice: damageDiceMaterial,
				itemUUID: itemUUID,
				baseNumber: damageBaseMaterial,
				isHalf: false,
				anchor: true,
				reroll: false,
				rerollCounter: 0,
				messageId: null,
			});
			materialDamageRollResult = materialDamageRoll.dataset.total;
			materialDamageRollParams = `data-dice-material="${damageDiceMaterial}" data-base-material="${damageBaseMaterial}"`;
			damageMaterialMessage = `${materialDamageRoll.outerHTML}`;
		}
		if (damageBasePsychic > 0 || damageDicePsychic > 0) {
			const psychicDamageRoll = await metanthropes.dice.metaRolld10({
				actorUUID: actorUUID,
				what: `Psychic Damage`,
				destinyReRoll: true,
				dice: damageDicePsychic,
				itemUUID: itemUUID,
				baseNumber: damageBasePsychic,
				isHalf: false,
				anchor: true,
				reroll: false,
				rerollCounter: 0,
				messageId: null,
			});
			psychicDamageRollResult = psychicDamageRoll.dataset.total;
			psychicDamageRollParams = `data-dice-psychic="${damageDicePsychic}" data-base-psychic="${damageBasePsychic}"`;
			damagePsychicMessage = `${psychicDamageRoll.outerHTML}`;
		}
		if (healingBase > 0 || healingDice > 0) {
			const healingRoll = await metanthropes.dice.metaRolld10({
				actorUUID: actorUUID,
				what: `Healing`,
				destinyReRoll: true,
				dice: healingDice,
				itemUUID: itemUUID,
				baseNumber: healingBase,
				isHalf: false,
				anchor: true,
				reroll: false,
				rerollCounter: 0,
				messageId: null,
			});
			healingRollResult = healingRoll.dataset.total;
			healingRollParams = `data-healing-dice="${healingDice}" data-healing-base="${healingBase}"`;
			healingMessage = `${healingRoll.outerHTML}`;
		}
		if (specialBase > 0 && specialDice > 0) {
			if (!specialIsHalf) {
				specialMessage = `${specialName}: [[${specialDice}d10${explosiveDice}+${specialBase}]]<br>`;
				specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll"
			data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="${specialName}" data-itemuuid="${itemUUID}"
			data-dice="${specialDice}" data-destiny-re-roll="true" data-base-number="${specialBase}"
			data-reroll="false" data-reroll-counter="1">
			Spend @METAFA(hand-fingers-crossed) to reroll ${specialName}</button>
			<br></div>`;
			} else if (specialIsHalf) {
				specialMessage = `${specialName}: [[ceil(${specialDice}d10${explosiveDice}/2)+${specialBase}]]<br>`;
				specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll" data-actoruuid="${actor.uuid}"
			data-item-name="${itemName}" data-what="${specialName}" data-dice="${specialDice}" data-itemuuid="${itemUUID}"
			data-destiny-re-roll="true" data-base-number="${specialBase}" data-is-half="true"
			data-reroll="false" data-reroll-counter="1">
			Spend @METAFA(hand-fingers-crossed) to reroll ${specialName}</button>
			<br></div>`;
			}
		} else if (specialBase > 0) {
			specialMessage = `${specialName}: [[${specialBase}]]<br><br>`;
		} else if (specialDice > 0) {
			if (!specialIsHalf) {
				specialMessage = `${specialName}: [[${specialDice}d10${explosiveDice}]]<br>`;
				specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll" data-actoruuid="${actor.uuid}"
			data-item-name="${itemName}" data-what="${specialName}" data-dice="${specialDice}" data-itemuuid="${itemUUID}"
			data-destiny-re-roll="true" data-reroll="false" data-reroll-counter="1">
			Spend @METAFA(hand-fingers-crossed) to reroll ${specialName}</button>
			<br></div>`;
			} else if (specialIsHalf) {
				specialMessage = `${specialName}: [[ceil(${specialDice}d10${explosiveDice}/2)]]<br>`;
				specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll" data-actoruuid="${actor.uuid}"
			data-item-name="${itemName}" data-what="${specialName}" data-dice="${specialDice}" data-itemuuid="${itemUUID}"
			data-destiny-re-roll="true" data-is-half="true" data-reroll="false" data-reroll-counter="1">
			Spend @METAFA(hand-fingers-crossed) to reroll ${specialName}</button>
			<br></div>`;
			}
		}
		//todo Removed Permanent Buffs showing until further notice
		// if (buffsPermanent) {
		// 	buffsPermanentMessage = `<i class="fa-solid fa-shield-halved"></i> <i class="fa-solid fa-infinity"></i>: ` + buffsPermanent + `<br>`;
		// }
		///* todo refactor with Active Effects in mind
		//todo: review if we should color the FA icons here to denote positive (+buff or -condition) / negative effects
		if (buffsApplied) {
			buffsAppliedMessage =
				`<span data-tooltip="METANTHROPES.LOGIC.METAEXECUTE.BuffsApplied">@METAFA(plus, null) @METAFA(shield-halved, null)</span>: ` +
				buffsApplied +
				`<br>`;
		}
		if (buffsRemoved) {
			buffsRemovedMessage =
				`<span data-tooltip="METANTHROPES.LOGIC.METAEXECUTE.BuffsRemoved">@METAFA(minus, null) @METAFA(shield-halved, null)</span>: ` +
				buffsRemoved +
				`<br>`;
		}
		if (conditionsApplied) {
			conditionsAppliedMessage =
				`<span data-tooltip="METANTHROPES.LOGIC.METAEXECUTE.ConditionsApplied">@METAFA(plus, null) @METAFA(skull, null)</span>: ` +
				conditionsApplied +
				`<br>`;
		}
		if (conditionsRemoved) {
			conditionsRemovedMessage =
				`<span data-tooltip="METANTHROPES.LOGIC.METAEXECUTE.ConditionsRemoved">@METAFA(minus, null) @METAFA(skull, null)</span>: ` +
				conditionsRemoved +
				`<br>`;
		}
		///* Assemble contentMessage to be presented in the content section (allows inline rolls)
		//todo since this area allows inline rolls, couldn't we make the extra rolling here for spending lvl of success?
		contentMessage = actionSlotMessage;
		contentMessage += targetsMessage;
		contentMessage += durationMessage;
		contentMessage +=
			`<span data-tooltip="METANTHROPES.COMMON.Range">@METAFA(ruler, null) -</span> ` + range + `<br>`;
		if (areaEffectMessage) {
			contentMessage += areaEffectMessage;
			contentMessage += `<hr />`;
		} else {
			contentMessage += `<hr />`;
		}
		if (vsMessage) {
			contentMessage += vsMessage;
			contentMessage += `<hr />`;
		}
		if (effectDescription) {
			contentMessage += `${effectDescription}<hr />`;
		}
		//* Targeting
		///todo Targeting v1 todo needs to move outside of execute or run along side it
		//todo clean up notes & simplify
		const manuallySelectedTargets = game.user.targets;
		//? VFX requires the tokens from ^^ here, which we get in an Array
		//? Grab an Array of the token documents involved and filter out null & dupes
		const targetsFilteredArray = Array.from(manuallySelectedTargets)
			.map((token) => token.actor)
			.filter((_) => _); //?Filter out null actors (in case there were deleted)
		const targetsTokenDocumentsArray = Array.from(new Set(targetsFilteredArray)); //? Remove duplicates (in case a linked actor is placed multiple times in the canvas) //todo should we even allow this in the first place?
		//? Create a new Array with only the token actor's uuids to be used for damage/healing application later
		targetedActorsUUIDs = Array.from(targetsTokenDocumentsArray.map((a) => a.uuid));
		mL(
			3,
			"metaExecute",
			"Review Target selection",
			"manuallySelectedTargets",
			manuallySelectedTargets,
			"targetsFilteredArray",
			targetsFilteredArray,
			"targetsTokenDocumentsArray",
			targetsTokenDocumentsArray,
			"targetedActorsUUIDs",
			targetedActorsUUIDs,
		);
		//? Check if there are any targeted actors and set the actionableTargets variable accordingly
		actionableTargets = targetedActorsUUIDs.length > 0;
		if (
			!actionableTargets &&
			duration.includes("Instantaneous") &&
			(damageCosmicMessage ||
				damageElementalMessage ||
				damageMaterialMessage ||
				damagePsychicMessage ||
				healingMessage)
		) {
			mL(4, "metaExecute", "No Manually Selected Targets");
			ui.notifications.warn("You must select valid targets first");
			if (event) {
				clickedButton.classList.remove("disabled");
			}
			return;
		}
		if (!actionableTargets) {
			mL(3, "metaExecute", "No Actionable Targets");
		} else {
			//!dd I don't need this var anymore
			//? Get the names of all targeted actors //! changed from targetsArray
			targetedActorNames = targetsTokenDocumentsArray.map((actor) => actor.name);
			mL(
				3,
				"metaExecute",
				`Target${targetedActorNames.length > 1 ? "s" : ""} Name${targetedActorNames.length > 1 ? "s" : ""}:`,
				targetedActorNames,
			);
			//!dd instead:
			targetedActorLinks = targetedActorsUUIDs.map((uuid) => `@METALINK(${uuid})`).join(", ");
		}
		if (
			//todo: need to allow to proceed without targets selected - perhaps split if we do or don't do (actionableTargets)
			actionableTargets > 0 ||
			(!duration.includes("Instantaneous") &&
				(damageCosmicMessage ||
					damageElementalMessage ||
					damageMaterialMessage ||
					damagePsychicMessage ||
					healingMessage))
		) {
			if (
				actionableTargets > 0 &&
				duration.includes("Instantaneous") &&
				(damageCosmicMessage || damageElementalMessage || damageMaterialMessage || damagePsychicMessage)
			) {
				contentMessage += `Applying @METAFA(burst) Damage to @METAFA(bullseye) Target${
					targetedActorNames.length > 1 ? "s" : ""
				}: ${targetedActorLinks}<br>`;
			}
			if (actionableTargets > 0 && healingMessage && duration.includes("Instantaneous")) {
				contentMessage += `Applying @METAFA(heart-pulse) Healing to @METAFA(bullseye) Target${
					targetedActorNames.length > 1 ? "s" : ""
				}: ${targetedActorLinks}<br>`;
			}
			//? Show selected Targets for non-Damage/Healing messages
			if (actionableTargets > 0 && !duration.includes("Instantaneous")) {
				contentMessage += `Selected Target${targetedActorNames.length > 1 ? "s" : ""}: ${targetedActorLinks}<br>`;
			}

			if (damageCosmicMessage) {
				contentMessage += `<div class="meta-roll-inline-results">`;
				contentMessage += damageCosmicMessage;
				contentMessage += `</div>`;
			}
			if (damageElementalMessage) {
				contentMessage += `<div class="meta-roll-inline-results">`;
				contentMessage += damageElementalMessage;
				contentMessage += `</div>`;
			}
			if (damageMaterialMessage) {
				contentMessage += `<div class="meta-roll-inline-results">`;
				contentMessage += damageMaterialMessage;
				contentMessage += `</div>`;
			}
			if (damagePsychicMessage) {
				contentMessage += `<div class="meta-roll-inline-results">`;
				contentMessage += damagePsychicMessage;
				contentMessage += `</div>`;
			}
			if (healingMessage) {
				contentMessage += `<div class="meta-roll-inline-results">`;
				contentMessage += healingMessage;
				contentMessage += `</div>`;
			}
		}
		if (
			damageCosmicMessage ||
			damageElementalMessage ||
			damageMaterialMessage ||
			damagePsychicMessage ||
			healingMessage
		)
			contentMessage += `<hr />`;
		if (specialMessage) {
			contentMessage += specialMessage;
			contentMessage += `<hr />`;
		}
		if (buffsAppliedMessage) {
			contentMessage += buffsAppliedMessage;
		}
		if (buffsRemovedMessage) {
			contentMessage += buffsRemovedMessage;
		}
		if (buffsAppliedMessage || buffsRemovedMessage) {
			contentMessage += `<hr />`;
		}
		if (conditionsAppliedMessage) {
			contentMessage += conditionsAppliedMessage;
		}
		if (conditionsRemovedMessage) {
			contentMessage += conditionsRemovedMessage;
		}
		if (conditionsAppliedMessage || conditionsRemovedMessage) {
			contentMessage += `<hr />`;
		}
		//todo add message that creates 'spend levels of success' button to increase damage + healing dices
		// if condition to only apply when damage/healing and when levels>=1
		// refactor metapowers json file
		// new button sets off a dialog that takes input in the form of options from the itemName & lvls
		// dialog returns an update to the chat message with the new results ideally.
		// ok vasika anti na pame sto chat, pame na to kanoume present se ena dialog prwta kai ekei na rwtame ean exoume mpei sto if
		//? check if actor has enough destiny points to reroll
		let destinyRerollButtonMessage = false;
		if (damageCosmicMessage || damageElementalMessage || damageMaterialMessage || damagePsychicMessage) {
			if (duration.includes("Instantaneous")) damageSelectedTargets = true;
			if (actor.currentDestiny > 0) {
				const damageReRollButton = `<div class="hide-button hidden">
				<button class="metanthropes-secondary-chat-button damage roll-damage-reroll chat-button-anchor"
				data-targets="${targetedActorsUUIDs}" data-actoruuid="${actor.uuid}" data-item-name="${itemName}"
				data-what="Damage" data-anchor="true" data-reroll="false" data-reroll-counter="1"
				data-message-id="null" data-destiny-re-roll="true" data-damage-selected-targets="${damageSelectedTargets}"
				data-first-message="true" data-itemuuid="${itemUUID}"
				${cosmicDamageRollParams} ${elementalDamageRollParams}
				${materialDamageRollParams} ${psychicDamageRollParams}
				>Spend @METAFA(hand-fingers-crossed) to Reroll @METAFA(burst) Damage
				</button></div>`;
				contentMessage += damageReRollButton;
				destinyRerollButtonMessage = true;
			}
		}
		if (healingMessage) {
			if (duration.includes("Instantaneous")) healSelectedTargets = true;
			if (actor.currentDestiny > 0) {
				const healingRerollButton = `<div class="hide-button hidden">
				<button class="metanthropes-secondary-chat-button healing roll-healing-reroll chat-button-anchor"
				data-targets="${targetedActorsUUIDs}" data-actoruuid="${actor.uuid}" data-item-name="${itemName}"
				data-what="Healing" data-anchor="true" data-heal-selected-targets="${healSelectedTargets}"
				data-reroll="false" data-reroll-counter="1" data-message-id="null"
				data-destiny-re-roll="true" ${healingRollParams} data-itemuuid="${itemUUID}"
				data-first-message="true"
				>Spend @METAFA(hand-fingers-crossed) to Reroll @METAFA(heart-pulse) Healing
				</button></div>`;
				contentMessage += healingRerollButton;
				destinyRerollButtonMessage = true;
			}
		}
		if (actor.currentDestiny > 0) {
			//? add destiny reroll buttons
			if (actionSlotRerollButton) {
				contentMessage += actionSlotRerollButton;
				destinyRerollButtonMessage = true;
			}
			if (targetsRerollButton) {
				contentMessage += targetsRerollButton;
				destinyRerollButtonMessage = true;
			}
			if (durationRerollButton) {
				contentMessage += durationRerollButton;
				destinyRerollButtonMessage = true;
			}
			if (specialRerollButton) {
				contentMessage += specialRerollButton;
				destinyRerollButtonMessage = true;
			}
			if (destinyRerollButtonMessage) {
				contentMessage += `<br>`;
			}
		}
		contentMessage += `<div class="hide-button hidden">${actor.name} has ${actor.currentDestiny} @METAFA(hand-fingers-crossed) Destiny remaining.</div>`;
	}

	//* Post Execution Actions
	mL(3, "metaExecute", "Post Execution Actions");
	//? Clear all metapower related result flags (currently only from duplicateself)
	//todo: this behavior should change with Actor active effects instead of flags, or we'd have to do many exceptions for edge cases
	//! the idea here being that if the flags are going to be added later, here we prevent them from remaining from previous successful activations
	await actor.unsetFlag("metanthropes", "duplicateSelf");
	//? Get the result of the last roll
	let checkResult = await actor.getFlag("metanthropes", "lastrolled").MetaEvaluate;
	//? Check for Duplicate Self Metapower Activation
	if (checkResult > 0 && action === "Metapower" && ["Clone", "Couple", "Team", "Squad", "Unit"].includes(itemName)) {
		mL(3, "metaExecute", "Duplicate Self Metapower Activation Detected");
		let currentLife = actor.system.Vital.Life.value;
		let duplicateMaxLife = 0;
		if (itemName === "Clone") {
			duplicateMaxLife = Math.ceil(currentLife * 0.1);
		} else if (itemName.includes("Couple")) {
			duplicateMaxLife = Math.ceil(currentLife * 0.2);
		} else if (itemName === "Team") {
			duplicateMaxLife = Math.ceil(currentLife * 0.3);
		} else if (itemName.includes("Squad")) {
			duplicateMaxLife = Math.ceil(currentLife * 0.4);
		} else if (itemName.includes("Unit")) {
			duplicateMaxLife = Math.ceil(currentLife * 0.5);
		}
		await actor.setFlag("metanthropes", "duplicateSelf", { maxLife: duplicateMaxLife });
		mL(3, "metaExecute", "Duplicate Self Metapower Max Life:", duplicateMaxLife);
	}

	//* Compile Chat Data
	let chatData = {
		//? user: game.user.id, //!why do we have this here, is it even valid?
		flavor: flavorMessage,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentMessage,
		//? is this now redundant here? rollMode: game.settings.get("core", "rollMode"),
		flags: { metanthropes: { actoruuid: actor.uuid } },
	};

	//* Set Visibility
	const rollMode = game.settings.get("core", "rollMode");
	await metanthropes.applications.MetaChatMessage.applyMode(chatData, rollMode);
	//* Send Chat Message
	await metanthropes.applications.MetaChatMessage.create(chatData);

	//! return new Promise(resolve);
	//todo should we wait here until DSN animation finished before proceeding?
	// needs a message.id - if (game.dice3d) await game.dice3d.waitFor3DAnimationByMessageID(chatMessage.id);

	//* Trigger VFX & Apply Damage to Selected Targets
	if (damageSelectedTargets && actionableTargets) {
		if (alphaTesting) {
			//? Trigger VFX
			mL(3, "metaExecute", "Triggering VFX");
			try {
				const vfxData = {
					initiatingTokenUUID: actorUUID,
					targetTokensUUIDs: targetedActorsUUIDs,
					cosmicDamage: cosmicDamageRollResult,
					elementalDamage: elementalDamageRollResult,
					materialDamage: materialDamageRollResult,
					psychicDamage: psychicDamageRollResult,
					itemUUID: itemUUID,
				};
				//! do I need to stringify here? seems not
				mL(3, "metaExecute", "VFX Payload", vfxData);
				game.socket.emit("system.metanthropes", {
					action: "metaPlayVFX",
					vfxData: vfxData,
				});
				//todo review socket emit if we would receive this ourselves?
				//todo review if stringify is required?
				await metanthropes.vfx.metaVFX(vfxData);
			} catch (error) {
				mL(5, "metaExecute", "VFX Failed with error", error);
			}
		}
		//? Apply Damage
		mL(3, "metaExecute", "Applying Damage");
		await metanthropes.logic.metaApplyDamage(
			targetedActorsUUIDs,
			cosmicDamageRollResult,
			elementalDamageRollResult,
			materialDamageRollResult,
			psychicDamageRollResult,
		);
	}

	//* Apply Healing to Selected Targets * no VFX currently
	if (healSelectedTargets && actionableTargets) {
		mL(3, "metaExecute", "Applying Healing");
		await metanthropes.logic.metaApplyHealing(targetedActorsUUIDs, healingRollResult);
	}
	mL(3, "metaExecute", "Finished");
}
