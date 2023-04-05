export async function MetapowerActivate(event) {
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const stat = button.dataset.stat;
	const statValue = parseInt(button.dataset.statValue);
	const resultLevel = button.dataset.resultLevel;
	const mpname = button.dataset.mpname;
	const destcost = parseInt(button.dataset.destcost);
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
	//todo: hide unecessary buttons and content
	//todo: create listener for buttons and functions to re-roll them - perhaps keep the same functions for the possessions later
	let chatData = {
		user: game.user.id,
		flavor: `<h3>${actor.name} Activates ${mpname}</h3>`,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: `
		<div>
		${effect}
		</div>
		<div>
		${buffs}
		</div>
		<div>
		${conditions}
		</div>
		<div>
		<button class="metapower-targets-re-roll" data-actor-id="${actor.id}" data-targetsdice="${targetsdice}" data-targets="${targets}" >
		🎯 [[${targetsdice}]] ${targets} 🤞</button>
		</div>
		<div>
		<button class="metapower-duration-re-roll" data-actor-id="${actor.id}" data-durationdice="${durationdice}" data-duration="${duration}" >
		⏳ [[${durationdice}]] ${duration} 🤞</button>
		</div>
		<div>
		<button class="metapower-damage-re-roll" data-actor-id="${actor.id}" data-damage="${damage}" >
		💥 [[${damage}]] 🤞</button>
		</div>
		<div>
		<button class="metapower-healing-re-roll" data-actor-id="${actor.id}" data-healing="${healing}" >
		💞 [[${healing}]] 🤞</button>
		</div>
		`,
	};
	// Send the message to chat
	ChatMessage.create(chatData);
}
