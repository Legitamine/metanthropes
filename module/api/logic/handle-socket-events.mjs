export async function metaHandleSocketEvents(payload) {
	if (!game.user.isGM) return;
	metanthropes.utils.metaLog(3, "metaHandleSocketEvents", "Engaged with payload:", payload);
	if (payload.action === "metaApplyActorUpdate") {
		const actor = await fromUuid(payload.actorUUID);
		if (!actor) return;
		await actor.update(payload.updateData);
	}
}
