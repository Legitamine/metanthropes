////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the Actor Sheet for the Metanthropes RPG System for FoundryVTT.
//? This controls how
//todo: Enable basic functionality
//*
////
import { MetaRoll } from "../helpers/metaroll.mjs";
export class MetanthropesActorSheet extends ActorSheet {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["metanthropes", "sheet", "actor"], // these are custom css classes that are used in the html file
			width: 990,
			height: 900,
			closeOnSubmit: false,
			submitOnClose: true,
			submitOnChange: true,
			resizable: true,
			tabs: [
				{
					navSelector: ".csnavselector",
					contentSelector: ".csnavtabs",
					initial: "cs-charstats",
				},
			],
		});
	}
	get template() {
		return `systems/metanthropes-system/templates/actor/${this.actor.type}-sheet.hbs`;
	}
	getData() {
		const context = super.getData();
		// from boilerplate:
		// Use a safe clone of the actor data for further operations.
		// It uses the document data's built in toObject() method and gives it the false parameter, which instructs Foundry to not just convert this to a plain object but to also run a deep clone on nested objects/arrays.
		// from https://foundryvtt.wiki/en/development/guides/SD-tutorial/SD07-Extending-the-ActorSheet-class
		const actorData = this.actor.toObject(false);
		// Add the actor's data to context.data for easier access, as well as flags.
		context.system = actorData.system;
		context.flags = actorData.flags;
		// Prepare character data and items.
		if (actorData.type == "MetaTherion") {
			this._prepareItems(context);
			//this._prepareCharacteristicsItemData(context);
		}
		// Add roll data for TinyMCE editors.
		//adding this enabled rolls??
		context.rollData = context.actor.getRollData();
		// Prepare active effects
		// context.effects = prepareActiveEffectCategories(this.actor.effects);
		return context;
	}
	//prepare localization for characters
	//_prepareCharacteristicsItemData(context) {
	//here is where I would do the localization
	//}
	//prepare items
	_prepareItems(context) {
		// Initialize containers.
		const Possessions = [];
		//todo: add filtering per category for possessions - allowing for an item to have multiple ones like a weapon that is also a gadget etc.
		//todo: need to create the correct schema on template.json for this
		//	Armor: [],
		//	Weapon: [],
		//	Gadget: [],
		//	Drug: [],
		const Perks = [];
		const Combos = {
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
		};
		const Metapowers = {
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
		};
		// Iterate through items, allocating to containers
		for (let i of context.items) {
			i.img = i.img || DEFAULT_TOKEN;
			// Append to Possessions.
			if (i.type === "Possession") {
				//todo if (i.system.category)
				Possessions.push(i);
			}
			// Append to Perks.
			else if (i.type === "Perk") {
				Perks.push(i);
			}
			// Append to Metapowers.
			else if (i.type === "Metapower") {
				if (i.system.Activation.Level.value != undefined) {
					Metapowers[i.system.Activation.Level.value].push(i);
				}
			} else if (i.type === "Combo") {
				if (i.system.level != undefined) {
					Combos[i.system.Level.value].push(i);
				}
			}
		}

		// Assign and return
		context.Possessions = Possessions;
		context.Perks = Perks;
		context.Metapowers = Metapowers;
		context.Combos = Combos;
	}
	// activate listeners for clickable stuff
	//code from boilerplate
	activateListeners(html) {
		super.activateListeners(html);
		// Render the item sheet for viewing/editing prior to the editable check.
		html.find(".item-edit").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.sheet.render(true);
		});
		// -------------------------------------------------------------
		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;
		// Add Inventory Item
		html.find(".item-create").click(this._onItemCreate.bind(this));
		// Delete Inventory Item
		html.find(".item-delete").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.delete();
			li.slideUp(200, () => this.render(false));
		});
		// Active Effect management
		// html.find(".effect-control").click((ev) => onManageActiveEffect(ev, this.actor));
		// Rollable abilities.
		html.find(".style-cs-rolls").click(this._onRoll.bind(this));
		// Drag events for macros.
		if (this.actor.isOwner) {
			let handler = (ev) => this._onDragStart(ev);
			html.find("li.item").each((i, li) => {
				if (li.classList.contains("inventory-header")) return;
				li.setAttribute("draggable", true);
				li.addEventListener("dragstart", handler, false);
			});
		}
	}
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
	//code from boilerplate on rolls
	async _onRoll(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		// Handle item rolls.
		if (dataset.rollType) {
			if (dataset.rollType == "item") {
				const itemId = element.closest(".item").dataset.itemId;
				const item = this.actor.items.get(itemId);
				if (item) return item.roll();
			}
		}
		// Handle rolls that supply the formula directly.
		if (dataset.roll) {
			const actor = this.actor;
			const stat = dataset.stat;
			MetaRoll(actor, stat);
		}
	}
}
