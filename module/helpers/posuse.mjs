export async function PossessionUse(actor, itemname, attacktype, effect, targets, damage, modifier, conditions) {
	//todo: perks integration
	// Create a chat message with the provided content
	const powerroll = actor.system.Characteristics.Body.Stats.Power.Roll;
	let contentdata = null;
	let flavordata = null;
	let damagedata = null;
	// Check if activation was successfull
	const result = actor.getFlag("metanthropes-system", "posused");
	console.log("PossessionUse - result:", result);
	if (result.resultLevel <= 0) {
		if (attacktype === "Melee") {
			flavordata = `<h3>Fails to attack with their ${itemname}!</h3>`;
		} else if (attacktype === "Projectile") {
			flavordata = `<h3>Throws their ${itemname} at the sky!</h3>`;
		} else if (attacktype === "Firearm") {
			flavordata = `<h3>Fires their ${itemname} and hits air!</h3>`;
		} else {
			console.log("Metanthropes RPG - PossessionUse - Unknown attacktype: ", attacktype);
			flavordata = `<h3>Fails to use ${itemname}!</h3>`;
		}
	} else {
		if (attacktype === "Melee") {
			flavordata = `<h3>Attacks with their ${itemname} with the following:</h3>`;
			if (modifier < 0) {
				//todo: need to add modifier size here to input in the damage calc
				damagedata = powerroll + modifier;
			} else {
				damagedata = powerroll;
			}
		} else if (attacktype === "Projectile") {
			flavordata = `<h3>Throws their ${itemname} with the following:</h3>`;
			damagedata = Math.ceil(powerroll / 2);
		} else if (attacktype === "Firearm") {
			flavordata = `<h3>Fires their ${itemname} with the following:</h3>`;
		} else {
			console.log("Metanthropes RPG - PossessionUse - Unknown attacktype: ", attacktype);
			flavordata = `<h3>Uses ${itemname} with the following:</h3>`;
		}
		if (effect) {
			contentdata = `<div><h4>Effect:</h4>${effect}</div><br>`;
		} else {
			contentdata = "";
		}
		contentdata += `<div><h4>🎯 Targets:</h4>${targets}</div><br>`;
		if (damage) {
			if (damagedata > 0) {
				contentdata += `<div class="hide-button layout-hide"><h4>💥 Damage:</h4>
			<button class="re-roll-damage" data-idactor="${actor.id}" data-itemname="${itemname}" data-damage="${damage}" data-damagedata="${damagedata}">
			💥 [[${damagedata}+${damage}]] 🤞</button>
			</div><br>`;
			} else {
				contentdata += `<div class="hide-button layout-hide"><h4>💥 Damage:</h4>
			<button class="re-roll-damage" data-idactor="${actor.id}" data-itemname="${itemname}" data-damage="${damage}" >
			💥 [[${damage}]] 🤞</button>
			</div><br>`;
			}
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
		flags: { "metanthropes-system": { actorId: actor.id } },
	};
	// Send the message to chat
	ChatMessage.create(chatData);
}
