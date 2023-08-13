export async function MetapowerActivate(event) {
	//todo: utilize existing levels of success and spent levels of success
	//? Get the data we need
	const button = event.target;
	//? Disable the button after it's been clicked
	button.disabled = true;
	const actorUUID = button.dataset.actoruuid;
	const itemName = button.dataset.itemName;
	const actor = await fromUuid(actorUUID);
	const metapowers = actor.items.filter((i) => i.type === "Metapower");
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
	// Create a chat message with the provided content
	let flavordata = null;
	let contentdata = null;
	// Check if activation was successfull
	const result = actor.getFlag("metanthropes-system", "lastrolled");
	console.log("MetapowerActivate - result:", result);
	if (result.Metapower <= 0) {
		flavordata = `Fails to Activate ${itemName}!`;
	} else {
		flavordata = `Activates ${itemName} with the following:`;
		contentdata = `<div>Effect:${effect}</div><br>`;
		if (targetsdice) {
			contentdata += `<div class="hide-button layout-hide">🎯 Targets:
		<button class="re-roll-targets" data-idactor="${actor.id}" data-item-name="${itemName}" data-targetsdice="${targetsdice}" data-targets="${targets}" >
		🎯 [[${targetsdice}d10x10]] ${targets} 🤞</button>
		</div><br>`;
		} else {
			contentdata += `<div>🎯 Targets:${targets}</div><br>`;
		}
		if (durationdice) {
			contentdata += `<div class="hide-button layout-hide">⏳ Duration:
		<button class="re-roll-duration" data-idactor="${actor.id}" data-item-name="${itemName}" data-durationdice="${durationdice}" data-duration="${duration}" >
		⏳ [[${durationdice}d10x10]] ${duration} 🤞</button>
		</div><br>`;
		} else {
			contentdata += `<div>⏳ Duration:${duration}</div><br>`;
		}
		if (damage) {
			contentdata += `<div class="hide-button layout-hide">💥 Damage:
		<button class="re-roll-damage" data-idactor="${actor.id}" data-item-name="${itemName}" data-damage="${damage}" >
		💥 [[${damage}d10x10]] 🤞</button>
		</div><br>`;
		}
		if (healing) {
			contentdata += `<div class="hide-button layout-hide">💞 Healing:
		<button class="re-roll-healing" data-idactor="${actor.id}" data-item-name="${itemName}" data-healing="${healing}" >
		💞 [[${healing}d10x10]] 🤞</button>
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
