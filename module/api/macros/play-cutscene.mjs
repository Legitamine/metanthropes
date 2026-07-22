/**
 * Narrator's Toolbox - Session Tools - Play Cutscene
 * 
 * Coordinates and synchronizes playback of a cinematic Cutscene.
 * Uses a Socket call to synchronize playback after all Clients have preloaded the Scene.
 * Returns to the previously active Scene after playback is finished.
 * todo log players ready --> self log, 0
 * todo show all players the loading bar
 *
 * @export
 * @async
 * @param {object} options
 * @property {string} cutsceneUUID - The Document UUID for the Scene which contains the cinematic.
 * @property {number} cutsceneDurationInSeconds - The duration of the cinematic in seconds.
 * @property {*} [preloadTimeout=60000] - Timeout after this ammount of time (default 1 minute) in milliseconds
 * @property {*} [buffer=1000] - Buffer to be added for playback (default 1 second) in milliseconds
 * @returns {*} 
 */
export async function playCutscene({
	cutsceneUUID,
	cutsceneDurationInSeconds,
	preloadTimeout = 60000, //? 1 minute
	buffer = 1000, //? 1 sec
}) {
	if (!game.user.isActiveGM) {
		return ui.notifications.warn(_loc("METANTHROPES.UI.NOTIFICATIONS.noActiveGM"));
	}
	const cutscene = await fromUuid(cutsceneUUID);
	if (!cutscene) return ui.notifications.error(`Could not find Cutscene with UUID: ${cutsceneUUID}`);
	const previousSceneUUID = game.scenes.current?.uuid ?? null;
	if (!previousSceneUUID || previousSceneUUID === cutsceneUUID) {
		return ui.notifications.error("Activate a different Scene before starting this macro.");
	}
	const previousScene = await fromUuid(previousSceneUUID);
	const requestID = foundry.utils.randomID();
	const expectedUserIDs = new Set(
		game.users
			.filter((user) => user.active) //? unfiltered will wait for all clients defined for the world, connected or not
			.map((user) => user.id),
	);
	const readyUserIDs = new Set();
	const failedUserIDs = new Map();
	const progressBar = ui.notifications.info("Loading Cutscene...", {
		progress: true,
		permanent: false,
	});
	let resolvePreload;
	const preloadPromise = new Promise((resolve) => {
		resolvePreload = resolve;
	});
	const timeoutPromise = new Promise((resolve) => {
		setTimeout(() => resolve({ timedOut: true }), preloadTimeout);
	});
	//todo review Migration flow and see if/how I could decouple the below and reuse it

	const updateProgressBar = () => {
		const answered = readyUserIDs.size + failedUserIDs.size;
		const total = expectedUserIDs.size;
		const pct = total > 0 ? answered / total : 1;
		progressBar.update({
			pct,
			message: `Loading Cutscene - ${cutscene.name}: ${answered}/${total}`,
		});
		if (answered >= total) {
			resolvePreload({ timedOut: false });
		}
	};

	const cutscenePlaybackHandler = (payload) => {
		if (payload.action !== "preloadCutsceneResult") return;
		if (payload.requestID !== requestID) return;
		if (payload.requesterID !== game.user.id) return;
		if (payload.result) {
			readyUserIDs.add(payload.userID);
		} else {
			failedUserIDs.set(payload.userID, payload.error ?? "Preload error");
		}
		updateProgressBar();
	};

	//* Call Clients to Preload the Cutscene
	game.socket.on("system.metanthropes", cutscenePlaybackHandler);
	try {
		game.socket.emit("system.metanthropes", {
			action: "preloadCutscene",
			requestID,
			requesterID: game.user.id,
			cutsceneUUID,
		});

		//? Handle preloading for the Active GM Client
		try {
			await foundry.canvas.TextureLoader.loadSceneTextures(cutscene);
			readyUserIDs.add(game.user.id);
		} catch (error) {
			failedUserIDs.set(game.user.id, error?.message ?? String(error));
		}
		updateProgressBar();

		//? Resolve when either promise resolves first
		const preloadResult = await Promise.race([preloadPromise, timeoutPromise]);

		//? Return early if we have failures or timedOut.
		if (failedUserIDs.size > 0 || preloadResult.timedOut) {
			game.socket.off("system.metanthropes", cutscenePlaybackHandler);
			if (failedUserIDs.size > 0) metanthropes.utils.metaLog(1, "playCutscene", "Some users failed to preload", failedUserIDs);
			return ui.notifications.error("Cutscene preload failed to complete. Aborting playback.");
		}

		//* Cutscene Playback
		progressBar.update({
			pct: 1,
			message: `Playing Cutscene: ${cutscene.name}`,
		});
		await cutscene.activate();
		await new Promise((resolve) => setTimeout(resolve, cutsceneDurationInSeconds * 1000 + buffer));
		await previousScene.activate();
	} catch (error) {
		metanthropes.utils.metaLog(1, "playCutscene", "Failed to trigger playback", error);
	} finally {
		game.socket.off("system.metanthropes", cutscenePlaybackHandler);
	}
}
