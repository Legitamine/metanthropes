import { metaExtractNumberOfDice } from "./metahelpers.mjs";
/**
 * MetaExecute handles the execution of Metapowers and Possessions for a given actor.
 *
 * This function determines the type of action (Metapower or Possession) and executes the corresponding logic.
 * It can be triggered either directly or from a button click event.
 * The function checks for Metapowers that affect explosive dice and applies the corresponding logic.
 * It also constructs and sends a chat message detailing the execution results.
 *
 * todo: Consider further refactoring to separate Metapower and Possession logic into distinct helper functions.
 * todo: Ensure all necessary data fields are available and handle any missing data gracefully.
 * ! need a new field to track fixed numbers to be added to the roll rollResults
 * ! do I need multiples based on different damage types?
 * todo na skeftw tin xrisi twn flags kai pws ta diavazw - ti xreiazomai pragmatika?
 * todo mazi me ta activations (lvls) na skeftw kai ta usage (lvls antistoixa)
 * todo episis upcoming combos!
 * todo kai olo mazi na kanei seamless integration se ena executioN!
 * !todo utilize existing levels of success and spent levels of success
 * ! what to do with targets being 1d10/2 ???? ++ *special* rolls
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
 * MetaExecute(null, actorUUID, "Metapower", "Danger Sense");
 */
export async function MetaExecute(event, actorUUID, action, itemName, multiAction = 0) {
	//? If we called this from a button click, get the data we need
	if (event) {
		console.log("Metanthropes RPG System | MetaExecute | event:", event);
		const button = event.target;
		actorUUID = button.dataset.actoruuid;
		itemName = button.dataset.itemName;
		action = button.dataset.action;
		multiAction = button.dataset.multiAction || 0;
	}
	const actor = await fromUuid(actorUUID);
	//? Checking if actor has Metapowers that affect the explosive dice
	let explosiveDice;
	const metapowers = actor.items.filter((item) => item.type === "Metapower");
	const hasArbiterPowers = metapowers.some((metapower) => metapower.name === "Arbiter Powers");
	if (hasArbiterPowers) {
		explosiveDice = "x1x2x10";
	} else {
		explosiveDice = "x10";
	}
	//? Find the first item ()that matches itemName
	let metaItemData = actor.items.find((item) => item.name === itemName);
	if (!metaItemData) {
		console.log("Metanthropes RPG System | MetaExecute | Could not find any item named:", itemName);
		return;
	}
	console.log("Metanthropes RPG System | MetaExecute | Engaged for", itemName);
	//? Gather all the execution data
	let actionSlot = metaItemData.system.Execution.ActionSlot.value;
	let targetsNumber = metaItemData.system.Execution.Targets.value;
	let targetsEligible = metaItemData.system.Execution.TargetsEligibility.value;
	let targetsType = metaItemData.system.Execution.TargetsType.value;
	let duration = metaItemData.system.Execution.Duration.value;
	let range = metaItemData.system.Execution.Range.value;
	let areaEffect = metaItemData.system.Execution.AreaEffect.value;
	//? Gather all the effect data
	let effectDescription = metaItemData.system.Effects.EffectDescription.value;
	let damageCosmicBase = metaItemData.system.Effects.Damage.Cosmic.Base;
	let damageCosmicDice = metaItemData.system.Effects.Damage.Cosmic.Dice;
	let damageElementalBase = metaItemData.system.Effects.Damage.Elemental.Base;
	let damageElementalDice = metaItemData.system.Effects.Damage.Elemental.Dice;
	let damageMaterialBase = metaItemData.system.Effects.Damage.Material.Base;
	let damageMaterialDice = metaItemData.system.Effects.Damage.Material.Dice;
	let damagePsychicBase = metaItemData.system.Effects.Damage.Psychic.Base;
	let damagePsychicDice = metaItemData.system.Effects.Damage.Psychic.Dice;
	let healingBase = metaItemData.system.Effects.Healing.Base;
	let healingDice = metaItemData.system.Effects.Healing.Dice;
	let specialName = metaItemData.system.Effects.Special.SpecialDiceName.value;
	let specialBase = metaItemData.system.Effects.Special.Base;
	let specialDice = metaItemData.system.Effects.Special.Dice;
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
	let damageCosmicMessage;
	let damageElementalMessage;
	let damageMaterialMessage;
	let damagePsychicMessage;
	let healingMessage;
	let specialMessage;
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
	const rollResult = actor.getFlag("metanthropes-system", "lastrolled");
	let executeRoll = null;
	//? Gather specific data & set the flavor message based on the action
	if (action === "Metapower") {
		//? Metapower only properties
		// space intentionally left blank
		//? Check if activation was successfull
		if (rollResult.Metapower <= 0) {
			flavorMessage = `Fails to Activate ${itemName}!`;
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
				flavorMessage = `Fails to connect with their ${itemName}!<br>`;
			} else if (attackType === "Projectile") {
				flavorMessage = `Throws their ${itemName} in the air!<br>`;
			} else if (attackType === "Firearm") {
				flavorMessage = `Fires their ${itemName} and hits nothing!<br>`;
			} else {
				flavorMessage = `Fails to use ${itemName}!<br>`;
			}
		} else {
			executeRoll = true;
			//? Use Possession
			console.log("Metanthropes RPG System | MetaExecute | Using Possession:", itemName, attackType);
			if (attackType === "Melee") {
				//todo: need to add size modifier to increase the base d10 dice pool for unarmed strikes only
				flavorMessage = `Attacks with their ${itemName}<br><br>`;
				if (multiAction < 0) {
					baseActorDamage = powerScore + multiAction;
					damageMaterialBase = baseActorDamage + damageMaterialBase;
				} else {
					baseActorDamage = powerScore;
					damageMaterialBase = baseActorDamage + damageMaterialBase;
				}
			} else if (attackType === "Projectile") {
				flavorMessage = `Throws their ${itemName}<br><br>`;
				baseActorDamage = Math.ceil(powerScore / 2);
				damageMaterialBase = baseActorDamage + damageMaterialBase;
			} else if (attackType === "Firearm") {
				flavorMessage = `Fires their ${itemName}<br><br>`;
			} else {
				flavorMessage = `Uses ${itemName}<br><br>`;
			}
		}
	} else {
		console.log("Metanthropes RPG System | MetaExecute | cannot Execute action:", action);
		return;
	}
	if (executeRoll) {
		//? check Area Effect
		if (areaEffect !== "None") {
			areaEffectMessage = `🗺️: ` + areaEffect + `<br>`;
		} else {
			areaEffectMessage = null;
		}
		//* execution message
		//? finalize action slot
		if (actionSlot.includes("Always Active")) {
			//? always active return
			console.log("Metanthropes RPG System | MetaExecute | Always Active:", itemName);
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
				🤞 to reroll ⏱ Activation</button>
				<br></div>`;
			} else if (actionSlot.includes("1d10 Hours")) {
				//? roll for hours
				actionSlotDice = 1;
				actionSlotMessage += `Focused Action: [[1d10${explosiveDice}]] Hours<br>`;
				actionSlotRerollButton = `<div class="hide-button hidden"><br>
				<button class="metanthropes-secondary-chat-button action-slot rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${actionSlotDice}" data-what="⏱ Activation" data-destiny-re-roll="true">
				🤞 to reroll ⏱ Activation</button>
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
			🤞 to reroll 🎯 Targets</button>
			<br></div>`;
			} else {
				//? all other rolls
				targetsNumberDice = await metaExtractNumberOfDice(targetsNumber);
				targetsNumberDiceMessage = `[[${targetsNumberDice}d10${explosiveDice}]]`;
				targetsMessage = `🎯: ${targetsNumberDiceMessage}`;
				targetsRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button targets rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${targetsNumberDice}" data-what="🎯 Targets" data-destiny-re-roll="true">
			🤞 to reroll 🎯 Targets</button>
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
			🤞 to reroll ⏳ Duration</button>
			<br></div>`;
		} else {
			//? fixed duration
			durationMessage = `⏳: ` + duration + `<br>`;
		}
		//* effect message
		if (damageCosmicBase > 0 && damageCosmicDice > 0) {
			damageCosmicMessage = `💥: [[${damageCosmicDice}d10${explosiveDice}+${damageCosmicBase}[Cosmic]]]<br>`;
			damageCosmicRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button cosmic-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Cosmic 💥 Damage" data-dice="${damageCosmicDice}" data-destiny-re-roll="true" data-base-number="${damageCosmicBase}">
			🤞 to reroll Cosmic 💥</button>
			<br></div>`;
		} else if (damageCosmicBase > 0) {
			damageCosmicMessage = `💥: [[${damageCosmicBase}[Cosmic]]]<br>`;
		} else if (damageCosmicDice > 0) {
			damageCosmicMessage = `💥: [[${damageCosmicDice}d10${explosiveDice}[Cosmic]]]<br>`;
			damageCosmicRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button cosmic-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Cosmic 💥 Damage" data-dice="${damageCosmicDice}" data-destiny-re-roll="true">
			🤞 to reroll Cosmic 💥</button>
			<br></div>`;
		}
		if (damageElementalBase > 0 && damageElementalDice > 0) {
			damageElementalMessage = `💥: [[${damageElementalDice}d10${explosiveDice}+${damageElementalBase}[Elemental]]]<br>`;
			damageElementalRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button elemental-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Elemental 💥 Damage" data-dice="${damageElementalDice}" data-destiny-re-roll="true" data-base-number="${damageElementalBase}">
			🤞 to reroll Elemental 💥</button>
			<br></div>`;
		} else if (damageElementalBase > 0) {
			damageElementalMessage = `💥: [[${damageElementalBase}[Elemental]]]<br>`;
		} else if (damageElementalDice > 0) {
			damageElementalMessage = `💥: [[${damageElementalDice}d10${explosiveDice}[Elemental]]]<br>`;
			damageElementalRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button elemental-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Elemental 💥 Damage" data-dice="${damageElementalDice}" data-destiny-re-roll="true">
			🤞 to reroll Elemental 💥</button>
			<br></div>`;
		}
		if (damageMaterialBase > 0 && damageMaterialDice > 0) {
			damageMaterialMessage = `💥: [[${damageMaterialDice}d10${explosiveDice}+${damageMaterialBase}[Material]]]<br>`;
			damageMaterialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button material-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Material 💥 Damage" data-dice="${damageMaterialDice}" data-destiny-re-roll="true" data-base-number="${damageMaterialBase}">
			🤞 to reroll Material 💥</button>
			<br></div>`;
		} else if (damageMaterialBase > 0) {
			damageMaterialMessage = `💥: [[${damageMaterialBase}[Material]]]<br>`;
		} else if (damageMaterialDice > 0) {
			damageMaterialMessage = `💥: [[${damageMaterialDice}d10${explosiveDice}[Material]]]<br>`;
			damageMaterialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button material-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Material 💥 Damage" data-dice="${damageMaterialDice}" data-destiny-re-roll="true">
			🤞 to reroll Material 💥</button>
			<br></div>`;
		}
		if (damagePsychicBase > 0 && damagePsychicDice > 0) {
			damagePsychicMessage = `💥: [[${damagePsychicDice}d10${explosiveDice}+${damagePsychicBase}[Psychic]]]<br>`;
			damagePsychicRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button psychic-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Psychic 💥 Damage" data-dice="${damagePsychicDice}" data-destiny-re-roll="true" data-base-number="${damagePsychicBase}">
			🤞 to reroll Psychic 💥</button>
			<br></div>`;
		} else if (damagePsychicBase > 0) {
			damagePsychicMessage = `💥: [[${damagePsychicBase}[Psychic]]]<br>`;
		} else if (damagePsychicDice > 0) {
			damagePsychicMessage = `💥: [[${damagePsychicDice}d10${explosiveDice}[Psychic]]]<br>`;
			damagePsychicRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button psychic-damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Psychic 💥 Damage" data-dice="${damagePsychicDice}" data-destiny-re-roll="true">
			🤞 to reroll Psychic 💥</button>
			<br></div>`;
		}
		if (healingBase > 0 && healingDice > 0) {
			healingMessage = `<br>💞: [[${healingDice}d10${explosiveDice}+${healingBase}[Healing]]]<br>`;
			healingRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button healing rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💞 Healing" data-dice="${healingDice}" data-destiny-re-roll="true" data-base-number="${healingBase}">
			🤞 to reroll 💞 Healing</button>
			<br></div>`;
		} else if (healingBase > 0) {
			healingMessage = `<br>💞: [[${healingBase}[Healing]]]<br>`;
		} else if (healingDice > 0) {
			healingMessage = `<br>💞: [[${healingDice}d10${explosiveDice}[Healing]]]<br>`;
			healingRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button healing rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💞 Healing" data-dice="${healingDice}" data-destiny-re-roll="true">
			🤞 to reroll 💞 Healing</button>
			<br></div>`;
		}
		if (specialBase > 0 && specialDice > 0) {
			specialMessage = `<br>${specialName}: [[${specialDice}d10${explosiveDice}+${specialBase}]]<br>`;
			specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="${specialName}" data-dice="${specialDice}" data-destiny-re-roll="true" data-base-number="${specialBase}">
			🤞 to reroll ${specialName}</button>
			<br></div>`;
		} else if (specialBase > 0) {
			specialMessage = `<br>${specialName}: [[${specialBase}]]<br><br>`;
		} else if (specialDice > 0) {
			specialMessage = `<br>${specialName}: [[${specialDice}d10${explosiveDice}]]<br>`;
			specialRerollButton = `<div class="hide-button hidden"><br>
			<button class="metanthropes-secondary-chat-button special rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="${specialName}" data-dice="${specialDice}" data-destiny-re-roll="true">
			🤞 to reroll ${specialName}</button>
			<br></div>`;
		}
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
		//? Prep message to be presented in the content section (allows inline rolls)
		contentMessage = actionSlotMessage;
		contentMessage += targetsMessage;
		contentMessage += durationMessage;
		contentMessage += `📏: ` + range + `<br>`;
		if (areaEffectMessage) {
			contentMessage += areaEffectMessage;
		}
		contentMessage += `<div><br>${effectDescription}<br></div>`;
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
			contentMessage += `<br>`;
		}
		if (healingMessage) {
			contentMessage += healingMessage;
			contentMessage += `<br>`;
		}
		if (specialMessage) {
			contentMessage += specialMessage;
			contentMessage += `<br>`;
		}
		if (buffsAppliedMessage) {
			contentMessage += buffsAppliedMessage;
		}
		if (buffsRemovedMessage) {
			contentMessage += buffsRemovedMessage;
		}
		if (buffsAppliedMessage || buffsRemovedMessage) {
			contentMessage += `<br>`;
		}
		if (conditionsAppliedMessage) {
			contentMessage += conditionsAppliedMessage;
		}
		if (conditionsRemovedMessage) {
			contentMessage += conditionsRemovedMessage;
		}
		if (conditionsAppliedMessage || conditionsRemovedMessage) {
			contentMessage += `<br>`;
		}
		//? check if actor has enough destiny points to reroll
		let currentDestiny = actor.system.Vital.Destiny.value;
		contentMessage += `<div>${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br></div>`;
		if (currentDestiny > 0) {
			//? add reroll buttons
			if (actionSlotRerollButton) {
				contentMessage += actionSlotRerollButton;
			}
			if (targetsRerollButton) {
				contentMessage += targetsRerollButton;
			}
			if (durationRerollButton) {
				contentMessage += durationRerollButton;
			}
			if (damageCosmicRerollButton) {
				contentMessage += damageCosmicRerollButton;
			}
			if (damageElementalRerollButton) {
				contentMessage += damageElementalRerollButton;
			}
			if (damageMaterialRerollButton) {
				contentMessage += damageMaterialRerollButton;
			}
			if (damagePsychicRerollButton) {
				contentMessage += damagePsychicRerollButton;
			}
			if (healingRerollButton) {
				contentMessage += healingRerollButton;
			}
			if (specialRerollButton) {
				contentMessage += specialRerollButton;
			}
		}
	}
	//? prepare the Chat message
	let chatData = {
		user: game.user.id,
		flavor: flavorMessage,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentMessage,
		flags: { "metanthropes-system": { actoruuid: actor.uuid } },
	};
	//? Send the message to chat
	ChatMessage.create(chatData);
	//? Refresh the actor sheet if it's open
	const sheet = actor.sheet;
	if (sheet && sheet.rendered) {
		sheet.render(true);
	}
}
