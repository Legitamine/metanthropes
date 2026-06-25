/**
 * Applies updates to an Actor, provided the actorUUID and updateData
 ** If the user is GM or metaowner of the Actor, it proceeds to do the update.
 ** If not, it emits a socket message with the proper payload
 *todo validate and serialize data (is it required?)
 *todo this should also work for any type of document, not just actor documents, right?
 *todo edw na kanw return done/failed? kai na kanw try/catch otan to kanw call?
 *
 * @export
 * @async
 * @param {*} actorUUID
 * @param {*} updateData
 * @returns {unknown}
 */
export async function metaApplyActorUpdates(actorUUID, updateData) {
	const mL = metanthropes.utils.metaLog;
	const actor = await fromUuid(actorUUID);
	if (game.user.isActiveGM || actor.system?.metaowner?.value === game.user.name) {
		mL(
			3,
			"metaApplyActorUpdates",
			"User is the Active GM or owner of the Actor",
			"Applying Actor updates directly",
		);
		return await actor.update(updateData);
	}
	const requestID = foundry.utils.randomID();
	const payload = {
		action: "metaApplyActorUpdate",
		actorUUID: actorUUID,
		updateData: updateData,
		requestID: requestID,
		requesterID: game.user.id,
	};
	mL(
		3,
		"metaApplyActorUpdates",
		"User is NOT the Active GM or owner of the Actor",
		"Sending Server Socket Request with Payload & Awaiting Reply",
		payload,
	);
	//* We will now await a response for our payload and return as appropriate
	return new Promise((resolve, reject) => {
		const timeoutError = setTimeout(() => {
			game.socket.off("system.metanthropes", responseHandler);
			mL(3, "metaApplyActorUpdates", "Did NOT receive a Server response within 10sec", "Aborting Request");
			reject(new Error(`metaApplyActorUpdates timed out for ${actorUUID}`));
		}, 10000);
		const responseHandler = (response) => {
			if (response?.action !== "metaApplyActorUpdatesResult") return;
			if (response.requestID !== requestID) return;
			if (response.requesterID !== game.user.id) return;
			clearTimeout(timeoutError);
			game.socket.off("system.metanthropes", responseHandler);
			if (response.error) {
				mL(3, "metaApplyActorUpdates", "Received an Error in Server response", response.error);
				reject(new Error(response.error));
			} else {
				mL(3, "metaApplyActorUpdates", "Received Server Response", response.result);
				resolve(response.result ?? true);
			}
		};
		game.socket.on("system.metanthropes", responseHandler);
		game.socket.emit("system.metanthropes", payload);
	});
}
