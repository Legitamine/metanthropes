
/**
 * todo this should be an Actor method instead
 * Core function to change the image of an actor or its token
 * @param {*} actor - Object of the actor
 * @param {string} imageDir - Directory for the image type (portraits/tokens)
 * @param {boolean} changeBoth - Flag to determine if both actor and token images should be changed
 * @param {boolean} useWildcard - Flag to determine if a wildcard image path should be used
 */
async function metaUpdateImage(actor, imageDir, changeBoth, useWildcard) {
	const actorType = actor.type.toLowerCase();
	const imagePick = new metanthropes.applications.MetaImagePicker({
		selected: actor.img,
		imageRegistryType: "actors",
		imageFolder: actorType,
		actorName: actor.name,
		actorUUID: actor.uuid,
		onSelect: async (path) => {
			if (!path)
				return metanthropes.utils.metaLog(
					2,
					"metaUpdateImage",
					"Not a valid path returned from MetaImagePicker",
					path,
				);
			if (changeBoth) {
				metanthropes.utils.metaLog(2, "metaUpdateImage", "changeBoth / path / useWildcard", path, useWildcard);
				await actor.update({ img: path });
				const updatedTokenImage = await convertPortraitToToken(path);
				await metaUpdateTokenImage(actor, updatedTokenImage, useWildcard);
			} else {
				metanthropes.utils.metaLog(
					2,
					"metaUpdateImage",
					"no changeBoth / path / useWildcard",
					imagePick.selected,
					useWildcard,
				);
				await metaUpdateTokenImage(actor, path, useWildcard);
			}
		},
	});
	imagePick.render(true);
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
async function convertPortraitToToken(path) {
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
		if (game.modules?.["forge-vtt"]?.active) source = "forge";
		else source = "data";
		try {
			const fpcheck = await foundry.applications.apps.FilePicker.browse(source, dir);
			return fpcheck.files?.includes(animatedPath) ? animatedPath : tokenPath;
		} catch (fperror) {
			metanthropes.utils.metaLog(
				2,
				"convertPortraitToToken",
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
			"convertPortraitToToken",
			"No result from dir, animatedPath",
			dir,
			animatedPath,
			"FilePicker returned error",
			error,
		);
		return tokenPath;
	}
}

/**
 * Updates the token images for an actor in each scene
 * @param {*} actor - Object of the actor
 * @param {string} selection - Selected image path
 * @param {boolean} useWildcard - Flag to determine if a wildcard image path should be used
 * todo wildcards should not use the full directory but the -01-02 versions instead?
 */
async function metaUpdateTokenImage(actor, selection, useWildcard) {
	metanthropes.utils.metaLog(
		3,
		"metaUpdateTokenImage",
		"actor, selection, useWildcard",
		actor,
		selection,
		useWildcard,
	);
	//? Modify the selection path if using wildcard
	//todo review how we choose to enable wildcards
	const tokenImagePath = useWildcard ? `${selection}/*` : selection;

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
					"metaUpdateTokenImage",
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
 * !deprecate
 * Helper function to change the image of an actor
 * @param {*} actor - Object of the actor
 * @param {boolean} useWildcard - Flag to determine if a wildcard image path should be used
 */
export async function metaChangeActorImage(actor, useWildcard = false) {
	const imageDir = "portraits";
	await metaUpdateImage(actor, imageDir, true, useWildcard);
}

/**
 * !deprecate
 * Helper function to change the token image of an actor
 * @param {*} actor - Object of the actor
 * @param {boolean} useWildcard - Flag to determine if a wildcard image path should be used
 */
export async function metaChangeTokenImage(actor, useWildcard = false) {
	const imageDir = "tokens";
	await metaUpdateImage(actor, imageDir, false, useWildcard);
}
