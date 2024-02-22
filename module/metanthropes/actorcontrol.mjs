
//* Give Control of an Actor to a Player, to allow showing the chat buttons for rerolls and execution
export async function metaActorControl(actor) {
	const playerName = game.user.name;
	await actor.update({ "system.metaowner.value": playerName });
}
