export async function metaHandleSocketEvents(payload) {
	//* Things that happen for everyone
	if (payload.action === "metaPlayVFX") {
		const vfxData = payload.vfxData;
		metanthropes.utils.metaLog(3, "metaHandleSocketEvents", "Triggering VFX with vfxData", vfxData);
		try {
			await metanthropes.vfx.metaVFX(vfxData);
		} catch (error) {
			metanthropes.utils.metaLog(5, "metaHandleSocketEvents", "VFX Failed with error", error);
		}
	}
	//* Things that should only happen on the Active GM's client
	if (!game.user.isActiveGM) return;
	metanthropes.utils.metaLog(3, "metaHandleSocketEvents", "Engaged for payload:", payload);
	if (payload.action === "metaApplyActorUpdate") {
		const actor = await fromUuid(payload.actorUUID);
		if (!actor) return;
		await actor.update(payload.updateData);
	}
}
