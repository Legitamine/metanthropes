/**
 * metaExecute handles the execution of Metapowers and Possessions for a given actor.
 *
 * This function determines the type of action (Metapower or Possession) and executes the corresponding logic.
 * It can be triggered either directly or from a button click event.
 * The function checks for Metapowers that affect explosive d10 dice and applies the corresponding logic.
 * It also constructs and sends a chat message detailing the execution results.
 * todo: this function is currently in the process of being refactored, along with all other dice functions
 *
 * @param {Event} [event] - The button click event, if the function was triggered by a button click. Expected to be null if the function is called directly.
 * @param {string} actorUUID - The UUID of the actor performing the action. Expected to be a string.
 * @param {string} action - The type of action ("Metapower" or "Possession"). Expected to be a string.
 * @param {string} itemName - The name of the Metapower or Possession being executed. Expected to be a string.
 * @param {number} multiAction - Indicates if multi-Actions are being performed. Expected to be a negative number.
 *
 * @returns {Promise<void>} A promise that resolves once the function completes its operations.
 *
 * @example
 * metaExecute(null, actorUUID, "Metapower", "Danger Sense");
 */
export async function metaExecute(event, actorUUID, action, itemName, multiAction = 0) {
	//? If we called this from a button click, get the data we need
	if (event) {
		const button = event.target;
		actorUUID = button.dataset.actoruuid;
		action = button.dataset.action;
		itemName = button.dataset.itemName;
		multiAction = parseInt(button.dataset.multiAction) ?? 0;
	}
	//? Check if we are running in Beta Testing mode (available via Homebrew Module)
	const betaTesting = await game.settings.get("metanthropes", "metaBetaTesting");
	const actor = await fromUuid(actorUUID);
	//? Checking if actor has Metapowers that affect the explosive dice
	const explosiveDice = "x10";
	//todo: placeholder for custom explosive dice
	//? Find the first item ()that matches itemName
	const metaItemData = actor.items.find((item) => item.name === itemName);
	if (!metaItemData) {
		metanthropes.utils.metaLog(2, "metaExecute", "ERROR: Could not find any item named:", itemName);
		return;
	}
	metanthropes.utils.metaLog(3, "metaExecute", "Engaged for", itemName);
	//? Gather all the execution data
	const actionSlot = metaItemData.system.Execution.ActionSlot.value;
	const targetsNumber = metaItemData.system.Execution.Targets.value;
	const targetsEligible = metaItemData.system.Execution.TargetsEligibility.value;
	const targetsType = metaItemData.system.Execution.TargetsType.value;
	const duration = metaItemData.system.Execution.Duration.value;
	const range = metaItemData.system.Execution.Range.value;
	const areaEffect = metaItemData.system.Execution.AreaEffect.value;
	const areaType = metaItemData.system.Execution.AreaType.value;
	const vsRoll = metaItemData.system.Effects.VSStatRoll.value;
	//? Sound Effect Data
	const sfx = metaItemData.system.Effects.SFX.PlaylistSoundID.value;
	//? Visual Effect Data
	const vfx = metaItemData.system.Effects.VFX.MacroID.value;
	//? Gather all the effect data
	const effectDescription = metaItemData.system.Effects.EffectDescription.value;
	const damageBaseCosmic = metaItemData.system.Effects.Damage.Cosmic.Base;
	const damageDiceCosmic = metaItemData.system.Effects.Damage.Cosmic.Dice;
	const damageBaseElemental = metaItemData.system.Effects.Damage.Elemental.Base;
	const damageDiceElemental = metaItemData.system.Effects.Damage.Elemental.Dice;
	let damageBaseMaterial = metaItemData.system.Effects.Damage.Material.Base;
	const damageDiceMaterial = metaItemData.system.Effects.Damage.Material.Dice;
	const damageBasePsychic = metaItemData.system.Effects.Damage.Psychic.Base;
	const damageDicePsychic = metaItemData.system.Effects.Damage.Psychic.Dice;
	const healingBase = metaItemData.system.Effects.Healing.Base;
	const healingDice = metaItemData.system.Effects.Healing.Dice;
	const specialName = metaItemData.system.Effects.Special.SpecialDiceName.value;
	const specialBase = metaItemData.system.Effects.Special.Base;
	const specialDice = metaItemData.system.Effects.Special.Dice;
	const specialIsHalf = metaItemData.system.Effects.Special.isHalf;
	const buffsPermanent = metaItemData.system.Effects.Buffs.Permanent.value;
	const buffsApplied = metaItemData.system.Effects.Buffs.Applied.value;
	const buffsRemoved = metaItemData.system.Effects.Buffs.Removed.value;
	const conditionsApplied = metaItemData.system.Effects.Conditions.Applied.value;
	const conditionsRemoved = metaItemData.system.Effects.Conditions.Removed.value;
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
	let buffsPermanentMessage;
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
	let specialRerollButton = null;
	let targetedActorNames = null;
	//? Get the last rolled result
	const rollResult = actor.getFlag("metanthropes", "lastrolled");
	let executeRoll = null;
	//? Gather specific data & set the flavor message based on the action
	if (action === "Metapower") {
		//? Metapower only properties
		// space intentionally left blank
		//? Check if activation was successfull
		if (rollResult.Metapower <= 0) {
			flavorMessage = `Fails to Activate ${itemName}!<br><br>`;
			executeRoll = false;
		} else {
			//? Activate Metapower
			flavorMessage = `Activates ${itemName}.<br><br>`;
			executeRoll = true;
		}
	} else if (action === "Possession") {
		//? Possession only properties
		powerScore = actor.system.Characteristics.Body.Stats.Power.Roll;
		category = metaItemData.system.Category.value; // currently unused
		attackType = metaItemData.system.AttackType.value;
		quantity = metaItemData.system.Quantity.value; // currently unused
		requiredPerk = metaItemData.system.RequiredPerk.value; // currently unused
		requiredPerkLevel = metaItemData.system.RequiredPerkLevel.value; // currently unused
		//? Check if using was successfull
		if (rollResult.Possession <= 0) {
			executeRoll = false;
			if (attackType === "Melee") {
				flavorMessage = `Fails to connect with their ${itemName}!<br><br>`;
			} else if (attackType === "Projectile") {
				flavorMessage = `Throws their ${itemName} in the air!<br><br>`;
			} else if (attackType === "Firearm") {
				flavorMessage = `Fires their ${itemName} and hits nothing!<br><br>`;
			} else {
				flavorMessage = `Fails to use ${itemName}!<br><br>`;
			}
		} else {
			executeRoll = true;
			//? Use Possession
			metanthropes.utils.metaLog(
				3,
				"metaExecute",
				"Using Possession:",
				itemName,
				"with Attack Type:",
				attackType
			);
			if (attackType === "Melee") {
				//todo: need to add size modifier to increase the base d10 dice pool for unarmed strikes only
				flavorMessage = `Attacks with their ${itemName}<br><br>`;
				if (multiAction < 0) {
					baseActorDamage = powerScore + multiAction;
					damageBaseMaterial = baseActorDamage + damageBaseMaterial;
				} else {
					baseActorDamage = powerScore;
					damageBaseMaterial = baseActorDamage + damageBaseMaterial;
				}
			} else if (attackType === "Projectile") {
				flavorMessage = `Throws their ${itemName}<br><br>`;
				baseActorDamage = Math.ceil(powerScore / 2);
				damageBaseMaterial = baseActorDamage + damageBaseMaterial;
			} else if (attackType === "Firearm") {
				flavorMessage = `Fires their ${itemName}<br><br>`;
			} else {
				flavorMessage = `Uses ${itemName}<br><br>`;
			}
		}
	} else {
		metanthropes.utils.metaLog(2, "metaExecute", "ERROR: cannot Execute action:", action);
		return;
	}
	//* Targeting v1 variables
	//? Setup a variable to check if we will be applying damage/healing to the targeted actors later
	let damageSelectedTargets = false;
	let healSelectedTargets = false;
	//? Setup an array for targeted actors, this will be used later to apply effects to them
	let targetedActors = [];
	//? Setup a variable to know if we'll have to apply effects to the targeted actors
	let actionableTargets = false;
	//* Prepare content message constituents
	//! the true meta-execute logic
	if (executeRoll) {
		//? check Area Effect
		if (areaEffect !== "None") {
			areaEffectMessage =
				`<span data-tooltip="Area Effect"><i class="fa-sharp-duotone fa-solid fa-hexagon-image"></i> -</span> ` +
				areaEffect +
				`<br>`;
			//? check Area Type
			if (areaType.length > 0) {
				areaEffectMessage +=
					`<span data-tooltip="Area Effect"><i class="fa-sharp-duotone fa-solid fa-hexagon-image"></i> (Type) -</span> ` +
					areaType +
					`<br>`;
			}
		} else {
			areaEffectMessage = null;
		}
		//? check for VS
		if (vsRoll !== "None") {
			vsMessage =
				`<span data-tooltip="VS Roll"><i class="fa-sharp-duotone fa-solid fa-swords"></i> - </span>` +
				vsRoll +
				`<br>`;
		}
		//? finalize action slot
		if (actionSlot.includes("Always Active")) {
			//? always active return
			metanthropes.utils.metaLog(1, "metaExecute", actor.name + "'s " + itemName, "is Always Active!");
			ui.notifications.info(actor.name + "'s " + itemName + " is Always Active!");
			return;
		} else if (actionSlot.includes("Focused")) {
			//? focused
			actionSlotMessage = `<span data-tooltip="Activation Slot"><i class="fa-sharp-duotone fa-solid fa-stopwatch"></i> - </span>`;
			if (actionSlot.includes("1d10 Cycles")) {
				//? roll for cycles
				actionSlotDice = 1;
				actionSlotMessage += `Focused Action: [[1d10${explosiveDice}]] Cycles<br>`;
				actionSlotRerollButton = `<div class="hide-button hidden"><br>
				<button class="metanthropes-secondary-chat-button action-slot rolld10-reroll"
				data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${actionSlotDice}"
				data-what="Activation" data-destiny-re-roll="true" data-reroll="false" data-reroll-counter="1">
				Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> to reroll <i class="fa-sharp-duotone fa-solid fa-stopwatch"></i> Activation</button>
				<br></div>`;
			} else if (actionSlot.includes("1d10 Hours")) {
				//? roll for hours
				actionSlotDice = 1;
				actionSlotMessage += `Focused Action: [[1d10${explosiveDice}]] Hours<br>`;
				actionSlotRerollButton = `<div class="hide-button hidden"><br>
				<button class="metanthropes-secondary-chat-button action-slot rolld10-reroll"
				data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${actionSlotDice}"
				data-what="Activation" data-destiny-re-roll="true" data-reroll="false" data-reroll-counter="1">
				Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> to reroll <i class="fa-sharp-duotone fa-solid fa-stopwatch"></i> Activation</button>
				<br></div>`;
			} else {
				actionSlotMessage += actionSlot + `<br>`;
			}
		} else {
			//? normal execution
			actionSlotMessage =
				`<span data-tooltip="Activation Slot"><i class="fa-sharp-duotone fa-solid fa-stopwatch"></i> - </span>` +
				actionSlot +
				`<br>`;
		}
		//? finalize targets
		if (targetsNumber.includes("d10")) {
			//? roll for targets
			if (targetsNumber === "1d10/2") {
				//? roll for 1d10/2
				targetsNumberDiceMessage = `[[ceil(1d10${explosiveDice}/2)]]`;
				targetsMessage = `<span data-tooltip="Targets"><i class="fa-sharp-duotone fa-solid fa-crosshairs-simple"></i> -</span> ${targetsNumberDiceMessage}`;
				targetsNumberDice = 1;
				targetsRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button targets rolld10-reroll"
			data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${targetsNumberDice}"
			data-what="Targets" data-is-half="true" data-destiny-re-roll="true" data-reroll="false"
			data-reroll-counter="1">Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> to reroll <i class="fa-sharp-duotone fa-solid fa-crosshairs-simple"></i> Targets</button><br></div>`;
			} else {
				//? all other rolls
				targetsNumberDice = await metanthropes.utils.metaExtractNumberOfDice(targetsNumber);
				targetsNumberDiceMessage = `[[${targetsNumberDice}d10${explosiveDice}]]`;
				targetsMessage = `<span data-tooltip="Targets"><i class="fa-sharp-duotone fa-solid fa-crosshairs-simple"></i> -</span> ${targetsNumberDiceMessage}`;
				targetsRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button targets rolld10-reroll"
			data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${targetsNumberDice}"
			data-what="Targets" data-destiny-re-roll="true" data-reroll="false" data-reroll-counter="1">
			Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> to reroll <i class="fa-sharp-duotone fa-solid fa-crosshairs-simple"></i> Targets</button>
			<br></div>`;
			}
		} else {
			targetsMessage = `<span data-tooltip="Targets"><i class="fa-sharp-duotone fa-solid fa-crosshairs-simple"></i> -</span> ${targetsNumber}`;
		}
		//? add eligible targets
		if (targetsEligible.length > 0) {
			targetsMessage += ` ` + targetsEligible.join(", ");
		}
		//? add type of targets
		if (targetsType.length > 0) {
			targetsMessage += ` ` + targetsType.join(", ") + `<br>`;
		} else {
			targetsMessage += `<br>`;
		}
		//? finalize duration
		if (duration.includes("d10")) {
			//? roll for duration
			durationDiceMessage = duration.match(/1d10 (.+)/);
			durationDice = 1;
			durationMessage =
				`<span data-tooltip="Duration"><i class="fa-sharp-duotone fa-solid fa-hourglass-start"></i> -</span> [[1d10${explosiveDice}]] ` +
				durationDiceMessage[1] +
				`<br>`;
			durationRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button duration rolld10-reroll"
			data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${durationDice}"
			data-what="Duration" data-destiny-re-roll="true" data-reroll="false" data-reroll-counter="1">
			Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> to reroll <i class="fa-sharp-duotone fa-solid fa-hourglass-start"></i> Duration</button>
			<br></div>`;
		} else {
			//? fixed duration
			durationMessage =
				`<span data-tooltip="Duration"><i class="fa-sharp-duotone fa-solid fa-hourglass-start"></i> -</span> ` +
				duration +
				`<br>`;
		}
		//* effect message
		if (damageBaseCosmic > 0 || damageDiceCosmic > 0) {
			const cosmicDamageRoll = await metanthropes.dice.metaRolld10(
				actor,
				`Cosmic Damage`,
				true,
				damageDiceCosmic,
				itemName,
				damageBaseCosmic,
				false,
				true,
				false,
				0,
				null
			);
			cosmicDamageRollResult = cosmicDamageRoll.dataset.total;
			cosmicDamageRollParams = `data-cosmic-damage-dice="${damageDiceCosmic}" data-cosmic-damage-base="${damageBaseCosmic}"`;
			damageCosmicMessage = `${cosmicDamageRoll.outerHTML}<br>`;
		}
		if (damageBaseElemental > 0 || damageDiceElemental > 0) {
			const elementalDamageRoll = await metanthropes.dice.metaRolld10(
				actor,
				`Elemental Damage`,
				true,
				damageDiceElemental,
				itemName,
				damageBaseElemental,
				false,
				true,
				false,
				0,
				null
			);
			elementalDamageRollResult = elementalDamageRoll.dataset.total;
			elementalDamageRollParams = `data-elemental-damage-dice="${damageDiceElemental}" data-elemental-damage-base="${damageBaseElemental}"`;
			damageElementalMessage = `${elementalDamageRoll.outerHTML}<br>`;
		}
		if (damageBaseMaterial > 0 || damageDiceMaterial > 0) {
			const materialDamageRoll = await metanthropes.dice.metaRolld10(
				actor,
				`Material Damage`,
				true,
				damageDiceMaterial,
				itemName,
				damageBaseMaterial,
				false,
				true,
				false,
				0,
				null
			);
			materialDamageRollResult = materialDamageRoll.dataset.total;
			materialDamageRollParams = `data-material-damage-dice="${damageDiceMaterial}" data-material-damage-base="${damageBaseMaterial}"`;
			damageMaterialMessage = `${materialDamageRoll.outerHTML}<br>`;
		}
		if (damageBasePsychic > 0 || damageDicePsychic > 0) {
			const psychicDamageRoll = await metanthropes.dice.metaRolld10(
				actor,
				`Psychic Damage`,
				true,
				damageDicePsychic,
				itemName,
				damageBasePsychic,
				false,
				true,
				false,
				0,
				null
			);
			psychicDamageRollResult = psychicDamageRoll.dataset.total;
			psychicDamageRollParams = `data-psychic-damage-dice="${damageDicePsychic}" data-psychic-damage-base="${damageBasePsychic}"`;
			damagePsychicMessage = `${psychicDamageRoll.outerHTML}<br>`;
		}
		if (healingBase > 0 || healingDice > 0) {
			const healingRoll = await metanthropes.dice.metaRolld10(
				actor,
				`Healing`,
				true,
				healingDice,
				itemName,
				healingBase,
				false,
				true,
				false,
				0,
				null
			);
			healingRollResult = healingRoll.dataset.total;
			healingMessage = `${healingRoll.outerHTML}<br>`;
		}
		if (specialBase > 0 && specialDice > 0) {
			if (!specialIsHalf) {
				specialMessage = `${specialName}: [[${specialDice}d10${explosiveDice}+${specialBase}]]<br>`;
				specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll"
			data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="${specialName}"
			data-dice="${specialDice}" data-destiny-re-roll="true" data-base-number="${specialBase}"
			data-reroll="false" data-reroll-counter="1">
			Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> to reroll ${specialName}</button>
			<br></div>`;
			} else if (specialIsHalf) {
				specialMessage = `${specialName}: [[ceil(${specialDice}d10${explosiveDice}/2)+${specialBase}]]<br>`;
				specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll" data-actoruuid="${actor.uuid}"
			data-item-name="${itemName}" data-what="${specialName}" data-dice="${specialDice}"
			data-destiny-re-roll="true" data-base-number="${specialBase}" data-is-half="true"
			data-reroll="false" data-reroll-counter="1">
			Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> to reroll ${specialName}</button>
			<br></div>`;
			}
		} else if (specialBase > 0) {
			specialMessage = `${specialName}: [[${specialBase}]]<br><br>`;
		} else if (specialDice > 0) {
			if (!specialIsHalf) {
				specialMessage = `${specialName}: [[${specialDice}d10${explosiveDice}]]<br>`;
				specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll" data-actoruuid="${actor.uuid}"
			data-item-name="${itemName}" data-what="${specialName}" data-dice="${specialDice}"
			data-destiny-re-roll="true" data-reroll="false" data-reroll-counter="1">
			Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> to reroll ${specialName}</button>
			<br></div>`;
			} else if (specialIsHalf) {
				specialMessage = `${specialName}: [[ceil(${specialDice}d10${explosiveDice}/2)]]<br>`;
				specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll" data-actoruuid="${actor.uuid}"
			data-item-name="${itemName}" data-what="${specialName}" data-dice="${specialDice}"
			data-destiny-re-roll="true" data-is-half="true" data-reroll="false" data-reroll-counter="1">
			Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> to reroll ${specialName}</button>
			<br></div>`;
			}
		}
		//? Removed Permanent Buffs showing until further notice
		// if (buffsPermanent) {
		// 	buffsPermanentMessage = `<i class="fa-sharp-duotone fa-solid fa-shield-halved"></i> <i class="fa-sharp-duotone fa-solid fa-infinity"></i>: ` + buffsPermanent + `<br>`;
		// }
		if (buffsApplied) {
			buffsAppliedMessage =
				`<span data-tooltip="Buffs Applied"><i class="fa-sharp-duotone fa-solid fa-plus"></i> <i class="fa-sharp-duotone fa-solid fa-shield-halved"></i></span>: ` +
				buffsApplied +
				`<br>`;
		}
		if (buffsRemoved) {
			buffsRemovedMessage =
				`<span data-tooltip="Buffs Removed"><i class="fa-sharp-duotone fa-solid fa-minus"></i> <i class="fa-sharp-duotone fa-solid fa-shield-halved"></i></span>: ` +
				buffsRemoved +
				`<br>`;
		}
		if (conditionsApplied) {
			conditionsAppliedMessage =
				`<span data-tooltip="Conditions Applied"><i class="fa-sharp-duotone fa-solid fa-plus"></i> <i class="fa-sharp-duotone fa-solid fa-skull"></i></span>: ` +
				conditionsApplied +
				`<br>`;
		}
		if (conditionsRemoved) {
			conditionsRemovedMessage =
				`<span data-tooltip="Conditions Removed"><i class="fa-sharp-duotone fa-solid fa-minus"></i> <i class="fa-sharp-duotone fa-solid fa-skull"></i></span>: ` +
				conditionsRemoved +
				`<br>`;
		}
		//* Assemble contentMessage to be presented in the content section (allows inline rolls)
		//todo since this area allows inline rolls, couldn't we make the extra rolling here for spending lvl of success?
		contentMessage = actionSlotMessage;
		contentMessage += targetsMessage;
		contentMessage += durationMessage;
		contentMessage +=
			`<span data-tooltip="Range"><i class="fa-sharp-duotone fa-solid fa-ruler"></i> -</span> ` + range + `<br>`;
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
		//* Targeting v1
		const manuallySelectedTargets = game.user.targets;
		if (
			!manuallySelectedTargets &&
			(damageCosmicMessage ||
				damageElementalMessage ||
				damageMaterialMessage ||
				damagePsychicMessage ||
				healingMessage)
		) {
			ui.notifications.warn("You must select valid targets first");
			return;
		}
		//? Store targeted actors in an array
		const targetsArray = Array.from(manuallySelectedTargets).map((token) => token.actor);
		//?Create a new array with only the actor's uuids to be used later
		targetedActors = targetsArray.map((actor) => actor.uuid);
		//? Check if there are any targeted actors and set the actionableTargets variable accordingly
		actionableTargets = targetedActors.length > 0;
		if (actionableTargets) {
			//? Get the names of all targeted actors
			targetedActorNames = targetsArray.map((actor) => actor.name);
			metanthropes.utils.metaLog(3, "metaExecute", "Target(s) Names:", targetedActorNames);
		}
		if (damageCosmicMessage || damageElementalMessage || damageMaterialMessage || damagePsychicMessage) {
			contentMessage += `Applying <i class="fa-sharp-duotone fa-solid fa-burst"></i> Damage to <i class="fa-sharp-duotone fa-solid fa-crosshairs-simple"></i> Target(s): ${targetedActorNames.join(
				", "
			)}<br><br>`;
			contentMessage += `<div class="meta-roll-inline-results">`;

			if (damageCosmicMessage) {
				contentMessage += damageCosmicMessage;
				contentMessage += `<br>`;
			}
			if (damageElementalMessage) {
				contentMessage += damageElementalMessage;
				contentMessage += `<br>`;
			}
			if (damageMaterialMessage) {
				contentMessage += damageMaterialMessage;
				contentMessage += `<br>`;
			}
			if (damagePsychicMessage) {
				contentMessage += damagePsychicMessage;
				contentMessage += `<br>`;
			}
			contentMessage += `</div>`;
		}
		if (damageCosmicMessage || damageElementalMessage || damageMaterialMessage || damagePsychicMessage) {
			damageSelectedTargets = true;
			//todo new button pickup + function to deliver / is it anchor?
			if (actor.currentDestiny > 0) {
				const damageReRollButton = `<div class="hide-button hidden">
				<button class="metanthropes-secondary-chat-button damage roll-damage-reroll chat-button-anchor"
				data-tooltip="Spend <i class='fa-sharp-duotone fa-solid fa-hand-fingers-crossed'></i> Destiny to reroll <i class='fa-sharp-duotone fa-solid fa-burst'></i> Damage"
				data-targets="${targetedActors}" data-actoruuid="${actor.uuid}" data-item-name="${itemName}"
				data-what="Damage" data-anchor="true" data-reroll="false" data-reroll-counter="1" data-message-id="null"
				data-destiny-re-roll="true" data-cosmic-dice="${damageDiceCosmic}" data-base-cosmic-number="${damageBaseCosmic}"
				data-elemental-dice="${damageDiceElemental}" data-base-elemental-number="${damageBaseElemental}"
				data-material-dice="${damageDiceMaterial}" data-base-material-number="${damageBaseMaterial}"
				data-psychic-dice="${damageDicePsychic}" data-base-psychic-number="${damageBasePsychic}"
				>Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> to Reroll <i class="fa-sharp-duotone fa-solid fa-burst"></i> Damage
				</button></div>`;
				contentMessage += `<br>`;
				contentMessage += damageReRollButton;
			}
			contentMessage += `<hr />`;
		}
		if (healingMessage) {
			healSelectedTargets = true;
			contentMessage += `Applying <i class="fa-sharp-duotone fa-solid fa-heart-pulse"></i> Healing to <i class="fa-sharp-duotone fa-solid fa-crosshairs-simple"></i> Target(s): ${targetedActorNames.join(
				", "
			)}<br><br>`;
			contentMessage += `<div class="meta-roll-inline-results">`;
			contentMessage += healingMessage;
			contentMessage += `<br></div>`;
			if (actor.currentDestiny > 0) {
				const healingRerollButton = `<div class="hide-button hidden">
				<button class="metanthropes-secondary-chat-button healing roll-healing-reroll chat-button-anchor"
				data-tooltip="Spend <i class='fa-sharp-duotone fa-solid fa-hand-fingers-crossed'></i> Destiny to reroll <i class='fa-sharp-duotone fa-solid fa-heart-pulse'></i> Healing"
				data-targets="${targetedActors}" data-actoruuid="${actor.uuid}" data-item-name="${itemName}"
				data-what="Healing" data-anchor="true"
				data-reroll="false" data-reroll-counter="1" data-message-id="null"
				data-destiny-re-roll="true" data-healing-dice="${healingDice}" data-healing-base="${healingBase}"
				>Spend <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> to Reroll <i class="fa-sharp-duotone fa-solid fa-heart-pulse"></i> Healing
				</button></div>`;
				contentMessage += healingRerollButton;
			}
			contentMessage += `<hr />`;
		}
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
		//? check if actor has enough destiny points to reroll
		contentMessage += `<div>${actor.name} has ${actor.currentDestiny} <i class="fa-sharp-duotone fa-solid fa-hand-fingers-crossed"></i> Destiny remaining.<br></div>`;
		if (actor.currentDestiny > 0) {
			let destinyRerollButtonMessage = false;
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
	}
	//* Send Chat Message
	//? prepare the Chat message
	let chatData = {
		user: game.user.id,
		flavor: flavorMessage,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentMessage,
		flags: { metanthropes: { actoruuid: actor.uuid } },
	};
	//? Send the message to chat
	await ChatMessage.create(chatData);
	//* Post Execution Actions
	metanthropes.utils.metaLog(3, "metaExecute", "Post Execution Actions");
	//? Clear all metapower related result flags (currently only from duplicateself)
	//! the idea here being that if the flags are going to be added later, here we prevent them from remaining from previous successful activations
	await actor.unsetFlag("metanthropes", "duplicateSelf");
	//? Get the result of the last roll
	let checkResult = await actor.getFlag("metanthropes", "lastrolled").MetaEvaluate;
	//* Check for Duplicate Self Metapower Activation
	if (
		checkResult > 0 &&
		action === "Metapower" &&
		["Clone", "Couple", "Team", "Squad", "Unit"].includes(itemName)
	) {
		metanthropes.utils.metaLog(3, "metaExecute", "Duplicate Self Metapower Activation Detected");
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
		metanthropes.utils.metaLog(3, "metaExecute", "Duplicate Self Metapower Max Life:", duplicateMaxLife);
	}
	//* Visual Effects
	if (vfx) {
		await metanthropes.utils.metaRunMacro(vfx);
	}
	//* Sound Effects
	if (sfx) {
		await metanthropes.audio.metaPlaySoundEffect(sfx);
	}
	//* Apply Damage to Selected Targets
	if (damageSelectedTargets && actionableTargets) {
		await metanthropes.logic.metaApplyDamage(
			targetedActors,
			cosmicDamageRollResult,
			elementalDamageRollResult,
			materialDamageRollResult,
			psychicDamageRollResult
		);
	}
	//* Apply Healing to Selected Targets
	if (healSelectedTargets && actionableTargets) {
		await metanthropes.logic.metaApplyHealing(targetedActors, healingRollResult);
	}
	//? metaExecute Finished
	metanthropes.utils.metaLog(3, "metaExecute", "Finished");
}
