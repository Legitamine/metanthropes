/**
 * Handles Metanthropes Socket Events
 *
 * Execution is based on the payload.action defined
 *
 * @export
 * @async
 * @param {object} payload
 * @returns {*}
 */
export async function metaHandleSocketEvents(payload) {
	//* Things that happen for everyone
	if (!game.ready) return; //? Required for the Network Logging, might as well have it here.

	//* Play VFX * EXPERIMENTAL
	if (payload.action === "metaPlayVFX") {
		const vfxData = payload.vfxData;
		metanthropes.utils.metaLog(3, "metaHandleSocketEvents", "Triggering VFX with vfxData", vfxData);
		try {
			await metanthropes.vfx.metaVFX(vfxData);
		} catch (error) {
			metanthropes.utils.metaLog(5, "metaHandleSocketEvents", "VFX Failed with error", error);
		}
		return;
	}

	//* Cutscene playback
	if (payload.action === "preloadCutscene") {
		try {
			if (payload.requesterID === game.user.id) return; //? so the GM client returns early
			const cutscene = await fromUuid(payload.cutsceneUUID);
			if (!cutscene) throw new Error(`Cutscene scene not found from UUID: ${payload.cutsceneUUID}`);
			await foundry.canvas.TextureLoader.loadSceneTextures(cutscene);
			game.socket.emit("system.metanthropes", {
				action: "preloadCutsceneResult",
				requestID: payload.requestID,
				requesterID: payload.requesterID,
				userID: game.user.id,
				result: true,
			});
			metanthropes.utils.metaLog(0, "Cutscene Loading Complete");
		} catch (error) {
			game.socket.emit("system.metanthropes", {
				action: "preloadCutsceneResult",
				requestID: payload.requestID,
				requesterID: payload.requesterID,
				userID: game.user.id,
				result: false,
				error: error?.message ?? String(error),
			});
			metanthropes.utils.metaLog(1, "Cutscene Loading Encountered an Error", error?.message ?? String(error));
		}
		return;
	}

	//* Switch Scene Background
	if (payload.action === "refreshSceneBackground") {
		const currentScene = canvas.scene;
		if (!currentScene) return;
		if (!payload.sceneUUIDs.includes(currentScene.uuid)) return;
		await canvas.draw(currentScene);
		return;
	}

	//* Things that should only happen on the Active GM's client
	if (!game.user.isActiveGM) return;
	// metanthropes.utils.metaLog(3, "metaHandleSocketEvents", "Engaged for payload:", payload);

	//* Network Logging
	if (payload.action === "metaNetLog") {
		let netLogObjects = null;
		let logFunction = console.log;
		switch (payload.logType) {
			case 1:
			case 4:
				logFunction = console.warn;
				break;
			case 2:
			case 5:
				logFunction = console.error;
				break;
		}
		try {
			netLogObjects = JSON.parse(payload.logObjects);
		} catch (error) {
			netLogObjects = payload.logObjects;
		}
		const networkMessage = payload.message.replace(
			/^%cMetanthropes/,
			`%cMetanthropes NetLog | ${payload.playerName}`,
		);
		logFunction(networkMessage, ...payload.styles, ...netLogObjects);
		return;
	}

	//* Apply Actor Updates
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
		return;
	}
}
