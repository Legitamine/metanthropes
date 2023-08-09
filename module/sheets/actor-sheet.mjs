////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the Actor Sheet for the Metanthropes RPG System for FoundryVTT.
//? This controls how the sheet functions
//*
////
import { MetaRoll } from "../metanthropes/metaroll.mjs";
import { MetaRollCustom } from "../metanthropes/metaroll.mjs";
import { MetapowerRoll } from "../helpers/mproll.mjs";
import { PossessionRoll } from "../helpers/posroll.mjs";
//? Import New Actor
import { NewActor } from "../metanthropes/newactor.mjs";
export class MetanthropesActorSheet extends ActorSheet {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["metanthropes", "sheet", "actor"], // these are custom css classes that are used in the html file
			width: 1012,
			height: 920,
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
	//* activate listeners for clickable stuff on the actor sheet!
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
		// Find the different type of rolls and add the event listeners
		//! should rename _onRoll to _onLeftClick and add a _onRightClick to handle right clicks differently.
		html.find(".style-cs-rolls").click(this._onRoll.bind(this));
		html.find(".style-cs-rolls").on("contextmenu", this._onCustomRoll.bind(this));
		html.find(".style-mp-rolls").click(this._onRoll.bind(this));
		html.find(".style-pos-rolls").click(this._onRoll.bind(this));
		//? New Actor Logic
		html.find(".new-actor").click(this._onNewActor.bind(this));
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
		console.log("Metanthropes RPG System | _onRoll | Evaluating a new _onRoll(event) for this:", this);
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		//? Handle all types of rolls here based on the rollType (data-roll-type)
		if (dataset.rollType) {
			//console.log("Metanthropes RPG System | We are about to make a new Roll for a", dataset.rollType);
			//console.log("Metanthropes RPG System | Dataset:", dataset);
			if (dataset.rollType == "StatRoll") {
				const actor = this.actor;
				const action = dataset.rollType;
				const stat = dataset.stat;
				console.log(
					"Metanthropes RPG System | _onRoll | Engaging MetaRoll for:",
					actor.name + "'s",
					action,
					"with",
					stat
				);
				await MetaRoll(actor, action, stat);
			} else if (dataset.rollType == "Metapower") {
				const actor = this.actor;
				const stat = dataset.stat;
				const action = dataset.rollType;
				const destinyCost = dataset.destinycost;
				const itemname = dataset.itemname;
				console.log(
					"Metanthropes RPG System | _onRoll | Engaging MetaRoll for:",
					actor,
					"Action:",
					action,
					"Metapower:",
					itemname,
					"Destiny Cost:",
					destinyCost,
					"with:",
					stat
				);
				await MetaRoll(actor, action, stat, destinyCost, itemname);
				console.log("Metanthropes RPG System | _onRoll | Finished");
				const effect = dataset.effect;
				const targets = dataset.targets;
				const targetsdice = dataset.targetsdice;
				const duration = dataset.duration;
				const durationdice = dataset.durationdice;
				const damage = dataset.damage;
				const healing = dataset.healing;
				const buffs = dataset.buffs;
				const conditions = dataset.conditions;

				//	MetapowerRoll(
				//		actor,
				//		stat,
				//		itemname,
				//		destcost,
				//		effect,
				//		targets,
				//		targetsdice,
				//		duration,
				//		durationdice,
				//		damage,
				//		healing,
				//		buffs,
				//		conditions
				//	);
			} else if (dataset.rollType == "Possession") {
				const actor = this.actor;
				const action = dataset.rollType;
				const stat = dataset.stat;
				const itemname = dataset.itemname;
				console.log(
					"Metanthropes RPG System | _onRoll | Engaging MetaRoll for:",
					actor.name + "'s",
					action + ":",
					itemname,
					"with",
					stat
				);
				await MetaRoll(actor, action, stat, 0, itemname);
				console.log("Metanthropes RPG System | _onRoll | Finished");
				const attacktype = dataset.attacktype;
				const effect = dataset.effect;
				const targets = dataset.targets;
				const damage = dataset.damage;
				const conditions = dataset.conditions;
				// PossessionRoll(actor, stat, itemname, attacktype, effect, targets, damage, conditions);
			} else if (dataset.rollType == "Combo") {
				const actor = this.actor;
				const stat = dataset.stat;
				console.log("Metanthropes RPG System | Rolling a Combo for:", actor.name, "'s", stat);
				console.log("Metanthropes RPG System | ====================================");
				MetaRoll(actor, stat);
			} else {
				console.log("Metanthropes RPG System | ERROR: not defined rollType", dataset.rollType);
				console.log("Metanthropes RPG System | ====================================");
				return;
			}
		}
		// Handle rolls that supply the formula directly.
		if (dataset.roll) {
			console.log(
				"Metanthropes RPG System | ERROR: You supplied the type of roll, this should not happen, using MetaRoll instead",
				dataset.roll
			);
			console.log("Metanthropes RPG System | ====================================");
			const actor = this.actor;
			const stat = dataset.stat;
			MetaRoll(actor, stat);
		}
		//? After doing a meta roll, re-render the actor sheet.
		this.render(true);
	}
	//first try to make a custom roll for right-clicking
	async _onCustomRoll(event) {
		//! this is a mess and needs refactoring
		//todo: refactor this
		//! this is a mess and needs refactoring
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		// Handle item rolls.
		if (dataset.rollType) {
			console.log("Metanthropes RPG System | ====================================");
			console.log("Metanthropes RPG System | We are about to make a new Custom Roll for a", dataset.rollType);
			console.log("Metanthropes RPG System | Dataset:", dataset);
			if (dataset.rollType == "StatRoll") {
				const actor = this.actor;
				const action = dataset.rollType;
				const stat = dataset.stat;
				console.log("Metanthropes RPG System | Rolling a Stat for:", actor.name, "'s", stat);
				console.log("Metanthropes RPG System | ====================================");
				MetaRollCustom(actor, action, stat);
			} else if (dataset.rollType == "Metapower") {
				const actor = this.actor;
				const stat = dataset.stat;
				const itemname = dataset.itemname;
				const destcost = dataset.destcost;
				const effect = dataset.effect;
				const targets = dataset.targets;
				const targetsdice = dataset.targetsdice;
				const duration = dataset.duration;
				const durationdice = dataset.durationdice;
				const damage = dataset.damage;
				const healing = dataset.healing;
				const buffs = dataset.buffs;
				const conditions = dataset.conditions;
				console.log(
					"Metanthropes RPG System | Rolling a Metapower for:",
					actor,
					"Metapower:",
					itemname,
					"Destiny Cost:",
					destcost,
					"with:",
					stat
				);
				console.log("Metanthropes RPG System | ====================================");
				MetapowerRoll(
					actor,
					stat,
					itemname,
					destcost,
					effect,
					targets,
					targetsdice,
					duration,
					durationdice,
					damage,
					healing,
					buffs,
					conditions
				);
			} else if (dataset.rollType == "Possession") {
				const actor = this.actor;
				const stat = dataset.stat;
				const itemname = dataset.itemname;
				const attacktype = dataset.attacktype;
				const effect = dataset.effect;
				const targets = dataset.targets;
				const damage = dataset.damage;
				const conditions = dataset.conditions;
				console.log("Metanthropes RPG System | Rolling a Possession for:", actor.name, "'s", stat);
				console.log("Metanthropes RPG System | ====================================");
				PossessionRoll(actor, stat, itemname, attacktype, effect, targets, damage, conditions);
			} else if (dataset.rollType == "Combo") {
				const actor = this.actor;
				const stat = dataset.stat;
				console.log("Metanthropes RPG System | Rolling a Combo for:", actor.name, "'s", stat);
				console.log("Metanthropes RPG System | ====================================");
				MetaRoll(actor, stat);
			} else {
				console.log("Metanthropes RPG System | ERROR: not defined rollType", dataset.rollType);
				console.log("Metanthropes RPG System | ====================================");
				return;
			}
		}
		// Handle rolls that supply the formula directly.
		//! am I still using this?
		if (dataset.roll) {
			console.log("Metanthropes RPG System | ====================================");
			console.log(
				"Metanthropes RPG System | ERROR: Still using this? You supplied the type of roll, this should not happen, using MetaRoll instead",
				dataset.roll
			);
			console.log("Metanthropes RPG System | ====================================");
			const actor = this.actor;
			const stat = dataset.stat;
			MetaRoll(actor, stat);
		}
		//? After doing a custom roll, re-render the actor sheet.
		this.render(true);
	}
	//? New Actor Logic
	async _onNewActor(event) {
		event.preventDefault();
		//const element = event.currentTarget;
		//const dataset = element.dataset;
		const actor = this.actor;
		console.log(this.actor);
		await NewActor(actor);
	}
}
