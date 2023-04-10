export async function MetapowerActivate(event) {
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const stat = button.dataset.stat;
	const statValue = parseInt(button.dataset.statValue);
	const mpname = button.dataset.mpname;
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
		flavordata = `<h3>Fails to Activate ${mpname}!</h3>`;
	} else {
		flavordata = `<h3>Activates ${mpname} with the following:</h3>`;
		contentdata = `<div><h3>Effect:</h3><br>${effect}</div>`;
		if (targetsdice) {
			contentdata += `<div class="hide-button layout-hide"><h3>🎯 Targets:</h3><br>
		<button class="re-roll-targets" data-actor-id="${actor.id}" data-mpname="${mpname}" data-targetsdice="${targetsdice}" data-targets="${targets}" >
		🎯 [[${targetsdice}]] ${targets} 🤞</button>
		</div>`;
		} else {
			contentdata += `<div><h3>🎯 Targets:</h3><br>${targets}</div>`;
		}
		if (durationdice) {
			contentdata += `<div class="hide-button layout-hide"><h3>⏳ Duration:</h3><br>
		<button class="re-roll-duration" data-actor-id="${actor.id}" data-mpname="${mpname}" data-durationdice="${durationdice}" data-duration="${duration}" >
		⏳ [[${durationdice}]] ${duration} 🤞</button>
		</div>`;
		} else {
			contentdata += `<div><h3>⏳ Duration:</h3><br>${duration}</div>`;
		}
		if (damage) {
			contentdata += `<div class="hide-button layout-hide"><h3>💥 Damage:</h3><br>
		<button class="re-roll-damage" data-actor-id="${actor.id}" data-mpname="${mpname}" data-damage="${damage}" >
		💥 [[${damage}]] 🤞</button>
		</div>`;
		}
		if (healing) {
			contentdata += `<div class="hide-button layout-hide"><h3>💞 Healing:</h3><br>
		<button class="re-roll-healing" data-actor-id="${actor.id}" data-mpname="${mpname}" data-healing="${healing}" >
		💞 [[${healing}]] 🤞</button>
		</div>`;
		}
		if (buffs) {
			contentdata += `<div><h3>🛡️ Buffs:</h3><br>${buffs}</div>`;
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
