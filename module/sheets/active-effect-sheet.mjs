/**
 * 
 * Metanthropes Active Effect Sheet
 * 
 * Extends the base ActiveEffectConfig sheet for Metanthropes
 * 
 */
export class MetanthropesActiveEffectSheet extends ActiveEffectConfig {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["sheet", "active-effect-sheet"],
			template: "systems/metanthropes-system/templates/metanthropes/active-effect-config.html",
			width: 580,
			height: "auto",
			tabs: [{ navSelector: ".tabs", contentSelector: "form", initial: "details" }],
		});
	}

	/* ----------------------------------------- */

	/** @override */
	async getData(options = {}) {
		const context = await super.getData(options);
		context.descriptionHTML = await TextEditor.enrichHTML(this.object.description, {
			async: true,
			secrets: this.object.isOwner,
		});
		const legacyTransfer = CONFIG.ActiveEffect.legacyTransferral;
		const labels = {
			transfer: {
				name: game.i18n.localize(`EFFECT.Transfer${legacyTransfer ? "Legacy" : ""}`),
				hint: game.i18n.localize(`EFFECT.TransferHint${legacyTransfer ? "Legacy" : ""}`),
			},
		};
		//context.isNarrator = game.user.isGM;
		context.metaEffectType = "mytype";
		const data = {
			labels,
			effect: this.object, // Backwards compatibility
			data: this.object,
			isActorEffect: this.object.parent.documentName === "Actor",
			isItemEffect: this.object.parent.documentName === "Item",
			isNarrator: game.user.isGM,
			submitText: "EFFECT.Submit",
			modes: Object.entries(CONST.ACTIVE_EFFECT_MODES).reduce((obj, e) => {
				obj[e[1]] = game.i18n.localize(`EFFECT.MODE_${e[0]}`);
				return obj;
			}, {}),
		};
		return foundry.utils.mergeObject(context, data);
	}

	/* ----------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		html.find(".effect-control").click(this._onEffectControl.bind(this));
	}

	/* ----------------------------------------- */

	/**
	 * Provide centralized handling of mouse clicks on control buttons.
	 * Delegate responsibility out to action-specific handlers depending on the button action.
	 * @param {MouseEvent} event      The originating click event
	 * @private
	 */
	_onEffectControl(event) {
		event.preventDefault();
		const button = event.currentTarget;
		switch (button.dataset.action) {
			case "add":
				return this._addEffectChange();
			case "delete":
				button.closest(".effect-change").remove();
				return this.submit({ preventClose: true }).then(() => this.render());
		}
	}

	/* ----------------------------------------- */

	/**
	 * Handle adding a new change to the changes array.
	 * @private
	 */
	async _addEffectChange() {
		const idx = this.document.changes.length;
		return this.submit({
			preventClose: true,
			updateData: {
				[`changes.${idx}`]: { key: "", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "" },
			},
		});
	}

	/* ----------------------------------------- */

	/** @inheritdoc */
	_getSubmitData(updateData = {}) {
		const fd = new FormDataExtended(this.form, { editors: this.editors });
		let data = foundry.utils.expandObject(fd.object);
		if (updateData) foundry.utils.mergeObject(data, updateData);
		data.changes = Array.from(Object.values(data.changes || {}));
		return data;
	}
}
