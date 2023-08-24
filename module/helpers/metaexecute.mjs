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
	let cosmicDamageBase = metaItemData.system.Effects.Damage.Cosmic.Base;
	let cosmicDamageDice = metaItemData.system.Effects.Damage.Cosmic.Dice;
	let elementalDamageBase = metaItemData.system.Effects.Damage.Elemental.Base;
	let elementalDamageDice = metaItemData.system.Effects.Damage.Elemental.Dice;
	let materialDamageBase = metaItemData.system.Effects.Damage.Material.Base;
	let materialDamageDice = metaItemData.system.Effects.Damage.Material.Dice;
	let psychicDamageBase = metaItemData.system.Effects.Damage.Psychic.Base;
	let psychicDamageDice = metaItemData.system.Effects.Damage.Psychic.Dice;
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
	let baseNumber;
	let quantity;
	let requiredPerk;
	let requiredPerkLevel;
	//? Prep chat message variables
	let actionSlotMessage;
	let actionSlotFocusedMessage;
	let targetsMessage;
	let targetsNumberDiceMessage;
	let durationMessage;
	let durationDiceMessage;
	let areaEffectMessage;
	let executionMessage;
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
	let effectMessage;
	let flavorMessage;
	let contentMessage;
	//? Prep dice holding variables
	let actionSlotDice;
	let targetsNumberDice;
	let durationDice;
	//? Prep chat message buttons
	let actionSlotRerollButton = ``;
	let targetsRerollButton = ``;
	let durationRerollButton = ``;
	let executionRerollButtons = ``;
	let damageRerollButton = ``;
	let healingRerollButton = ``;
	let specialRerollButton = ``;
	//? Get the last rolled result
	const rollResult = actor.getFlag("metanthropes-system", "lastrolled");
	//! afou ta execution k effects fields einai ta idia gia metapowers kai possessions, xreiazomai na ta kanw differentiate mono gia to chat message, to logic tha einai to idio in either case - right???
	//? Gather specific data based on the action
	if (action === "Metapower") {
		//? Metapower only properties
	} else if (action === "Possession") {
		//? Possession only properties
		powerScore = actor.system.Characteristics.Body.Stats.Power.Roll;
		category = metaItemData.system.Category.value;
		attackType = metaItemData.system.AttackType.value;
		quantity = metaItemData.system.Quantity.value;
		requiredPerk = metaItemData.system.RequiredPerk.value;
		requiredPerkLevel = metaItemData.system.RequiredPerkLevel.value;
	} else {
		console.log("Metanthropes RPG System | MetaExecute | cannot Execute action:", action);
		return;
	}
	//? check Area Effect
	if (areaEffect !== "None") {
		areaEffectMessage = `🗺️: ` + areaEffect + `<br>`;
	} else {
		areaEffectMessage = ``;
	}
	//* execution step
	//!! issue: the flavor message cannot contain any rollable results - they have to be in the content message instead
	//	//? finalize action slot
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
			actionSlotRerollButton = `<div class="hide-button hidden">
				<button class="metanthropes-secondary-chat-button action-slot rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${actionSlotDice}" data-what="⏱ Activation" data-destiny-re-roll="true">
				🤞 to reroll ⏱ Activation</button>
				</div><br>`;
		} else if (actionSlot.includes("1d10 Hours")) {
			//? roll for hours
			actionSlotDice = 1;
			actionSlotMessage += `Focused Action: [[1d10${explosiveDice}]] Hours<br>`;
			actionSlotRerollButton = `<div class="hide-button hidden">
				<button class="metanthropes-secondary-chat-button action-slot rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${actionSlotDice}" data-what="⏱ Activation" data-destiny-re-roll="true">
				🤞 to reroll ⏱ Activation</button>
				</div><br>`;
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
			targetsNumberDice = "special";
			targetsNumberDiceMessage = `[[1d5x5]]`;
		} else {
			//? all other rolls
			targetsNumberDice = await metaExtractNumberOfDice(targetsNumber);
			targetsNumberDiceMessage = `[[${targetsNumberDice}d10${explosiveDice}]]`;
		}
		targetsMessage = `🎯: ${targetsNumberDiceMessage}`;
		targetsRerollButton = `<div class="hide-button hidden">
					<button class="metanthropes-secondary-chat-button targets rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${targetsNumberDice}" data-what="🎯 Targets" data-destiny-re-roll="true">
					🤞 to reroll 🎯 Targets</button>
					</div><br>`;
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
		durationRerollButton = `<div class="hide-button hidden">
			<button class="metanthropes-secondary-chat-button duration rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${durationDice}" data-what="⏳ Duration" data-destiny-re-roll="true">
			🤞 to reroll ⏳ Duration</button>
			</div><br>`;
	} else {
		//? fixed duration
		durationMessage = `⏳: ` + duration + `<br>`;
	}
	//? execution message
	executionMessage = actionSlotMessage + targetsMessage + durationMessage;
	executionRerollButtons = actionSlotRerollButton + targetsRerollButton + durationRerollButton;
	//? effect message

	if (cosmicDamageBase > 0 || cosmicDamageDice > 0) {
		damageCosmicMessage = `💥: `;
		damageCosmicMessage += `[[${cosmicDamageBase}+${cosmicDamageDice}d10${explosiveDice}[Cosmic]]]<br>`;
		damageRerollButton = `<div class="hide-button hidden">
			<button class="metanthropes-secondary-chat-button damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Cosmic 💥 Damage" data-dice="${cosmicDamageDice}" data-destiny-re-roll="true" data-base-number="${cosmicDamageBase}">
			🤞 to reroll Cosmic 💥</button>
			</div><br>`;
	}
	if (elementalDamageBase > 0 || elementalDamageDice > 0) {
		damageElementalMessage = `💥: `;
		damageElementalMessage += `[[${elementalDamageBase}+${elementalDamageDice}d10${explosiveDice}[Elemental]]]<br>`;
		damageRerollButton = `<div class="hide-button hidden">
			<button class="metanthropes-secondary-chat-button damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Elemental 💥 Damage" data-dice="${elementalDamageDice}" data-destiny-re-roll="true" data-base-number="${elementalDamageBase}">
			🤞 to reroll Elemental 💥</button>
			</div><br>`;
	}
	if (materialDamageBase > 0 || materialDamageDice > 0) {
		damageMaterialMessage = `💥: `;
		damageMaterialMessage += `[[${materialDamageBase}+${materialDamageDice}d10${explosiveDice}[Material]]]<br>`;
		damageRerollButton = `<div class="hide-button hidden">
			<button class="metanthropes-secondary-chat-button damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Material 💥 Damage" data-dice="${materialDamageDice}" data-destiny-re-roll="true" data-base-number="${materialDamageBase}">
			🤞 to reroll Material 💥</button>
			</div><br>`;
	}
	if (psychicDamageBase > 0 || psychicDamageDice > 0) {
		damagePsychicMessage = `💥: `;
		damagePsychicMessage += `[[${psychicDamageBase}+${psychicDamageDice}d10${explosiveDice}[Psychic]]]<br>`;
		damageRerollButton = `<div class="hide-button hidden">
			<button class="metanthropes-secondary-chat-button damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="Psychic 💥 Damage" data-dice="${psychicDamageDice}" data-destiny-re-roll="true" data-base-number="${psychicDamageBase}">
			🤞 to reroll Psychic 💥</button>
			</div><br>`;
	}

	if (healingBase > 0 || healingDice > 0) {
		healingMessage = `💞: `;
		healingMessage += `[[${healingBase}+${healingDice}d10${explosiveDice}[Healing]]]<br>`;
		healingRerollButton = `<div class="hide-button hidden">
			<button class="metanthropes-secondary-chat-button healing rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💞 Healing" data-dice="${healingDice}" data-destiny-re-roll="true" data-base-number="${healingBase}">
			🤞 to reroll 💞 Healing</button>
			</div><br>`;
	}

	if (specialBase > 0 || specialDice > 0) {
		specialMessage = `${specialName}: `;
		specialMessage += `[[${specialBase}+${specialDice}d10${explosiveDice}[${specialName}]]]<br>`;
		specialRerollButton = `<div class="hide-button hidden">
			<button class="metanthropes-secondary-chat-button special rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="${specialName}" data-dice="${specialDice}" data-destiny-re-roll="true" data-base-number="${specialBase}">
			🤞 to reroll ${specialName}</button>
			</div><br>`;
	}

	if (buffsApplied) {
		buffsAppliedMessage = `🛡️ ➕: ` + buffsApplied;
	}
	if (buffsRemoved) {
		buffsRemovedMessage = `🛡️ ➖: ` + buffsRemoved;
	}
	if (conditionsApplied) {
		conditionsAppliedMessage = `💀 ➕: ` + conditionsApplied;
	}
	if (conditionsRemoved) {
		conditionsRemovedMessage = `💀 ➖: ` + conditionsRemoved;
	}
	//* check gia perk ean einai possession
	//! perk einai penalty ?! so prepei na to dw sto metaEvaluate stage
	//? prep flavor and content message
	if (action === "Metapower") {
		//? Check if activation was successfull
		if (rollResult.Metapower <= 0) {
			flavorMessage = `Fails to Activate ${itemName}!`;
		} else {
			//? Activate Metapower
			flavorMessage = `Activates Ⓜ️ Metapower: ${itemName}.<br><br>`;
		}
	} else if (action === "Possession") {
		//? Check if using was successfull
		if (rollResult.Possession <= 0) {
			if (attackType === "Melee") {
				flavorMessage = `Fails to connect with their ${itemName}!`;
			} else if (attackType === "Projectile") {
				flavorMessage = `Throws their ${itemName} in the air!`;
			} else if (attackType === "Firearm") {
				flavorMessage = `Fires their ${itemName} and hits nothing!`;
			} else {
				console.log(
					"Metanthropes RPG System | MetaExecute | Unknown attackType for possession activation:",
					attackType
				);
				flavorMessage = `Fails to use ${itemName}!`;
			}
		} else {
			//? Use Possession
			console.log("Metanthropes RPG System | MetaExecute | Using Possession:", itemName, attackType);
			if (attackType === "Melee") {
				flavorMessage = `Attacks with their ${itemName} with the following:`;
				if (multiAction < 0) {
					//todo: need to add modifier size here to input in the damage calc
					baseNumber = powerScore + multiAction;
				} else {
					baseNumber = powerScore;
				}
			} else if (attackType === "Projectile") {
				flavorMessage = `Throws their ${itemName} with the following:`;
				baseNumber = Math.ceil(powerScore / 2);
			} else if (attackType === "Firearm") {
				flavorMessage = `Fires their ${itemName} with the following:`;
			} else {
				console.log("Metanthropes RPG System | PossessionUse | Unknown attackType: ", attackType);
				flavorMessage = `Uses ${itemName} with the following:`;
			}
		}
		//? Use Possession
		console.log("Metanthropes RPG System | MetaExecute | Finished Executing Possession Use");
	}
	//? Prep content message
	contentMessage = actionSlotMessage;
	contentMessage += targetsMessage;
	contentMessage += durationMessage;
	contentMessage += `📏: ` + range + `<br>`;
	contentMessage += areaEffectMessage;
	contentMessage += `<br><div>${effectDescription}</div><br>`;
	contentMessage += damageCosmicMessage;
	contentMessage += damageElementalMessage;
	contentMessage += damageMaterialMessage;
	contentMessage += damagePsychicMessage;
	contentMessage += healingMessage;
	contentMessage += specialMessage;
	contentMessage += buffsAppliedMessage;
	contentMessage += buffsRemovedMessage;
	contentMessage += conditionsAppliedMessage;
	contentMessage += conditionsRemovedMessage;
	contentMessage += actionSlotRerollButton;
	contentMessage += targetsRerollButton;
	contentMessage += durationRerollButton;
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
