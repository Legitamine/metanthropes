////
//*
//! Metanthropes RPG System for FoundryVTT
//? This is the Item Sheet for the Metanthropes RPG System for FoundryVTT.
//? This controls how
//todo: Enable basic functionality
//*
////

////
//*
//! Table of Contents
//*
//? 1. Extend the default ItemSheet

////

export class MetanthropesItemSheet extends ItemSheet {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["metanthropes", "sheet", "item"],
			width: 650,
			height: 700,
			closeOnSubmit: false,
			submitOnClose: true,
			submitOnChange: true,
			resizable: true,
			tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
		});
	}

	/** @override */
	get template() {
		const path = "systems/metanthropes-system/templates/item";
		// Return a single sheet for all item types.
		// return `${path}/item-sheet.html`;

		// Alternatively, you could use the following return statement to do a
		// unique item sheet by type, like `weapon-sheet.html`.
		return `${path}/item-${this.item.type}-sheet.hbs`;
	}

	/* -------------------------------------------- */

	/** @override */
	getData() {
		// Retrieve base data structure.
		const context = super.getData();

		// Use a safe clone of the item data for further operations.
		const itemData = context.item;

		// Retrieve the roll data for TinyMCE editors.
		context.rollData = {};
		let actor = this.object?.parent ?? null;
		if (actor) {
			context.rollData = actor.getRollData();
		}

		// Add the actor's data to context.data for easier access, as well as flags.
		context.system = itemData.system;
		context.flags = itemData.flags;

		return context;
	}

	/* -------------------------------------------- */

	/** @override */
	//	activateListeners(html) {
	//		super.activateListeners(html);
//	
	//		// Everything below here is only needed if the sheet is editable
	//		if (!this.isEditable) return;
//	
	//		// Roll handlers, click handlers, etc. would go here.
	//	}
}
