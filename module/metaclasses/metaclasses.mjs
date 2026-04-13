import { metaChangeActorImage } from "../helpers/metaimagehandler.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;


/**
 * Proof Of Concept custom class to display portrait images from multiple paths
 *todo review registry functionality
 *todo is this going to be also used in non-Actor scenarios?
 *todo proper localization of hbs etc
 *todo review The Forge compatibility
 *todo utilize the 'enabled' content from modules
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
			title: "Select Image",
			resizable: true,
		},
		actions: {
			selectImage: this.#onSelectImage,
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
	}

	get imageRegistry() {
		return metanthropes.registry.imagePaths ?? {};
	}

	async _prepareContext(_options) {
		const groups = await this.#collectGroups();
		return {
			groups,
			selected: this.selected,
			hasImages: groups.some((group) => group.images.length),
		};
	}

	async #collectGroups() {
		const groups = [];
		for (const [registryKey, rootPath] of Object.entries(this.imageRegistry)) {
			//todo can do filtering based on the registry structure here
			//todo include final species design
			//todo do we want AppV1 compatibility?
			if (!rootPath) continue;
			//? Spin off a FilePicker for grabbing the files from the rootPath for that selection
			//todo if running on The Forge, figure out the correct relative path?
			const filePickerInstance = await foundry.applications.apps.FilePicker.browse("data", rootPath);
			const images = (filePickerInstance.files ?? []).map((path) => ({
				path,
				name: path.split("/").pop().split(".")[0], //? grab the file name without the extension
				isSelected: path === this.selected,
			}));
			groups.push({
				registryKey,
				rootPath,
				images,
			});
		}
		return groups;
	}

	static async #onSelectImage(_event, target) {
		const path = target.dataset.path;
		if (!path) return metanthropes.utils.metaLog(2, "MetaImagePicker", "onSelectImage", "Could not work with path", path);
		this.selected = path;
		metanthropes.utils.metaLog(3, "MetaImagePicker", "onSelectImage", "Selected path", path);
		await this.close();
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
		if (!game.settings.get("metanthropes", "metaAlphaTesting")) return;
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
