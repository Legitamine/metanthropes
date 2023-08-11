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
	let contentdata = null;
	let flavordata = null;
	// Check if activation was successfull
	const result = actor.getFlag("metanthropes-system", "lastrolled");
	console.log("MetapowerActivate - result:", result);
	if (result.Metapower <= 0) {
		flavordata = `<h3>Fails to Activate ${itemName}!</h3>`;
	} else {
		flavordata = `<h3>Activates ${itemName} with the following:</h3>`;
		contentdata = `<div><h4>Effect:</h4>${effect}</div><br>`;
		if (targetsdice) {
			contentdata += `<div class="hide-button layout-hide"><h4>🎯 Targets:</h4>
		<button class="re-roll-targets" data-idactor="${actor.id}" data-item-name="${itemName}" data-targetsdice="${targetsdice}" data-targets="${targets}" >
		🎯 [[${targetsdice}]] ${targets} 🤞</button>
		</div><br>`;
		} else {
			contentdata += `<div><h4>🎯 Targets:</h4>${targets}</div><br>`;
		}
		if (durationdice) {
			contentdata += `<div class="hide-button layout-hide"><h4>⏳ Duration:</h4>
		<button class="re-roll-duration" data-idactor="${actor.id}" data-item-name="${itemName}" data-durationdice="${durationdice}" data-duration="${duration}" >
		⏳ [[${durationdice}]] ${duration} 🤞</button>
		</div><br>`;
		} else {
			contentdata += `<div><h4>⏳ Duration:</h4>${duration}</div><br>`;
		}
		if (damage) {
			contentdata += `<div class="hide-button layout-hide"><h4>💥 Damage:</h4>
		<button class="re-roll-damage" data-idactor="${actor.id}" data-item-name="${itemName}" data-damage="${damage}" >
		💥 [[${damage}]] 🤞</button>
		</div><br>`;
		}
		if (healing) {
			contentdata += `<div class="hide-button layout-hide"><h4>💞 Healing:</h4>
		<button class="re-roll-healing" data-idactor="${actor.id}" data-item-name="${itemName}" data-healing="${healing}" >
		💞 [[${healing}]] 🤞</button>
		</div><br>`;
		}
		if (buffs) {
			contentdata += `<div><h4>🛡️ Buffs:</h4>${buffs}</div><br>`;
		}
		if (conditions) {
			contentdata += `<div><h4>💀 Conditions:</h4>${conditions}</div><br>`;
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
}
