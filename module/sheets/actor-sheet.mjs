//? Import HandleMetaRolls
import { HandleMetaRolls } from "../helpers/metarollhandler.mjs";
//? Import New Actor
import { NewActor } from "../metanthropes/newactor.mjs";
//? Import Finalize Premade Protagonist
import { FinalizePremadeProtagonist } from "../metanthropes/newactor.mjs";
//? Import Progression Dialog
import { openProgressionDialog } from "../metanthropes/progression.mjs";
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
			classes: ["metanthropes", "sheet", "actor"], //? these are custom css classes that are used in the html file
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
		//* from boilerplate:
		//* It uses Foundry's built in toObject() method and gives it the false parameter, which instructs Foundry to not just convert this to a plain object but to also run a deep clone on nested objects/arrays.
		//* from https://foundryvtt.wiki/en/development/guides/SD-tutorial/SD07-Extending-the-ActorSheet-class
		console.error("Metanthropes | ActorSheet getData | what we get as context before anything:", context)
		//? Use a safe clone of the actor data for further operations.
		const actorData = this.actor.toObject(false);
		//? Add the actor's data to context.data for easier access, as well as flags.
		context.system = actorData.system;
		context.flags = actorData.flags;
		//? Prepare character data and items.
		if (actorData.type !== "Animal") {
			this._prepareItems(context);
		}
		//? This will create the .RollStats array under .system that is used by Handlebars in the actor sheet for rolling
		//context.rollData = context.actor.getRollData();
		this.actor.getRollData();
		//! Prepare active effects - causes error when enabled - prepareActiveEffectCategories is not defined
		//! it needs effects.mjs from https://gitlab.com/asacolips-projects/foundry-mods/boilerplate/-/blob/master/module/helpers/effects.mjs?ref_type=heads
		// context.effects = prepareActiveEffectCategories(this.actor.effects);
		//? Add check if the user is a Narrator (Game Master)
		context.isGM = game.user.isGM;
		console.error("Metanthropes | ActorSheet getData | what we return as FINAL context:", context)
		//todo I would like to refresh the sheet after getting all the data
		console.warn("Metanthropes | ActorSheet getData | this:", this)
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
		//! needs the effects from boilerplate to work
		// html.find(".effect-control").click((ev) => onManageActiveEffect(ev, this.actor));
		//? Find the different type of rolls and add the event listeners
		html.find(".style-cs-rolls").click(this._onRoll.bind(this));
		html.find(".style-cs-rolls").on("contextmenu", this._onCustomRoll.bind(this));
		html.find(".style-mp-rolls").click(this._onRoll.bind(this));
		html.find(".style-mp-rolls").on("contextmenu", this._onCustomRoll.bind(this));
		html.find(".style-pos-rolls").click(this._onRoll.bind(this));
		html.find(".style-pos-rolls").on("contextmenu", this._onCustomRoll.bind(this));
		//? Roll New Actor Button
		html.find(".new-actor").click(this._onNewActor.bind(this));
		//? Finalize Premade Protagonist Button
		html.find(".finalize-premade-protagonist").click(this._onFinalizePremadeProtagonist.bind(this));
		//? Progression Dialog Button
		html.find(".progression-dialog").click(this._onProgressionDialog.bind(this));
		//? Drag events for macros.
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
	prepareCharacteristicsProgression(actorData) {
		if (actorData.type == "Vehicle") return;
		const systemData = actorData.system;
		for (const [CharKey, CharValue] of Object.entries(systemData.Characteristics)) {
			//? Calculate the Base score for this Characteristic (Initial + Progressed)
			parseInt((CharValue.Base = Number(CharValue.Initial) + Number(Number(CharValue.Progressed) * 5)));
			//? Determine if the Characteristic has dropped to 0
			for (const [StatKey, StatValue] of Object.entries(CharValue.Stats)) {
				//? Calculate the Base score for this Stat (Initial + Progressed)
				parseInt((StatValue.Base = Number(StatValue.Initial) + Number(Number(StatValue.Progressed) * 5)));
				//? Calculate the Score used for Progression for this Stat (Base + Characteristic_Base)
				parseInt(
					(StatValue.Roll = Number(StatValue.Base) + Number(CharValue.Base))
				);
			}
		}
	}
	//* Progression Dialog
	_onProgressionDialog(event) {
		event.preventDefault();
		console.warn("Metanthropes | Actor Sheet | Progression Dialog | this:", this);
		//? Get the most up-to-date data for the actor
		const actorData = this.getData();
		this.prepareCharacteristicsProgression(actorData);
		console.warn("Metanthropes | Actor Sheet | Progression Dialog | this after this.getData():", this);
		console.warn("Metanthropes | Actor Sheet | Progression Dialog | what we pass along to openProgressionDialog:", actorData);
		openProgressionDialog(actorData);
	}
}
