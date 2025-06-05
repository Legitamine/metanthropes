export async function metaApplyActorUpdates(actorUUID, updateData) {
	if (game.user.isGM) {
		metanthropes.utils.metaLog(3, "metaApplyActorUpdates", "User is a GM");
		const actor = await fromUuid(actorUUID);
		return await actor.update(updateData);
	}
	metanthropes.utils.metaLog(4, "metaApplyActorUpdates", "User is not a GM, socket emit instead", actorUUID, updateData);
	return await game.socket.emit("system.metanthropes", {
		action: "metaApplyActorUpdate",
		actorUUID: actorUUID,
		updateData: updateData,
	});
}
