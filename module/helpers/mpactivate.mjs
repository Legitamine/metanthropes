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
	// Create a chat message with the provided content
	//todo: check if activation was successfull
	//todo: utilize existing levels of success
	let contentdata = `<div>With the following Effect:<br>${effect}</div>`;
	if (buffs) {
		contentdata += `<div>With the following 🛡️ Buffs:<br>${buffs}</div>`;
	}
	if (conditions) {
		contentdata += `<div>With the following 💀 Conditions:<br>${conditions}</div>`;
	}
	if (targetsdice) {
		contentdata += `<div class="metanthropes hide-button layout-hide">
		<button class="re-roll-targets" data-actor-id="${actor.id}" data-mpname="${mpname}" data-targetsdice="${targetsdice}" data-targets="${targets}" >
		🎯 [[${targetsdice}]] ${targets} 🤞</button>
		</div>`;
	} else {
		contentdata += `<div>🎯 ${targets}</div>`;
	}
	if (durationdice) {
		contentdata += `<div class="metanthropes hide-button layout-hide">
		<button class="re-roll-duration" data-actor-id="${actor.id}" data-mpname="${mpname}" data-durationdice="${durationdice}" data-duration="${duration}" >
		⏳ [[${durationdice}]] ${duration} 🤞</button>
		</div>`;
	} else {
		contentdata += `<div>⏳ ${duration}</div>`;
	}
	if (damage) {
		contentdata += `<div class="metanthropes hide-button layout-hide">
		<button class="re-roll-damage" data-actor-id="${actor.id}" data-mpname="${mpname}" data-damage="${damage}" >
		💥 [[${damage}]] 🤞</button>
		</div>`;
	}
	if (healing) {
		contentdata += `<div class="metanthropes hide-button layout-hide">
		<button class="re-roll-healing" data-actor-id="${actor.id}" data-mpname="${mpname}" data-healing="${healing}" >
		💞 [[${healing}]] 🤞</button>
		</div>`;
	}
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: `Activates ${mpname}</h3>`,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentdata,
		flags: { "metanthropes-system": { actorId: actor.id } },
	};
	// Send the message to chat
	ChatMessage.create(chatData);
}
