import { metaExtractNumberOfDice, metaLog } from "../helpers/metahelpers.mjs";

/**
 * metaExecute handles the execution of Metapowers and Possessions for a given actor.
 *
 * This function determines the type of action (Metapower or Possession) and executes the corresponding logic.
 * It can be triggered either directly or from a button click event.
 * The function checks for Metapowers that affect explosive d10 dice and applies the corresponding logic.
 * It also constructs and sends a chat message detailing the execution results.
 *
 * todo: Ensure all necessary data fields are available and handle any missing data gracefully.
 * ! need a new field to track fixed numbers to be added to the roll rollResults
 * todo na skeftw tin xrisi twn flags kai pws ta diavazw - ti xreiazomai pragmatika?
 * todo mazi me ta activations (lvls) na skeftw kai ta usage (lvls antistoixa)
 * todo episis upcoming combos!
 * !todo utilize existing levels of success and spent levels of success
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
		metaLog(3, "metaExecute", "Engaged via button click - Event:", event);
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
	let metaItemData = actor.items.find((item) => item.name === itemName);
	if (!metaItemData) {
		metaLog(2, "metaExecute", "ERROR: Could not find any item named:", itemName);
		return;
	}
	metaLog(3, "metaExecute", "Engaged for", itemName);
	//todo review which need to be const and which let by determining what can be changed by the spending of lvl of success
	//? Gather all the execution data
	let actionSlot = metaItemData.system.Execution.ActionSlot.value;
	let targetsNumber = metaItemData.system.Execution.Targets.value;
	let targetsEligible = metaItemData.system.Execution.TargetsEligibility.value;
	let targetsType = metaItemData.system.Execution.TargetsType.value;
	let duration = metaItemData.system.Execution.Duration.value;
	let range = metaItemData.system.Execution.Range.value;
	let areaEffect = metaItemData.system.Execution.AreaEffect.value;
	let areaType = metaItemData.system.Execution.AreaType.value;
	let vsRoll = metaItemData.system.Effects.VSStatRoll.value;
	//? Sound Effect Data
	const sfxCompendium = metaItemData.system.Effects.SFX.Compendium.value;
	const sfxName = metaItemData.system.Effects.SFX.Name.value;
	//? Gather all the effect data
	let effectDescription = metaItemData.system.Effects.EffectDescription.value;
	let damageBaseCosmic = metaItemData.system.Effects.Damage.Cosmic.Base;
	let damageDiceCosmic = metaItemData.system.Effects.Damage.Cosmic.Dice;
	let damageBaseElemental = metaItemData.system.Effects.Damage.Elemental.Base;
	let damageDiceElemental = metaItemData.system.Effects.Damage.Elemental.Dice;
	let damageBaseMaterial = metaItemData.system.Effects.Damage.Material.Base;
	let damageDiceMaterial = metaItemData.system.Effects.Damage.Material.Dice;
	let damageBasePsychic = metaItemData.system.Effects.Damage.Psychic.Base;
	let damageDicePsychic = metaItemData.system.Effects.Damage.Psychic.Dice;
	let healingBase = metaItemData.system.Effects.Healing.Base;
	let healingDice = metaItemData.system.Effects.Healing.Dice;
	let specialName = metaItemData.system.Effects.Special.SpecialDiceName.value;
	let specialBase = metaItemData.system.Effects.Special.Base;
	let specialDice = metaItemData.system.Effects.Special.Dice;
	let specialIsHalf = metaItemData.system.Effects.Special.isHalf;
	let buffsPermanent = metaItemData.system.Effects.Buffs.Permanent.value;
	let buffsApplied = metaItemData.system.Effects.Buffs.Applied.value;
	let buffsRemoved = metaItemData.system.Effects.Buffs.Removed.value;
	let conditionsApplied = metaItemData.system.Effects.Conditions.Applied.value;
	let conditionsRemoved = metaItemData.system.Effects.Conditions.Removed.value;
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
	//? Prep dice holding variables
	let actionSlotDice;
	let targetsNumberDice;
	let durationDice;
	//? Prep chat message buttons
	let actionSlotRerollButton = null;
	let targetsRerollButton = null;
	let durationRerollButton = null;
	let damageCosmicRerollButton = null;
	let damageElementalRerollButton = null;
	let damageMaterialRerollButton = null;
	let damagePsychicRerollButton = null;
	let healingRerollButton = null;
	let specialRerollButton = null;
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
			metaLog(3, "metaExecute", "Using Possession:", itemName, "with Attack Type:", attackType);
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
		metaLog(2, "metaExecute", "ERROR: cannot Execute action:", action);
		return;
	}
	//* Targeting v1 variables
	//? Setup a variable to check if we will be applying damage to the targeted actors later
	let damageSelectedTargets = false;
	//? Setup an array for targeted actors, this will be used later to apply effects to them
	let targetedActors = [];
	//? Setup a variable to know if we'll have to apply effects to the targeted actors
	let actionableTargets = false;
	//* Prepare content message constituents
	if (executeRoll) {
		//? check Area Effect
		if (areaEffect !== "None") {
			areaEffectMessage = `🗺️: ` + areaEffect + `<br>`;
			//? check Area Type
			if (areaType.length > 0) {
				areaEffectMessage += `🗺️ (Type): ` + areaType + `<br>`;
			}
		} else {
			areaEffectMessage = null;
		}
		//? check for VS
		if (vsRoll !== "None") {
			vsMessage = `🆚: ` + vsRoll + `<br>`;
		}
		//? finalize action slot
		if (actionSlot.includes("Always Active")) {
			//? always active return
			metaLog(1, "metaExecute", actor.name + "'s " + itemName, "is Always Active!");
			ui.notifications.info(actor.name + "'s " + itemName + " is Always Active!");
			return;
		} else if (actionSlot.includes("Focused")) {
			//? focused
			actionSlotMessage = `⏱: `;
			if (actionSlot.includes("1d10 Cycles")) {
				//? roll for cycles
				actionSlotDice = 1;
				actionSlotMessage += `Focused Action: [[1d10${explosiveDice}]] Cycles<br>`;
				actionSlotRerollButton = `<div class="hide-button hidden"><br>
				<button class="metanthropes-secondary-chat-button action-slot rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${actionSlotDice}" data-what="⏱ Activation" data-destiny-re-roll="true">
				Spend 🤞 to reroll ⏱ Activation</button>
				<br></div>`;
			} else if (actionSlot.includes("1d10 Hours")) {
				//? roll for hours
				actionSlotDice = 1;
				actionSlotMessage += `Focused Action: [[1d10${explosiveDice}]] Hours<br>`;
				actionSlotRerollButton = `<div class="hide-button hidden"><br>
				<button class="metanthropes-secondary-chat-button action-slot rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${actionSlotDice}" data-what="⏱ Activation" data-destiny-re-roll="true">
				Spend 🤞 to reroll ⏱ Activation</button>
				<br></div>`;
			} else {
				actionSlotMessage += actionSlot + `<br>`;
			}
		} else {
			//? normal execution
			actionSlotMessage = `⏱: ` + actionSlot + `<br>`;
		}
		//? finalize targets
		if (targetsNumber.includes("d10")) {
			//? roll for targets
			if (targetsNumber === "1d10/2") {
				//? roll for 1d10/2
				targetsNumberDiceMessage = `[[ceil(1d10${explosiveDice}/2)]]`;
				targetsMessage = `🎯: ${targetsNumberDiceMessage}`;
				targetsNumberDice = 1;
				targetsRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button targets rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${targetsNumberDice}" data-what="🎯 Targets" data-is-half="true" data-destiny-re-roll="true">
			Spend 🤞 to reroll 🎯 Targets</button>
			<br></div>`;
			} else {
				//? all other rolls
				targetsNumberDice = await metaExtractNumberOfDice(targetsNumber);
				targetsNumberDiceMessage = `[[${targetsNumberDice}d10${explosiveDice}]]`;
				targetsMessage = `🎯: ${targetsNumberDiceMessage}`;
				targetsRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button targets rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${targetsNumberDice}" data-what="🎯 Targets" data-destiny-re-roll="true">
			Spend 🤞 to reroll 🎯 Targets</button>
			<br></div>`;
			}
		} else {
			targetsMessage = `🎯: ${targetsNumber}`;
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
			durationMessage = `⏳: [[1d10${explosiveDice}]] ` + durationDiceMessage[1] + `<br>`;
			durationRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button duration rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${durationDice}" data-what="⏳ Duration" data-destiny-re-roll="true">
			Spend 🤞 to reroll ⏳ Duration</button>
			<br></div>`;
		} else {
			//? fixed duration
			durationMessage = `⏳: ` + duration + `<br>`;
		}
		//* effect message
		if (damageBaseCosmic > 0 && damageDiceCosmic > 0) {
			damageCosmicMessage = `💥: [[${damageDiceCosmic}d10${explosiveDice}+${damageBaseCosmic}[Cosmic]]]<br>`;
			damageCosmicRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button cosmic-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Cosmic 💥 Damage" data-dice="${damageDiceCosmic}" data-destiny-re-roll="true" data-base-number="${damageBaseCosmic}">
			Spend 🤞 to reroll Cosmic 💥</button>
			<br></div>`;
		} else if (damageBaseCosmic > 0) {
			damageCosmicMessage = `💥: [[${damageBaseCosmic}[Cosmic]]]<br>`;
		} else if (damageDiceCosmic > 0) {
			damageCosmicMessage = `💥: [[${damageDiceCosmic}d10${explosiveDice}[Cosmic]]]<br>`;
			damageCosmicRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button cosmic-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Cosmic 💥 Damage" data-dice="${damageDiceCosmic}" data-destiny-re-roll="true">
			Spend 🤞 to reroll Cosmic 💥</button>
			<br></div>`;
		}
		if (damageBaseElemental > 0 && damageDiceElemental > 0) {
			damageElementalMessage = `💥: [[${damageDiceElemental}d10${explosiveDice}+${damageBaseElemental}[Elemental]]]<br>`;
			damageElementalRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button elemental-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Elemental 💥 Damage" data-dice="${damageDiceElemental}" data-destiny-re-roll="true" data-base-number="${damageBaseElemental}">
			Spend 🤞 to reroll Elemental 💥</button>
			<br></div>`;
		} else if (damageBaseElemental > 0) {
			damageElementalMessage = `💥: [[${damageBaseElemental}[Elemental]]]<br>`;
		} else if (damageDiceElemental > 0) {
			damageElementalMessage = `💥: [[${damageDiceElemental}d10${explosiveDice}[Elemental]]]<br>`;
			damageElementalRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button elemental-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Elemental 💥 Damage" data-dice="${damageDiceElemental}" data-destiny-re-roll="true">
			Spend 🤞 to reroll Elemental 💥</button>
			<br></div>`;
		}
		if (damageBaseMaterial > 0 && damageDiceMaterial > 0) {
			damageMaterialMessage = `💥: [[${damageDiceMaterial}d10${explosiveDice}+${damageBaseMaterial}[Material]]]<br>`;
			damageMaterialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button material-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Material 💥 Damage" data-dice="${damageDiceMaterial}" data-destiny-re-roll="true" data-base-number="${damageBaseMaterial}">
			Spend 🤞 to reroll Material 💥</button>
			<br></div>`;
		} else if (damageBaseMaterial > 0) {
			damageMaterialMessage = `💥: [[${damageBaseMaterial}[Material]]]<br>`;
		} else if (damageDiceMaterial > 0) {
			damageMaterialMessage = `💥: [[${damageDiceMaterial}d10${explosiveDice}[Material]]]<br>`;
			damageMaterialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button material-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Material 💥 Damage" data-dice="${damageDiceMaterial}" data-destiny-re-roll="true">
			Spend 🤞 to reroll Material 💥</button>
			<br></div>`;
		}
		if (damageBasePsychic > 0 && damageDicePsychic > 0) {
			damagePsychicMessage = `💥: [[${damageDicePsychic}d10${explosiveDice}+${damageBasePsychic}[Psychic]]]<br>`;
			damagePsychicRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button psychic-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Psychic 💥 Damage" data-dice="${damageDicePsychic}" data-destiny-re-roll="true" data-base-number="${damageBasePsychic}">
			Spend 🤞 to reroll Psychic 💥</button>
			<br></div>`;
		} else if (damageBasePsychic > 0) {
			damagePsychicMessage = `💥: [[${damageBasePsychic}[Psychic]]]<br>`;
		} else if (damageDicePsychic > 0) {
			damagePsychicMessage = `💥: [[${damageDicePsychic}d10${explosiveDice}[Psychic]]]<br>`;
			damagePsychicRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button psychic-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Psychic 💥 Damage" data-dice="${damageDicePsychic}" data-destiny-re-roll="true">
			Spend 🤞 to reroll Psychic 💥</button>
			<br></div>`;
		}
		if (healingBase > 0 && healingDice > 0) {
			healingMessage = `💞: [[${healingDice}d10${explosiveDice}+${healingBase}[Healing]]]<br>`;
			healingRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button healing rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💞 Healing" data-dice="${healingDice}" data-destiny-re-roll="true" data-base-number="${healingBase}">
			Spend 🤞 to reroll 💞 Healing</button>
			<br></div>`;
		} else if (healingBase > 0) {
			healingMessage = `💞: [[${healingBase}[Healing]]]<br>`;
		} else if (healingDice > 0) {
			healingMessage = `💞: [[${healingDice}d10${explosiveDice}[Healing]]]<br>`;
			healingRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button healing rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💞 Healing" data-dice="${healingDice}" data-destiny-re-roll="true">
			Spend 🤞 to reroll 💞 Healing</button>
			<br></div>`;
		}
		if (specialBase > 0 && specialDice > 0) {
			if (!specialIsHalf) {
				specialMessage = `${specialName}: [[${specialDice}d10${explosiveDice}+${specialBase}]]<br>`;
				specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="${specialName}" data-dice="${specialDice}" data-destiny-re-roll="true" data-base-number="${specialBase}">
			Spend 🤞 to reroll ${specialName}</button>
			<br></div>`;
			} else if (specialIsHalf) {
				specialMessage = `${specialName}: [[ceil(${specialDice}d10${explosiveDice}/2)+${specialBase}]]<br>`;
				specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="${specialName}" data-dice="${specialDice}" data-destiny-re-roll="true" data-base-number="${specialBase}" data-is-half="true">
			Spend 🤞 to reroll ${specialName}</button>
			<br></div>`;
			}
		} else if (specialBase > 0) {
			specialMessage = `${specialName}: [[${specialBase}]]<br><br>`;
		} else if (specialDice > 0) {
			if (!specialIsHalf) {
				specialMessage = `${specialName}: [[${specialDice}d10${explosiveDice}]]<br>`;
				specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="${specialName}" data-dice="${specialDice}" data-destiny-re-roll="true">
			Spend 🤞 to reroll ${specialName}</button>
			<br></div>`;
			} else if (specialIsHalf) {
				specialMessage = `${specialName}: [[ceil(${specialDice}d10${explosiveDice}/2)]]<br>`;
				specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="${specialName}" data-dice="${specialDice}" data-destiny-re-roll="true" data-is-half="true">
			Spend 🤞 to reroll ${specialName}</button>
			<br></div>`;
			}
		}
		//? Removed Permanent Buffs showing until further notice
		// if (buffsPermanent) {
		// 	buffsPermanentMessage = `🛡️ ♾️: ` + buffsPermanent + `<br>`;
		// }
		if (buffsApplied) {
			buffsAppliedMessage = `🛡️ ➕: ` + buffsApplied + `<br>`;
		}
		if (buffsRemoved) {
			buffsRemovedMessage = `🛡️ ➖: ` + buffsRemoved + `<br>`;
		}
		if (conditionsApplied) {
			conditionsAppliedMessage = `💀 ➕: ` + conditionsApplied + `<br>`;
		}
		if (conditionsRemoved) {
			conditionsRemovedMessage = `💀 ➖: ` + conditionsRemoved + `<br>`;
		}
		//* Assemble contentMessage to be presented in the content section (allows inline rolls)
		//todo since this area allows inline rolls, couldn't we make the extra rolling here for spending lvl of success?
		contentMessage = actionSlotMessage;
		contentMessage += targetsMessage;
		contentMessage += durationMessage;
		contentMessage += `📏: ` + range + `<br>`;
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
		//* Targeting v1 - requires beta Testing from Homebrew Module enabled
		if (betaTesting) {
			const manuallySelectedTargets = game.user.targets;
			metaLog(3, "metaExecute", "Manually Selected Targets:", manuallySelectedTargets);
			//? Store targeted actors in an array
			targetedActors = Array.from(manuallySelectedTargets).map((token) => token.actor);
			metaLog(3, "metaExecute", "Targeted Actors:", targetedActors);
			//? Check if there are any targeted actors and set the actionableTargets variable accordingly
			actionableTargets = targetedActors.length > 0;
			metaLog(3, "metaExecute", "Actionable Targets:", actionableTargets);
			if (actionableTargets) {
				//? Get the names of all targeted actors
				const targetedActorNames = targetedActors.map((actor) => actor.name);
				const allSelectedTargetsMessage = `Beta Testing: Selected 🎯 Target(s): ${targetedActorNames.join(
					", "
				)}`;
				contentMessage += allSelectedTargetsMessage;
				contentMessage += `<hr />`;
				metaLog(3, "metaExecute", "All Selected Targets Message:", allSelectedTargetsMessage);
			}
		}
		if (damageCosmicMessage) {
			contentMessage += damageCosmicMessage;
		}
		if (damageElementalMessage) {
			contentMessage += damageElementalMessage;
		}
		if (damageMaterialMessage) {
			contentMessage += damageMaterialMessage;
		}
		if (damagePsychicMessage) {
			contentMessage += damagePsychicMessage;
		}
		if (damageCosmicMessage || damageElementalMessage || damageMaterialMessage || damagePsychicMessage) {
			damageSelectedTargets = true;
			contentMessage += `<hr />`;
		}
		if (healingMessage) {
			contentMessage += healingMessage;
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
		const currentDestiny = actor.system.Vital.Destiny.value;
		contentMessage += `<div>${actor.name} has ${currentDestiny} 🤞 Destiny remaining.<br></div>`;
		if (currentDestiny > 0) {
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
			if (damageCosmicRerollButton) {
				contentMessage += damageCosmicRerollButton;
				destinyRerollButtonMessage = true;
			}
			if (damageElementalRerollButton) {
				contentMessage += damageElementalRerollButton;
				destinyRerollButtonMessage = true;
			}
			if (damageMaterialRerollButton) {
				contentMessage += damageMaterialRerollButton;
				destinyRerollButtonMessage = true;
			}
			if (damagePsychicRerollButton) {
				contentMessage += damagePsychicRerollButton;
				destinyRerollButtonMessage = true;
			}
			if (healingRerollButton) {
				contentMessage += healingRerollButton;
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
	//* Apply Damage to Selected Targets (requires Targeting V1 & Beta Testing enabled)
	//todo: removing this for now, until we revisit the chat message and create our custom class, as we cannot pass along the proper dmg/healing values to the application from the inline rolls.
	// if (betaTesting) {
	// 	if (damageSelectedTargets && actionableTargets) {
	// 		metaLog(3, "metaExecute", "Applying Damage to Selected Targets");
	// 		//? Apply damage to each targeted actor
	// 		for (let i = 0; i < targetedActors.length; i++) {
	// 			let targetedActor = targetedActors[i];
	// 			let targetedActorName = targetedActor.name;
	// 			let targetedActorCurrentLife = targetedActor.system.Vital.Life.value;
	// 			let targetedActorMaxLife = targetedActor.system.Vital.Life.max;
	// 			let targetedActorResistanceCosmic = targetedActor.system.physical.resistances.cosmic.initial;
	// 			let targetedActorResistanceElemental = targetedActor.system.physical.resistances.elemental.initial;
	// 			let targetedActorResistanceMaterial = targetedActor.system.physical.resistances.material.initial;
	// 			let targetedActorResistancePsychic = targetedActor.system.physical.resistances.psychic.initial;
	// 			let targetedActorDamage = 0;
	// 			let targetedActorHealing = 0;
	// 			let targetedActorMessageDamage = null;
	// 			let targetedActorMessageHealing = null;
	// 			//? Check for Damage & Resistances
	// 			if (damageBaseCosmic > 0 || damageDiceCosmic > 0) {
	// 				targetedActorDamage += targetedActorResistanceCosmic - damageBaseCosmic - damageDiceCosmic;
	// 				targetedActorMessageDamage += `Beta Testing: ${targetedActorName} takes ${targetedActorDamage} Cosmic 💥 Damage.<br>`;
	// 			}
	// 			if (damageBaseElemental > 0 || damageDiceElemental > 0) {
	// 				targetedActorDamage += targetedActorResistanceElemental - damageBaseElemental - damageDiceElemental;
	// 				targetedActorMessageDamage += `Beta Testing: ${targetedActorName} takes ${targetedActorDamage} Elemental 💥 Damage.<br>`;
	// 			}
	// 			if (damageBaseMaterial > 0 || damageDiceMaterial > 0) {
	// 				targetedActorDamage += targetedActorResistanceMaterial - damageBaseMaterial - damageDiceMaterial;
	// 				targetedActorMessageDamage += `Beta Testing: ${targetedActorName} takes ${targetedActorDamage} Material 💥 Damage.<br>`;
	// 			}
	// 			if (damageBasePsychic > 0 || damageDicePsychic > 0) {
	// 				targetedActorDamage += targetedActorResistancePsychic - damageBasePsychic - damageDicePsychic;
	// 				targetedActorMessageDamage += `Beta Testing: ${targetedActorName} takes ${targetedActorDamage} Psychic 💥 Damage.<br>`;
	// 			}
	// 			//? Check for Healing
	// 			if (healingBase > 0 || healingDice > 0) {
	// 				targetedActorHealing += healingBase + healingDice;
	// 				targetedActorMessageHealing = `Beta Testing: ${targetedActorName} receives ${targetedActorHealing} 💞 Healing.<br>`;
	// 			}
	// 			//? Prep Message
	// 			if (targetedActorDamage > 0) {
	// 				let targetedActorNewLife = targetedActorCurrentLife - targetedActorDamage;
	// 				if (targetedActorNewLife < 0) {
	// 					targetedActorNewLife = 0;
	// 				}
	// 				await targetedActor.update({ "system.Vital.Life.value": targetedActorNewLife });
	// 				contentMessage += targetedActorMessageDamage;
	// 			}
	// 			if (targetedActorHealing > 0) {
	// 				let targetedActorNewLife = targetedActorCurrentLife + targetedActorHealing;
	// 				if (targetedActorNewLife > targetedActorMaxLife) {
	// 					targetedActorNewLife = targetedActorMaxLife;
	// 				}
	// 				await targetedActor.update({ "system.Vital.Life.value": targetedActorNewLife });
	// 				contentMessage += targetedActorMessageHealing;
	// 			}
	// 			const targetedActorFinalLifeCurrent = await targetedActor.system.Vital.Life.value;
	// 			const targetedActorFinalLifeMax = await targetedActor.system.Vital.Life.max;
	// 			metaLog(3, "metaExecute", "Beta Testing Damage Application", targetedActorName, targetedActorDamage, targetedActorHealing);
	// 			contentMessage += `Beta Testing (Damage/Healing applicationt test, please ignore): ${targetedActorName} has ${targetedActorFinalLifeCurrent}/${targetedActorFinalLifeMax} ❤️ Life remaining.<br>`;
	// 			// await ChatMessage.create({
	// 			// 	user: game.user.id,
	// 			// 	speaker: ChatMessage.getSpeaker({ actor: actor }),
	// 			// 	content: contentMessage,
	// 			// });
	// 		}
	// 	}
	// }
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
	//? Clear all metapower related result flags (currently only from duplicateself)
	//! the idea here being that if the flags are going to be added later, here we prevent them from remaining from previous successful activations
	await actor.unsetFlag("metanthropes", "duplicateSelf");
	//? Get the result of the last roll
	metaLog(3, "metaExecute", "Post Execution Actions");
	let checkResult = await actor.getFlag("metanthropes", "lastrolled").MetaEvaluate;
	//* Check for Duplicate Self Metapower Activation
	if (
		checkResult > 0 &&
		action === "Metapower" &&
		(itemName === "Clone" ||
			itemName === "Couple" ||
			itemName === "Team" ||
			itemName === "Squad" ||
			itemName === "Unit")
	) {
		metaLog(3, "metaExecute", "Duplicate Self Metapower Activation Detected");
		let currentLife = actor.system.Vital.Life.value;
		let duplicateMaxLife = 0;
		if (itemName === "Clone") {
			duplicateMaxLife = Math.ceil(currentLife * 0.1);
		} else if (itemName === "Couple") {
			duplicateMaxLife = Math.ceil(currentLife * 0.2);
		} else if (itemName === "Team") {
			duplicateMaxLife = Math.ceil(currentLife * 0.3);
		} else if (itemName === "Squad") {
			duplicateMaxLife = Math.ceil(currentLife * 0.4);
		} else if (itemName === "Unit") {
			duplicateMaxLife = Math.ceil(currentLife * 0.5);
		}
		await actor.setFlag("metanthropes", "duplicateSelf", { maxLife: duplicateMaxLife });
		metaLog(3, "metaExecute", "Duplicate Self Metapower Max Life:", duplicateMaxLife);
	}
	//* Visual Effects
	//* Sound Effects
	//? Get the Sound Effect Compendium
	//todo: add a custom setting to use our sound engine (from metathropes-ost)
	if (sfxCompendium === "metanthropes-ost") {
		//todo: identify what I need to change to make it work with all similar compendiums, currently only supports metanthropes-ost
		const sfxCompendiumToUse = await game.packs.get("metanthropes-ost.sound-effects");
		if (sfxCompendiumToUse) {
			const sfxCompendiumIndex = await sfxCompendiumToUse.getIndex();
			//? Search for the Sound Effect within each playlist of the compendium
			for (let entry of sfxCompendiumIndex) {
				//? Load the full playlist document
				let playlist = await sfxCompendiumToUse.getDocument(entry._id);
				//? Search for the sound within the playlist
				if (sfxName) {
					let foundSound = playlist.sounds.find((sound) => sound.name === sfxName);
					if (foundSound) {
						//? Play the sound
						metaLog(
							3,
							"metaExecute",
							"Playing Sound Effect:",
							foundSound.name,
							"from Compendium:",
							sfxCompendium
						);
						//todo: this should trigger after the chat message is rendered and the dice are rolled
						AudioHelper.play({ src: foundSound.sound.src, volume: 0.8, autoplay: true, loop: false }, true);
						break;
					}
				}
			}
		}
	}
	//? metaExecute Finished
	metaLog(3, "metaExecute", "Finished");
}
