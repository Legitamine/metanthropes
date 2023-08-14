export async function MetapowerActivate(actorUUID, itemName, event = null) {
	//todo: utilize existing levels of success and spent levels of success
	//? If we called this from a button click, get the data we need
	if (event) {
		const button = event.target;
		actorUUID = button.dataset.actoruuid;
		itemName = button.dataset.itemName;
	}
	const actor = await fromUuid(actorUUID);
	//? Checking if actor has Metapowers that affect the explosive dice
	let explosiveDice = "x10";
	const metapowers = actor.items.filter((item) => item.type === "Metapower");
	const hasDangerSense = metapowers.some((metapower) => metapower.name === "Danger Sense");
	if (hasDangerSense) {
		explosiveDice = "x1x2x10";
	}
	//? Find the first item that matches the name
	const itemData = metapowers.find((metapower) => metapower.name === itemName);
	if (!itemData) {
		console.log("Metanthropes RPG - MetapowerActivate - Could not find itemData for ", itemName);
		return;
	}
	console.log("Metanthropes RPG - MetapowerActivate - itemData:", itemData);
	const effect = itemData.system.EffectDescription.value;
	const targets = itemData.system.Activation.Targets.value;
	const targetsdice = itemData.system.Activation.TargetsDice.value;
	const duration = itemData.system.Activation.Duration.value;
	const durationdice = itemData.system.Activation.DurationDice.value;
	const damage = itemData.system.Effects.Damage.value;
	const healing = itemData.system.Effects.Healing.value;
	const buffs = itemData.system.Effects.Buffs.value;
	const conditions = itemData.system.Effects.Conditions.value;
	//! need a new field to track fixed numbers to be added to the roll results
	//! do I need multiples based on different damage types?
	// Create a chat message with the provided content
	let flavordata = null;
	let contentdata = null;
	// Check if activation was successfull
	const result = actor.getFlag("metanthropes-system", "lastrolled");
	//console.log("MetapowerActivate - result:", result);
	if (result.Metapower <= 0) {
		flavordata = `Fails to Activate ${itemName}!`;
	} else {
		flavordata = `Activates ${itemName} with the following:`;
		contentdata = `<div>Effect:${effect}</div><br>`;
		if (targetsdice) {
			contentdata += `<div class="hide-button hidden">🎯 Targets:
		<button class="metanthropes-secondary-chat-button targets rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${targetsdice}" data-what="🎯 Targets" data-targets="${targets}" data-destiny-re-roll="true">
		🎯 [[${targetsdice}d10${explosiveDice}]] ${targets} 🤞</button>
		</div><br>`;
		} else {
			contentdata += `<div>🎯 Targets: ${targets}</div><br>`;
		}
		if (durationdice) {
			contentdata += `<div class="hide-button hidden">⏳ Duration:
		<button class="metanthropes-secondary-chat-button duration rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-dice="${durationdice}" data-what="⏳ Duration" data-duration="${duration}" data-destiny-re-roll="true">
		⏳ [[${durationdice}d10${explosiveDice}]] ${duration} 🤞</button>
		</div><br>`;
		} else {
			contentdata += `<div>⏳ Duration:${duration}</div><br>`;
		}
		if (damage) {
			contentdata += `<div class="hide-button hidden">💥 Damage:
		<button class="metanthropes-secondary-chat-button damage rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💥 Damage" data-dice="${damage}" data-destiny-re-roll="true">
		💥 [[${damage}d10${explosiveDice}]] 🤞</button>
		</div><br>`;
		}
		if (healing) {
			contentdata += `<div class="hide-button hidden">💞 Healing:
		<button class="metanthropes-secondary-chat-button healing rolld10-reroll" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-what="💞 Healing" data-dice="${healing}" data-destiny-re-roll="true">
		💞 [[${healing}d10${explosiveDice}]] 🤞</button>
		</div><br>`;
		}
		if (buffs) {
			contentdata += `<div>🛡️ Buffs:${buffs}</div><br>`;
		}
		if (conditions) {
			contentdata += `<div>💀 Conditions:${conditions}</div><br>`;
		}
	}
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: flavordata,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentdata,
		flags: { "metanthropes-system": { actoruuid: actor.uuid } },
	};
	// Send the message to chat
	ChatMessage.create(chatData);
	//? Refresh the actor sheet if it's open
	const sheet = actor.sheet;
	if (sheet && sheet.rendered) {
		sheet.render(true);
	}
}
