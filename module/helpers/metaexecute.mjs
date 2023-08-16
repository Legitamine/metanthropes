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
 * ! what to do with targets being 1d10/2 ????
 *
 * @param {Event} [event] - The button click event, if the function was triggered by a button click. Expected to be null if the function is called directly.
 * @param {string} actorUUID - The UUID of the actor performing the action. Expected to be a string.
 * @param {string} action - The type of action ("Metapower" or "Possession"). Expected to be a string.
 * @param {string} itemName - The name of the Metapower or Possession being executed. Expected to be a string.
 * @param {number} multiAction - Indicates if multi-Actions are being performed. (Possession only). Expected to be a negative number.
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
	const possessions = actor.items.filter((item) => item.type === "Possession");
	const hasArbiterPowers = metapowers.some((metapower) => metapower.name === "Arbiter Powers");
	if (hasArbiterPowers) {
		explosiveDice = "x1x2x10";
	} else {
		explosiveDice = "x10";
	}
	//? Gather all the data
	let metaItemData;
	let effect;
	let targets;
	let targetsDice;
	let duration;
	let durationDice;
	let damage;
	let healing;
	let buffs;
	let conditions;
	let powerScore;
	let attackType;
	let baseNumber;
	//? Gather specific data based on the action
	if (action === "Metapower") {
		//? Find the first item ()that matches itemName
		metaItemData = metapowers.find((metapower) => metapower.name === itemName);
		if (!metaItemData) {
			console.log("Metanthropes RPG System | MetaExecute | Could not find a Metapower named:", itemName);
			return;
		}
		console.log("Metanthropes RPG System | MetaExecute | metaItemData for Metapower:", metaItemData);
		//? Metapower only properties
		targetsDice = metaItemData.system.Activation.TargetsDice.value;
		duration = metaItemData.system.Activation.Duration.value;
		durationDice = metaItemData.system.Activation.DurationDice.value;
		healing = metaItemData.system.Effects.Healing.value;
		buffs = metaItemData.system.Effects.Buffs.value;
		//! conflicts
		targets = metaItemData.system.Activation.Targets.value;
	} else if (action === "Possession") {
		//? Find the first item ()that matches itemName
		metaItemData = possessions.find((possession) => possession.name === itemName);
		if (!metaItemData) {
			console.log("Metanthropes RPG System | MetaExecute | Could not find a Possession named:", itemName);
			return;
		}
		console.log("Metanthropes RPG System | MetaExecute | metaItemData for Possession:", metaItemData);
		//? Possession only properties
		powerScore = actor.system.Characteristics.Body.Stats.Power.Roll;
		attackType = metaItemData.system.AttackType.value;
		//! conflicts
		targets = metaItemData.system.Usage.Targets.value;
	} else {
		console.log("Metanthropes RPG System | MetaExecute | cannot Execute action:", action);
		return;
	}
	//? Common Properties
	effect = metaItemData.system.EffectDescription.value;
	damage = metaItemData.system.Effects.Damage.value;
	conditions = metaItemData.system.Effects.Conditions.value;
	//? Create a chat message with the provided content
	let flavorData;
	let contentData;
	const rollResult = actor.getFlag("metanthropes-system", "lastrolled");
	if (action === "Metapower") {
		//? Check if activation was successfull
		if (rollResult.Metapower <= 0) {
			flavorData = `Fails to Activate ${itemName}!`;
		} else {
			//? Activate Metapower
			flavorData = `Activates Ⓜ️ Metapower: ${itemName} with the following:`;
			contentData = `<div>Effect: ${effect}</div><br>`;
			if (targetsDice) {
				contentData += `<div>🎯 Targets: [[${targetsDice}d10${explosiveDice}]] ${targets}</div><br>`;
				contentData += `<div class="hide-button hidden">
		<button class="metanthropes-secondary-chat-button targets rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${targetsDice}" data-what="🎯 Targets" data-targets="${targets}" data-destiny-re-roll="true">
		🤞 to reroll 🎯 Targets</button>
		</div><br>`;
			} else {
				contentData += `<div>🎯 Targets: ${targets}</div><br>`;
			}
			if (durationDice) {
				contentData += `<div>⏳ Duration: [[${durationDice}d10${explosiveDice}]] ${duration} </div><br>`;
				contentData += `<div class="hide-button hidden">
		<button class="metanthropes-secondary-chat-button duration rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${durationDice}" data-what="⏳ Duration" data-duration="${duration}" data-destiny-re-roll="true">
		🤞 to reroll ⏳ Duration</button>
		</div><br>`;
			} else {
				contentData += `<div>⏳ Duration: ${duration}</div><br>`;
			}
			if (damage) {
				contentData += `<div>💥 Damage: [[${damage}d10${explosiveDice}]] </div><br>`;
				contentData += `<div class="hide-button hidden">
		<button class="metanthropes-secondary-chat-button damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💥 Damage" data-dice="${damage}" data-destiny-re-roll="true">
		🤞 to reroll 💥 Damage</button>
		</div><br>`;
			}
			if (healing) {
				contentData += `<div>💞 Healing: [[${healing}d10${explosiveDice}]] </div><br>`;
				contentData += `<div class="hide-button hidden">
		<button class="metanthropes-secondary-chat-button healing rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💞 Healing" data-dice="${healing}" data-destiny-re-roll="true">
		🤞 to reroll 💞 Healing</button>
		</div><br>`;
			}
			if (buffs) {
				contentData += `<div>🛡️ Buffs: ${buffs}</div><br>`;
			}
			if (conditions) {
				contentData += `<div>💀 Conditions: ${conditions}</div><br>`;
			}
		}
		console.log("Metanthropes RPG System | MetaExecute | Finished Executing Metapower Activation");
	} else if (action === "Possession") {
		//? Check if using was successfull
		if (rollResult.Possession <= 0) {
			if (attackType === "Melee") {
				flavorData = `Fails to connect with their ${itemName}!`;
			} else if (attackType === "Projectile") {
				flavorData = `Throws their ${itemName} in the air!`;
			} else if (attackType === "Firearm") {
				flavorData = `Fires their ${itemName} and hits nothing!`;
			} else {
				console.log(
					"Metanthropes RPG System | MetaExecute | Unknown attackType for possession activation:",
					attackType
				);
				flavorData = `Fails to use ${itemName}!`;
			}
		} else {
			//? Use Possession
			console.log("Metanthropes RPG System | MetaExecute | Using Possession:", itemName, attackType);
			if (attackType === "Melee") {
				flavorData = `Attacks with their ${itemName} with the following:`;
				if (multiAction < 0) {
					//todo: need to add modifier size here to input in the damage calc
					baseNumber = powerScore + multiAction;
				} else {
					baseNumber = powerScore;
				}
			} else if (attackType === "Projectile") {
				flavorData = `Throws their ${itemName} with the following:`;
				baseNumber = Math.ceil(powerScore / 2);
			} else if (attackType === "Firearm") {
				flavorData = `Fires their ${itemName} with the following:`;
			} else {
				console.log("Metanthropes RPG System | PossessionUse | Unknown attackType: ", attackType);
				flavorData = `Uses ${itemName} with the following:`;
			}
			if (effect) {
				contentData = `<div>Effect: ${effect}</div><br>`;
			} else {
				contentData = "";
			}
			contentData += `<div>🎯 Targets: ${targets}</div><br>`;
			if (damage) {
				if (baseNumber > 0) {
					contentData += `<div>💥 Damage: [[${damage}d10${explosiveDice}+${baseNumber}]] </div><br>`;
					contentData += `<div class="hide-button hidden">
					<button class="metanthropes-secondary-chat-button damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💥 Damage" data-dice="${damage}" data-destiny-re-roll="true" data-base-number="${baseNumber}">
					🤞 to reroll 💥 Damage</button>
			</div><br>`;
				} else {
					contentData += `<div>💥 Damage: [[${damage}d10${explosiveDice}]] </div><br>`;
					contentData += `<div class="hide-button hidden">
					<button class="metanthropes-secondary-chat-button damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💥 Damage" data-dice="${damage}" data-destiny-re-roll="true">
					🤞 to reroll 💥 Damage</button>
					</div><br>`;
				}
			}
			if (conditions) {
				contentData += `<div>💀 Conditions: ${conditions}</div><br>`;
			}
		}
		console.log("Metanthropes RPG System | MetaExecute | Finished Executing Possession Use");
	}
	//? prepare the Chat message
	let chatData = {
		user: game.user.id,
		flavor: flavorData,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentData,
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
