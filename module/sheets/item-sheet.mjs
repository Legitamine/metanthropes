export class MetanthropesItemSheet extends ItemSheet {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["metanthropes", "sheet", "item"],
			width: 860,
			height: 820,
			closeOnSubmit: false,
			submitOnClose: true,
			submitOnChange: true,
			resizable: true,
			tabs: [{ navSelector: ".itemnavselector", contentSelector: ".itemnavtabs", initial: "description" }],
		});
	}
	//? Only Narrators are allowed to drag and drop items
	//! players are also able to drag n drop possessions from itempiles perhaps?
	/** @override */
	_canDragDrop(selector) {
		return game.user.isGM;
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

		//? Indicate that the user is a Narrator
		context.isGM = game.user.isGM;

		return context;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		//? Call the super class's activateListeners method to ensure any other listeners are set up
		super.activateListeners(html);
		//? Only Narrators are allowed to edit the item
		if (!game.user.isGM) {
			html.find("input, textarea, select").attr("disabled", "disabled");
		}
	}
	//		// Everything below here is only needed if the sheet is editable
	//		if (!this.isEditable) return;
	//
	//		// Roll handlers, click handlers, etc. would go here.
	//	}
}
