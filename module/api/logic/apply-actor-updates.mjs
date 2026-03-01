/**
 * Applies updates to an actor, provided the actorUUID and updateData
 * If the user is GM it proceeds to do the update, if not, it emits a socket message
 * todo the game.user should also work in updating documents that isOwner(?), saving us some socket calls
 * ? this should also work for any type of document, not just actor documents, right?
 * ? edw na kanw return done/failed? kai na kanw try/catch otan to kanw call?
 *
 * @export
 * @async
 * @param {*} actorUUID
 * @param {*} updateData
 * @returns {unknown}
 */
export async function metaApplyActorUpdates(actorUUID, updateData) {
	const mL = metanthropes.utils.metaLog;
	if (game.user.isGM) {
		mL(3, "metaApplyActorUpdates", "User is a GM, applying updates directly");
		const actor = await fromUuid(actorUUID);
		return await actor.update(updateData);
	}
	mL(3, "metaApplyActorUpdates", "User is not a GM, socket emit instead", actorUUID, updateData);
	return await game.socket.emit("system.metanthropes", {
		action: "metaApplyActorUpdate",
		actorUUID: actorUUID,
		updateData: updateData,
	});
}
