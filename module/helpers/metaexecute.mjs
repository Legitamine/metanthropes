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
	let numberTargets = metaItemData.system.Execution.Targets.value;
	let eligibleTargets = metaItemData.system.Execution.TargetsEligibility.value;
	let typeTargets = metaItemData.system.Execution.TargetsType.value;
	let duration = metaItemData.system.Execution.Duration.value;
	console.log("Metanthropes RPG System | MetaExecute", duration);
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
	let quantity;
	let requiredPerk;
	let requiredPerkLevel;
	//? Prep chat message variables
	let actionSlotMessage;
	let actionSlotFocusedMessage;
	let targetsMessage;
	let numberTargetsDice;
	let durationMessage;
	let durationMessageDice;
	let executionMessage;
	let effectMessage;
	let flavorMessage;
	let contentMessage;
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
	//* execution step
	//!! issue: the flavor message cannot contain any rollable results - they have to be in the content message instead
	//? finalize action slot
	if (actionSlot.includes("Always Active")) {
		//? always active return
		console.log("Metanthropes RPG System | MetaExecute | Always Active:", itemName);
		ui.notifications.info(actor.name + "'s " + itemName + " is Always Active!");
		return;
	} else if (actionSlot.includes("Focused")) {
		//? focused
		actionSlotMessage = `focusing for `;
		if (actionSlot.includes("1d10 Cycles")) {
			//? roll for cycles
			actionSlotMessage += `[[1d10${explosiveDice}]] Cycles, `;
		} else if (actionSlot.includes("1d10 Hours")) {
			//? roll for hours
			actionSlotMessage += `[[1d10${explosiveDice}]] Hours, `;
		} else if (actionSlot.includes("Hour")) {
			//? for an hour
			actionSlotMessage += `an Hour, `;
		} else {
			//? for a cycle or for a full turn
			actionSlotFocusedMessage = actionSlot.match(/Focused Action: (.+)/);
			actionSlotMessage += `a ` + actionSlotFocusedMessage[1] + `, `;
		}
	} else {
		//? normal execution
		actionSlotMessage = `spending their ` + actionSlot + `, `;
	}
	//? Check for multi-action
	if (multiAction < 0) {
		actionSlotMessage += `as part of their Multi-Action, `;
	}
	//? finalize targets
	if (numberTargets.includes("d10")) {
		//? roll for targets
		if (numberTargets === "1d10/2") {
			//? roll for 1d10/2
			numberTargetsDice = `[[/roll 1d10${explosiveDice}/2]]`;
		} else {
			//? all other rolls
			numberTargetsDice = `[[${numberTargets}d10${explosiveDice}]]`;
		}
		targetsMessage = `targeting ${numberTargetsDice}`;
		contentMessage += `<div class="hide-button hidden">
					<button class="metanthropes-secondary-chat-button targets rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${numberTargets}" data-what="🎯 Targets" data-destiny-re-roll="true">
					🤞 to reroll 🎯 Targets</button>
					</div><br>`;
	} else {
		//? fixed targets
		if (numberTargets === "Self") {
			//? self
			targetsMessage = `targeting their self`;
		} else {
			//? all other fixed targets
			targetsMessage = `targeting ` + numberTargets;
		}
	}
	//? add eligible targets
	if (eligibleTargets.length > 0) {
		targetsMessage += ` ` + eligibleTargets.join(", ") + ` 🎯 Targets`;
	}
	//? add type of targets
	if (typeTargets.length > 0) {
		targetsMessage += ` of the ` + typeTargets.join(", ") + ` type`;
	}
	//? finalize duration
	if (duration.includes("d10")) {
		//? roll for duration
		durationMessageDice = duration.match(/1d10 (.+)/);
		console.log("Metanthropes RPG System | MetaExecute | durationMessageDice:", durationMessageDice);
		durationMessage = ` and for [[1d10${explosiveDice}]] ` + durationMessageDice[1]`.`;
	} else {
		//? fixed duration
		if (duration === "Instantaneous") {
			durationMessage = ` and for an ` + duration + ` ⏳ Duration.`;
		} else {
			durationMessage = ` and for a ` + duration + ` ⏳ Duration.`;
		}
	}
	//? execution message
	executionMessage = actionSlotMessage + targetsMessage + durationMessage;
	//* check gia perk ean einai possession
	//! perk einai penalty ?! so prepei na to dw sto metaEvaluate stage
	//? prep flavor and content message
	if (action === "Metapower") {
		//? Check if activation was successfull
		if (rollResult.Metapower <= 0) {
			flavorMessage = `Fails to Activate ${itemName}!`;
		} else {
			//? Activate Metapower
			flavorMessage = `Activates Ⓜ️ Metapower: ${itemName} by ${executionMessage} <br><br>It has the following effect:<br>`;
			contentMessage = `<div>${effectDescription}</div><br>`;
		}
	}
			//	if (durationDice) {
			//		contentData += `<div>⏳ Duration: [[${durationDice}d10${explosiveDice}]] ${duration} </div><br>`;
			//		contentData += `<div class="hide-button hidden">
			//			<button class="metanthropes-secondary-chat-button duration rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${durationDice}" data-what="⏳ Duration" data-duration="${duration}" data-destiny-re-roll="true">
			//			🤞 to reroll ⏳ Duration</button>
			//			</div><br>`;
			//	} else {
			//		contentData += `<div>⏳ Duration: ${duration}</div><br>`;
			//	}
			//	if (damage) {
			//		contentData += `<div>💥 Damage: [[${damage}d10${explosiveDice}]] </div><br>`;
			//		contentData += `<div class="hide-button hidden">
			//			<button class="metanthropes-secondary-chat-button damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💥 Damage" data-dice="${damage}" data-destiny-re-roll="true">
			//			🤞 to reroll 💥 Damage</button>
			//			</div><br>`;
			//	}
			//	if (healing) {
			//		contentData += `<div>💞 Healing: [[${healing}d10${explosiveDice}]] </div><br>`;
			//		contentData += `<div class="hide-button hidden">
			//			<button class="metanthropes-secondary-chat-button healing rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💞 Healing" data-dice="${healing}" data-destiny-re-roll="true">
			//			🤞 to reroll 💞 Healing</button>
			//			</div><br>`;
			//	}
			//	if (buffs) {
			//		contentData += `<div>🛡️ Buffs: ${buffs}</div><br>`;
			//	}
			//	if (conditions) {
			//		contentData += `<div>💀 Conditions: ${conditions}</div><br>`;
			//	}
	//	}
	//		console.log("Metanthropes RPG System | MetaExecute | Finished Executing Metapower Activation");
	//	} else if (action === "Possession") {
	//		//? Check if using was successfull
	//		if (rollResult.Possession <= 0) {
	//			if (attackType === "Melee") {
	//				flavorData = `Fails to connect with their ${itemName}!`;
	//			} else if (attackType === "Projectile") {
	//				flavorData = `Throws their ${itemName} in the air!`;
	//			} else if (attackType === "Firearm") {
	//				flavorData = `Fires their ${itemName} and hits nothing!`;
	//			} else {
	//				console.log(
	//					"Metanthropes RPG System | MetaExecute | Unknown attackType for possession activation:",
	//					attackType
	//				);
	//				flavorData = `Fails to use ${itemName}!`;
	//			}
	//		} else {
	//			//? Use Possession
	//			console.log("Metanthropes RPG System | MetaExecute | Using Possession:", itemName, attackType);
	//			if (attackType === "Melee") {
	//				flavorData = `Attacks with their ${itemName} with the following:`;
	//				if (multiAction < 0) {
	//					//todo: need to add modifier size here to input in the damage calc
	//					baseNumber = powerScore + multiAction;
	//				} else {
	//					baseNumber = powerScore;
	//				}
	//			} else if (attackType === "Projectile") {
	//				flavorData = `Throws their ${itemName} with the following:`;
	//				baseNumber = Math.ceil(powerScore / 2);
	//			} else if (attackType === "Firearm") {
	//				flavorData = `Fires their ${itemName} with the following:`;
	//			} else {
	//				console.log("Metanthropes RPG System | PossessionUse | Unknown attackType: ", attackType);
	//				flavorData = `Uses ${itemName} with the following:`;
	//			}
	//			if (effect) {
	//				contentData = `<div>Effect: ${effect}</div><br>`;
	//			} else {
	//				contentData = "";
	//			}
	//			contentData += `<div>🎯 Targets: ${targets}</div><br>`;
	//			if (damage) {
	//				if (baseNumber > 0) {
	//					contentData += `<div>💥 Damage: [[${damage}d10${explosiveDice}+${baseNumber}]] </div><br>`;
	//					contentData += `<div class="hide-button hidden">
	//						<button class="metanthropes-secondary-chat-button damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💥 Damage" data-dice="${damage}" data-destiny-re-roll="true" data-base-number="${baseNumber}">
	//						🤞 to reroll 💥 Damage</button>
	//						</div><br>`;
	//				} else {
	//					contentData += `<div>💥 Damage: [[${damage}d10${explosiveDice}]] </div><br>`;
	//					contentData += `<div class="hide-button hidden">
	//						<button class="metanthropes-secondary-chat-button damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💥 Damage" data-dice="${damage}" data-destiny-re-roll="true">
	//						🤞 to reroll 💥 Damage</button>
	//						</div><br>`;
	//				}
	//			}
	//			if (conditions) {
	//				contentData += `<div>💀 Conditions: ${conditions}</div><br>`;
	//			}
	//		}
	//		console.log("Metanthropes RPG System | MetaExecute | Finished Executing Possession Use");
	//	}
	//	//? prepare the Chat message
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
