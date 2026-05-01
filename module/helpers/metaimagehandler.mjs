/**
 * todo this should be an Actor method instead
 * Core function to change the image of an actor or its token
 * @param {*} actor - Object of the actor
 * @param {string} imageDir - Directory for the image type (portraits/tokens)
 * @param {boolean} changeBoth - Flag to determine if both actor and token images should be changed
 * @param {boolean} useWildcard - Flag to determine if a wildcard image path should be used
 */
export async function metaUpdateActorImages({ actorUUID, changeBoth = true, useWildcard = false }) {
	const actor = await fromUuid(actorUUID);
	const imagePick = new metanthropes.applications.MetaImagePicker({
		selected: actor.img,
		imageRegistryType: "actors",
		imageFolder: actor.type.toLowerCase(),
		actorName: actor.name,
		actorUUID: actor.uuid,
	});
	imagePick.render(true);
}

/**
 * Updates the token images for an actor in each scene
 * @param {string} actorUUID - Actor's UUID
 * @param {string} selectedPath - Selected image path
 * @param {boolean} useWildcard - Flag to determine if a wildcard image path should be used * currently unused
 * todo wildcards should not use the full directory but the -01-02 versions instead?
 */
export async function metaUpdateTokenImages({ actorUUID, selectedPath, useWildcard = false }) {
	const actor = await fromUuid(actorUUID);
	metanthropes.utils.metaLog(
		3,
		"metaUpdateTokenImages",
		"actor, selection, useWildcard",
		actor,
		selectedPath,
		useWildcard,
	);
	//? Modify the selection path if using wildcard
	//todo review how we choose to enable wildcards
	const tokenImagePath = useWildcard ? `${selectedPath}/*` : selectedPath;

	//? Iterate over all the available Scenes
	for (const scene of game.scenes) {
		//? Find the tokens that represent the actor
		const tokensToUpdate = []; //? Reset the selections for each scene
		for (const token of scene.tokens.contents) {
			//? Add them to the Array
			if (token.actorId === actor.id) {
				tokensToUpdate.push({ _id: token.id, "texture.src": tokenImagePath });
			}
		}
		if (tokensToUpdate.length > 0) {
			try {
				await scene.updateEmbeddedDocuments("Token", tokensToUpdate);
			} catch (error) {
				metanthropes.utils.metaLog(
					2,
					"metaUpdateTokenImages",
					"Error updating token:",
					error,
					"tokens to update:",
					tokensToUpdate,
				);
			}
		}
	}

	//? Update the actor's prototype token image
	await actor.update({ "prototypeToken.texture.src": tokenImagePath });

	//? If called from the canvas, update only the current token
	if (!actor.prototypeToken) {
		const token = actor.token;
		await token.update({ "texture.src": tokenImagePath });
	}
}

/**
 * Returns the corresponsing top-down Token for a Portrait
 * Prefers Animated Tokens if available
 * Compatible with The Forge hosting service
 *
 * @async
 * @param {*} path
 * @returns {string} path
 */
export async function metaConvertPortraitToTokenImage(path) {
	//? Switch path
	const tokenPath = path.replace("/portraits/", "/tokens/");
	if (tokenPath === path) return path;
	//? Prefer Animated Tokens
	const animatedPath = tokenPath.replace(/\.webp$/i, ".webm");
	if (animatedPath === tokenPath) return tokenPath;
	const dir = animatedPath.split("/").slice(0, -1).join("/");
	try {
		//? The Forge compatibility
		let source;
		if (game.modules.get("forge-vtt")?.active) source = "forgevtt";
		else source = "data";
		try {
			const fpcheck = await foundry.applications.apps.FilePicker.browse(source, dir);
			return fpcheck.files?.includes(animatedPath) ? animatedPath : tokenPath;
		} catch (fperror) {
			metanthropes.utils.metaLog(
				2,
				"metaConvertPortraitToTokenImage",
				"path",
				path,
				"returned FP error",
				fperror,
				"Insted Returning tokenPath",
				tokenPath,
			);
			return tokenPath;
		}
	} catch (error) {
		metanthropes.utils.metaLog(
			4,
			"metaConvertPortraitToTokenImage",
			"No result from dir, animatedPath",
			dir,
			animatedPath,
			"FilePicker returned error",
			error,
		);
		return tokenPath;
	}
}
