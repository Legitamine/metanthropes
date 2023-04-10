export async function PossessionUse(event) {
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const stat = button.dataset.stat;
	const statValue = parseInt(button.dataset.statValue);
	const itemname = button.dataset.itemname;
	const attacktype = button.dataset.attacktype;
	const effect = button.dataset.effect;
	const actor = game.actors.get(actorId);
	const targets = button.dataset.targets;
	const damage = button.dataset.damage;
	const conditions = button.dataset.conditions;
	//todo: utilize existing levels of success and spent levels of success
	// Create a chat message with the provided content
	let contentdata = null;
	let flavordata = null;
	// Check if activation was successfull
	const result = actor.getFlag("metanthropes-system", "posused");
	console.log("PossessionUse - result:", result);
	if (result.resultLevel <= 0) {
		flavordata = `<h3>Fails to use ${itemname}!</h3>`;
	} else {
		if (attacktype === "Melee") {
			flavordata = `<h3>Attacks with their ${itemname} with the following:</h3>`;
		} else if (attacktype === "Projectile") {
			flavordata = `<h3>Throws their ${itemname} with the following:</h3>`;
		} else if (attacktype === "Firearm") {
			flavordata = `<h3>Fires their ${itemname} with the following:</h3>`;
		} else {
			console.log("Metanthropes RPG - PossessionUse - Unknown attacktype: ", attacktype);
			flavordata = `<h3>Uses ${itemname} with the following:</h3>`;
		}
		if (effect) {
			contentdata = `<div><h3>Effect:</h3><br>${effect}</div>`;
		}
		contentdata += `<div><h3>🎯 Targets:</h3><br>${targets}</div>`;
		if (damage) {
			contentdata += `<div class="hide-button layout-hide"><h3>💥 Damage:</h3><br>
			<button class="re-roll-damage" data-actor-id="${actor.id}" data-itemname="${itemname}" data-damage="${damage}" >
			💥 [[${damage}]] 🤞</button>
			</div>`;
		}
		if (conditions) {
			contentdata += `<div><h3>💀 Conditions:</h3><br>${conditions}</div>`;
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
