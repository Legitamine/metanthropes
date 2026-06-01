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
		try {
			const actor = await fromUuid(payload.actorUUID);
			if (!actor) throw new Error(`Actor not found from UUID: ${payload.actorUUID}`);
			await actor.update(payload.updateData);
			const reply = {
				action: "metaApplyActorUpdatesResult",
				result: true,
				actorUUID: payload.actorUUID,
				requestID: payload.requestID,
				requesterID: payload.requesterID,
			};
			game.socket.emit("system.metanthropes", reply);
		} catch (error) {
			const reply = {
				action: "metaApplyActorUpdatesResult",
				result: false,
				actorUUID: payload.actorUUID,
				requestID: payload.requestID,
				requesterID: payload.requesterID,
				error: error?.message ?? String(error),
			};
			game.socket.emit("system.metanthropes", reply);
		}
	}
}
