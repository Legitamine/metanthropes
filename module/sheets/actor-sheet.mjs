////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the Actor Sheet for the Metanthropes RPG System for FoundryVTT.
//? This controls how
//todo: Enable basic functionality
//*
////
export class MetanthropesActorSheet extends ActorSheet {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["metanthropes", "sheet", "actor"], // these are custom css classes that are used in the html file
			template: "systems/metanthropes-system/templates/actor/actor-sheet.html",
			width: 990,
			height: 900,
			closeOnSubmit: false,
			submitOnClose: false,
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
		// doesn't work console.log('${this.actor.data.type}');
		return `systems/metanthropes-system/templates/sheets/${this.actor.type}-sheet.hbs`;
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
		//		if (actorData.type == "humanoid") {
		//			this._prepareItems(context);
		//			this._prepareHumanoidData(context);
		//		}
		// Add roll data for TinyMCE editors.
		//adding this enabled rolls??
		context.rollData = context.actor.getRollData();
		// Prepare active effects
		//context.effects = prepareActiveEffectCategories(this.actor.effects);
		return context;
	}
	//prepare humanoid data
	//	_prepareHumanoidData(context) {
	//
	//	}
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
		//	// Add Inventory Item
		//	html.find(".item-create").click(this._onItemCreate.bind(this));
		//	// Delete Inventory Item
		//	html.find(".item-delete").click((ev) => {
		//		const li = $(ev.currentTarget).parents(".item");
		//		const item = this.actor.items.get(li.data("itemId"));
		//		item.delete();
		//		li.slideUp(200, () => this.render(false));
		//	});
		//	// Active Effect management
		//	html.find(".effect-control").click((ev) => onManageActiveEffect(ev, this.actor));
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
	//code from boilerplate on rolls
	_onRoll(event) {
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
			//let label = dataset.label ? `[${dataset.label}] ${dataset.statroll}` : "";
			let message = `${this.actor.name} attempts a roll with ${dataset.label} score of ${dataset.statroll}%`;
			let roll = new Roll(dataset.roll, this.actor.getRollData()).evaluate({ async: false });
			let result = roll.total <= dataset.statroll ? "Success 🟩" : "Failure 🟥";
			let levelsOfSuccess = Math.floor((dataset.statroll - roll.total) / 10);
			let levelsOfFailure = Math.floor((roll.total - dataset.statroll) / 10);
			let criticalSuccess = roll.total === 1;
			let criticalFailure = roll.total === 100;
			if (roll.total > dataset.statroll) {
				levelsOfSuccess = 0;
			} else {
				levelsOfFailure = 0;
			}
			if (criticalSuccess) {
				levelsOfSuccess = 10;
				if (dataset.statroll < 100) {
					levelsOfSuccess += 0;
				} else {
					levelsOfSuccess += Math.floor((dataset.statroll - 100) / 10);
				}
			}
			if (criticalFailure) {
				levelsOfFailure = 10;
			}
			if (criticalSuccess) {
				result = "🟩 Critical Success 🟩";
			} else if (criticalFailure) {
				result = "🟥 Critical Failure 🟥";
			}
			if (levelsOfSuccess > 0) {
				message += ` and the result is ${roll.total}, therefore it is a ${result}, accumulating: ${levelsOfSuccess}*✔️.`;
			} else if (levelsOfFailure > 0) {
				message += ` and the result is ${roll.total}, therefore it is a ${result}, accumulating: ${levelsOfFailure}*❌.`;
			} else {
				message += ` and the result is ${roll.total}, therefore it is a ${result}.`;
			}
			console.log(roll.total);
			roll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flavor: message,
				rollMode: game.settings.get("core", "rollMode"),
			});
			return roll;
		}
	}
}
