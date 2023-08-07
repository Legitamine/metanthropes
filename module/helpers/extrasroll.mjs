//* This is how we roll d10s
export async function Rolld10(actor, what, destinyreroll, dice) {
	//? This functions rolls a number of d10 and allow rerolls if destiny is set to 1
	//? destiny allows for rerolling the result by spending 1 Destiny Point
	//! thelw info apo bro gia to poia metapowers allazoune ta dice poy kaneis reroll gia na ta kanw include edw
	//! review CSS classes
	//? dice is the number of d10 to roll
	const rolld10 = await new Roll(`${dice}d10x10`).evaluate({ async: true });
	const total = rolld10.total;
	//* Message to be printed to chat
	let message = `${actor.name} rolls for ${what} with ${dice} * d10 and gets a total of ${total}. <br>`;
	//? if destiny is set to 1, allow rerolling the result by spending 1 Destiny Point
	if (destinyreroll === 1) {
		let currentDestiny = actor.system.Vital.Destiny.value;
		message += `<br>${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>
		<div class="hide-button hidden"><br><button class="rolld10-reroll" data-actoruuid="${actor.uuid}"
		data-what="${what}" data-destinyreroll="${destinyreroll}" data-dice="${dice}">Spend 🤞 Destiny to reroll
		</button><br><br></div>`;
	}
	await actor.setFlag("metanthropes-system", "lastrolled", {
		rolld10: total,
	});
	//print message to chat and enable Dice So Nice to roll the dice and display the message
	rolld10.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: message,
		rollMode: game.settings.get("core", "rollMode"),
		flags: { "metanthropes-system": { actoruuid: actor.uuid } },
	});
}
//* This is the function that is called when the destiny re-roll button is clicked
export async function Rolld10ReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actoruuid = button.dataset.actoruuid;
	const what = button.dataset.what;
	const destinyreroll = parseInt(button.dataset.destinyreroll);
	const dice = parseInt(button.dataset.dice);
	const actor = await fromUuid(actoruuid);
	let currentDestiny = actor.system.Vital.Destiny.value;
	// make this function only available to the owner of the actor
	if ((actor && actor.isOwner) || game.user.isGM) {
		// Reduce Destiny.value by 1
		if (currentDestiny > 0) {
			currentDestiny -= 1;
			await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
			//! Currently unused
			//? Update re-roll button visibility
			const message = game.messages.get(button.dataset.messageId);
			if (message) {
				message.render();
			}
			Rolld10(actor, what, destinyreroll, dice);
		}
	}
}
export async function ReRollTargets(event) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE RE ROLL TARGETS");
	console.log("=====+++++++======+++++++");
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.idactor;
	const itemname = button.dataset.itemname;
	const targetsdice = button.dataset.targetsdice;
	const targets = button.dataset.targets;
	const actor = game.actors.get(actorId);
	let currentDestiny = actor.system.Vital.Destiny.value;
	// make this function only available to the owner of the actor
	if ((actor && actor.isOwner) || game.user.isGM) {
		// Reduce Destiny.value by 1
		if (currentDestiny > 0) {
			currentDestiny -= 1;
			await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
			// Update re-roll button visibility
			const message = game.messages.get(button.dataset.messageId);
			if (message) {
				message.render();
			}
			RollTargets(actor, itemname, targetsdice, targets);
		}
	}
}
export async function RollTargets(actor, itemname, targetsdice, targets) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE ROLL TARGETS");
	console.log("=====+++++++======+++++++");
	// Create a chat message with the provided content
	let currentDestiny = actor.system.Vital.Destiny.value;
	let contentdata = `<div class="metanthropes hide-button layout-hide">
	<button class="re-roll-targets" data-idactor="${actor.id}" data-itemname="${itemname}" data-targetsdice="${targetsdice}" data-targets="${targets}" >
	🎯 [[${targetsdice}]] ${targets} 🤞</button>
	</div>
	<div>${actor.name} has ${currentDestiny} * 🤞 remaining.
	</div>
	`;
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: `<h3>Re-Rolls Targets for ${itemname}</h3>`,
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
	const actorId = button.dataset.idactor;
	const itemname = button.dataset.itemname;
	const durationdice = button.dataset.durationdice;
	const duration = button.dataset.duration;
	const actor = game.actors.get(actorId);
	let currentDestiny = actor.system.Vital.Destiny.value;
	// make this function only available to the owner of the actor
	if ((actor && actor.isOwner) || game.user.isGM) {
		// Reduce Destiny.value by 1
		if (currentDestiny > 0) {
			currentDestiny -= 1;
			await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
			// Update re-roll button visibility
			const message = game.messages.get(button.dataset.messageId);
			if (message) {
				message.render();
			}
			RollDuration(actor, itemname, durationdice, duration);
		}
	}
}
export async function RollDuration(actor, itemname, durationdice, duration) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE ROLL DURATION");
	console.log("=====+++++++======+++++++");
	// Create a chat message with the provided content
	let currentDestiny = actor.system.Vital.Destiny.value;
	let contentdata = `<div class="metanthropes hide-button layout-hide">
	<button class="re-roll-duration" data-idactor="${actor.id}" data-itemname="${itemname}" data-durationdice="${durationdice}" data-duration="${duration}" >
	⏳ [[${durationdice}]] ${duration} 🤞</button>
	</div>
	<div>${actor.name} has ${currentDestiny} * 🤞 remaining.
	</div>
	`;
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: `<h3>Re-Rolls Duration for ${itemname}</h3>`,
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
	const actorId = button.dataset.idactor;
	const itemname = button.dataset.itemname;
	const damage = button.dataset.damage;
	const damagedata = button.dataset.damagedata;
	const actor = game.actors.get(actorId);
	let currentDestiny = actor.system.Vital.Destiny.value;
	// make this function only available to the owner of the actor
	if ((actor && actor.isOwner) || game.user.isGM) {
		// Reduce Destiny.value by 1
		if (currentDestiny > 0) {
			currentDestiny -= 1;
			await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
			// Update re-roll button visibility
			const message = game.messages.get(button.dataset.messageId);
			if (message) {
				message.render();
			}
			RollDamage(actor, itemname, damage, damagedata);
		}
	}
}
export async function RollDamage(actor, itemname, damage, damagedata) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE ROLL DAMAGE");
	console.log("=====+++++++======+++++++");
	// Create a chat message with the provided content
	let currentDestiny = actor.system.Vital.Destiny.value;
	let contentdata = null;
	if (damagedata > 0) {
		contentdata = `<div class="metanthropes hide-button layout-hide">
	<button class="re-roll-damage" data-idactor="${actor.id}" data-itemname="${itemname}" data-damage="${damage}" data-damagedata="${damagedata}" >
	💥 [[${damagedata}+${damage}]] 🤞</button>
	</div>
	<div>${actor.name} has ${currentDestiny} * 🤞 remaining.
	</div>
	`;
	} else {
		contentdata = `<div class="metanthropes hide-button layout-hide">
		<button class="re-roll-damage" data-idactor="${actor.id}" data-itemname="${itemname}" data-damage="${damage}" >
		💥 [[${damage}]] 🤞</button>
		</div>
		<div>${actor.name} has ${currentDestiny} * 🤞 remaining.
		</div>
		`;
	}
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: `<h3>Re-Rolls Damage for ${itemname}</h3>`,
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
	const actorId = button.dataset.idactor;
	const itemname = button.dataset.itemname;
	const healing = button.dataset.healing;
	const actor = game.actors.get(actorId);
	let currentDestiny = actor.system.Vital.Destiny.value;
	// make this function only available to the owner of the actor
	if ((actor && actor.isOwner) || game.user.isGM) {
		// Reduce Destiny.value by 1
		if (currentDestiny > 0) {
			currentDestiny -= 1;
			await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
			// Update re-roll button visibility
			const message = game.messages.get(button.dataset.messageId);
			if (message) {
				message.render();
			}
			RollHealing(actor, itemname, healing);
		}
	}
}
export async function RollHealing(actor, itemname, healing) {
	console.log("=====+++++++======+++++++");
	console.log("INSIDE ROLL HEALING");
	console.log("=====+++++++======+++++++");
	// Create a chat message with the provided content
	let currentDestiny = actor.system.Vital.Destiny.value;
	let contentdata = `<div class="metanthropes hide-button layout-hide">
	<button class="re-roll-healing" data-idactor="${actor.id}" data-itemname="${itemname}" data-healing="${healing}" >
	💞 [[${healing}]] 🤞</button>
	</div>
	<div>${actor.name} has ${currentDestiny} * 🤞 remaining.
	</div>
	`;
	//send the activation message to chat
	let chatData = {
		user: game.user.id,
		flavor: `<h3>Re-Rolls Healing for ${itemname}</h3>`,
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: contentdata,
		flags: { "metanthropes-system": { actorId: actor.id } },
	};
	// Send the message to chat
	ChatMessage.create(chatData);
}
