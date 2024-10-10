import { metaFilePicker } from "../metaclasses/metaclasses.mjs";

/**
 * Helper function to change the image of an actor
 * @param {*} actor - Object of the actor
 * @param {boolean} useWildcard - Flag to determine if a wildcard image path should be used
 */
export async function metaChangeActorImage(actor, useWildcard = false) {
	const imageDir = "portraits";
	await metaUpdateImage(actor, imageDir, true, useWildcard);
}

/**
 * Helper function to change the token image of an actor
 * @param {*} actor - Object of the actor
 * @param {boolean} useWildcard - Flag to determine if a wildcard image path should be used
 */
export async function metaChangeTokenImage(actor, useWildcard = false) {
	const imageDir = "tokens";
	await metaUpdateImage(actor, imageDir, false, useWildcard);
}

/**
 * Core function to change the image of an actor or its token
 * @param {*} actor - Object of the actor
 * @param {string} imageDir - Directory for the image type (portraits/tokens)
 * @param {boolean} changeBoth - Flag to determine if both actor and token images should be changed
 * @param {boolean} useWildcard - Flag to determine if a wildcard image path should be used
 */
async function metaUpdateImage(actor, imageDir, changeBoth, useWildcard) {
	// Define the base directory
	let baseDir = "systems/metanthropes/artwork/actors/";

	// If using Metanthropes Introductory Module, change the base directory
	const intro = game.settings.get("metanthropes", "metaIntroductory");
	if (intro) {
		baseDir = "modules/metanthropes-introductory/artwork/actors/";
	}

	// Set the final directory based on the actor type
	const actorType = actor.type.toLowerCase();
	const finalDir = `${baseDir}${imageDir}/${actorType}/`;

	// Open the file picker
	const fp = new metaFilePicker({
		resource: "data",
		current: finalDir,
		displayMode: "tiles",
		callback: async (selection) => {
			if (changeBoth) {
				await actor.update({ img: selection });
				const tokenImagePath = convertPortraitToTokenPath(selection);
				await metaUpdateTokenImage(actor, tokenImagePath, useWildcard);
			} else {
				await metaUpdateTokenImage(actor, selection, useWildcard);
			}
		},
	});

	return fp.browse();
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
 * Update token images for an actor
 * @param {*} actor - Object of the actor
 * @param {string} selection - Selected image path
 * @param {boolean} useWildcard - Flag to determine if a wildcard image path should be used
 */
async function metaUpdateTokenImage(actor, selection, useWildcard) {
	const tokensToUpdate = [];

	// Modify the selection path if using wildcard
	const tokenImagePath = useWildcard ? `${selection}/*` : selection;

	// Update iterate over all scenes
	for (const scene of game.scenes) {
		// Find tokens that represent the actor
		for (const token of scene.tokens.contents) {
			if (token.actorId === actor.id) {
				tokensToUpdate.push({ _id: token.id, "texture.src": tokenImagePath });
			}
		}
	}

	// Update the tokens
	for (const scene of game.scenes) {
		if (tokensToUpdate.length > 0) {
			try {
				await scene.updateEmbeddedDocuments("Token", tokensToUpdate);
			} catch (error) {
				metanthropes.utils.metaLog(2, "metaUpdateTokenImage", "Error updating token:", error, "tokens to update:", tokensToUpdate);
			}
		}
	}

	// Update the actor's prototype token image
	await actor.update({ "prototypeToken.texture.src": tokenImagePath });

	// If called from the canvas, update only the current token
	if (!actor.prototypeToken) {
		const token = actor.token;
		await token.update({ "texture.src": tokenImagePath });
	}
}

// /**
//  *
//  * Helper function to change the portrait of an actor
//  * Presents a metaFilePicker Image browser to the user to select the image
//  * The browser opens up at a specific folder based on the actor type and modules installed
//  * This function places the selected image as the actor.img and picks up the related token image for the actor.prototypeToken.texture.src
//  * todo: configure a logic to handle non-linked tokens that will have wildcards in prototypeToken.texture.src
//  *
//  * @param {*} actor - Object of the actor
//  *
//  */
// export async function metaChangeActorImage(actor, image) {
// 	//? Define the variables
// 	let baseDir = "systems/metanthropes/artwork/actors/";
// 	let imageDir = null;
// 	let finalDir = baseDir + imageDir + "/";
// 	if (image !== "portrait" || image !== "token") {
// 		metanthropes.utils.metaLog(5, "metaChangeActorImage", "Error for image type of:", image, " - no such image type defined");
// 		return;
// 	}
// 	if (image === "portrait") {
// 		imageDir = "portraits";
// 	} else {
// 		imageDir = "tokens";
// 	}
// 	//? If using Metanthropes Introductory Module, change the current directory
// 	const intro = game.settings.get("metanthropes", "metaIntroductory");
// 	if (intro) {
// 		//todo: do a check if we want to default to introductory's artwork or not (leave it to system or core?)
// 		baseDir = "modules/metanthropes-introductory/artwork/actors/";
// 	}
// 	//todo: if running in demo mode, return with a notification
// 	const actorType = actor.type.toLowerCase();
// 	const currentDir = finalDir + actorType + "/";
// 	const fp = new metaFilePicker({
// 		resource: "data",
// 		current: currentDir,
// 		displayMode: "tiles",
// 		callback: async (selection) => {
// 			if (image === "portrait") {
// 				await actor.update({ img: selection });
// 			}
// 			const prototype = actor.prototypeToken || false;
// 			if (prototype) {
// 				//? Update Iterate over all scenes
// 				for (const scene of game.scenes) {
// 					let tokensToUpdate = [];
// 					//? Find tokens that represent the actor
// 					for (const token of scene.tokens.contents) {
// 						if (token.actorId === actor.id) {
// 							tokensToUpdate.push({ _id: token.id, "texture.src": selection });
// 						}
// 					}
// 					//? Update the tokens
// 					if (tokensToUpdate.length > 0) {
// 						try {
// 							await scene.updateEmbeddedDocuments("Token", tokensToUpdate);
// 						} catch (error) {
// 							metanthropes.utils.metaLog(
// 								2,
// 								"metaChangePortrait",
// 								"Error updating token:",
// 								error,
// 								"tokens to update:",
// 								tokensToUpdate
// 							);
// 						}
// 					}
// 				}
// 				await actor.update({ "prototypeToken.texture.src": selection });
// 			} else {
// 				//? Update only the current token if this was called from the canvas instead of the sidebar
// 				const token = actor.token;
// 				await token.update({ "texture.src": selection });
// 			}
// 		},
// 	});
// 	return fp.browse();
// }
