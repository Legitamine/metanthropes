////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the Actor Sheet for the Metanthropes RPG System for FoundryVTT.
//? This controls how the sheet functions
//*
////
//? Import MetaRoll
import { MetaRoll } from "../metanthropes/metaroll.mjs";
//? Import New Actor
import { NewActor } from "../metanthropes/newactor.mjs";
//? Import Finalize Premade Protagonist
import { FinalizePremadeProtagonist } from "../metanthropes/newactor.mjs";
export class MetanthropesActorSheet extends ActorSheet {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["metanthropes", "sheet", "actor"], // these are custom css classes that are used in the html file
			width: 1012,
			height: 910,
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
		if (actorData.type !== "Animal") {
			this._prepareItems(context);
		}
		// Add roll data for TinyMCE editors.
		context.rollData = context.actor.getRollData();
		// Prepare active effects
		// context.effects = prepareActiveEffectCategories(this.actor.effects);
		//	//? Troubleshooting template.json data
		//	// Log the value of system.Characteristics
		//	console.log("Metanthropes RPG System | system.Characteristics:", context.system.Characteristics);
		//
		//	// Log the Title property of each characteristic
		//	for (const key in context.system.Characteristics) {
		//		console.log(`Metanthropes RPG System | ${key} Title:`, context.system.Characteristics[key].Title);
		//	}
		//? Indicate that the user is a Narrator
		context.isGM = game.user.isGM;
		//console.log("Metanthropes RPG System | getData | Is this a GM?", context.isGM);
		return context;
	}
	//prepare items
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
		const Combos = {
			1: [],
			2: [],
			3: [],
			4: [],
			5: [],
		};
		//? Iterate through items, allocating to containers
		for (let i of context.items) {
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
			//? Append to Combos.
			} else if (i.type === "Combo") {
				if (i.system.level != undefined) {
					Combos[i.system.Level.value].push(i);
				}
			}
		}
		//? Assign and return
		context.Possessions = Possessions;
		context.Metapowers = Metapowers;
		context.Combos = Combos;
	}
	//? activate listeners for clickable stuff on the actor sheet!
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
		html.find(".effect-control").click((ev) => onManageActiveEffect(ev, this.actor));
		//? Find the different type of rolls and add the event listeners
		html.find(".style-cs-rolls").click(this._onRoll.bind(this));
		html.find(".style-cs-rolls").on("contextmenu", this._onCustomRoll.bind(this));
		html.find(".style-mp-rolls").click(this._onRoll.bind(this));
		html.find(".style-mp-rolls").on("contextmenu", this._onCustomRoll.bind(this));
		html.find(".style-pos-rolls").click(this._onRoll.bind(this));
		html.find(".style-pos-rolls").on("contextmenu", this._onCustomRoll.bind(this));
		//? New Actor Logic
		html.find(".new-actor").click(this._onNewActor.bind(this));
		//? Finalize Premade Protagonist
		html.find(".finalize-premade-protagonist").click(this._onFinalizePremadeProtagonist.bind(this));
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
	//? Handling Rolls
	async _handleMetaRolls(event, isCustomRoll = false) {
		event.preventDefault();
		const element = event.currentTarget;
		//? Disable element for a few seconds to prevent double-clicking
		element.disabled = true;
		setTimeout(() => {
			element.disabled = false;
		}, 3000);
		const dataset = element.dataset;
		console.log("Metanthropes RPG System | _handleMetaRolls | Engaged", isCustomRoll);
		//? Handle all types of rolls here based on the rollType (data-roll-type)
		if (dataset.rollType) {
			const actor = this.actor;
			const action = dataset.rollType;
			const stat = dataset.stat;
			const destinyCost = dataset.destinyCost || 0; //? Destiny Cost is optional, so if it's not defined, set it to 0
			const itemName = dataset.itemName || ""; //? Item Name is optional, so if it's not defined, set it to ""
			if (dataset.rollType == "StatRoll") {
				console.log(
					"Metanthropes RPG System | _handleMetaRolls | Engaging MetaRoll for:",
					actor.name + "'s",
					action,
					"with",
					stat
				);
				await MetaRoll(actor, action, stat, isCustomRoll, destinyCost, itemName);
				console.log("Metanthropes RPG System | _handleMetaRolls | Finished Rolling for StatRoll");
			} else if (dataset.rollType == "Metapower") {
				console.log(
					"Metanthropes RPG System | _handleMetaRolls | Engaging MetaRoll for:",
					actor,
					"Action:",
					action,
					"Metapower:",
					itemName,
					"Destiny Cost:",
					destinyCost,
					"with:",
					stat
				);
				await MetaRoll(actor, action, stat, isCustomRoll, destinyCost, itemName);
				console.log("Metanthropes RPG System | _handleMetaRolls | Finished Rolling for Metapower");
			} else if (dataset.rollType == "Possession") {
				console.log(
					"Metanthropes RPG System | _handleMetaRolls | Engaging MetaRoll for:",
					actor.name + "'s",
					action + ":",
					itemName,
					"with",
					stat
				);
				await MetaRoll(actor, action, stat, isCustomRoll, 0, itemName);
				console.log("Metanthropes RPG System | _handleMetaRolls | Finished Rolling for Possession");
			} else {
				console.log(
					"Metanthropes RPG System | _handleMetaRolls | ERROR: not defined rollType",
					dataset.rollType
				);
				return;
			}
		} else {
			console.log("Metanthropes RPG System | _handleMetaRolls | ERROR: rollType not defined");
			return;
		}
		//? After doing a meta roll, re-render the actor sheet.
		console.log("Metanthropes RPG System | _handleMetaRolls | Finished, re-rendering the actor sheet");
		this.render(true);
	}
	//? Handle Left-Click Rolls
	async _onRoll(event) {
		this._handleMetaRolls(event, false);
		//? After doing a roll, re-render the actor sheet.
		console.log("Metanthropes RPG System | _onRoll | Finished, re-rendering the actor sheet");
		this.render(true);
	}
	//? Handle Right-Click Rolls
	async _onCustomRoll(event) {
		this._handleMetaRolls(event, true);
		//? After doing a custom roll, re-render the actor sheet.
		console.log("Metanthropes RPG System | _onCustomRoll | Finished, re-rendering the actor sheet");
		this.render(true);
	}
	//? New Actor Logic
	async _onNewActor(event) {
		event.preventDefault();
		const actor = this.actor;
		await NewActor(actor);
	}
	//? Finalize Premade Protagonist
	async _onFinalizePremadeProtagonist(event) {
		event.preventDefault();
		const actor = this.actor;
		await FinalizePremadeProtagonist(actor);
	}
}
