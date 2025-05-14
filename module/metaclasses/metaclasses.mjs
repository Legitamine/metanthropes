//? Import Helpers
import { metaChangeActorImage } from "../helpers/metaimagehandler.mjs";
/**
 *
 * Helper class to extend the FilePicker class for a custom MetaDialog usage
 * Primarily we want to use this to render a 'select your portrait' dialog for the User
 * Minimizing the additional functionality and controls that FilePicker provides
 *
 * @param {*} app
 * @param {*} buttons
 */
//! todo perhps the best apprach is to have left-click our own and right click the orginal FVTT process
//todo Deprecate notice: need to also revise/remove the CSS classes we had for the image animations
export class metaFilePicker extends foundry.applications.apps.FilePicker.implementation {
	//todo: clean up the z-index tryouts
	/** @override */
	constructor(options = {}) {
		super(options);
		this.displayMode = options.displayMode || "tiles";
	}
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/metanthropes/templates/metanthropes/filepicker.html",
			classes: ["filepicker"],
			width: 520,
			tabs: [{ navSelector: ".tabs" }],
			dragDrop: [{ dragSelector: ".file", dropSelector: ".filepicker-body" }],
			tileSize: false,
			filters: [{ inputSelector: 'input[name="filter"]', contentSelector: ".filepicker-body" }],
		});
	}
	/** @override */
	render(force, options) {
		if (game.world && !game.user.can("FILES_BROWSE")) return this;
		this.position.height = null;
		//* Ensure the dialog is rendered above the MetaDialog
		const newZIndex = this.position.zIndex + 1500;
		this.element.css({ height: "" });
		this.element.css({ zIndex: newZIndex });
		this._tabs[0].active = this.activeSource;
		if (!this._loaded) {
			this.browse();
			this.position.zIndex = newZIndex;
			return this;
		} else return super.render(force, options);
	}
}

/**
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
		let html = await renderTemplate("templates/app-window.html", windowData);
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
		new Draggable(this, html, header, this.options.resizable);
		// Make the outer window minimizable
		if (this.options.minimizable) {
			header.addEventListener("dblclick", this._onToggleMinimize.bind(this));
		}
		// Set the outer frame z-index
		if (Object.keys(ui.windows).length === 0) _maxZ = 100 - 1;
		this.position.zIndex = Math.min(++_maxZ, 9999);
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
