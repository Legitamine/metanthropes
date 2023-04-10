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
	// Create a chat message with the provided content
	let contentdata = `<div class="metanthropes hide-button layout-hide">
	<button class="re-roll-targets" data-actor-id="${actor.id}" data-mpname="${mpname}" data-targetsdice="${targetsdice}" data-targets="${targets}" >
	🎯 [[${targetsdice}]] ${targets} 🤞</button>
	</div>`;
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: `<h3>Re-Rolls Targets for ${mpname}</h3>`,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentdata,
		flags: { "metanthropes-system": { actorId: actor.id } },
	};
	// Send the message to chat
	ChatMessage.create(chatData);
}
export async function ReRollDuration(event) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE RE ROLL DURATION");
	console.log("=====+++++++======+++++++");
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const mpname = button.dataset.mpname;
	const durationdice = button.dataset.durationdice;
	const duration = button.dataset.duration;
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
			RollDuration(actor, mpname, durationdice, duration);
		}
	}
}
export async function RollDuration(actor, mpname, durationdice, duration) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE ROLL DURATION");
	console.log("=====+++++++======+++++++");
	// Create a chat message with the provided content
	let contentdata = `<div class="metanthropes hide-button layout-hide">
	<button class="re-roll-duration" data-actor-id="${actor.id}" data-mpname="${mpname}" data-durationdice="${durationdice}" data-duration="${duration}" >
	⏳ [[${durationdice}]] ${duration} 🤞</button>
	</div>`;
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: `<h3>Re-Rolls Duration for ${mpname}</h3>`,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentdata,
		flags: { "metanthropes-system": { actorId: actor.id } },
	};
	// Send the message to chat
	ChatMessage.create(chatData);
}
export async function ReRollDamage(event) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE RE ROLL DAMAGE");
	console.log("=====+++++++======+++++++");
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const mpname = button.dataset.mpname;
	const damage = button.dataset.damage;
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
			RollDamage(actor, mpname, damage);
		}
	}
}
export async function RollDamage(actor, mpname, damage) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE ROLL DAMAGE");
	console.log("=====+++++++======+++++++");
	// Create a chat message with the provided content
	let contentdata = `<div class="metanthropes hide-button layout-hide">
	<button class="re-roll-damage" data-actor-id="${actor.id}" data-mpname="${mpname}" data-damage="${damage}" >
	💥 [[${damage}]] 🤞</button>
	</div>`;
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: `<h3>Re-Rolls Damage for ${mpname}</h3>`,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentdata,
		flags: { "metanthropes-system": { actorId: actor.id } },
	};
	// Send the message to chat
	ChatMessage.create(chatData);
}
export async function ReRollHealing(event) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE RE ROLL HEALING");
	console.log("=====+++++++======+++++++");
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const mpname = button.dataset.mpname;
	const healing = button.dataset.healing;
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
			RollHealing(actor, mpname, healing);
		}
	}
}
export async function RollHealing(actor, mpname, healing) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE ROLL HEALING");
	console.log("=====+++++++======+++++++");
	// Create a chat message with the provided content
	let contentdata = `<div class="metanthropes hide-button layout-hide">
	<button class="re-roll-healing" data-actor-id="${actor.id}" data-mpname="${mpname}" data-healing="${healing}" >
	💞 [[${healing}]] 🤞</button>
	</div>`;
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: `<h3>Re-Rolls Healing for ${mpname}</h3>`,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentdata,
		flags: { "metanthropes-system": { actorId: actor.id } },
	};
	// Send the message to chat
	ChatMessage.create(chatData);
}