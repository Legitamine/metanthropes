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
export class metaFilePicker extends FilePicker {
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

/**
 * The MetaSidebar class is a custom Sidebar
 * This enables us to control the various UI controls elements that are visible in the Sidebar
 *
 */
export class MetaSidebar extends Sidebar {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "sidebar",
			template: "systems/metanthropes/templates/sidebar/sidebar.hbs",
			popOut: false,
			width: 300,
			tabs: [{ navSelector: ".tabs", contentSelector: "#sidebar", initial: "chat" }],
		});
	}
	/** @override */
	getData(options = {}) {
		const isGM = game.user.isGM;
		const isMetaCore = game.settings.get("metanthropes", "metaCore");
		const isMetaHomebrew = game.settings.get("metanthropes", "metaHomebrew");
		// Configure tabs
		const tabs = {
			chat: {
				tooltip: ChatMessage.metadata.labelPlural,
				icon: CONFIG.ChatMessage.sidebarIcon,
				notification: '<i id="chat-notification" class="notification-pip fas fa-exclamation-circle"></i>',
			},
			combat: {
				tooltip: Combat.metadata.labelPlural,
				icon: CONFIG.Combat.sidebarIcon,
			},
			scenes: {
				tooltip: Scene.metadata.labelPlural,
				icon: CONFIG.Scene.sidebarIcon,
				isCreationAllowed: isMetaCore,
			},
			actors: {
				tooltip: Actor.metadata.labelPlural,
				icon: CONFIG.Actor.sidebarIcon,
				isCreationAllowed: isMetaCore,
			},
			items: {
				tooltip: Item.metadata.labelPlural,
				icon: CONFIG.Item.sidebarIcon,
				isCreationAllowed: isMetaHomebrew,
			},
			journal: {
				tooltip: "SIDEBAR.TabJournal",
				icon: CONFIG.JournalEntry.sidebarIcon,
				isCreationAllowed: isMetaCore,
			},
			tables: {
				tooltip: RollTable.metadata.labelPlural,
				icon: CONFIG.RollTable.sidebarIcon,
				isCreationAllowed: isMetaCore,
			},
			cards: {
				tooltip: Cards.metadata.labelPlural,
				icon: CONFIG.Cards.sidebarIcon,
				id: "cards",
			},
			playlists: {
				tooltip: Playlist.metadata.labelPlural,
				icon: CONFIG.Playlist.sidebarIcon,
				isCreationAllowed: isMetaCore,
			},
			compendium: {
				tooltip: "SIDEBAR.TabCompendium",
				icon: "fas fa-atlas",
				isCreationAllowed: isMetaHomebrew,
			},
			settings: {
				tooltip: "SIDEBAR.TabSettings",
				icon: "fas fa-cogs",
			},
		};
		if (!isGM) delete tabs.scenes;
		// Display core or system update notification?
		if (isGM && (game.data.coreUpdate.hasUpdate || game.data.systemUpdate.hasUpdate)) {
			tabs.settings.notification = `<i class="notification-pip fas fa-exclamation-circle"></i>`;
		}
		return { tabs };
	}
}

/**
 * The metaDocumentDirectory class is a custom Directory for the Sidebar
 * It controls the various UI controls elements that are visible in the Sidebar
 *
 * @extends {DocumentDirectory}
 *
 */
export class metaDocumentDirectory extends DocumentDirectory {
	/** @override */
	get canCreateEntry() {
		const cls = getDocumentClass(this.constructor.documentName);
		return cls.canUserCreate(game.user);
	}
	//? Add our getters
	get isMetaCore() {
		return Boolean(game.settings.get("metanthropes", "metaCore"));
	}
	get isMetaHomebrew() {
		return Boolean(game.settings.get("metanthropes", "metaHomebrew"));
	}
	get isMetaCreationAllowed() {
		if (this.tabName === "items") return this.isMetaHomebrew;
		else if (this.tabName === "actors") return this.isMetaCore;
		else return true;
	}
	/**
	 * @override
	 * @returns {DocumentDirectoryOptions}
	 */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			template: "systems/metanthropes/templates/sidebar/document-directory.hbs",
			renderUpdateKeys: ["name", "img", "thumb", "ownership", "sort", "sorting", "folder"],
		});
	}
	/** @override */
	async getData(options = {}) {
		const context = await super.getData(options);
		const cfg = CONFIG[this.collection.documentName];
		const cls = cfg.documentClass;
		return foundry.utils.mergeObject(context, {
			documentCls: cls.documentName.toLowerCase(),
			//tabName: cls.metadata.collection,
			sidebarIcon: cfg.sidebarIcon,
			folderIcon: CONFIG.Folder.sidebarIcon,
			label: game.i18n.localize(cls.metadata.label),
			labelPlural: game.i18n.localize(cls.metadata.labelPlural),
			unavailable: game.user.isGM ? cfg.collection?.instance?.invalidDocumentIds?.size : 0,
			cssId: this.id,
			cssClass: this.options.classes.join(" "),
			tabName: this.tabName,
			user: game.user,
			isMetaCreationAllowed: this.isMetaCreationAllowed,
		});
	}
}

/**
 * The sidebar directory which organizes and displays world-level Scene documents.
 * @extends {DocumentDirectory}
 */
export class metaSceneDirectory extends metaDocumentDirectory {
	/** @override */
	static documentName = "Scene";

	/** @override */
	static entryPartial = "templates/sidebar/scene-partial.html";

	/* -------------------------------------------- */

	/** @inheritdoc */
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.renderUpdateKeys.push("background");
		return options;
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _render(force, options) {
		if (!game.user.isGM) return;
		return super._render(force, options);
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_getEntryContextOptions() {
		let options = super._getEntryContextOptions();
		options = [
			{
				name: "SCENES.View",
				icon: '<i class="fas fa-eye"></i>',
				condition: (li) => !canvas.ready || li.data("documentId") !== canvas.scene.id,
				callback: (li) => {
					const scene = game.scenes.get(li.data("documentId"));
					scene.view();
				},
			},
			{
				name: "SCENES.Activate",
				icon: '<i class="fas fa-bullseye"></i>',
				condition: (li) => game.user.isGM && !game.scenes.get(li.data("documentId")).active,
				callback: (li) => {
					const scene = game.scenes.get(li.data("documentId"));
					scene.activate();
				},
			},
			{
				name: "SCENES.Configure",
				icon: '<i class="fas fa-cogs"></i>',
				callback: (li) => {
					const scene = game.scenes.get(li.data("documentId"));
					scene.sheet.render(true);
				},
			},
			{
				name: "SCENES.Notes",
				icon: '<i class="fas fa-scroll"></i>',
				condition: (li) => {
					const scene = game.scenes.get(li.data("documentId"));
					return !!scene.journal;
				},
				callback: (li) => {
					const scene = game.scenes.get(li.data("documentId"));
					const entry = scene.journal;
					if (entry) {
						const sheet = entry.sheet;
						const options = {};
						if (scene.journalEntryPage) options.pageId = scene.journalEntryPage;
						sheet.render(true, options);
					}
				},
			},
			{
				name: "SCENES.ToggleNav",
				icon: '<i class="fas fa-compass"></i>',
				condition: (li) => {
					const scene = game.scenes.get(li.data("documentId"));
					return game.user.isGM && !scene.active;
				},
				callback: (li) => {
					const scene = game.scenes.get(li.data("documentId"));
					scene.update({ navigation: !scene.navigation });
				},
			},
			{
				name: "SCENES.GenerateThumb",
				icon: '<i class="fas fa-image"></i>',
				condition: (li) => {
					const scene = game.scenes.get(li[0].dataset.documentId);
					return (scene.background.src || scene.tiles.size) && !game.settings.get("core", "noCanvas");
				},
				callback: (li) => {
					const scene = game.scenes.get(li[0].dataset.documentId);
					scene
						.createThumbnail()
						.then((data) => {
							scene.update({ thumb: data.thumb }, { diff: false });
							ui.notifications.info(
								game.i18n.format("SCENES.GenerateThumbSuccess", { name: scene.name })
							);
						})
						.catch((err) => ui.notifications.error(err.message));
				},
			},
		].concat(options);

		// Remove the ownership entry
		options.findSplice((o) => o.name === "OWNERSHIP.Configure");
		return options;
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_getFolderContextOptions() {
		const options = super._getFolderContextOptions();
		options.findSplice((o) => o.name === "OWNERSHIP.Configure");
		return options;
	}
}

/**
 * metaActorDirectory extends the ActorDirectory to enable us to set it as the default Actors tab
 *
 * @extends {metaDocumentDirectory}
 * Also adding Foundry's ActorDirectory implementation
 *
 */
export class metaActorDirectory extends metaDocumentDirectory {
	//? Add Foundry's implementation of the ActorDirectory
	constructor(...args) {
		super(...args);
		this._dragDrop[0].permissions.dragstart = () => game.user.can("TOKEN_CREATE");
		this._dragDrop[0].permissions.drop = () => game.user.can("ACTOR_CREATE");
	}
	/* -------------------------------------------- */
	/** @override */
	static documentName = "Actor";
	/* -------------------------------------------- */
	/** @override */
	_canDragStart(selector) {
		return game.user.can("TOKEN_CREATE");
	}
	/* -------------------------------------------- */
	/** @override */
	_onDragStart(event) {
		const li = event.currentTarget.closest(".directory-item");
		let actor = null;
		if (li.dataset.documentId) {
			actor = game.actors.get(li.dataset.documentId);
			if (!actor || !actor.visible) return false;
		}
		// Parent directory drag start handling
		super._onDragStart(event);
		// Create the drag preview for the Token
		if (actor && canvas.ready) {
			const img = li.querySelector("img");
			const pt = actor.prototypeToken;
			const w = pt.width * canvas.dimensions.size * Math.abs(pt.texture.scaleX) * canvas.stage.scale.x;
			const h = pt.height * canvas.dimensions.size * Math.abs(pt.texture.scaleY) * canvas.stage.scale.y;
			const preview = DragDrop.createDragImage(img, w, h);
			event.dataTransfer.setDragImage(preview, w / 2, h / 2);
		}
	}
	/* -------------------------------------------- */
	/** @override */
	_canDragDrop(selector) {
		return game.user.can("ACTOR_CREATE");
	}
	/* -------------------------------------------- */
	/** @override */
	_getEntryContextOptions() {
		const options = super._getEntryContextOptions();
		return [
			{
				name: "SIDEBAR.CharArt",
				icon: '<i class="fas fa-image"></i>',
				condition: (li) => {
					const actor = game.actors.get(li.data("documentId"));
					return actor.img !== CONST.DEFAULT_TOKEN;
				},
				callback: (li) => {
					const actor = game.actors.get(li.data("documentId"));
					new ImagePopout(actor.img, {
						title: actor.name,
						uuid: actor.uuid,
					}).render(true);
				},
			},
			{
				name: "SIDEBAR.TokenArt",
				icon: '<i class="fas fa-image"></i>',
				condition: (li) => {
					const actor = game.actors.get(li.data("documentId"));
					if (actor.prototypeToken.randomImg) return false;
					return ![null, undefined, CONST.DEFAULT_TOKEN].includes(actor.prototypeToken.texture.src);
				},
				callback: (li) => {
					const actor = game.actors.get(li.data("documentId"));
					new ImagePopout(actor.prototypeToken.texture.src, {
						title: actor.name,
						uuid: actor.uuid,
					}).render(true);
				},
			},
		].concat(options);
	}
}

/**
 * The sidebar directory which organizes and displays world-level Item documents.
 */
export class metaItemDirectory extends metaDocumentDirectory {
	/** @override */
	static documentName = "Item";

	/* -------------------------------------------- */

	/** @override */
	_canDragDrop(selector) {
		return game.user.can("ITEM_CREATE");
	}

	/* -------------------------------------------- */

	/** @override */
	_getEntryContextOptions() {
		const options = super._getEntryContextOptions();
		return [
			{
				name: "ITEM.ViewArt",
				icon: '<i class="fas fa-image"></i>',
				condition: (li) => {
					const item = game.items.get(li.data("documentId"));
					return item.img !== CONST.DEFAULT_TOKEN;
				},
				callback: (li) => {
					const item = game.items.get(li.data("documentId"));
					new ImagePopout(item.img, {
						title: item.name,
						uuid: item.uuid,
					}).render(true);
				},
			},
		].concat(options);
	}
}

/**
 * The sidebar directory which organizes and displays world-level JournalEntry documents.
 * @extends {DocumentDirectory}
 */
export class metaJournalDirectory extends metaDocumentDirectory {
	/** @override */
	static documentName = "JournalEntry";

	/* -------------------------------------------- */

	/** @override */
	_getEntryContextOptions() {
		const options = super._getEntryContextOptions();
		return options.concat([
			{
				name: "SIDEBAR.JumpPin",
				icon: '<i class="fas fa-crosshairs"></i>',
				condition: (li) => {
					const entry = game.journal.get(li.data("document-id"));
					return !!entry.sceneNote;
				},
				callback: (li) => {
					const entry = game.journal.get(li.data("document-id"));
					return entry.panToNote();
				},
			},
		]);
	}
}

/**
 * The sidebar directory which organizes and displays world-level RollTable documents.
 * @extends {DocumentDirectory}
 */
export class metaRollTableDirectory extends metaDocumentDirectory {
	/** @override */
	static documentName = "RollTable";

	/* -------------------------------------------- */

	/** @inheritdoc */
	_getEntryContextOptions() {
		let options = super._getEntryContextOptions();

		// Add the "Roll" option
		options = [
			{
				name: "TABLE.Roll",
				icon: '<i class="fas fa-dice-d20"></i>',
				callback: (li) => {
					const table = game.tables.get(li.data("documentId"));
					table.draw({ roll: true, displayChat: true });
				},
			},
		].concat(options);
		return options;
	}
}

/**
 * The sidebar directory which organizes and displays world-level Playlist documents.
 * @extends {DocumentDirectory}
 */
export class metaPlaylistDirectory extends metaDocumentDirectory {
	constructor(options) {
		super(options);

		/**
		 * Track the playlist IDs which are currently expanded in their display
		 * @type {Set<string>}
		 */
		this._expanded = this._createExpandedSet();

		/**
		 * Are the global volume controls currently expanded?
		 * @type {boolean}
		 * @private
		 */
		this._volumeExpanded = true;

		/**
		 * Cache the set of Playlist documents that are displayed as playing when the directory is rendered
		 * @type {Playlist[]}
		 */
		this._playingPlaylists = [];

		/**
		 * Cache the set of PlaylistSound documents that are displayed as playing when the directory is rendered
		 * @type {PlaylistSound[]}
		 */
		this._playingSounds = [];

		// Update timestamps every second
		setInterval(this._updateTimestamps.bind(this), 1000);

		// Playlist 'currently playing' pinned location.
		game.settings.register("core", "playlist.playingLocation", {
			scope: "client",
			config: false,
			default: "top",
			type: String,
			onChange: () => ui.playlists.render(),
		});
	}

	/** @override */
	static documentName = "Playlist";

	/** @override */
	static entryPartial = "templates/sidebar/partials/playlist-partial.html";

	/* -------------------------------------------- */

	/** @override */
	static get defaultOptions() {
		const options = super.defaultOptions;
		options.template = "templates/sidebar/playlists-directory.html";
		options.dragDrop[0].dragSelector = ".folder, .playlist-name, .sound-name";
		options.renderUpdateKeys = ["name", "playing", "mode", "sounds", "sort", "sorting", "folder"];
		options.contextMenuSelector = ".document .playlist-header";
		return options;
	}

	/* -------------------------------------------- */

	/**
	 * Initialize the set of Playlists which should be displayed in an expanded form
	 * @returns {Set<string>}
	 * @private
	 */
	_createExpandedSet() {
		const expanded = new Set();
		for (let playlist of this.documents) {
			if (playlist.playing) expanded.add(playlist.id);
		}
		return expanded;
	}

	/* -------------------------------------------- */
	/*  Properties                                  */
	/* -------------------------------------------- */

	/**
	 * Return an Array of the Playlist documents which are currently playing
	 * @type {Playlist[]}
	 */
	get playing() {
		return this._playingPlaylists;
	}

	/**
	 * Whether the 'currently playing' element is pinned to the top or bottom of the display.
	 * @type {string}
	 * @private
	 */
	get _playingLocation() {
		return game.settings.get("core", "playlist.playingLocation");
	}

	/* -------------------------------------------- */
	/*  Rendering                                   */
	/* -------------------------------------------- */

	/** @inheritdoc */
	async getData(options = {}) {
		this._playingPlaylists = [];
		this._playingSounds = [];
		this._playingSoundsData = [];
		this._prepareTreeData(this.collection.tree);
		const data = await super.getData(options);
		const currentAtTop = this._playingLocation === "top";
		return foundry.utils.mergeObject(data, {
			playingSounds: this._playingSoundsData,
			showPlaying: this._playingSoundsData.length > 0,
			playlistModifier: foundry.audio.AudioHelper.volumeToInput(game.settings.get("core", "globalPlaylistVolume")),
			playlistTooltip: PlaylistDirectory.volumeToTooltip(game.settings.get("core", "globalPlaylistVolume")),
			ambientModifier: foundry.audio.AudioHelper.volumeToInput(game.settings.get("core", "globalAmbientVolume")),
			ambientTooltip: PlaylistDirectory.volumeToTooltip(game.settings.get("core", "globalAmbientVolume")),
			interfaceModifier: foundry.audio.AudioHelper.volumeToInput(game.settings.get("core", "globalInterfaceVolume")),
			interfaceTooltip: PlaylistDirectory.volumeToTooltip(game.settings.get("core", "globalInterfaceVolume")),
			volumeExpanded: this._volumeExpanded,
			currentlyPlaying: {
				class: `location-${currentAtTop ? "top" : "bottom"}`,
				location: { top: currentAtTop, bottom: !currentAtTop },
				pin: { label: `PLAYLIST.PinTo${currentAtTop ? "Bottom" : "Top"}`, caret: currentAtTop ? "down" : "up" },
			},
		});
	}

	/* -------------------------------------------- */

	/**
	 * Converts a volume level to a human-friendly % value
	 * @param {number} volume         Value between [0, 1] of the volume level
	 * @returns {string}
	 */
	static volumeToTooltip(volume) {
		return game.i18n.format("PLAYLIST.VolumeTooltip", {
			volume: Math.round(foundry.audio.AudioHelper.volumeToInput(volume) * 100),
		});
	}

	/* -------------------------------------------- */

	/**
	 * Augment the tree directory structure with playlist-level data objects for rendering
	 * @param {object} node   The tree leaf node being prepared
	 * @private
	 */
	_prepareTreeData(node) {
		node.entries = node.entries.map((p) => this._preparePlaylistData(p));
		for (const child of node.children) this._prepareTreeData(child);
	}

	/* -------------------------------------------- */

	/**
	 * Create an object of rendering data for each Playlist document being displayed
	 * @param {Playlist} playlist   The playlist to display
	 * @returns {object}            The data for rendering
	 * @private
	 */
	_preparePlaylistData(playlist) {
		const isGM = game.user.isGM;
		if (playlist.playing) this._playingPlaylists.push(playlist);

		// Playlist configuration
		const p = playlist.toObject(false);
		p.modeTooltip = this._getModeTooltip(p.mode);
		p.modeIcon = this._getModeIcon(p.mode);
		p.disabled = p.mode === CONST.PLAYLIST_MODES.DISABLED;
		p.expanded = this._expanded.has(p._id);
		p.css = [p.expanded ? "" : "collapsed", playlist.playing ? "playing" : ""].filterJoin(" ");
		p.controlCSS = isGM && !p.disabled ? "" : "disabled";

		// Playlist sounds
		const sounds = [];
		for (const soundId of playlist.playbackOrder) {
			const sound = playlist.sounds.get(soundId);
			if (!isGM && !sound.playing) continue;

			// All sounds
			const s = sound.toObject(false);
			s.playlistId = playlist.id;
			s.css = s.playing ? "playing" : "";
			s.controlCSS = isGM ? "" : "disabled";
			s.playIcon = this._getPlayIcon(sound);
			s.playTitle = s.pausedTime ? "PLAYLIST.SoundResume" : "PLAYLIST.SoundPlay";

			// Playing sounds
			if (sound.sound && !sound.sound.failed && (sound.playing || s.pausedTime)) {
				s.isPaused = !sound.playing && s.pausedTime;
				s.pauseIcon = this._getPauseIcon(sound);
				s.lvolume = foundry.audio.AudioHelper.volumeToInput(s.volume);
				s.volumeTooltip = this.constructor.volumeToTooltip(s.volume);
				s.currentTime = this._formatTimestamp(sound.playing ? sound.sound.currentTime : s.pausedTime);
				s.durationTime = this._formatTimestamp(sound.sound.duration);
				this._playingSounds.push(sound);
				this._playingSoundsData.push(s);
			}
			sounds.push(s);
		}
		p.sounds = sounds;
		return p;
	}

	/* -------------------------------------------- */

	/**
	 * Get the icon used to represent the "play/stop" icon for the PlaylistSound
	 * @param {PlaylistSound} sound   The sound being rendered
	 * @returns {string}              The icon that should be used
	 * @private
	 */
	_getPlayIcon(sound) {
		if (!sound.playing) return sound.pausedTime ? "fas fa-play-circle" : "fas fa-play";
		else return "fas fa-square";
	}

	/* -------------------------------------------- */

	/**
	 * Get the icon used to represent the pause/loading icon for the PlaylistSound
	 * @param {PlaylistSound} sound   The sound being rendered
	 * @returns {string}              The icon that should be used
	 * @private
	 */
	_getPauseIcon(sound) {
		return sound.playing && !sound.sound?.loaded ? "fas fa-spinner fa-spin" : "fas fa-pause";
	}

	/* -------------------------------------------- */

	/**
	 * Given a constant playback mode, provide the FontAwesome icon used to display it
	 * @param {number} mode
	 * @returns {string}
	 * @private
	 */
	_getModeIcon(mode) {
		return {
			[CONST.PLAYLIST_MODES.DISABLED]: '<i class="fas fa-ban"></i>',
			[CONST.PLAYLIST_MODES.SEQUENTIAL]: '<i class="far fa-arrow-alt-circle-right"></i>',
			[CONST.PLAYLIST_MODES.SHUFFLE]: '<i class="fas fa-random"></i>',
			[CONST.PLAYLIST_MODES.SIMULTANEOUS]: '<i class="fas fa-compress-arrows-alt"></i>',
		}[mode];
	}

	/* -------------------------------------------- */

	/**
	 * Given a constant playback mode, provide the string tooltip used to describe it
	 * @param {number} mode
	 * @returns {string}
	 * @private
	 */
	_getModeTooltip(mode) {
		return {
			[CONST.PLAYLIST_MODES.DISABLED]: game.i18n.localize("PLAYLIST.ModeDisabled"),
			[CONST.PLAYLIST_MODES.SEQUENTIAL]: game.i18n.localize("PLAYLIST.ModeSequential"),
			[CONST.PLAYLIST_MODES.SHUFFLE]: game.i18n.localize("PLAYLIST.ModeShuffle"),
			[CONST.PLAYLIST_MODES.SIMULTANEOUS]: game.i18n.localize("PLAYLIST.ModeSimultaneous"),
		}[mode];
	}

	/* -------------------------------------------- */
	/*  Event Listeners and Handlers                */
	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Volume sliders
		html.find(".global-volume-slider").change(this._onGlobalVolume.bind(this));
		html.find(".sound-volume").change(this._onSoundVolume.bind(this));

		// Collapse/Expand
		html.find("#global-volume .playlist-header").click(this._onVolumeCollapse.bind(this));

		// Currently playing pinning
		html.find("#currently-playing .pin").click(this._onPlayingPin.bind(this));

		// All options below require a GM user
		if (!game.user.isGM) return;

		// Playlist Control Events
		html.on("click", "a.sound-control", (event) => {
			event.preventDefault();
			const btn = event.currentTarget;
			const action = btn.dataset.action;
			if (!action || btn.classList.contains("disabled")) return;

			// Delegate to Playlist and Sound control handlers
			switch (action) {
				case "playlist-mode":
					return this._onPlaylistToggleMode(event);
				case "playlist-play":
				case "playlist-stop":
					return this._onPlaylistPlay(event, action === "playlist-play");
				case "playlist-forward":
				case "playlist-backward":
					return this._onPlaylistSkip(event, action);
				case "sound-create":
					return this._onSoundCreate(event);
				case "sound-pause":
				case "sound-play":
				case "sound-stop":
					return this._onSoundPlay(event, action);
				case "sound-repeat":
					return this._onSoundToggleMode(event);
			}
		});
	}

	/* -------------------------------------------- */

	/**
	 * Handle global volume change for the playlist sidebar
	 * @param {MouseEvent} event   The initial click event
	 * @private
	 */
	_onGlobalVolume(event) {
		event.preventDefault();
		const slider = event.currentTarget;
		const volume = foundry.audio.AudioHelper.inputToVolume(slider.value);
		const tooltip = PlaylistDirectory.volumeToTooltip(volume);
		slider.setAttribute("data-tooltip", tooltip);
		game.tooltip.activate(slider, { text: tooltip });
		return game.settings.set("core", slider.name, volume);
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	collapseAll() {
		super.collapseAll();
		const el = this.element[0];
		for (let p of el.querySelectorAll("li.playlist")) {
			this._collapse(p, true);
		}
		this._expanded.clear();
		this._collapse(el.querySelector("#global-volume"), true);
		this._volumeExpanded = false;
	}

	/* -------------------------------------------- */

	/** @override */
	_onClickEntryName(event) {
		const li = event.currentTarget.closest(".playlist");
		const playlistId = li.dataset.documentId;
		const wasExpanded = this._expanded.has(playlistId);
		this._collapse(li, wasExpanded);
		if (wasExpanded) this._expanded.delete(playlistId);
		else this._expanded.add(playlistId);
	}

	/* -------------------------------------------- */

	/**
	 * Handle global volume control collapse toggle
	 * @param {MouseEvent} event   The initial click event
	 * @private
	 */
	_onVolumeCollapse(event) {
		event.preventDefault();
		const div = event.currentTarget.parentElement;
		this._volumeExpanded = !this._volumeExpanded;
		this._collapse(div, !this._volumeExpanded);
	}

	/* -------------------------------------------- */

	/**
	 * Helper method to render the expansion or collapse of playlists
	 * @private
	 */
	_collapse(el, collapse, speed = 250) {
		const ol = el.querySelector(".playlist-sounds");
		const icon = el.querySelector("i.collapse");
		if (collapse) {
			// Collapse the sounds
			$(ol).slideUp(speed, () => {
				el.classList.add("collapsed");
				icon.classList.replace("fa-angle-down", "fa-angle-up");
			});
		} else {
			// Expand the sounds
			$(ol).slideDown(speed, () => {
				el.classList.remove("collapsed");
				icon.classList.replace("fa-angle-up", "fa-angle-down");
			});
		}
	}

	/* -------------------------------------------- */

	/**
	 * Handle Playlist playback state changes
	 * @param {MouseEvent} event    The initial click event
	 * @param {boolean} playing     Is the playlist now playing?
	 * @private
	 */
	_onPlaylistPlay(event, playing) {
		const li = event.currentTarget.closest(".playlist");
		const playlist = game.playlists.get(li.dataset.documentId);
		if (playing) return playlist.playAll();
		else return playlist.stopAll();
	}

	/* -------------------------------------------- */

	/**
	 * Handle advancing the playlist to the next (or previous) sound
	 * @param {MouseEvent} event    The initial click event
	 * @param {string} action       The control action requested
	 * @private
	 */
	_onPlaylistSkip(event, action) {
		const li = event.currentTarget.closest(".playlist");
		const playlist = game.playlists.get(li.dataset.documentId);
		return playlist.playNext(undefined, { direction: action === "playlist-forward" ? 1 : -1 });
	}

	/* -------------------------------------------- */

	/**
	 * Handle cycling the playback mode for a Playlist
	 * @param {MouseEvent} event   The initial click event
	 * @private
	 */
	_onPlaylistToggleMode(event) {
		const li = event.currentTarget.closest(".playlist");
		const playlist = game.playlists.get(li.dataset.documentId);
		return playlist.cycleMode();
	}

	/* -------------------------------------------- */

	/**
	 * Handle Playlist track addition request
	 * @param {MouseEvent} event   The initial click event
	 * @private
	 */
	_onSoundCreate(event) {
		const li = $(event.currentTarget).parents(".playlist");
		const playlist = game.playlists.get(li.data("documentId"));
		const sound = new PlaylistSound({ name: game.i18n.localize("SOUND.New") }, { parent: playlist });
		sound.sheet.render(true, { top: li[0].offsetTop, left: window.innerWidth - 670 });
	}

	/* -------------------------------------------- */

	/**
	 * Modify the playback state of a Sound within a Playlist
	 * @param {MouseEvent} event    The initial click event
	 * @param {string} action       The sound control action performed
	 * @private
	 */
	_onSoundPlay(event, action) {
		const li = event.currentTarget.closest(".sound");
		const playlist = game.playlists.get(li.dataset.playlistId);
		const sound = playlist.sounds.get(li.dataset.soundId);
		switch (action) {
			case "sound-play":
				return playlist.playSound(sound);
			case "sound-pause":
				return sound.update({ playing: false, pausedTime: sound.sound.currentTime });
			case "sound-stop":
				return playlist.stopSound(sound);
		}
	}

	/* -------------------------------------------- */

	/**
	 * Handle volume adjustments to sounds within a Playlist
	 * @param {Event} event   The initial change event
	 * @private
	 */
	_onSoundVolume(event) {
		event.preventDefault();
		const slider = event.currentTarget;
		const li = slider.closest(".sound");
		const playlist = game.playlists.get(li.dataset.playlistId);
		const playlistSound = playlist.sounds.get(li.dataset.soundId);

		// Get the desired target volume
		const volume = foundry.audio.AudioHelper.inputToVolume(slider.value);
		if (volume === playlistSound.volume) return;

		// Immediately apply a local adjustment
		playlistSound.updateSource({ volume });
		playlistSound.sound?.fade(playlistSound.effectiveVolume, { duration: PlaylistSound.VOLUME_DEBOUNCE_MS });
		const tooltip = PlaylistDirectory.volumeToTooltip(volume);
		slider.setAttribute("data-tooltip", tooltip);
		game.tooltip.activate(slider, { text: tooltip });

		// Debounce a change to the database
		if (playlistSound.isOwner) playlistSound.debounceVolume(volume);
	}

	/* -------------------------------------------- */

	/**
	 * Handle changes to the sound playback mode
	 * @param {Event} event   The initial click event
	 * @private
	 */
	_onSoundToggleMode(event) {
		event.preventDefault();
		const li = event.currentTarget.closest(".sound");
		const playlist = game.playlists.get(li.dataset.playlistId);
		const sound = playlist.sounds.get(li.dataset.soundId);
		return sound.update({ repeat: !sound.repeat });
	}

	/* -------------------------------------------- */

	_onPlayingPin() {
		const location = this._playingLocation === "top" ? "bottom" : "top";
		return game.settings.set("core", "playlist.playingLocation", location);
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onSearchFilter(event, query, rgx, html) {
		const isSearch = !!query;
		const playlistIds = new Set();
		const soundIds = new Set();
		const folderIds = new Set();
		const nameOnlySearch = this.collection.searchMode === CONST.DIRECTORY_SEARCH_MODES.NAME;

		// Match documents and folders
		if (isSearch) {
			let results = [];
			if (!nameOnlySearch) results = this.collection.search({ query: query });

			// Match Playlists and Sounds
			for (let d of this.documents) {
				let matched = false;
				for (let s of d.sounds) {
					if (s.playing || rgx.test(SearchFilter.cleanQuery(s.name))) {
						soundIds.add(s._id);
						matched = true;
					}
				}
				if (
					matched ||
					d.playing ||
					(nameOnlySearch && rgx.test(SearchFilter.cleanQuery(d.name))) ||
					results.some((r) => r._id === d._id)
				) {
					playlistIds.add(d._id);
					if (d.folder) folderIds.add(d.folder._id);
				}
			}

			// Include parent Folders
			const folders = this.folders.sort((a, b) => b.depth - a.depth);
			for (let f of folders) {
				if (folderIds.has(f.id) && f.folder) folderIds.add(f.folder._id);
			}
		}

		// Toggle each directory item
		for (let el of html.querySelectorAll(".directory-item")) {
			if (el.classList.contains("global-volume")) continue;

			// Playlists
			if (el.classList.contains("document")) {
				const pid = el.dataset.documentId;
				let playlistIsMatch = !isSearch || playlistIds.has(pid);
				el.style.display = playlistIsMatch ? "flex" : "none";

				// Sounds
				const sounds = el.querySelector(".playlist-sounds");
				for (const li of sounds.children) {
					let soundIsMatch = !isSearch || soundIds.has(li.dataset.soundId);
					li.style.display = soundIsMatch ? "flex" : "none";
					if (soundIsMatch) {
						playlistIsMatch = true;
					}
				}
				const showExpanded = this._expanded.has(pid) || (isSearch && playlistIsMatch);
				el.classList.toggle("collapsed", !showExpanded);
			}

			// Folders
			else if (el.classList.contains("folder")) {
				const hidden = isSearch && !folderIds.has(el.dataset.folderId);
				el.style.display = hidden ? "none" : "flex";
				const uuid = el.closest("li.folder").dataset.uuid;
				const expanded =
					(isSearch && folderIds.has(el.dataset.folderId)) || (!isSearch && game.folders._expanded[uuid]);
				el.classList.toggle("collapsed", !expanded);
			}
		}
	}

	/* -------------------------------------------- */

	/**
	 * Update the displayed timestamps for all currently playing audio sources.
	 * Runs on an interval every 1000ms.
	 * @private
	 */
	_updateTimestamps() {
		if (!this._playingSounds.length) return;
		const playing = this.element.find("#currently-playing")[0];
		if (!playing) return;
		for (let sound of this._playingSounds) {
			const li = playing.querySelector(`.sound[data-sound-id="${sound.id}"]`);
			if (!li) continue;

			// Update current and max playback time
			const current = li.querySelector("span.current");
			const ct = sound.playing ? sound.sound.currentTime : sound.pausedTime;
			if (current) current.textContent = this._formatTimestamp(ct);
			const max = li.querySelector("span.duration");
			if (max) max.textContent = this._formatTimestamp(sound.sound.duration);

			// Remove the loading spinner
			const play = li.querySelector("a.pause i.fas");
			if (play.classList.contains("fa-spinner")) {
				play.classList.remove("fa-spin");
				play.classList.replace("fa-spinner", "fa-pause");
			}
		}
	}

	/* -------------------------------------------- */

	/**
	 * Format the displayed timestamp given a number of seconds as input
	 * @param {number} seconds    The current playback time in seconds
	 * @returns {string}          The formatted timestamp
	 * @private
	 */
	_formatTimestamp(seconds) {
		if (!Number.isFinite(seconds)) return "∞";
		seconds = seconds ?? 0;
		let minutes = Math.floor(seconds / 60);
		seconds = Math.round(seconds % 60);
		return `${minutes}:${seconds.paddedString(2)}`;
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_contextMenu(html) {
		super._contextMenu(html);
		/**
		 * A hook event that fires when the context menu for a Sound in the PlaylistDirectory is constructed.
		 * @function getPlaylistDirectorySoundContext
		 * @memberof hookEvents
		 * @param {jQuery} html                     The HTML element to which the context options are attached
		 * @param {ContextMenuEntry[]} entryOptions The context menu entries
		 */
		ContextMenu.create(this, html, ".playlist .sound", this._getSoundContextOptions(), {
			hookName: "SoundContext",
		});
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_getFolderContextOptions() {
		const options = super._getFolderContextOptions();
		options.findSplice((o) => o.name === "OWNERSHIP.Configure");
		return options;
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_getEntryContextOptions() {
		const options = super._getEntryContextOptions();
		options.findSplice((o) => o.name === "OWNERSHIP.Configure");
		options.unshift({
			name: "PLAYLIST.Edit",
			icon: '<i class="fas fa-edit"></i>',
			callback: (header) => {
				const li = header.closest(".directory-item");
				const playlist = game.playlists.get(li.data("document-id"));
				const sheet = playlist.sheet;
				sheet.render(
					true,
					this.popOut
						? {}
						: {
								top: li[0].offsetTop - 24,
								left: window.innerWidth - ui.sidebar.position.width - sheet.options.width - 10,
						  }
				);
			},
		});
		return options;
	}

	/* -------------------------------------------- */

	/**
	 * Get context menu options for individual sound effects
	 * @returns {Object}   The context options for each sound
	 * @private
	 */
	_getSoundContextOptions() {
		return [
			{
				name: "PLAYLIST.SoundEdit",
				icon: '<i class="fas fa-edit"></i>',
				callback: (li) => {
					const playlistId = li.parents(".playlist").data("document-id");
					const playlist = game.playlists.get(playlistId);
					const sound = playlist.sounds.get(li.data("sound-id"));
					const sheet = sound.sheet;
					sheet.render(
						true,
						this.popOut
							? {}
							: {
									top: li[0].offsetTop - 24,
									left: window.innerWidth - ui.sidebar.position.width - sheet.options.width - 10,
							  }
					);
				},
			},
			{
				name: "PLAYLIST.SoundPreload",
				icon: '<i class="fas fa-download"></i>',
				callback: (li) => {
					const playlistId = li.parents(".playlist").data("document-id");
					const playlist = game.playlists.get(playlistId);
					const sound = playlist.sounds.get(li.data("sound-id"));
					game.audio.preload(sound.path);
				},
			},
			{
				name: "PLAYLIST.SoundDelete",
				icon: '<i class="fas fa-trash"></i>',
				callback: (li) => {
					const playlistId = li.parents(".playlist").data("document-id");
					const playlist = game.playlists.get(playlistId);
					const sound = playlist.sounds.get(li.data("sound-id"));
					return sound.deleteDialog({
						top: Math.min(li[0].offsetTop, window.innerHeight - 350),
						left: window.innerWidth - 720,
					});
				},
			},
		];
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	_onDragStart(event) {
		const target = event.currentTarget;
		if (target.classList.contains("sound-name")) {
			const sound = target.closest(".sound");
			const document = game.playlists.get(sound.dataset.playlistId)?.sounds.get(sound.dataset.soundId);
			event.dataTransfer.setData("text/plain", JSON.stringify(document.toDragData()));
		} else super._onDragStart(event);
	}

	/* -------------------------------------------- */

	/** @inheritdoc */
	async _onDrop(event) {
		const data = TextEditor.getDragEventData(event);
		if (data.type !== "PlaylistSound") return super._onDrop(event);

		// Reference the target playlist and sound elements
		const target = event.target.closest(".sound, .playlist");
		if (!target) return false;
		const sound = await PlaylistSound.implementation.fromDropData(data);
		const playlist = sound.parent;
		const otherPlaylistId = target.dataset.documentId || target.dataset.playlistId;

		// Copying to another playlist.
		if (otherPlaylistId !== playlist.id) {
			const otherPlaylist = game.playlists.get(otherPlaylistId);
			return PlaylistSound.implementation.create(sound.toObject(), { parent: otherPlaylist });
		}

		// If there's nothing to sort relative to, or the sound was dropped on itself, do nothing.
		const targetId = target.dataset.soundId;
		if (!targetId || targetId === sound.id) return false;
		sound.sortRelative({
			target: playlist.sounds.get(targetId),
			siblings: playlist.sounds.filter((s) => s.id !== sound.id),
		});
	}
}

/**
 * //* Since this isn't extending  the DocumentDirectory like other directories, we set our getters and change the default template, here as well as in getData
 * A compendium of knowledge arcane and mystical!
 * Renders the sidebar directory of compendium packs
 * @extends {SidebarTab}
 * @mixes {DirectoryApplication}
 */
export class metaCompendiumDirectory extends DirectoryApplicationMixin(SidebarTab) {
	/** @inheritdoc */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			id: "compendium",
			template: "systems/metanthropes/templates/sidebar/compendium-directory.hbs",
			title: "COMPENDIUM.SidebarTitle",
			contextMenuSelector: ".directory-item.compendium",
			entryClickSelector: ".compendium",
		});
	}

	/**
	 * A reference to the currently active compendium types. If empty, all types are shown.
	 * @type {string[]}
	 */
	#activeFilters = [];

	get activeFilters() {
		return this.#activeFilters;
	}

	/* -------------------------------------------- */

	/** @override */
	entryType = "Compendium";

	/* -------------------------------------------- */

	/** @override */
	static entryPartial = "templates/sidebar/partials/pack-partial.html";

	/* -------------------------------------------- */

	/** @override */
	_entryAlreadyExists(entry) {
		return this.collection.has(entry.collection);
	}

	/* -------------------------------------------- */

	/** @override */
	_getEntryDragData(entryId) {
		const pack = this.collection.get(entryId);
		return {
			type: "Compendium",
			id: pack.collection,
		};
	}

	/* -------------------------------------------- */

	/** @override */
	_entryIsSelf(entry, otherEntry) {
		return entry.metadata.id === otherEntry.metadata.id;
	}

	/* -------------------------------------------- */

	/** @override */
	async _sortRelative(entry, sortData) {
		// We build up a single update object for all compendiums to prevent multiple re-renders
		const packConfig = game.settings.get("core", "compendiumConfiguration");
		const targetFolderId = sortData.updateData.folder;
		if (targetFolderId) {
			packConfig[entry.collection] = foundry.utils.mergeObject(packConfig[entry.collection] || {}, {
				folder: targetFolderId,
			});
		}

		// Update sorting
		const sorting = SortingHelpers.performIntegerSort(entry, sortData);
		for (const s of sorting) {
			const pack = s.target;
			const existingConfig = packConfig[pack.collection] || {};
			existingConfig.sort = s.update.sort;
		}
		await game.settings.set("core", "compendiumConfiguration", packConfig);
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		html.find(".filter").click(this._displayFilterCompendiumMenu.bind(this));
	}

	/* -------------------------------------------- */

	/**
	 * Display a menu of compendium types to filter by
	 * @param {PointerEvent} event    The originating pointer event
	 * @returns {Promise<void>}
	 * @protected
	 */
	async _displayFilterCompendiumMenu(event) {
		// If there is a current dropdown menu, remove it
		const dropdown = document.getElementsByClassName("dropdown-menu")[0];
		if (dropdown) {
			dropdown.remove();
			return;
		}
		const button = event.currentTarget;

		// Display a menu of compendium types to filter by
		const choices = CONST.COMPENDIUM_DOCUMENT_TYPES.map((t) => {
			const config = CONFIG[t];
			return {
				name: game.i18n.localize(config.documentClass.metadata.label),
				icon: config.sidebarIcon,
				type: t,
				callback: (event) => this._onToggleCompendiumFilterType(event, t),
			};
		});

		// If there are active filters, add a "Clear Filters" option
		if (this.#activeFilters.length) {
			choices.unshift({
				name: game.i18n.localize("COMPENDIUM.ClearFilters"),
				icon: "fas fa-times",
				type: null,
				callback: (event) => this._onToggleCompendiumFilterType(event, null),
			});
		}

		// Create a vertical list of buttons contained in a div
		const menu = document.createElement("div");
		menu.classList.add("dropdown-menu");
		const list = document.createElement("div");
		list.classList.add("dropdown-list", "flexcol");
		menu.appendChild(list);
		for (let c of choices) {
			const dropdownItem = document.createElement("a");
			dropdownItem.classList.add("dropdown-item");
			if (this.#activeFilters.includes(c.type)) dropdownItem.classList.add("active");
			dropdownItem.innerHTML = `<i class="${c.icon}"></i> ${c.name}`;
			dropdownItem.addEventListener("click", c.callback);
			list.appendChild(dropdownItem);
		}

		// Position the menu
		const pos = {
			top: button.offsetTop + 10,
			left: button.offsetLeft + 10,
		};
		menu.style.top = `${pos.top}px`;
		menu.style.left = `${pos.left}px`;
		button.parentElement.appendChild(menu);
	}

	/* -------------------------------------------- */

	/**
	 * Handle toggling a compendium type filter
	 * @param {PointerEvent} event    The originating pointer event
	 * @param {string|null} type      The compendium type to filter by. If null, clear all filters.
	 * @protected
	 */
	_onToggleCompendiumFilterType(event, type) {
		if (type === null) this.#activeFilters = [];
		else
			this.#activeFilters = this.#activeFilters.includes(type)
				? this.#activeFilters.filter((t) => t !== type)
				: this.#activeFilters.concat(type);
		this.render();
	}

	/* -------------------------------------------- */

	/**
	 * The collection of Compendium Packs which are displayed in this Directory
	 * @returns {CompendiumPacks<string, CompendiumCollection>}
	 */
	get collection() {
		return game.packs;
	}

	/* -------------------------------------------- */
	//? Add our getters
	get isMetaCore() {
		return Boolean(game.settings.get("metanthropes", "metaCore"));
	}
	get isMetaHomebrew() {
		return Boolean(game.settings.get("metanthropes", "metaHomebrew"));
	}
	get isMetaCreationAllowed() {
		return this.isMetaHomebrew;
	}

	/**
	 * Get the dropped Entry from the drop data
	 * @param {object} data         The data being dropped
	 * @returns {Promise<object>}   The dropped Entry
	 * @protected
	 */
	async _getDroppedEntryFromData(data) {
		return game.packs.get(data.id);
	}

	/* -------------------------------------------- */

	/** @override */
	async _createDroppedEntry(document, folder) {
		throw new Error("The _createDroppedEntry shouldn't be called for CompendiumDirectory");
	}

	/* -------------------------------------------- */

	/** @override */
	_getEntryName(entry) {
		return entry.metadata.label;
	}

	/* -------------------------------------------- */

	/** @override */
	_getEntryId(entry) {
		return entry.metadata.id;
	}

	/* -------------------------------------------- */

	/** @override */
	async getData(options = {}) {
		let context = await super.getData(options);

		// For each document, assign a default image if one is not already present, and calculate the style string
		const packageTypeIcons = {
			world: World.icon,
			system: System.icon,
			module: Module.icon,
		};
		const packContext = {};
		for (const pack of this.collection) {
			packContext[pack.collection] = {
				locked: pack.locked,
				customOwnership: "ownership" in pack.config,
				collection: pack.collection,
				name: pack.metadata.packageName,
				label: pack.metadata.label,
				icon: CONFIG[pack.metadata.type].sidebarIcon,
				hidden: this.#activeFilters?.length ? !this.#activeFilters.includes(pack.metadata.type) : false,
				banner: pack.banner,
				sourceIcon: packageTypeIcons[pack.metadata.packageType],
			};
		}

		// Return data to the sidebar
		context = foundry.utils.mergeObject(context, {
			folderIcon: CONFIG.Folder.sidebarIcon,
			label: game.i18n.localize("PACKAGE.TagCompendium"),
			labelPlural: game.i18n.localize("SIDEBAR.TabCompendium"),
			sidebarIcon: "fas fa-atlas",
			filtersActive: !!this.#activeFilters.length,
			//? Adding our logic
			isMetaCreationAllowed: this.isMetaCreationAllowed,
		});
		context.packContext = packContext;
		return context;
	}

	/* -------------------------------------------- */

	/** @override */
	async render(force = false, options = {}) {
		game.packs.initializeTree();
		return super.render(force, options);
	}

	/* -------------------------------------------- */

	/** @override */
	_getEntryContextOptions() {
		if (!game.user.isGM) return [];
		return [
			{
				name: "OWNERSHIP.Configure",
				icon: '<i class="fa-solid fa-user-lock"></i>',
				callback: (li) => {
					const pack = game.packs.get(li.data("pack"));
					return pack.configureOwnershipDialog();
				},
			},
			{
				name: "FOLDER.Clear",
				icon: '<i class="fas fa-folder"></i>',
				condition: (header) => {
					const li = header.closest(".directory-item");
					const entry = this.collection.get(li.data("entryId"));
					return !!entry.folder;
				},
				callback: (header) => {
					const li = header.closest(".directory-item");
					const entry = this.collection.get(li.data("entryId"));
					entry.setFolder(null);
				},
			},
			{
				name: "COMPENDIUM.ToggleLocked",
				icon: '<i class="fas fa-lock"></i>',
				callback: (li) => {
					let pack = game.packs.get(li.data("pack"));
					const isUnlock = pack.locked;
					if (isUnlock && pack.metadata.packageType !== "world") {
						return Dialog.confirm({
							title: `${game.i18n.localize("COMPENDIUM.ToggleLocked")}: ${pack.title}`,
							content: `<p><strong>${game.i18n.localize("Warning")}:</strong> ${game.i18n.localize(
								"COMPENDIUM.ToggleLockedWarning"
							)}</p>`,
							yes: () => pack.configure({ locked: !pack.locked }),
							options: {
								top: Math.min(li[0].offsetTop, window.innerHeight - 350),
								left: window.innerWidth - 720,
								width: 400,
							},
						});
					} else return pack.configure({ locked: !pack.locked });
				},
			},
			{
				name: "COMPENDIUM.Duplicate",
				icon: '<i class="fas fa-copy"></i>',
				callback: (li) => {
					let pack = game.packs.get(li.data("pack"));
					const html = `<form>
		  <div class="form-group">
		      <label>${game.i18n.localize("COMPENDIUM.DuplicateTitle")}</label>
		      <input type="text" name="label" value="${game.i18n.format("DOCUMENT.CopyOf", { name: pack.title })}"/>
		      <p class="notes">${game.i18n.localize("COMPENDIUM.DuplicateHint")}</p>
		  </div>
		</form>`;
					return Dialog.confirm({
						title: `${game.i18n.localize("COMPENDIUM.Duplicate")}: ${pack.title}`,
						content: html,
						yes: (html) => {
							const label = html.querySelector('input[name="label"]').value;
							return pack.duplicateCompendium({ label });
						},
						options: {
							top: Math.min(li[0].offsetTop, window.innerHeight - 350),
							left: window.innerWidth - 720,
							width: 400,
							jQuery: false,
						},
					});
				},
			},
			{
				name: "COMPENDIUM.ImportAll",
				icon: '<i class="fas fa-download"></i>',
				condition: (li) => game.packs.get(li.data("pack"))?.documentName !== "Adventure",
				callback: (li) => {
					let pack = game.packs.get(li.data("pack"));
					return pack.importDialog({
						top: Math.min(li[0].offsetTop, window.innerHeight - 350),
						left: window.innerWidth - 720,
						width: 400,
					});
				},
			},
			{
				name: "COMPENDIUM.Delete",
				icon: '<i class="fas fa-trash"></i>',
				condition: (li) => {
					let pack = game.packs.get(li.data("pack"));
					return pack.metadata.packageType === "world";
				},
				callback: (li) => {
					let pack = game.packs.get(li.data("pack"));
					return this._onDeleteCompendium(pack);
				},
			},
		];
	}

	/* -------------------------------------------- */

	/** @override */
	async _onClickEntryName(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const packId = element.closest("[data-pack]").dataset.pack;
		const pack = game.packs.get(packId);
		pack.render(true);
	}

	/* -------------------------------------------- */

	/** @override */
	async _onCreateEntry(event) {
		event.preventDefault();
		event.stopPropagation();
		const li = event.currentTarget.closest(".directory-item");
		const targetFolderId = li ? li.dataset.folderId : null;
		//? Added an exclusion of Cards as a valid Compendium type
		const types = CONST.COMPENDIUM_DOCUMENT_TYPES.filter((documentName) => documentName !== "Cards").map(
			(documentName) => {
				return {
					value: documentName,
					label: game.i18n.localize(getDocumentClass(documentName).metadata.label),
				};
			}
		);
		game.i18n.sortObjects(types, "label");
		const folders = this.collection._formatFolderSelectOptions();
		const html = await renderTemplate("templates/sidebar/compendium-create.html", {
			types,
			folders,
			folder: targetFolderId,
			hasFolders: folders.length >= 1,
		});
		return Dialog.prompt({
			title: game.i18n.localize("COMPENDIUM.Create"),
			content: html,
			label: game.i18n.localize("COMPENDIUM.Create"),
			callback: async (html) => {
				const form = html.querySelector("#compendium-create");
				const fd = new FormDataExtended(form);
				const metadata = fd.object;
				let targetFolderId = metadata.folder;
				if (metadata.folder) delete metadata.folder;
				if (!metadata.label) {
					let defaultName = game.i18n.format("DOCUMENT.New", {
						type: game.i18n.localize("PACKAGE.TagCompendium"),
					});
					const count = game.packs.size;
					if (count > 0) defaultName += ` (${count + 1})`;
					metadata.label = defaultName;
				}
				const pack = await CompendiumCollection.createCompendium(metadata);
				if (targetFolderId) await pack.setFolder(targetFolderId);
			},
			rejectClose: false,
			options: { jQuery: false },
		});
	}

	/* -------------------------------------------- */

	/**
	 * Handle a Compendium Pack deletion request
	 * @param {object} pack   The pack object requested for deletion
	 * @private
	 */
	_onDeleteCompendium(pack) {
		return Dialog.confirm({
			title: `${game.i18n.localize("COMPENDIUM.Delete")}: ${pack.title}`,
			content: `<h4>${game.i18n.localize("AreYouSure")}</h4><p>${game.i18n.localize(
				"COMPENDIUM.DeleteWarning"
			)}</p>`,
			yes: () => pack.deleteCompendium(),
			defaultYes: false,
		});
	}
}
