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
	//todo: hide unecessary buttons and content
	//todo: create listener for buttons and functions to re-roll them - perhaps keep the same functions for the possessions later
	let contentdata = `<div>${effect}</div>`;
	if (buffs) {
		contentdata += `<div>${buffs}</div>`;
	}
	if (conditions) {
		contentdata += `<div>${conditions}</div>`;
	} 
	if (targetsdice) {
		contentdata += `<div>
		<button class="re-roll-targets" data-actor-id="${actor.id}" data-mpname="${mpname}" data-targetsdice="${targetsdice}" data-targets="${targets}" >
		🎯 [[${targetsdice}]] ${targets} 🤞</button>
		</div>`
	} else {
		contentdata += `<div>🎯 ${targets}</div>`
	}
	if (durationdice) {
		contentdata += `<div>
		<button class="metapower-duration-re-roll" data-actor-id="${actor.id}" data-mpname="${mpname}" data-durationdice="${durationdice}" data-duration="${duration}" >
		⏳ [[${durationdice}]] ${duration} 🤞</button>
		</div>`
	} else {
		contentdata += `<div>⏳ ${duration}</div>`
	}
	if (damage) {
		contentdata += `<div>
		<button class="metapower-damage-re-roll" data-actor-id="${actor.id}" data-mpname="${mpname}" data-damage="${damage}" >
		💥 [[${damage}]] 🤞</button>
		</div>`
	}
	if (healing) {
		contentdata += `<div>
		<button class="metapower-healing-re-roll" data-actor-id="${actor.id}" data-mpname="${mpname}" data-healing="${healing}" >
		💞 [[${healing}]] 🤞</button>
		</div>`
	}
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: `<h3>${actor.name} Activates ${mpname}</h3>`,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentdata,
	};
	// Send the message to chat
	ChatMessage.create(chatData);
}
export async function ReRollTargets(event) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE RE ROLL TARGETS");
	console.log("=====+++++++======+++++++");
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const mpname = button.dataset.mpname;
	const targetsdice = button.dataset.targetsdice;
	const targets = button.dataset.targets;
	const actor = game.actors.get(actorId);
	let currentDestiny = actor.system.Vital.Destiny.value;
	// make this function only available to the owner of the actor
	if (actor && actor.isOwner) {
		// Reduce Destiny.value by 1
		if (currentDestiny > 0) {
			currentDestiny -= 1;
			await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
			// Update re-roll button visibility
			const message = game.messages.get(button.dataset.messageId);
			if (message) {
				message.render();
			}
			RollTargets(actor, mpname, targetsdice, targets);
		}
	}
}
export async function RollTargets(actor, mpname, targetsdice, targets) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE ROLL TARGETS");
	console.log("=====+++++++======+++++++");
	// Roll the targets
	const targetsroll = new Roll(targetsdice).roll();
	// Create a chat message with the provided content
	let contentdata = `<div>
	<button class="re-roll-targets" data-actor-id="${actor.id}" data-mpname="${mpname}" data-targetsdice="${targetsdice}" data-targets="${targets}" >
	🎯 [[${targetsdice}]] ${targets} 🤞</button>
	</div>`;
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: `<h3>${actor.name} Rolls Targets for ${mpname}</h3>`,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentdata,
	};
	// Send the message to chat
	ChatMessage.create(chatData);
}
