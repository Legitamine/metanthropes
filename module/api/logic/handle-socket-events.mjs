export async function metaHandleSocketEvents(payload) {
	if (!game.user.isActiveGM) return;
	metanthropes.utils.metaLog(3, "metaHandleSocketEvents", "Engaged for payload:", payload);
	if (payload.action === "metaApplyActorUpdate") {
		const actor = await fromUuid(payload.actorUUID);
		if (!actor) return;
		await actor.update(payload.updateData);
	}
}
