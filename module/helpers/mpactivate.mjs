export async function MetapowerActivate(event) {
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.actorId;
	const stat = button.dataset.stat;
	const statValue = parseInt(button.dataset.statValue);
	const modifier = parseInt(button.dataset.modifier);
	const bonus = parseInt(button.dataset.bonus);
	const penalty = parseInt(button.dataset.penalty);
	const mpname = button.dataset.mpname;
	const destcost = parseInt(button.dataset.destcost);
	const effect = button.dataset.effect;
	const actor = game.actors.get(actorId);
	// Create a chat message with the provided content
	let chatData = {
		user: game.user.id,
		flavor: "<h1>Metapower Activation - 1</h1><br><h2>Metapower Activation - 2</h2><br><h3>Metapower Activation - 3</h3><br><h4>Metapower Activation - 4</h4><br><h5>Metapower Activation - 5</h5><br><h6>Metapower Activation - 6</h6><br>",
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: `<strong>${actor.name} activates ${mpname}:</strong> <div class="metanthropes layout-hide hide-button"><button class="metapower-re-roll" data-actor-id="${actor.id}" data-stat="${stat}" data-stat-value="${statValue}" data-modifier="${modifier}" data-bonus="${bonus}" data-penalty="${penalty}" data-mpname="${mpname}" data-destcost="${destcost}" data-effect="${effect}" >
		[[/roll ${effect}]]</button></div>`,
	};

	// Send the message to chat
	ChatMessage.create(chatData);
}
