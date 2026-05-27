const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Metanthropes Image Picker - Allows to browse Images from multiple folders & sets corresponding top-down Token accordingly
 * * Allows other supported Modules to extend the available options for each Type of Actor
 * * Compatible with The Forge hosting service (test pending)
 * * Compatible with the Tokenizer Module (test pending)
 * * Applies the respective top-down Token to all respective Tokens across Scenes
 * * Prefers to use an Animated Token if available.
 *todo Utilizes the metanthropes.registry - read how to use it in your own modules [here](tbd)
 *todo is this going to be also used in non-Actor scenarios?
 *!todo utilize the 'enabled' content from modules - or remove to declutter the Settings UI
 *todo wildcard selection, limits only to those who have more than 01
 *todo revise how we do wildcards, we should we control it
 *todo when returning an animated token, set the correct scale
 *
 * @export
 * @class MetaImagePicker
 * @typedef {MetaImagePicker}
 * @extends {HandlebarsApplicationMixin(ApplicationV2)}
 */
export class MetaImagePicker extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		id: "metanthropes-image-picker",
		classes: ["metanthropes", "image-picker"],
		tag: "form",
		position: {
			width: 960,
			height: 720,
		},
		window: {
			title: "METANTHROPES.UI.APPS.META_IMAGE_PICKER.Title",
			resizable: true,
			//frame: false, //todo how to make it full screen?
		},
		actions: {
			selectImage: this.#onSelectImage,
			editImage: this.#onEditImage,
		},
	};

	static PARTS = {
		main: {
			template: "systems/metanthropes/templates/apps/image-picker.hbs",
		},
	};

	constructor(options = {}) {
		super(options);
		this.selected = options.selected ?? null;
		this.imageRegistryType = options.imageRegistryType ?? null;
		this.imageFolder = options.imageFolder ?? null;
		this.actorName = options.actorName ?? null;
		this.actorUUID = options.actorUUID ?? null;
		this.wildcard = options.wildcard ?? null;
		this.appendNumber = options.appendNumber ?? null;
		this.prependAdjective = options.prependAdjective ?? null;
	}
	//todo to actor link pws ginetai control swsta apo to API otan kapoios to kanei call via macro ?

	//* Form Interactions
	//todo refactor to do actor update once at the end
	async _onChangeForm(formConfig, event) {
		super._onChangeForm(formConfig, event);
		const input = event.target;
		switch (input.name) {
			case "wildcard":
				this.wildcard = input.checked;
				const wildcardActor = await fromUuid(this.actorUUID);
				let updates = { "prototypeToken.randomImg": input.checked };
				if (input.checked) updates = { ...updates, "prototypeToken.actorLink": false };
				else updates = { ...updates, "prototypeToken.actorLink": true };
				await wildcardActor.update(updates);
				metanthropes.utils.metaLog(3, "MetaImagePicker", "Wildcard", wildcardActor.name, this.wildcard);
				//!design: yparxei periptwsi na exw linked actor multiple times me wildcard tokens on the field?
				//!design: isws einai thema tou otan ginetai drop enas actor sto canvas check poy na doume pio meta?
				this.render(true);
				break;
			case "appendNumber":
				this.appendNumber = input.checked;
				const appendActor = await fromUuid(this.actorUUID);
				await appendActor.update({ "prototypeToken.appendNumber": input.checked });
				break;
			case "prependAdjective":
				this.prependAdjective = input.checked;
				const prependActor = await fromUuid(this.actorUUID);
				await prependActor.update({ "prototypeToken.prependAdjective": input.checked });
				break;
			default:
				return;
		}
	}

	async _prepareContext(options) {
		//super._prepareContext(options); //todo do we need to call super? review the default appv2 section.
		//todo seems relevant for custom tabs?
		const paths = await this.#collectPaths(this.imageRegistryType, this.imageFolder);
		const actor = await fromUuid(`${this.actorUUID}`);
		this.wildcard = actor.prototypeToken.randomImg; //todo what if there is no actor returned?
		this.appendNumber = actor.prototypeToken.appendNumber;
		this.prependAdjective = actor.prototypeToken.prependAdjective;
		this.actorLink = actor.prototypeToken.actorLink;
		return {
			isNarrator: game.user.isGM,
			canUseFilePicker: game.user.can("FILES_BROWSE"),
			isUntrustedUser: Boolean(game.user.role === 1),
			isTrustedUser: Boolean(game.user.role > 1),
			paths: paths,
			selected: this.selected,
			imageRegistryType: this.imageRegistryType,
			imageFolder: this.imageFolder,
			hasImages: paths.some((group) => group.images.length),
			actorName: this.actorName,
			actorUUID: this.actorUUID,
			tokenizer: game.modules.get("vtta-tokenizer")?.active,
			isWildcard: this.wildcard,
			isToken: actor.token,
			appendNumber: this.appendNumber,
			prependAdjective: this.prependAdjective,
			actorLink: this.actorLink,
		};
	}

	//* Applies the new Image for the Actor and the Tokens
	static async #onSelectImage(event, target) {
		const path = target.dataset.path;
		if (!path)
			return metanthropes.utils.metaLog(
				2,
				"MetaImagePicker",
				"#onSelectImage",
				"Could not work with path",
				path,
				"Aborting",
			);
		this.selected = path;
		metanthropes.utils.metaLog(3, "MetaImagePicker", "#onSelectImage", "Selected path", path);
		const actor = await fromUuid(this.actorUUID);
		//todo wildcard intel here, needs to pass along to below
		// const updatedTokenImage = await metanthropes.utils.metaConvertPortraitToTokenImage(path);
		const updatedTokenImage = await this.selectTokenImage(path, this.wildcard);
		const selectedTokenImage = await this.selectTokenImage(path, false);

		//? If called from the canvas (updating a Token), update only the current token on that scene, don't iterate over all Scenes/Tokens
		if (actor.isToken) { //todo den einai swsto ayto edw, kati allo paizei, mallon prepei na vriskw tou token to id anti gia tou actor?
			metanthropes.utils.metaLog(
				3,
				"MetaImagePicker",
				"#onSelectImage",
				"Engaged for a Token",
				"Updating Token Image to",
				selectedTokenImage,
			);
			const token = actor.token;
			await token.update({ "texture.src": selectedTokenImage });
		} else {
			//? Not a Token, so we should update the Actor
			const actorUpdates = {
				img: path,
				"prototypeToken.texture.src": updatedTokenImage,
				"prototypeToken.randomImg": this.wildcard,
			};
			metanthropes.utils.metaLog(3, "MetaImagePicker", "#onSelectImage", "Pushing Actor Updates", actorUpdates);
			await actor.update(actorUpdates);
			//? Iterate over all the available Scenes, updating each Token with the corresponding Top-Down Selected Image
			for (const scene of game.scenes) {
				//? Find the tokens that represent the actor
				const tokensToUpdate = []; //? Reset the selections for each scene
				for (const token of scene.tokens.contents) {
					//? Add them to the Array
					if (token.actorId === actor.id) {
						tokensToUpdate.push({ _id: token.id, "texture.src": selectedTokenImage });
					}
				}
				if (tokensToUpdate.length > 0) {
					try {
						metanthropes.utils.metaLog(
							3,
							"MetaImagePicker",
							"#onSelectImage",
							"Updating Tokens",
							tokensToUpdate,
						);
						await scene.updateEmbeddedDocuments("Token", tokensToUpdate);
					} catch (error) {
						metanthropes.utils.metaLog(
							2,
							"MetaImagePicker",
							"#onSelectImage",
							"Error updating token:",
							error,
							"tokens to update:",
							tokensToUpdate,
						);
					}
				}
			}
		}

		// await metanthropes.utils.metaUpdateTokenImages({ actorUUID: actor.uuid, selectedPath: updatedTokenImage });
		// await this.updateTokenImage();
		await this.close();
	}

	static async #onEditImage(event, target) {
		//? from example https://foundryvtt.wiki/en/development/guides/applicationV2-conversion-guide
		const field = target.dataset.field || "img";
		const actor = await fromUuid(target.dataset.actorId);
		const current = foundry.utils.getProperty(actor.document, field);
		let source;
		let fp;
		//? The Forge compatibility
		if (game.modules.get("forge-vtt")?.active) {
			source = "forgevtt";
			fp = ForgeVTT_FilePicker;
		} else {
			source = "data";
			fp = foundry.applications.apps.FilePicker;
		}
		const imageEditor = new fp({
			type: "image",
			current: current,
			callback: async (path) => {
				await actor.update({ [field]: path });
				await this.close();
			},
		});
		imageEditor.render(true);
	}

	//todo ? why can't I declare it as #? Why would I want/need to do it this way and what should I be using?
	//* Returns an appropriate path for the Token Image
	async selectTokenImage(path, wildcard) {
		//* Switch to Token path
		let tokenPath = path.replace("/portraits/", "/tokens/");
		if (tokenPath === path) return path;
		//* Check for wildcard
		if (wildcard) tokenPath = tokenPath.replace(/-\d+\.webp$/i, "-*.webp");
		//* Prefer Animated Tokens
		const animatedPath = tokenPath.replace(/\.webp$/i, ".webm");
		if (animatedPath === tokenPath) return tokenPath;
		const dir = animatedPath.split("/").slice(0, -1).join("/");
		try {
			//? The Forge compatibility
			let fp;
			let source;
			if (game.modules.get("forge-vtt")?.active) {
				source = "forgevtt";
				fp = ForgeVTT_FilePicker;
			} else {
				source = "data";
				fp = foundry.applications.apps.FilePicker;
			}
			try {
				const fpcheck = await fp.browse(source, dir);
				return fpcheck.files?.includes(animatedPath) ? animatedPath : tokenPath;
			} catch (fperror) {
				//! The Forge does not return an error here as one would expect!
				metanthropes.utils.metaLog(
					2,
					"MetaImagePicker",
					"selectTokenImage",
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
				"MetaImagePicker",
				"selectTokenImage",
				"No result from dir, animatedPath",
				dir,
				animatedPath,
				"FilePicker returned error",
				error,
			);
			return tokenPath;
		}
	}

	async #collectPaths(imageRegistryType, imageFolder) {
		//todo how to properly modularize, do I really need to?
		if (!imageRegistryType || !imageRegistryType === "actors")
			return metanthropes.utils.metaLog(
				5,
				"MetaImagePicker",
				"#collectPaths",
				"No valid imageRegistryType Provided",
			);
		const paths = [];
		for (const [registryKey, rootPath] of Object.entries(metanthropes.registry.artwork)) {
			//if (!(registryKey === this.imageRegistryType)) continue;
			if (!rootPath) continue;
			let finalPath;
			let folderName;
			let images;
			//todo remove once deprecation period ends
			const deprecatedImages = new Set([
				"modules/metanthropes-introductory/assets/artwork/actors/portraits/human/civilian-03.webp",
				"modules/metanthropes-introductory/assets/artwork/actors/portraits/human/civilian-06.webp",
				"modules/metanthropes-introductory/assets/artwork/actors/portraits/human/civilian-08.webp",
				"modules/metanthropes-introductory/assets/artwork/actors/portraits/human/civilian-10.webp",
				"modules/metanthropes-introductory/assets/artwork/actors/portraits/human/civilian-15.webp",
				"modules/metanthropes-introductory/assets/artwork/actors/portraits/human/civilian-16.webp",
			]);
			switch (imageFolder) {
				case "protagonist":
					//? Show Metanthropes
					folderName = "metanthrope";
					finalPath = `${rootPath}/actors/portraits/metanthrope/`;
					images = await this.#callFilePicker(finalPath);
					if (images && images !== "false" && images.length > 0)
						paths.push({
							registryKey,
							rootPath,
							folderName,
							images,
						});
					//? Show Humans
					folderName = "human";
					finalPath = `${rootPath}/actors/portraits/human/`;
					images = await this.#callFilePicker(finalPath);
					if (images && images !== "false" && images.length > 0) {
						const deprecateCivilians = images.filter((entry) => !deprecatedImages.has(entry.path));
						paths.push({
							registryKey,
							rootPath,
							folderName,
							images: deprecateCivilians,
						});
					}
					continue;
				case "metanthrope":
					//? Show Metanthropes
					folderName = "metanthrope";
					finalPath = `${rootPath}/actors/portraits/metanthrope/`;
					images = await this.#callFilePicker(finalPath);
					if (images && images !== "false" && images.length > 0)
						paths.push({
							registryKey,
							rootPath,
							folderName,
							images,
						});
					//? Show Humans
					folderName = "human";
					finalPath = `${rootPath}/actors/portraits/human/`;
					images = await this.#callFilePicker(finalPath);
					if (images && images !== "false" && images.length > 0) {
						const deprecateCivilians = images.filter((entry) => !deprecatedImages.has(entry.path));
						paths.push({
							registryKey,
							rootPath,
							folderName,
							images: deprecateCivilians,
						});
					}
					continue;
				case "human":
					//? Show Humans
					folderName = "human";
					finalPath = `${rootPath}/actors/portraits/human/`;
					images = await this.#callFilePicker(finalPath);
					if (images && images !== "false" && images.length > 0) {
						const deprecateCivilians = images.filter((entry) => !deprecatedImages.has(entry.path));
						paths.push({
							registryKey,
							rootPath,
							folderName,
							images: deprecateCivilians,
						});
					}
					continue;
				default:
					finalPath = `${rootPath}/actors/portraits/${imageFolder}/`;
					images = await this.#callFilePicker(finalPath);
					if (images && images !== "false" && images.length > 0) {
						folderName = imageFolder;
						paths.push({
							registryKey,
							rootPath,
							folderName,
							images,
						});
					}
					continue;
			}
		}
		metanthropes.utils.metaLog(3, "MetaImagePicker", "#collectPaths", "All Paths returned", paths);
		return paths;
	}

	async #callFilePicker(path) {
		metanthropes.utils.metaLog(3, "MetaImagePicker", "#callFilePicker", "Testing Path", path);
		let fpcheck;
		let source;
		let fp;
		//? The Forge compatibility
		if (game.modules.get("forge-vtt")?.active) {
			source = "forgevtt";
			fp = ForgeVTT_FilePicker;
		} else {
			source = "data";
			fp = foundry.applications.apps.FilePicker.implementation;
		}
		try {
			fpcheck = await fp.browse(source, path);
		} catch (error) {
			//! The Forge doesn't return an error here as expected.
			metanthropes.utils.metaLog(
				4,
				"MetaImagePicker",
				"#callFilePicker",
				"No assets found in Path",
				path,
				"FilePicker Returned Error",
				error,
			);
			return false;
		}
		const images = (fpcheck.files ?? []).map((path) => ({
			path,
			name: path.split("/").pop().split(".")[0], //? grab the file name without the extension
			isSelected: path === this.selected,
		}));
		//todo refactor so we only return images if it's not falsy, instead of checking for it during #collectPaths
		return images;
	}
}
