////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the Actor Sheet for the Metanthropes RPG System for FoundryVTT.
//? This controls how
//todo: Enable basic functionality
//*
////
import { MetaRoll } from "../helpers/metaroll.mjs";
import { MetapowerRoll} from "../helpers/mproll.mjs";
import { PossessionRoll } from "../helpers/posroll.mjs";
export class MetanthropesActorSheet extends ActorSheet {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["metanthropes", "sheet", "actor"], // these are custom css classes that are used in the html file
			width: 855,
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
		if (actorData.type == "MetaTherion" || actorData.type == "Protagonist") {
			this._prepareItems(context);
		}
		// Add roll data for TinyMCE editors.
		context.rollData = context.actor.getRollData();
		// Prepare active effects
		// context.effects = prepareActiveEffectCategories(this.actor.effects);
		return context;
	}
	//prepare items
	_prepareItems(context) {
		// Initialize containers.
		const Possessions = {
			Weapon: [],
			Armor: [],
			Gadget: [],
			Drug: [],
		};
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
				if (i.system.Category.value != undefined) {
					Possessions[i.system.Category.value].push(i);
				}
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
			console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
			console.log("Metanthropes RPG We are about to make a new Roll for a", dataset.rollType);
			console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
			if (dataset.rollType == "Stat") {
				const actor = this.actor;
				const stat = dataset.stat;
				console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
				console.log("Metanthropes RPG Rolling a Stat for:", actor,"'s", stat);
				console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
				MetaRoll(actor, stat);
			} else if (dataset.rollType == "Metapower") {
				const actor = this.actor;
				const stat = dataset.stat;
				console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
				console.log("Metanthropes RPG Rolling a Metapower for:", actor,"'s", stat);
				console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
				MetapowerRoll(actor, stat);
			} else if (dataset.rollType == "Possession") {
				const actor = this.actor;
				const stat = dataset.stat;
				console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
				console.log("Metanthropes RPG Rolling a Possession for:", actor,"'s", stat);
				console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
				PossessionRoll(actor, stat);
			} else if (dataset.rollType == "Combo") {
				const actor = this.actor;
				const stat = dataset.stat;
				console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
				console.log("Metanthropes RPG Rolling a Combo for:", actor,"'s", stat);
				console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
				MetaRoll(actor, stat);
			} else {
				console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
				console.log("Metanthropes RPG ERROR: not defined rollType", dataset.rollType);
				console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
				return;
				//	const itemId = element.closest(".item").dataset.itemId;
				//	const item = this.actor.items.get(itemId);
				//	if (item) return item.roll();
				//	console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
				//	console.log("Even worse???", item.roll);
				//	console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
			}
		}
		// Handle rolls that supply the formula directly.
		if (dataset.roll) {
			console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
			console.log(
				"Metanthropes RPG ERROR: You supplied the type of roll, this should not happen, using MetaRoll instead",
				dataset.roll
			);
			console.log("=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+");
			const actor = this.actor;
			const stat = dataset.stat;
			MetaRoll(actor, stat);
		}
	}
}
