/**
 * Register a set of game settings for a module
 *
 * @export
 * @param {*} settings
 *
 * todo: investigate the 'registerMenu' to define a settings submenu
 *
 * * Usage: a valid settings file should have an array with each setting as an object as follows:
 * {
 * module: string, eg: "metanthropes" // needs to be a valid system or module-id
 * key: string, eg: "metaIntroductory" // needs to be unique
 * name: string, eg: "Enable Advanced Logging" // the name of the setting that shows up in the settings menu
 * hint: string, eg: "The Console helps you identify any issues or potential bugs in regards to Metanthropes System for Foundry VTT." // an explanation of what the setting does
 * scope: string, eg: "client" or "world" // This specifies if it's a client-side setting or a world setting
 * config: boolean, eg: true or false // it makes the setting appear in the module configuration
 * requiresReload: boolean, eg: true or false // If true, a client reload (F5) is required to activate the setting
 * type: any, eg: Boolean, Number, String, Object, Array // see
 * default: any, eg: false or true
 * onChange: function, eg: (value) => { // Do something when the setting is changed, if necessary }
 * }
 *
 */
export function metaRegisterGameSettings(settings) {
	settings.forEach((setting) => {
		game.settings.register(setting.module, setting.key, {
			name: setting.name,
			hint: setting.hint,
			scope: setting.scope,
			config: setting.config,
			requiresReload: setting.requiresReload,
			type: setting.type,
			default: setting.default,
			onChange: setting.onChange,
		});
	});
}
