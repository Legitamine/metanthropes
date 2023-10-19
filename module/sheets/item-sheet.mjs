import { HandleMetaRolls } from "../helpers/metarollhandler.mjs";
import { metaLog } from "../helpers/metahelpers.mjs";
/**
 * MetanthropesItemSheet - An Item Sheet for Metanthropes items.
 *
 * This class extends the foundry ItemSheet class.
 * It is used to display and edit items.
 *
 * @extends {ItemSheet}
 *
 */
export class MetanthropesItemSheet extends ItemSheet {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			id: "metanthropes-item-sheet",
			classes: ["metanthropes", "item", "sheet"],
			width: 860,
			height: 860,
			tabs: [{ navSelector: ".itemnavselector", contentSelector: ".itemnavtabs", initial: "description" }],
			sheetConfig: false,
			closeOnSubmit: false,
			submitOnClose: true,
			submitOnChange: true,
			resizable: true,
			minimizable: true,
		});
	}
	//? Only Narrators are allowed to drag and drop items
	//! players are also able to drag n drop possessions from itempiles perhaps?
	//todo investigate exactly what players can drag n drop - is there something similar in the actor sheet?
	/** @override */
	_canDragDrop(selector) {
		return game.user.isGM;
	}
	/** @override */
	get template() {
		const path = "systems/metanthropes-system/templates/item";
		return `${path}/item-${this.item.type}-sheet.hbs`;
	}
	/** @override */
	getData() {
		//! In the item getData we currently collect and store in .rollData the actor's roll data.
		//! However it's never used from there - right??
		//? Retrieve base data structure.
		const context = super.getData();
		//? Use a safe clone of the item data for further operations.
		//! this is not the same as in actor??
		const itemData = context.item;
		//! We don't use the rollData so no need for this to exist
		//	// ? Retrieve the roll data for TinyMCE editors.
		//	context.rollData = {};
		//	let actor = this.object?.parent ?? null;
		//	if (actor) {
		//		context.rollData = actor.getRollData();
		//	}
		//? Add the actor's data to context.data for easier access, as well as flags.
		context.system = itemData.system;
		context.flags = itemData.flags;
		//? Provide a boolean for if 'Beta Testing of New Features' is enabled
		context.betaTesting = game.settings.get("metanthropes-system", "metaBetaTesting");
		//? Provide a boolean for if 'Advanced Logging' is enabled
		context.advancedLogging = game.settings.get("metanthropes-system", "metaAdvancedLogging");
		//? Provide a boolean for if the user is a Narrator(GameMaster)
		context.isNarrator = game.user.isGM;
		metaLog(5, "ItemSheet getData", "context:", context);
		return context;
	}
	//* Clickable stuff on the item sheets
	/** @override */
	activateListeners(html) {
		//? Call the super class's activateListeners method to ensure any other listeners are set up
		super.activateListeners(html);
		//? Only Narrators are allowed to edit the item sheets
		if (!game.user.isGM) {
			html.find("input, textarea, select").attr("disabled", "disabled");
		}
		//* Everything below this point is only needed if the sheet is editable
		//? Observers (non-owners) of the item sheet, should not be able to roll anything
		if (!this.isEditable) return;
		//? Roll Metapower
		html.find(".style-mp-rolls").click(this._onRoll.bind(this));
		html.find(".style-mp-rolls").on("contextmenu", this._onCustomRoll.bind(this));
		//? Roll Possession
		html.find(".style-pos-rolls").click(this._onRoll.bind(this));
		html.find(".style-pos-rolls").on("contextmenu", this._onCustomRoll.bind(this));
	}
	//* Handle Left-Click Rolls
	async _onRoll(event) {
		HandleMetaRolls(event, this, false);
	}
	//* Handle Right-Click Rolls
	async _onCustomRoll(event) {
		HandleMetaRolls(event, this, true);
	}
}
