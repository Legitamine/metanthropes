//? Import Roll Handler
import { HandleMetaRolls, handleCoverRolls } from "../helpers/metarollhandler.mjs";
//? Import New Actor & Finalize Actor Logic
import { NewActor, FinalizePremadeActor } from "../metanthropes/newactor.mjs";
//? Import Progression Sheet
import { MetaStartProgression } from "../metanthropes/metaprogression.mjs";
//? Import helpers
import { metaLog, metaFilePicker, metaHandleResize } from "../helpers/metahelpers.mjs";
//? Import Active Effect helper
import { prepareActiveEffectCategories, onManageActiveEffect } from "../metanthropes/metaeffects.mjs";
/**
 * MetanthropesActorSheet - An Actor Sheet for Metanthropes actors.
 *
 * This class extends the foundry ActorSheet class.
 * It is used to display and edit actors.
 *
 * @extends {ActorSheet}
 *
 */
export class MetanthropesActorSheet extends ActorSheet {
	/** @override */
	//todo Decide on the opening tab
	static get defaultOptions() {
		const options = super.defaultOptions;
		return mergeObject(options, {
			id: "metanthropes-actor-sheet",
			classes: ["metanthropes", "sheet", "actor"], //? these are custom css classes that are used in the html file
			width: 1012,
			height: 913,
			//! I don't understand why I can still drag when no item has .enablehotbar
			dragDrop: [{ dragSelector: ".enablehotbar", dropSelector: null }],
			tabs: [
				{
					navSelector: ".csnavselector",
					contentSelector: ".csnavtabs",
					initial: "cs-charstats",
				},
			],
			sheetConfig: false,
			closeOnSubmit: false,
			submitOnClose: false,
			submitOnChange: true,
			resizable: true,
			minimizable: true,
		});
	}
	/** @override */
	get template() {
		return `systems/metanthropes-system/templates/actor/actor-sheet.hbs`;
	}
	/** @override */
	get title() {
		return this.actor.isToken
			? `[Token] ${this.actor.name} - ${this.actor.type}`
			: `${this.actor.name} - ${this.actor.type}`;
	}
	/** @override */
	getData(options = {}) {
		//* Retrieve the data structure from the base sheet. You can inspect or log
		//* the context variable to see the structure, but some key properties for
		//* sheets are the actor object, the data object, whether or not it's
		//* editable, the items array, and the effects array.
		//* Much like the Actor class' prepareData() method, we can use the getData() method to derive new data for the character sheet.
		//* The main difference is that values created here will only be available within this class and on the character sheet's HTML template.
		//* If you were to use your browser's inspector to take a look at an actor's available data, you wouldn't see these values in the list, unlike those created in prepareData().
		//? super.getData() will construct context.actor context.items and context.effects
		const context = super.getData(options);
		//* It uses Foundry's built in toObject() method and gives it the false parameter, which instructs Foundry to not just convert this to a plain object but to also run a deep clone on nested objects/arrays.
		//* from https://foundryvtt.wiki/en/development/guides/SD-tutorial/SD07-Extending-the-ActorSheet-class
		//? Use a safe clone of the actor data for further operations.
		const actorData = this.actor.toObject(false);
		//? Add the actor's system attributes and flages to the context for easier access.
		context.system = actorData.system;
		context.flags = actorData.flags;
		//? Prepare items - this will produce .Metapowers and .Possessions where applicable
		//todo break it down to metapowers and possessions so I can get better filtering by actor.type (?)
		//todo for Duplicates, perhaps skipping thi step will remove all Metapowers and Possessions from the sheet? How do I keep the strike?
		if (actorData.type !== "Animal") {
			this._prepareItems(context);
		}
		//? This will create the .RollStats object under .system that is used by Handlebars in the actor sheet for rolling
		this.actor.getRollData();
		//? Provide a boolean for if 'Beta Testing of New Features' is enabled
		context.betaTesting = game.settings.get("metanthropes-system", "metaBetaTesting");
		//? Provide a boolean for if 'Advanced Logging' is enabled
		context.advancedLogging = game.settings.get("metanthropes-system", "metaAdvancedLogging");
		//? Provide a combined boolean for if 'Beta Testing of New Features' and 'Advanced Logging' are enabled
		context.advancedBetaTesting = context.betaTesting && context.advancedLogging;
		//? Provide a boolean for if the user is a Narrator(GameMaster)
		context.isNarrator = game.user.isGM;
		//? Add the actor's active effects to the context for easier access.
		if (context.betaTesting) context.effects = prepareActiveEffectCategories(this.actor.effects);
		//? Change the default Tab to Summary for Narrators opening up Premade Actors
		if (game.user.isGM && this.actor.isPremade) this._tabs[0].active = "cs-summary";
		metaLog(3, "MetanthropesActorSheet", "getData", "this, context, options", this, context, options);
		return context;
	}
	//* Prepare items
	_prepareItems(context) {
		//? Initialize containers.
		const Possessions = {
			Strike: [],
			Weapon: [],
			Armor: [],
			Gadget: [],
			Drug: [],
		};
		const Metapowers = {
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
		};
		//? Iterate through items, allocating to containers
		for (let i of context.items) {
			//! Why do I need this line?
			i.img = i.img || DEFAULT_TOKEN;
			//? Append to Possessions.
			if (i.type === "Possession") {
				if (i.system.Category.value != undefined) {
					Possessions[i.system.Category.value].push(i);
				}
			}
			//? Append to Metapowers.
			else if (i.type === "Metapower") {
				if (i.system.Level.value != undefined) {
					Metapowers[i.system.Level.value].push(i);
				}
			}
		}
		//? Assign and return
		context.Possessions = Possessions;
		context.Metapowers = Metapowers;
	}
	//* activate listeners for clickable stuff on the actor sheet!
	activateListeners(html) {
		super.activateListeners(html);
		//? Render the item sheet for viewing/editing prior to the editable check.
		html.find(".item-edit").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.sheet.render(true);
		});
		//* Everything below this point is only needed if the sheet is editable
		//? Observers (non-owners) of the item sheet, should not be able to roll anything, or add/remove items
		if (!this.isEditable) return;
		//? Add Inventory Item
		//! This is how I will add metapowers or allow players to browse compendiums
		html.find(".item-create").click(this._onItemCreate.bind(this));
		//? Delete Inventory Item
		html.find(".item-delete").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.delete();
			li.slideUp(200, () => this.render(false));
		});
		//? Active Effect management
		if (this.betaTesting) html.find(".effect-control").click((ev) => onManageActiveEffect(ev, this.actor));
		//? Roll Stat
		html.find(".style-cs-rolls").click(this._onRoll.bind(this));
		html.find(".style-cs-rolls").on("contextmenu", this._onCustomRoll.bind(this));
		//? Roll Metapower
		html.find(".style-mp-rolls").click(this._onRoll.bind(this));
		html.find(".style-mp-rolls").on("contextmenu", this._onCustomRoll.bind(this));
		//? Roll Possession
		html.find(".style-pos-rolls").click(this._onRoll.bind(this));
		html.find(".style-pos-rolls").on("contextmenu", this._onCustomRoll.bind(this));
		//? Roll New Actor Button
		html.find(".new-actor").click(this._onNewActor.bind(this));
		//? Finalize Premade Protagonist Button
		html.find(".finalize-premade-actor").click(this._onFinalizePremadeActor.bind(this));
		//? Change the Player controling the Actor
		html.find(".change-actor-player").click(this._onChangeActorPlayer.bind(this));
		//? Progression Form Button
		html.find(".progression-form").click(this._onProgression.bind(this));
		//? Roll Cover
		html.find(".meta-cover-roll").click(this._onCoverRoll.bind(this));
		//? Change Portrait
		html.find(".meta-change-portrait").click(this._onChangePortrait.bind(this));
		//!? Drag events for macros !??
		if (this.actor.isOwner) {
			let handler = (ev) => this._onDragStart(ev);
			html.find("li.item").each((i, li) => {
				if (li.classList.contains("inventory-header")) return;
				li.setAttribute("draggable", true);
				li.addEventListener("dragstart", handler, false);
			});
		}
	}
	//* Responsive UI
	//? Header Buttons
	/** @override */
	_getHeaderButtons() {
		let buttons = super._getHeaderButtons();
		const closeIndex = buttons.findIndex((btn) => btn.label === "Close");
		buttons.splice(closeIndex, 0, {
			class: "header-ui-button-single-column",
			icon: "fas fa-arrows-up-down",
			onclick: () => this._onHeaderButtonClick("singleColumn"),
		});
		buttons.splice(closeIndex + 1, 0, {
			class: "header-ui-button-small",
			icon: "fas fa-table-cells",
			onclick: () => this._onHeaderButtonClick("small"),
		});
		buttons.splice(closeIndex + 2, 0, {
			class: "header-ui-button-medium",
			icon: "fas fa-outdent",
			onclick: () => this._onHeaderButtonClick("medium"),
		});
		buttons.splice(closeIndex + 3, 0, {
			class: "header-ui-button-normal",
			icon: "fas fa-square-full",
			onclick: () => this._onHeaderButtonClick("normal"),
		});
		buttons.splice(closeIndex + 4, 0, {
			class: "header-ui-button-extended",
			icon: "fas fa-indent",
			onclick: () => this._onHeaderButtonClick("extended"),
		});
		//? Filters-out the Item Piles button for all actors besides Vehicles
		if (this.actor.type !== "Vehicle") buttons = buttons.filter((btn) => btn.label !== "Configure");
		return buttons;
	}
	async _onHeaderButtonClick(size) {
		await this.minimize();
		switch (size) {
			case "singleColumn":
				this.position.width = 200;
				this.position.height = 880;
				this._tabs[0].active = "cs-charstats";
				break;
			case "small":
				this.position.width = 300;
				this.position.height = 380;
				this._tabs[0].active = "cs-charstats";
				break;
			case "medium":
				this.position.width = 550;
				this.position.height = 895;
				break;
			case "extended":
				this.position.width = 1400;
				this.position.height = 940;
				break;
			default:
				this.position.width = 1012;
				this.position.height = 913;
				break;
		}
		await this.maximize();
		this.render(true);
		metaLog(3, "MetanthropesActorSheet _onHeaderButtonClick", size);
	}
	//? Render the sheet
	/**
	 * Render the outer application wrapper
	 * @returns {Promise<jQuery>}   A promise resolving to the constructed jQuery object
	 * @protected
	 */
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
		html.css({ zIndex: this.position.zIndex });
		ui.activeWindow = this;
		// Return the outer frame
		return html;
	}
	//? Resize the sheet on render
	/** @override */
	async _render(force = false, options = {}) {
		await super._render(force, options);
		const resizeElement = this.element[0];
		this._onResize(null, resizeElement);
	}
	//? Change CSS classes based on the width of the sheet
	/** @override */
	//todo: this desperately needs to be refactored & outsourced to a helper function
	_onResize(event, element = null) {
		super._onResize(event);
		let uiTargets = element ? $(element).find(".meta-ui-responsive") : this.element.find(".meta-ui-responsive");
		const currentWidth = this.position.width;
		for (let target of uiTargets) {
			const isSingleColumn = currentWidth <= 280;
			const isMinimumSize = currentWidth <= 450 && currentWidth > 280;
			const isMediumSize = currentWidth > 450 && currentWidth < 750;
			const isMaximumSize = currentWidth > 750 && currentWidth < 1190;
			const isBeyondMaximumSize = currentWidth >= 1190;
			const hideAtMinimum = target.classList.contains("meta-ui-hide-at-minimum");
			const hideAtMedium = target.classList.contains("meta-ui-hide-at-medium");
			const characteristicLabel = target.classList.contains("style-cs-chars-label");
			const statLabel = target.classList.contains("style-cs-stats-label");
			const characteristicContainer = target.classList.contains("meta-ui-change-at-minimum");
			const charstats2Grid = target.classList.contains("meta-ui-change-at-medium");
			const summary1Grid = target.classList.contains("meta-ui-change-summary-at-medium");
			const statRoll = target.classList.contains("meta-ui-change-at-single-column");
			const extraFields = target.classList.contains("meta-ui-extra-fields");
			if (isSingleColumn) {
				if (hideAtMinimum) target.classList.toggle("meta-ui-hidden", true);
				if (hideAtMedium) target.classList.toggle("meta-ui-hidden", true);
				if (characteristicLabel) {
					target.classList.toggle("meta-ui-small-font", false);
					target.classList.toggle("meta-ui-medium-font", false);
					target.classList.toggle("meta-ui-single-column-font", true);
				}
				if (statLabel) {
					target.classList.toggle("meta-ui-small-font", false);
					target.classList.toggle("meta-ui-medium-font", false);
					target.classList.toggle("meta-ui-single-column-font", true);
				}
				if (characteristicContainer) {
					target.classList.toggle("layout-container-outer-charstats", false);
					target.classList.toggle("layout-container-outer-charstats-minimum", false);
					target.classList.toggle("layout-container-outer-charstats-single-column", true);
				}
				if (statRoll) {
					target.classList.toggle("style-cs-rolls-single-column", true);
					target.classList.toggle("style-cs-rolls", false);
				}
				if (extraFields) target.classList.toggle("meta-ui-hidden", true);
				if (charstats2Grid) {
					target.classList.toggle("layout-container-grid3x1-cs", false);
					target.classList.toggle("layout-container-grid2x1-cs", false);
					target.classList.toggle("layout-container-grid1x1-cs", true);
				}
				if (summary1Grid) {
					target.classList.toggle("layout-tab-summary-at-medium", true);
					target.classList.toggle("layout-tab-summary", false);
				}
			} else if (isMinimumSize) {
				if (hideAtMinimum) target.classList.toggle("meta-ui-hidden", true);
				if (hideAtMedium) target.classList.toggle("meta-ui-hidden", true);
				if (characteristicLabel) {
					target.classList.toggle("meta-ui-small-font", true);
					target.classList.toggle("meta-ui-medium-font", false);
					target.classList.toggle("meta-ui-single-column-font", false);
				}
				if (statLabel) {
					target.classList.toggle("meta-ui-small-font", true);
					target.classList.toggle("meta-ui-medium-font", false);
					target.classList.toggle("meta-ui-single-column-font", false);
				}
				if (characteristicContainer) {
					target.classList.toggle("layout-container-outer-charstats", false);
					target.classList.toggle("layout-container-outer-charstats-minimum", true);
					target.classList.toggle("layout-container-outer-charstats-single-column", false);
				}
				if (statRoll) {
					target.classList.toggle("style-cs-rolls-single-column", true);
					target.classList.toggle("style-cs-rolls", false);
				}
				if (extraFields) target.classList.toggle("meta-ui-hidden", true);
				if (charstats2Grid) {
					target.classList.toggle("layout-container-grid3x1-cs", false);
					target.classList.toggle("layout-container-grid2x1-cs", false);
					target.classList.toggle("layout-container-grid1x1-cs", true);
				}
				if (summary1Grid) {
					target.classList.toggle("layout-tab-summary-at-medium", true);
					target.classList.toggle("layout-tab-summary", false);
				}
			} else if (isMediumSize) {
				if (hideAtMinimum) target.classList.toggle("meta-ui-hidden", false);
				if (hideAtMedium) target.classList.toggle("meta-ui-hidden", true);
				if (characteristicLabel) {
					target.classList.toggle("meta-ui-small-font", false);
					target.classList.toggle("meta-ui-medium-font", true);
					target.classList.toggle("meta-ui-single-column-font", false);
				}
				if (statLabel) {
					target.classList.toggle("meta-ui-small-font", false);
					target.classList.toggle("meta-ui-medium-font", true);
					target.classList.toggle("meta-ui-single-column-font", false);
				}
				if (characteristicContainer) {
					target.classList.toggle("layout-container-outer-charstats", true);
					target.classList.toggle("layout-container-outer-charstats-minimum", false);
					target.classList.toggle("layout-container-outer-charstats-single-column", false);
				}
				if (statRoll) {
					target.classList.toggle("style-cs-rolls-single-column", true);
					target.classList.toggle("style-cs-rolls", false);
				}
				if (extraFields) target.classList.toggle("meta-ui-hidden", true);
				if (charstats2Grid) {
					target.classList.toggle("layout-container-grid3x1-cs", false);
					target.classList.toggle("layout-container-grid2x1-cs", true);
					target.classList.toggle("layout-container-grid1x1-cs", false);
				}
				if (summary1Grid) {
					target.classList.toggle("layout-tab-summary-at-medium", true);
					target.classList.toggle("layout-tab-summary", false);
				}
			} else if (isMaximumSize) {
				if (hideAtMinimum) target.classList.toggle("meta-ui-hidden", false);
				if (hideAtMedium) target.classList.toggle("meta-ui-hidden", false);
				if (characteristicLabel) {
					target.classList.toggle("meta-ui-small-font", false);
					target.classList.toggle("meta-ui-medium-font", false);
					target.classList.toggle("meta-ui-single-column-font", false);
				}
				if (statLabel) {
					target.classList.toggle("meta-ui-small-font", false);
					target.classList.toggle("meta-ui-medium-font", false);
					target.classList.toggle("meta-ui-single-column-font", false);
				}
				if (characteristicContainer) {
					target.classList.toggle("layout-container-outer-charstats", true);
					target.classList.toggle("layout-container-outer-charstats-minimum", false);
					target.classList.toggle("layout-container-outer-charstats-single-column", false);
				}
				if (statRoll) {
					target.classList.toggle("style-cs-rolls-single-column", false);
					target.classList.toggle("style-cs-rolls", true);
				}
				if (extraFields) target.classList.toggle("meta-ui-hidden", true);
				if (charstats2Grid) {
					target.classList.toggle("layout-container-grid3x1-cs", true);
					target.classList.toggle("layout-container-grid2x1-cs", false);
					target.classList.toggle("layout-container-grid1x1-cs", false);
				}
				if (summary1Grid) {
					target.classList.toggle("layout-tab-summary-at-medium", false);
					target.classList.toggle("layout-tab-summary", true);
				}
			} else if (isBeyondMaximumSize) {
				if (hideAtMinimum) target.classList.toggle("meta-ui-hidden", false);
				if (hideAtMedium) target.classList.toggle("meta-ui-hidden", false);
				if (characteristicLabel) {
					target.classList.toggle("meta-ui-small-font", false);
					target.classList.toggle("meta-ui-medium-font", false);
					target.classList.toggle("meta-ui-single-column-font", false);
				}
				if (statLabel) {
					target.classList.toggle("meta-ui-small-font", false);
					target.classList.toggle("meta-ui-medium-font", false);
					target.classList.toggle("meta-ui-single-column-font", false);
				}
				if (characteristicContainer) {
					target.classList.toggle("layout-container-outer-charstats", true);
					target.classList.toggle("layout-container-outer-charstats-minimum", false);
					target.classList.toggle("layout-container-outer-charstats-single-column", false);
				}
				if (statRoll) {
					target.classList.toggle("style-cs-rolls-single-column", false);
					target.classList.toggle("style-cs-rolls", true);
				}
				if (extraFields) target.classList.toggle("meta-ui-hidden", false);
				if (charstats2Grid) {
					target.classList.toggle("layout-container-grid3x1-cs", true);
					target.classList.toggle("layout-container-grid2x1-cs", false);
					target.classList.toggle("layout-container-grid1x1-cs", false);
				}
				if (summary1Grid) {
					target.classList.toggle("layout-tab-summary-at-medium", false);
					target.classList.toggle("layout-tab-summary", true);
				}
			}
		}
	}
	//! is this being used?
	// code from boilerplate
	async _onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		// Get the type of item to create.
		const type = header.dataset.type;
		// Grab any data associated with this control.
		const data = duplicate(header.dataset);
		// Initialize a default name.
		const name = `New ${type.capitalize()}`;
		// Prepare the item object.
		const itemData = {
			name: name,
			type: type,
			system: data,
		};
		// Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.system["type"];
		// Finally, create the item!
		return await Item.create(itemData, { parent: this.actor });
	}
	//* Handle Left-Click Rolls
	async _onRoll(event) {
		HandleMetaRolls(event, this, false);
	}
	//* Handle Right-Click Rolls
	async _onCustomRoll(event) {
		HandleMetaRolls(event, this, true);
	}
	//* New Actor Logic
	async _onNewActor(event) {
		event.preventDefault();
		const actor = this.actor;
		await NewActor(actor);
	}
	//* Finalize Premade Protagonist
	async _onFinalizePremadeActor(event) {
		event.preventDefault();
		const actor = this.actor;
		await FinalizePremadeActor(actor);
	}
	//* Change the Player controling the Actor
	async _onChangeActorPlayer(event) {
		event.preventDefault();
		const actor = this.actor;
		//? Present a dialog with values from the game.users object
		const activePlayers = game.users.filter((user) => user.active);
		if (activePlayers.length === 0) {
			ui.notifications.warn("There are no active players to choose from");
			return;
		}
		//? Create a new Dialog
		const dialog = new Dialog({
			title: "Change Player",
			content: `
			<form>
				<div>Only Narrators (Gamemasters) and the chosen Player can see and click the Buttons in the Chat<br><br></div>
				<div><p>You can add/remove players from the Settings - User Management<br><br> To manually change the Player's name, please use the 'Narrator Toolbox - Edit Protagonist Details' Macro<br><br></p></div>
				<div><p>Current Player: ${actor.system.metaowner.value}</p><br></div>
				<div class="form-group">
					<label>New Player</label>
					<select id="player" name="player">
						${activePlayers.map((user) => `<option value="${user.name}">${user.name}</option>`)}
					</select>
				</div>
			</form>
			`,
			buttons: {
				select: {
					label: "Confirm",
					callback: async (html) => {
						//? Get the selected player
						const selectedPlayer = html.find("#player")[0].value;
						//? Change the actor's player
						await actor.update({ "system.metaowner.value": selectedPlayer });
						//? Close the dialog
						dialog.close();
					},
				},
				cancel: {
					label: "Cancel",
				},
			},
			default: "select",
		});
		//? Render the dialog
		dialog.render(true);
	}
	//* Progression
	async _onProgression(event) {
		event.preventDefault();
		//? Check if 'Beta Testing of New Features' is enabled
		if (!game.settings.get("metanthropes-system", "metaBetaTesting")) {
			ui.notifications.warn("Progression is only available if Beta Testing of New Features is enabled");
			return;
		}
		//? Get the actor for the Progression
		const metaProgressionActor = this.actor;
		//? Set the Flags for the Progression Form
		//! Note that this flag will remain set unless otherwise told to do so!
		//todo do this properly with a promise!
		metaProgressionActor.setFlag("metanthropes-system", "Progression", { isProgressing: true });
		//? Pass along the actor to the Progression Form
		metaLog(
			3,
			"MetanthropesActorSheet",
			"_onProgression",
			"Engaging Progression Form for",
			metaProgressionActor.name
		);
		try {
			await MetaStartProgression(metaProgressionActor);
		} catch (error) {
			metaLog(2, "MetanthropesActorSheet", "_onProgression", "ERROR:", error);
			metaProgressionActor.setFlag("metanthropes-system", "Progression", { isProgressing: false });
		}
	}
	async _onCoverRoll(event) {
		handleCoverRolls(event, this);
	}
	async _onChangePortrait(event) {
		event.preventDefault();
		const fp = new metaFilePicker({
			resource: "data",
			current: "systems/metanthropes-system/artwork/tokens/portraits/",
			displayMode: "tiles",
			callback: this._onSelectFile.bind(this),
		});
		this.filepickers.push(fp);
		return fp.browse();
	}
	async _onSelectFile(selection, filePicker) {
		const actor = this.actor;
		const path = selection;
		//? Update the Actor image + Prototype token image
		//todo need to evaluate how this works with non-linked tokens & actors
		await actor.update({ img: path });
		const prototype = actor.prototypeToken || false;
		if (prototype) {
			await actor.update({ "prototypeToken.texture.src": path });
		}
		//? Update Iterate over all scenes
		for (const scene of game.scenes) {
			let tokensToUpdate = [];
			//? Find tokens that represent the actor
			for (const token of scene.tokens.contents) {
				if (token.actorId === actor.id) {
					tokensToUpdate.push({ _id: token.id, "texture.src": path });
				}
			}
			//? Update the token images
			if (tokensToUpdate.length > 0) {
				await scene.updateEmbeddedDocuments("Token", tokensToUpdate);
			}
		}
	}
}
