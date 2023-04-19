export async function MetapowerActivate(event) {
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const stat = button.dataset.stat;
	const statValue = parseInt(button.dataset.statValue);
	const itemname = button.dataset.itemname;
	const effect = button.dataset.effect;
	const actor = game.actors.get(actorId);
	const targets = button.dataset.targets;
	const targetsdice = button.dataset.targetsdice;
	const duration = button.dataset.duration;
	const durationdice = button.dataset.durationdice;
	const damage = button.dataset.damage;
	const healing = button.dataset.healing;
	const buffs = button.dataset.buffs;
	const conditions = button.dataset.conditions;
	//todo: utilize existing levels of success and spent levels of success
	// Create a chat message with the provided content
	let contentdata = null;
	let flavordata = null;
	// Check if activation was successfull
	const result = actor.getFlag("metanthropes-system", "lastrolled");
	console.log("MetapowerActivate - result:", result);
	if (result.resultLevel <= 0) {
		flavordata = `<h3>Fails to Activate ${itemname}!</h3>`;
	} else {
		flavordata = `<h3>Activates ${itemname} with the following:</h3>`;
		contentdata = `<div><h4>Effect:</h4>${effect}</div><br>`;
		if (targetsdice) {
			contentdata += `<div class="hide-button layout-hide"><h4>🎯 Targets:</h4>
		<button class="re-roll-targets" data-actorId="${actor.id}" data-itemname="${itemname}" data-targetsdice="${targetsdice}" data-targets="${targets}" >
		🎯 [[${targetsdice}]] ${targets} 🤞</button>
		</div><br>`;
		} else {
			contentdata += `<div><h4>🎯 Targets:</h4>${targets}</div><br>`;
		}
		if (durationdice) {
			contentdata += `<div class="hide-button layout-hide"><h4>⏳ Duration:</h4>
		<button class="re-roll-duration" data-actorId="${actor.id}" data-itemname="${itemname}" data-durationdice="${durationdice}" data-duration="${duration}" >
		⏳ [[${durationdice}]] ${duration} 🤞</button>
		</div><br>`;
		} else {
			contentdata += `<div><h4>⏳ Duration:</h4>${duration}</div><br>`;
		}
		if (damage) {
			contentdata += `<div class="hide-button layout-hide"><h4>💥 Damage:</h4>
		<button class="re-roll-damage" data-actorId="${actor.id}" data-itemname="${itemname}" data-damage="${damage}" >
		💥 [[${damage}]] 🤞</button>
		</div><br>`;
		}
		if (healing) {
			contentdata += `<div class="hide-button layout-hide"><h4>💞 Healing:</h4>
		<button class="re-roll-healing" data-actorId="${actor.id}" data-itemname="${itemname}" data-healing="${healing}" >
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
		flags: { "metanthropes-system": { actorId: actor.id } },
	};
	// Send the message to chat
	ChatMessage.create(chatData);
}
