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
				const tokenImagePath = convertPortraitToTokenPath(path);
				await metaUpdateTokenImage(actor, tokenImagePath, useWildcard);
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
	imagePick.render({ force: true }); //todo test without force
	const path = await imagePick.result;
	metanthropes.utils.metaLog(2, "metaUpdateImage", "onSelect", "new path", path);
	//todo merge the callback after reviewing the metaUpdateTokenImage and convertPortraitToTokenPath

	//?I get the new image path here for the Actor, need to update the top-down token accordingly
	// if (!imagePick.selected) return metanthropes.utils.metaLog(2, "metaUpdateImage", "Not a valid path returned from MetaImagePicker", imagePick);
	// if (changeBoth) {
	// 	metanthropes.utils.metaLog(2, "metaUpdateImage", "changeBoth / path / useWildcard", imagePick.selected, useWildcard);
	// 	await actor.update({ img: imagePick.selected });
	// 	const tokenImagePath = convertPortraitToTokenPath(imagePick.selected);
	// 	await metaUpdateTokenImage(actor, tokenImagePath, useWildcard);
	// } else {
	// 	metanthropes.utils.metaLog(2, "metaUpdateImage", "no changeBoth / path / useWildcard", imagePick.selected, useWildcard);
	// 	await metaUpdateTokenImage(actor, imagePick.selected, useWildcard);
	// }

	//todo we want to have a 'virtual' directory where we show all available actors for that species/type
	//todo needs to grab all active modules that can provide such assets and combine them
	// let baseDir = "systems/metanthropes/assets/artwork/actors/";

	// //? If using the Metanthropes: Introductory Module features, change the base directory
	// const intro = game.settings.get("metanthropes", "metaIntroductory");
	// if (intro) {
	// 	baseDir = "modules/metanthropes-introductory/assets/artwork/actors/";
	// }

	// //? Set the final directory based on the actor type
	// //todo replace the 'actorType' with the new 'species'
	// const finalDir = `${baseDir}${imageDir}/${actorType}/`;

	// //? File picker configuration
	// //todo set a flag on the actor so we show the virtual folder once?
	// const fp = new foundry.applications.apps.FilePicker.implementation({
	// 	resource: "data",
	// 	current: finalDir,
	// 	displayMode: "tiles",
	// 	callback: async (selection) => {
	// 		if (changeBoth) {
	// 			await actor.update({ img: selection });
	// 			const tokenImagePath = convertPortraitToTokenPath(selection);
	// 			await metaUpdateTokenImage(actor, tokenImagePath, useWildcard);
	// 		} else {
	// 			await metaUpdateTokenImage(actor, selection, useWildcard);
	// 		}
	// 	},
	// });

	// return fp.browse();
}

/**
 * Convert a portrait image path to a token image path
 * @param {string} portraitPath - The portrait image path
 * @returns {string} The token image path
 */
function convertPortraitToTokenPath(portraitPath) {
	return portraitPath.replace("/portraits/", "/tokens/");
}

/**
 * Updates the token images for an actor in each scene
 * @param {*} actor - Object of the actor
 * @param {string} selection - Selected image path
 * @param {boolean} useWildcard - Flag to determine if a wildcard image path should be used
 * ! wildcards should not use the full directory but the -01-02 versions instead?
 */
async function metaUpdateTokenImage(actor, selection, useWildcard) {
	metanthropes.utils.metaLog(3, "metaUpdateTokenImage", actor, selection, useWildcard);
	//? Modify the selection path if using wildcard
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
