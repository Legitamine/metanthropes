/**
 * Metanthropes Pause UI App.
 * Replaces the default icon with the Metanthropes Logo.
 *
 * @export
 * @class MetanthropesPause
 * @typedef {MetanthropesPause}
 * @extends {foundry.applications.ui.GamePause}
 */
export class MetanthropesPause extends foundry.applications.ui.GamePause {
	async _prepareContext(_options) {
		const context = await super._prepareContext(_options);
		context.icon = "systems/metanthropes/assets/logos/metanthropes-logo.webp";
		return context;
	}
}
