export async function NewPlayerReRoll(event) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE NEW PLAYER RE ROLL");
	console.log("=====+++++++======+++++++");
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const newvalue = button.dataset.newvalue;
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
			NewPlayer(actor, newvalue);
		}
	}
}
export async function NewPlayer(actor, newvalue) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE NEW PLAYER");
	console.log("=====+++++++======+++++++");
	// Create a chat message with the provided content
	let contentdata = `<div class="metanthropes hide-button layout-hide">
	<button class="new-player" data-actor-id="${actor.id}" data-newvalue="${newvalue}" >
	Primary [[3d10x10]] 🤞</button>
	</div>`;
	contentdata += `<div class="metanthropes hide-button layout-hide">
	<button class="new-player" data-actor-id="${actor.id}" data-newvalue="${newvalue}" >
	Secondary [[2d10x10]] 🤞</button>
	</div>`;
	contentdata += `<div class="metanthropes hide-button layout-hide">
	<button class="new-player" data-actor-id="${actor.id}" data-newvalue="${newvalue}" >
	Tertiary [[1d10x10]] 🤞</button>
	</div>`;
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: `<h3>Rolls for Starter ${newvalue}</h3>`,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentdata,
		flags: { "metanthropes-system": { actorId: actor.id } },
	};
	// Send the message to chat
	ChatMessage.create(chatData);
}
export async function NewPlayerReRoll(event) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE NEW PLAYER RE ROLL");
	console.log("=====+++++++======+++++++");
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const newvalue = button.dataset.newvalue;
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
			NewPlayer(actor, newvalue);
		}
	}
}
export async function NewPlayer(actor, newvalue) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE NEW PLAYER");
	console.log("=====+++++++======+++++++");
	// Create a chat message with the provided content
	let contentdata = `<div class="metanthropes hide-button layout-hide">
	<button class="new-player" data-actor-id="${actor.id}" data-newvalue="${newvalue}" >
	${newvalue} [[3d10x10]] 🤞</button>
	</div>`;
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: `<h3>Rolls for Starter ${newvalue}</h3>`,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentdata,
		flags: { "metanthropes-system": { actorId: actor.id } },
	};
	// Send the message to chat
	ChatMessage.create(chatData);
}