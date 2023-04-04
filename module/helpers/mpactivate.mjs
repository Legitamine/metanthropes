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
		flavor: "<h3>Metapower Activation - This is a long 3 text area tha should display properly<div>div test</div></h3>",
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: `<strong>${actor.name} activates ${mpname}:</strong> <div class="metanthropes layout-hide hide-button"><button class="metapower-re-roll" data-actor-id="${actor.id}" data-stat="${stat}" data-stat-value="${statValue}" data-modifier="${modifier}" data-bonus="${bonus}" data-penalty="${penalty}" data-mpname="${mpname}" data-destcost="${destcost}" data-effect="${effect}" >
		[[/roll ${effect}]]</button></div><div class="metanthropes layout-hide hide-button"><button class="metapower-re-roll" data-actor-id="${actor.id}" data-stat="${stat}" data-stat-value="${statValue}" data-modifier="${modifier}" data-bonus="${bonus}" data-penalty="${penalty}" data-mpname="${mpname}" data-destcost="${destcost}" data-effect="${effect}" >
		[/roll ${effect}]</button></div><div class="metanthropes layout-hide hide-button"><button class="metapower-re-roll" data-actor-id="${actor.id}" data-stat="${stat}" data-stat-value="${statValue}" data-modifier="${modifier}" data-bonus="${bonus}" data-penalty="${penalty}" data-mpname="${mpname}" data-destcost="${destcost}" data-effect="${effect}" >
		🤞 [[${effect}+10d4x4[elemental damage]]]</button></div>
		<div class="metanthropes layout-hide hide-button"><button class="metapower-re-roll" data-actor-id="${actor.id}" data-stat="${stat}" data-stat-value="${statValue}" data-modifier="${modifier}" data-bonus="${bonus}" data-penalty="${penalty}" data-mpname="${mpname}" data-destcost="${destcost}" data-effect="${effect}" >
		[[${effect}+10d4x4[elemental damage]]] 🤞</button></div><div class="metanthropes layout-hide hide-button"><button class="metapower-re-roll" data-actor-id="${actor.id}" data-stat="${stat}" data-stat-value="${statValue}" data-modifier="${modifier}" data-bonus="${bonus}" data-penalty="${penalty}" data-mpname="${mpname}" data-destcost="${destcost}" data-effect="${effect}" >
		[${effect}]</button></div>`,
	};

	// Send the message to chat
	ChatMessage.create(chatData);
}
