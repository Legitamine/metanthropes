//? Import Roll Handler
import { HandleMetaRolls } from "../helpers/metarollhandler.mjs";
//? Import New Actor & Finalize Actor Logic
import { NewActor, FinalizePremadeProtagonist } from "../metanthropes/newactor.mjs";
//? Import Progression Sheet
import { MetaStartProgression } from "../metanthropes/metaprogression.mjs";
//? Import helpers
import { metaLog } from "../helpers/metahelpers.mjs";
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
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
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
		return `systems/metanthropes-system/templates/actor/${this.actor.type}-sheet.hbs`;
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
		//todo I would like to refresh the sheet after getting all the data
		metaLog(3, "MetanthropesActorSheet getData results", "this, context, options", this, context, options);
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
		html.find(".finalize-premade-protagonist").click(this._onFinalizePremadeProtagonist.bind(this));
		//? Progression Form Button
		html.find(".progression-form").click(this._onProgression.bind(this));
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
	async _onFinalizePremadeProtagonist(event) {
		event.preventDefault();
		const actor = this.actor;
		await FinalizePremadeProtagonist(actor);
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
}
