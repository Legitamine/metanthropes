export async function PossessionUse(event) {
	//todo: perks integration
	//? Get the data we need
	const button = event.target;
	//? Disable the button after it's been clicked
	button.disabled = true;
	const actorUUID = button.dataset.actoruuid;
	const itemName = button.dataset.itemName;
	const multiAction = button.dataset.multiAction;
	const actor = await fromUuid(actorUUID);
	const possessions = actor.items.filter((i) => i.type === "Possession");
	//? Find the first item that matches the name
	const itemData = possessions.find((possession) => possession.name === itemName);
	if (!itemData) {
		console.log("Metanthropes RPG - PossessionUse - Could not find itemData for ", itemName);
		return;
	}
	console.log("Metanthropes RPG - PossessionUse - itemData:", itemData);
	const attacktype = itemData.system.AttackType.value;
	const effect = itemData.system.EffectDescription.value;
	const targets = itemData.system.Usage.Targets.value;
	const damage = itemData.system.Effects.Damage.value;
	const conditions = itemData.system.Effects.Conditions.value;
	// Create a chat message with the provided content
	const powerScore = actor.system.Characteristics.Body.Stats.Power.Roll;
	let contentdata = null;
	let flavordata = null;
	let damagedata = null;
	// Check if activation was successfull
	const result = actor.getFlag("metanthropes-system", "lastrolled");
	if (result.Possession <= 0) {
		if (attacktype === "Melee") {
			flavordata = `Fails to attack with their ${itemName}!`;
		} else if (attacktype === "Projectile") {
			flavordata = `Throws their ${itemName} in the air!`;
		} else if (attacktype === "Firearm") {
			flavordata = `Fires their ${itemName} and hits nothing!`;
		} else {
			console.log("Metanthropes RPG System | PossessionUse | Unknown attacktype for failed roll: ", attacktype);
			flavordata = `Fails to use ${itemName}!`;
		}
	} else {
		if (attacktype === "Melee") {
			flavordata = `Attacks with their ${itemName} with the following:`;
			if (multiAction < 0) {
				//todo: need to add modifier size here to input in the damage calc
				damagedata = powerScore + multiAction;
			} else {
				damagedata = powerScore;
			}
		} else if (attacktype === "Projectile") {
			flavordata = `Throws their ${itemName} with the following:`;
			damagedata = Math.ceil(powerScore / 2);
		} else if (attacktype === "Firearm") {
			flavordata = `Fires their ${itemName} with the following:`;
		} else {
			console.log("Metanthropes RPG System | PossessionUse | Unknown attacktype: ", attacktype);
			flavordata = `Uses ${itemName} with the following:`;
		}
		if (effect) {
			contentdata = `<div>Effect:${effect}</div><br>`;
		} else {
			contentdata = "";
		}
		contentdata += `<div>🎯 Targets:${targets}</div><br>`;
		if (damage) {
			if (damagedata > 0) {
				contentdata += `<div class="hide-button layout-hide">💥 Damage:
			<button class="re-roll-damage" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-damage="${damage}" data-damagedata="${damagedata}">
			💥 [[${damagedata}+${damage}d10x10]] 🤞</button>
			</div><br>`;
			} else {
				contentdata += `<div class="hide-button layout-hide">💥 Damage:
			<button class="re-roll-damage" data-actoruuid="${actor.uuid}" data-item-name="${itemName}" data-damage="${damage}" >
			💥 [[${damage}d10x10]] 🤞</button>
			</div><br>`;
			}
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
