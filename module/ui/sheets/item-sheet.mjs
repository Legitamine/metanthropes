/**
 * MetanthropesItemSheet - An Item Sheet for Metanthropes items.
 *
 * This class extends the foundry ItemSheet class.
 * It is used to display and edit items.
 *
 * @extends {ItemSheet}
 *
 */
export class MetanthropesItemSheet extends foundry.appv1.sheets.ItemSheet {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
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
		const path = "systems/metanthropes/templates/item";
		const itemType = this.item.type.toLowerCase();
		return `${path}/item-${itemType}-sheet.hbs`;
	}
	/** @override */
	async getData(options = {}) {
		//! In the item getData we currently collect and store in .rollData the actor's roll data.
		//! However it's never used from there - right??
		//? Retrieve base data structure.
		const context = await super.getData(options);
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
		//? Provide a boolean for if we are running with Introductory Features enabled
		context.introductoryFeatures = await game.settings.get("metanthropes", "metaIntroductory");
		//? Provide a boolean for if we are running with Core Features enabled
		context.coreFeatures = await game.settings.get("metanthropes", "metaCore");
		//? Provide a boolean for if we are running with Homebrew Features enabled
		context.homebrewFeatures = await game.settings.get("metanthropes", "metaHomebrew");
		//? Provide a boolean for if 'Beta Testing of New Features' is enabled
		context.betaTesting = await game.settings.get("metanthropes", "metaBetaTesting");
		//? Provide a boolean for if 'Advanced Logging' is enabled
		context.advancedLogging = await game.settings.get("metanthropes", "metaAdvancedLogging");
		//? Provide a combined boolean for if 'Beta Testing of New Features' and 'Advanced Logging' are enabled
		context.advancedBetaTesting = context.betaTesting && context.advancedLogging;
		//? Provide a boolean for if the user is a Narrator(GameMaster)
		context.isNarrator = game.user.isGM;
		//? Prepare Active Effects
		if (context.betaTesting) context.effects = metanthropes.utils.prepareActiveEffectCategories(this.document.effects);
		return context;
	}
	//* Clickable stuff on the item sheets
	/** @override */
	activateListeners(html) {
		//? Call the super class's activateListeners method to ensure any other listeners are set up
		super.activateListeners(html);
		//? Only Narrators with the Homebrew Module are allowed to edit the item sheets
		//todo this will change to include the author so that narrators can edit their own items, while protecting official items being edited without homebrew
		const homebrewFeatures = game.settings.get("metanthropes", "metaHomebrew");
		if (!game.user.isGM || !homebrewFeatures) {
			html.find("input, textarea, select").attr("disabled", "disabled");
		}
		//* Everything below this point is only needed if the sheet is editable
		//? Observers (non-owners) of the item sheet, should not be able to roll anything
		if (!this.isEditable) return;
		//? Active Effects
		if (game.settings.get("metanthropes", "metaBetaTesting"))
			html.find(".effect-control").click((ev) => metanthropes.utils.onManageActiveEffect(ev, this.document));
		//? Roll Metapower
		html.find(".style-mp-rolls").click(this._onRoll.bind(this));
		html.find(".style-mp-rolls").on("contextmenu", this._onCustomRoll.bind(this));
		//? Roll Possession
		html.find(".style-pos-rolls").click(this._onRoll.bind(this));
		html.find(".style-pos-rolls").on("contextmenu", this._onCustomRoll.bind(this));
	}
	/** @override */
	_getHeaderButtons() {
		let buttons = super._getHeaderButtons();
		//? Filters-out the Item Piles button for all items besides Possessions
		if (this.item.type !== "Possession") buttons = buttons.filter((btn) => btn.label !== "Configure");
		return buttons;
	}
	//* Handle Left-Click Rolls
	async _onRoll(event) {
		metanthropes.dice.metaHandleRolls(event, this, false);
	}
	//* Handle Right-Click Rolls
	async _onCustomRoll(event) {
		metanthropes.dice.metaHandleRolls(event, this, true);
	}
}
