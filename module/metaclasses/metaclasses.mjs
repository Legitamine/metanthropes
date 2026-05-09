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
		tag: "section",
		position: {
			width: 960,
			height: 720,
		},
		window: {
			title: "METANTHROPES.UI.APPS.META_IMAGE_PICKER.Title",
			resizable: true,
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
	}

	async _prepareContext(options) {
		//todo why freaks out when calling super below?
		//super(options);
		const paths = await this.#collectPaths(this.imageRegistryType, this.imageFolder);
		return {
			isNarrator: game.user.isGM, //todo should we enable only for Active GMs?
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
		};
	}

	static async #onSelectImage(event, target) {
		const path = target.dataset.path;
		if (!path)
			return metanthropes.utils.metaLog(2, "MetaImagePicker", "#onSelectImage", "Could not work with path", path, "Aborting");
		this.selected = path;
		metanthropes.utils.metaLog(3, "MetaImagePicker", "#onSelectImage", "Selected path", path);
		const actor = await fromUuid(this.actorUUID);
		await actor.update({ img: path });
		const updatedTokenImage = await metanthropes.utils.metaConvertPortraitToTokenImage(path);
		await metanthropes.utils.metaUpdateTokenImages({actorUUID: actor.uuid, selectedPath: updatedTokenImage});
		await this.close();
	}

	static async #onEditImage(event, target) {
		//? from example https://foundryvtt.wiki/en/development/guides/applicationV2-conversion-guide
		const field = target.dataset.field || "img";
		const actor = await fromUuid(target.dataset.actorId);
		const current = foundry.utils.getProperty(actor.document, field);
		const fp = new foundry.applications.apps.FilePicker({
			type: "image",
			current: current,
			callback: async (path) => {
				await actor.update({ [field]: path });
				await this.close();
			},
		});
		fp.render(true);
	}

	async #collectPaths(imageRegistryType, imageFolder) {
		//todo how to properly modularize, do I really needd to?
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
					if (images && images !== "false") {
						paths.push({
							registryKey,
							rootPath,
							folderName,
							images,
						});
					}
					//? Show Humans
					folderName = "human";
					finalPath = `${rootPath}/actors/portraits/human/`;
					images = await this.#callFilePicker(finalPath);
					if (images && images !== "false") {
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
					if (images && images !== "false") {
						paths.push({
							registryKey,
							rootPath,
							folderName,
							images,
						});
					}
					//? Show Humans
					folderName = "human";
					finalPath = `${rootPath}/actors/portraits/human/`;
					images = await this.#callFilePicker(finalPath);
					if (images && images !== "false") {
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
					if (!images || images === "false") continue;
					folderName = imageFolder;
					paths.push({
						registryKey,
						rootPath,
						folderName,
						images,
					});
					continue;
			}
		}
		metanthropes.utils.metaLog(3, "all paths returned", paths);
		return paths;
	}

	async #callFilePicker(path) {
		metanthropes.utils.metaLog(3, "trying path", path);
		let filePickerInstance;
		try {
			//? The Forge compatibility
			let source;
			if (game.modules.get("forge-vtt")?.active) source = "forgevtt";
			else source = "data";
			filePickerInstance = await foundry.applications.apps.FilePicker.browse(source, path);
		} catch (error) {
			metanthropes.utils.metaLog(
				4,
				"MetaImagePicker",
				"Didn't find any assets at",
				path,
				"FilePicker Returned Error",
				error,
			);
			return false;
		}
		const images = (filePickerInstance.files ?? []).map((path) => ({
			path,
			name: path.split("/").pop().split(".")[0], //? grab the file name without the extension
			isSelected: path === this.selected,
		}));
		return images;
	}
}

/**
 * ! to be deprecated
 * The MetaDialog class is a custom Dialog that ensures it's always displayed over the Actor Sheet
 * It also removes the Close button and the ability to press Escape to close the dialog
 *
 * @extends {Dialog}
 *
 */
export class MetaDialog extends Dialog {
	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		//? Change Portrait
		html.find(".meta-change-portrait").click(this._onChangePortrait.bind(this));
	}
	async _onChangePortrait(event) {
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		const actorUUID = dataset.actoruuid;
		const actor = await fromUuid(actorUUID);
		await metaChangeActorImage(actor);
		this.render();
	}
	/**
	 * Render the outer application wrapper
	 * @returns {Promise<jQuery>}   A promise resolving to the constructed jQuery object
	 * @protected
	 */
	//* Note we are overriding the _renderOuter of the Application Class, so the below has both Application + Dialog merged in one
	/** @override */
	async _renderOuter() {
		// Gather basic application data
		const classes = this.options.classes;
		const windowData = {
			id: this.id,
			classes: classes.join(" "),
			appId: this.appId,
			title: this.title,
			headerButtons: this._getHeaderButtons(),
		};
		// Render the template and return the promise
		let html = await foundry.applications.handlebars.renderTemplate("templates/app-window.html", windowData);
		html = $(html);
		// Activate header button click listeners after a slight timeout to prevent immediate interaction
		setTimeout(() => {
			html.find(".header-button").click((event) => {
				event.preventDefault();
				const button = windowData.headerButtons.find((b) => event.currentTarget.classList.contains(b.class));
				button.onclick(event);
			});
		}, 500);
		// Make the outer window draggable
		const header = html.find("header")[0];
		new foundry.applications.ux.Draggable.implementation(this, html, header, this.options.resizable);
		// Make the outer window minimizable
		if (this.options.minimizable) {
			header.addEventListener("dblclick", this._onToggleMinimize.bind(this));
		}
		// Set the outer frame z-index
		if (Object.keys(ui.windows).length === 0) foundry.applications.api.ApplicationV2._maxZ = 100 - 1;
		this.position.zIndex = Math.min(++foundry.applications.api.ApplicationV2._maxZ, 9999);
		/** @override */
		//* Ensure that the dialog is always displayed over the Actor Sheet
		this.position.zIndex += 10;
		html.css({ zIndex: this.position.zIndex });
		ui.activeWindow = this;
		// Return the outer frame
		/** @override */
		//* Extending the Dialog Class _renderOuter
		const app = html[0];
		app.setAttribute("role", "dialog");
		app.setAttribute("aria-modal", "true");
		return html;
	}
	/**
	 * Specify the set of config buttons which should appear in the Application header.
	 * Buttons should be returned as an Array of objects.
	 * The header buttons which are added to the application can be modified by the getApplicationHeaderButtons hook.
	 * @fires getApplicationHeaderButtons
	 * @returns {ApplicationHeaderButton[]}
	 * @protected
	 */
	/** @override */
	_getHeaderButtons() {
		/** @override */
		//* do not show Close button for MetaDialog
		const buttons = [];
		for (let cls of this.constructor._getInheritanceChain()) {
			Hooks.call(`get${cls.name}HeaderButtons`, this, buttons);
		}
		return buttons;
	}
	/**
	 * Handle a keydown event while the dialog is active
	 * @param {KeyboardEvent} event   The keydown event
	 * @private
	 */
	/** @override */
	_onKeyDown(event) {
		// Cycle Options
		if (event.key === "Tab") {
			const dialog = this.element[0];
			// If we are already focused on the Dialog, let the default browser behavior take over
			if (dialog.contains(document.activeElement)) return;
			// If we aren't focused on the dialog, bring focus to one of its buttons
			event.preventDefault();
			event.stopPropagation();
			const dialogButtons = Array.from(document.querySelectorAll(".dialog-button"));
			const targetButton = event.shiftKey ? dialogButtons.pop() : dialogButtons.shift();
			targetButton.focus();
		}
		// Close dialog
		if (event.key === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			/** @override */
			//* Do not close the dialog on Escape
			return;
		}
		// Confirm choice
		if (event.key === "Enter") {
			// Only handle Enter presses if an input element within the Dialog has focus
			const dialog = this.element[0];
			if (!dialog.contains(document.activeElement) || document.activeElement instanceof HTMLTextAreaElement)
				return;
			event.preventDefault();
			event.stopPropagation();
			// Prefer a focused button, or enact the default option for the dialog
			const button = document.activeElement.dataset.button || this.data.default;
			const choice = this.data.buttons[button];
			return this.submit(choice);
		}
	}
}

/**
 * Meta Chat Message
 ** Extends the default ChatMessage
 ** Used for testing, not really doing anything
 *todo examine why it is not overriding as expected
 *
 * @export
 * @class MetaChatMessage
 * @typedef {MetaChatMessage}
 * @extends {ChatMessage}
 */
export class MetaChatMessage extends ChatMessage {
	/** @inheritDoc */
	_onCreate(data, options, userId) {
		metanthropes.utils.metaLog(2, "QUAPLA QUAPLA QUAPLA");
		super._onCreate(data, options, userId);
	}
	/** @inheritDoc */
	_onUpdate(changed, options, userId) {
		metanthropes.utils.metaLog(2, "QUAPLA -------QUAPLA------- QUAPLA");
		super._onUpdate(changed, options, userId);
	}
	/**
	 * Play a VFX animation using data provided by this ChatMessage
	 * @returns {Promise<void>}
	 */
	async #playVFXEffect() {
		if (!metanthropes.utils.metaCheckSetting("homebrew", "metaAlphaTesting")) return;
		//! DSN
		if (this.rolls.length && "dice3d" in game) await game.dice3d.waitFor3DAnimationByMessageID(this.id);
		/*
		const action = CrucibleAction.fromChatMessage(this);
		//grabs references and config from the flags
		const { references, ...vfxConfig } = this.flags.crucible.vfxConfig;
		//calls to play the vfx
		await action.playVFXEffect(vfxConfig, references);
		*/
		if (!this.token?.parent.isView) return; //! prepei edw to this na ginetai resolve ston actor?
	}
}

/**
 * Custom Class for the Pause UI
 *
 * @export
 * @class MetanthropesPause
 * @typedef {MetanthropesPause}
 * @extends {foundry.applications.ui.GamePause}
 */
export class MetanthropesPause extends foundry.applications.ui.GamePause {
	async _prepareContext(_options) {
		const context = await super._prepareContext(_options);
		context.icon = "systems/metanthropes/assets/logos/metanthropes-logo.webp";
		return context;
	}
}
