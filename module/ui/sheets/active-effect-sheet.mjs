/**
 * Metanthropes Active Effect Sheet
 * 
 * * We are currently (only) overriding the first tab (details)
 * * show Description's enriched text to Players and editor to Narrators
 *
 * @export
 * @class MetanthropesActiveEffectSheetV2
 * @typedef {MetanthropesActiveEffectSheetV2}
 * @extends {foundry.applications.sheets.ActiveEffectConfig}
 */
export class MetanthropesActiveEffectSheetV2 extends foundry.applications.sheets.ActiveEffectConfig {
	static PARTS = {
		...super.PARTS,
		details: {
			...super.PARTS.details,
			template: "systems/metanthropes/templates/apps/sheets/active-effect-details.hbs",
		},
	};
	async _preparePartContext(partId, context) {
		context = await super._preparePartContext(partId, context);

		if (partId === "details") {
			context.isNarrator = game.user.isGM;
			context.enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(
				context.source.description ?? "",
				{
					relativeTo: this.document,
					secrets: this.isEditable,
					rollData: this.document.parent?.getRollData?.() ?? {}, //?do we want it in the effect?
				},
				{ async: true }, //? not required in v14? enrich already returns a promise?
			);
		}

		return context;
	}
}
