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
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		content: `<strong>${actor.name} activates ${mpname}:</strong> ${effect}`,
	};

	// Send the message to chat
	ChatMessage.create(chatData);
}
