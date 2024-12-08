/**
 * metaPlaySoundEffect - A utility function to play a sound effect from a compendium.
 *
 * @export
 * @async
 * @param {string} sfxDocumentID - the document id of the playlist
 * @returns {unknown}
 */
export async function metaPlaySoundEffect(sfxDocumentID) {
	//? Get the Sound Effect Compendium
	const sfx = await fromUuid(sfxDocumentID);
	if (!(sfx instanceof PlaylistSound)) {
		return ui.notifications.error("Did not find a valid Sound Effect from a Playlist");
	}
	//? Play the sound
	metanthropes.utils.metaLog(3, "metaPlaySoundEffect", "Playing Sound Effect:", sfx.name);
	await foundry.audio.AudioHelper.play({ src: sfx.path, volume: 0.8, autoplay: true, loop: false }, true);
}
