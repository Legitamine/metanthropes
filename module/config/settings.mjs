/**
 * Register game settings available from the Game Settings -> Configure Settings section.
 * todo: investigate the 'registerMenu' to define a settings submenu
 * todo: clean up examples and syntax comments from below, remove unused sections
 * @param {*} settings typically game.settings 
 * Options:
 * - name: The name of the setting
 * - hint: A description of the setting
 * - scope: The setting scope, either "world" or "client"
 * - config: Whether the setting should be configurable by users. If false it won't show up in the settings menu
 */
export function metaRegisterGameSettings(settings) {

	//? Migration Script Required
	//! unused
	settings.register("metanthropes", "migrationVersion", {
		name: "Last Migration Performed",
		hint: `
		This setting is used to keep track of the last migration script that was performed.
		This setting is not visible in the UI and only used by the migration scripts.
		`,
		scope: "world", // This specifies if it's a client-side setting
		config: false, // This makes the setting appear in the module configuration
		requiresReload: false, // If true, a client reload (F5) is required to activate the setting
		type: String,
		default: "0.8.20",
	});

	//? Advanced Logging
	settings.register("metanthropes", "metaAdvancedLogging", {
		name: "Enable Advanced Logging",
		hint: `
		The Console helps you identify any issues or potential bugs in regards to Metanthropes System for Foundry VTT.
		Enable this setting to see even more detailed logs in the Console.
		You can press 'F12' in the Foundry Client or 'CTRL+SHIFT+i' in a Chrome-ium web browser to show the Console.
		`,
		scope: "client", // This specifies if it's a client-side setting
		config: true, // This makes the setting appear in the module configuration
		requiresReload: false, // If true, a client reload (F5) is required to activate the setting
		type: Boolean,
		default: false,
		onChange: (value) => {
			// Do something when the setting is changed, if necessary
		},
	});

	//? Introductory Module Settings
	settings.register("metanthropes", "metaIntroductory", {
		name: "Enable Metanthropes: Introductory",
		hint: `
			Enable this setting to gain access to the Metanthropes: Introductory features.
			`,
		scope: "world", // This specifies if it's a client-side setting
		config: false, // This makes the setting appear in the module configuration
		requiresReload: true, // If true, a client reload (F5) is required to activate the setting
		type: Boolean,
		default: false,
		onChange: (value) => {
			// Do something when the setting is changed, if necessary
		},
	});

	//? Core Module Settings
	settings.register("metanthropes", "metaCore", {
		name: "Enable Metanthropes: Core",
		hint: `
			Enable this setting to gain access to the Metanthropes: Core features.
			`,
		scope: "world", // This specifies if it's a client-side setting
		config: false, // This makes the setting appear in the module configuration
		requiresReload: true, // If true, a client reload (F5) is required to activate the setting
		type: Boolean,
		default: false,
		onChange: (value) => {
			// Do something when the setting is changed, if necessary
		},
	});

	//? Homebrew Module Settings
	settings.register("metanthropes", "metaHomebrew", {
		name: "Enable Metanthropes: Homebrew",
		hint: `
			Enable this setting to gain access to the Metanthropes: Homebrew features.
			`,
		scope: "world", // This specifies if it's a client-side setting
		config: false, // This makes the setting appear in the module configuration
		requiresReload: true, // If true, a client reload (F5) is required to activate the setting
		type: Boolean,
		default: false,
		onChange: (value) => {
			// Do something when the setting is changed, if necessary
		},
	});

	//? Beta Features Testing
	settings.register("metanthropes", "metaBetaTesting", {
		name: "Enable Beta Testing of New Features",
		hint: `
		Enable this setting to test New Features that are still in development.
		These features may not be fully functional and are subject to change during development.
		Make sure you backup your world before enabling this setting - just to be safe.
		`,
		scope: "world", // This specifies if it's a client-side setting
		config: false, // This makes the setting appear in the module configuration
		requiresReload: true, // If true, a client reload (F5) is required to activate the setting
		type: Boolean,
		default: false,
		onChange: (value) => {
			// Do something when the setting is changed, if necessary
		},
	});

	//? Welcome Screen
	settings.register("metanthropes", "metaWelcome", {
		name: "Show Welcome Screen",
		hint: `
		Enable this setting to display the Metanthropes Welcome Screen when the World loads.
		`,
		scope: "world",
		config: true,
		requiresReload: false,
		type: Boolean,
		default: true,
	});

	//? Display System Install Guide
	settings.register("metanthropes", "metaInstall", {
		name: "Show System Installation Guide",
		hint: `
		Enable to show the System Installation Guide on the next startup.
		`,
		scope: "world", //? This specifies if it's a client-side setting
		config: true, //? This makes the setting appear in the module configuration
		requiresReload: false, //? If true, a client reload (F5) is required to activate the setting
		type: Boolean,
		default: true,
		onChange: (value) => {
			//? Do something when the setting is changed, if necessary
		},
	});

	//? Un-pause on World load
	settings.register("metanthropes", "metaPause", {
		name: "Un-pause the World after initialization",
		hint: `
		Enable this setting to automatically un-pause the World after initializing the System and Modules.
		`,
		scope: "world",
		config: true,
		requiresReload: false,
		type: Boolean,
		default: true,
	});

}