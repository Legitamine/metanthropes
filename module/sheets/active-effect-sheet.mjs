//? Import metaLog helper
import { metaLog } from "../helpers/metahelpers.mjs";
/**
 *
 * Metanthropes Active Effect Sheet
 * Extends the DocumentSheet instead of overriding the ActiveEffectConfig class
 * Based off ActiveEffectConfig from the core Foundry VTT system
 *
 * @extends {DocumentSheet}
 *
 */
export class MetanthropesActiveEffectSheet extends DocumentSheet {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["sheet", "active-effect-sheet"],
			template: "systems/metanthropes-system/templates/metanthropes/active-effect-config.html",
			width: 580,
			height: "auto",
			sheetConfig: false,
			sumbitOnChange: true,
			tabs: [{ navSelector: ".tabs", contentSelector: "form", initial: "details" }],
		});
	}

	/* ----------------------------------------- */

	/** @override */
	async getData(options = {}) {
		metaLog(4, "Metanthropes | Active Effect Sheet | getData, this", this);
		const context = await super.getData(options);
		const metaFlags = this.object.flags.metanthropes;
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
		const metaEffectTypeOptions = ["Buff", "Condition", "Detection", "Immunity", "Shift", "Movement", "Resistance", "Cover"];
		const predefinedKeys = [
			{
				key: "system.physical.resistances.cosmic.initial",
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				label: "Cosmic Resistance",
			},
			{
				key: "system.physical.resistances.elemental.initial",
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				label: "Elemental Resistance",
			},
			{
				key: "system.physical.resistances.material.initial",
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				label: "Material Resistance",
			},
			{
				key: "system.physical.resistances.psychic.initial",
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				label: "Psychic Resistance",
			},
			{
				key: "system.physical.speed.Buffs.accelerated.value",
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				label: "Accelerated",
			},
			{
				key: "system.physical.speed.Conditions.slowed.value",
				mode: CONST.ACTIVE_EFFECT_MODES.UPGRADE,
				label: "Slowed",
			},
		];
		const data = {
			labels,
			effect: this.object, // Backwards compatibility
			data: this.object,
			metaEffectType: metaFlags.metaEffectType,
			metaCycle: metaFlags.metaCycle,
			metaRound: metaFlags.metaRound,
			metaStartCycle: metaFlags.metaStartCycle,
			metaStartRound: metaFlags.metaStartRound,
			isActorEffect: this.object.parent.documentName === "Actor",
			isItemEffect: this.object.parent.documentName === "Item",
			isNarrator: game.user.isGM,
			submitText: "EFFECT.Submit",
			modes: Object.entries(CONST.ACTIVE_EFFECT_MODES).reduce((obj, e) => {
				obj[e[1]] = game.i18n.localize(`EFFECT.MODE_${e[0]}`);
				return obj;
			}, {}),
			predefinedKeys: predefinedKeys,
			metaEffectTypeOptions: metaEffectTypeOptions,
		};
		metaLog(4, "Metanthropes | Active Effect Sheet | getData, context, data", context, data);
		return foundry.utils.mergeObject(context, data);
	}

	/* ----------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		html.find(".effect-control").click(this._onEffectControl.bind(this));
		//? Listener for predefined key/mode dropdown changes
		html.find(".predefined-key-mode").on("change", (event) => {
			const selected = event.target.value;
			const li = $(event.currentTarget).closest("li.effect-change");
			const index = li.data("index");
			//? Update the key and mode fields based on the selected predefined combination
			if (selected !== "custom") {
				const [key, mode] = selected.split("|");
				li.find(`input[name='changes.${index}.key']`).val(key).trigger("change");
				li.find(`select[name='changes.${index}.mode']`).val(mode).trigger("change");
			} else {
				//? Reset to custom values
				li.find(`input[name='changes.${index}.key']`).val("").trigger("change");
				li.find(`select[name='changes.${index}.mode']`).val(CONST.ACTIVE_EFFECT_MODES.ADD).trigger("change");
			}
		});
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
				[`changes.${idx}`]: {
					predefinedKeyMode: "custom",
					key: "",
					mode: CONST.ACTIVE_EFFECT_MODES.ADD,
					value: "",
				},
			},
		});
	}

	/* ----------------------------------------- */

	/** @inheritdoc */
	_getSubmitData(updateData = {}) {
		const fd = new FormDataExtended(this.form, { editors: this.editors });
		let data = foundry.utils.expandObject(fd.object);
		metaLog(3, "Metanthropes | Active Effect Sheet | _getSubmitData, data, updateData", fd, data, updateData);
		if (updateData) foundry.utils.mergeObject(data, updateData);
		data.changes = Array.from(Object.values(data.changes || {}));
		return data;
	}
}
