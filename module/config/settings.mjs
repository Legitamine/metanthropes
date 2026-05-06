export const settings = [
	{
		module: "metanthropes",
		key: "metaAdvancedLogging",
		name: "Enable Advanced Logging",
		hint: `
		The Console helps you identify any issues or potential bugs in regards to Metanthropes System for Foundry VTT.
		Enable this setting to see even more detailed logs in the Console.
		You can press 'F12' in the Foundry Client or 'CTRL+SHIFT+i' in a Chrome-ium web browser to show the Console.
		`,
		scope: "client",
		config: true,
		requiresReload: false,
		type: Boolean,
		default: false,
		onChange: null,
	},
	{
		module: "metanthropes",
		key: "forceMigration",
		name: "Force Data Migration",
		hint: `
		When you enable this setting, it will force the system to migrate this World's data to the latest version.
		Migration happens on the first World load after an update, and you can run it again by enabling this setting.
		To get support with any issues with updating, contact us at support@metanthropes.com or join our Discord.
		This setting requires a reload and it will be disabled automatically once it completes.
		`,
		scope: "world",
		config: true,
		requiresReload: true,
		type: Boolean,
		default: false,
		onChange: null,
	},
	{
		module: "metanthropes",
		key: "metaPause",
		name: "Un-pause the World after initialization",
		hint: `
		Enable this setting to automatically un-pause the World after initializing the System and Modules.
		`,
		scope: "world",
		config: true,
		requiresReload: false,
		type: Boolean,
		default: true,
		onChange: null,
	},
	//! Deprecated
	{
		module: "metanthropes",
		key: "metaWelcome",
		name: "Show Welcome Screen",
		hint: `
		Enable this setting to display the Metanthropes Welcome Screen when the World loads.
		`,
		scope: "world",
		config: false,
		requiresReload: false,
		type: Boolean,
		default: true,
		onChange: null,
	},
	{
		module: "metanthropes",
		key: "metaInstall",
		name: "Show System Demo Adventure",
		hint: `
		Enable to show the System Demo Adventure on the next startup.
		`,
		scope: "world",
		config: false,
		requiresReload: false,
		type: Boolean,
		default: true,
		onChange: null,
	},
	//* Hidden from the UI
	{
		module: "metanthropes",
		key: "migration",
		name: "Migration Settings",
		hint: ``,
		scope: "world",
		config: false,
		requiresReload: false,
		type: Object,
		default: null,
		onChange: null,
	},
	{
		module: "metanthropes",
		key: "welcomeMsg",
		name: "Welcome Message",
		hint: ``,
		scope: "world",
		config: false,
		requiresReload: false,
		type: Object,
		default: null,
		onChange: null,
	},
	//* Visible with Metanthropes: Introductory
	{
		module: "metanthropes",
		key: "metaIntroductory",
		name: "Enable Metanthropes: Introductory",
		hint: `
			Enable this setting to gain access to the Metanthropes: Introductory features.
			`,
		scope: "world",
		config: false,
		requiresReload: true,
		type: Boolean,
		default: false,
		onChange: null,
	},
	//* Visible with Metanthropes: Core
	{
		module: "metanthropes",
		key: "metaCore",
		name: "Enable Metanthropes: Core",
		hint: `
			Enable this setting to gain access to the Metanthropes: Core features.
			`,
		scope: "world",
		config: false,
		requiresReload: true,
		type: Boolean,
		default: false,
		onChange: null,
	},
	{
		module: "metanthropes",
		key: "metaBetaTesting",
		name: "Enable Beta Testing of New Features",
		hint: `
		Enable this setting to test New Features that are still in development.
		These features may not be fully functional and are subject to change during development.
		Make sure you give us your feedback and suggestions!
		`,
		scope: "world",
		config: false,
		requiresReload: true,
		type: Boolean,
		default: false,
		onChange: null,
	},
	//* Visible with Metanthropes: Homebrew
	{
		module: "metanthropes",
		key: "metaHomebrew",
		name: "Enable Metanthropes: Homebrew",
		hint: `
			Enable this setting to gain access to the Metanthropes: Homebrew features.
			`,
		scope: "world",
		config: false,
		requiresReload: true,
		type: Boolean,
		default: false,
		onChange: null,
	},
	{
		module: "metanthropes",
		key: "metaAlphaTesting",
		name: "Enable Alpha Testing of Upcoming Features",
		hint: `
		Enable this setting to test Upcoming Features that are still in early development.
		These features are not fully functional and are subject to change during development.
		Make sure you give us your feedback and suggestions!
		`,
		scope: "world",
		config: false,
		requiresReload: true,
		type: Boolean,
		default: false,
		onChange: null,
	},
	//* Placeholder for Anthologies
	{
		module: "metanthropes",
		key: "metaAether",
		name: "Enable Metanthropes: Anthologies - Aether",
		hint: `
			Enable this setting to gain access to the Metanthropes Anthologies: Aether features.
			`,
		scope: "world",
		config: false,
		requiresReload: true,
		type: Boolean,
		default: false,
		onChange: null,
	},
	{
		module: "metanthropes",
		key: "metaAstral",
		name: "Enable Metanthropes: Anthologies - Astral",
		hint: `
			Enable this setting to gain access to the Metanthropes Anthologies: Astral features.
			`,
		scope: "world",
		config: false,
		requiresReload: true,
		type: Boolean,
		default: false,
		onChange: null,
	},
	{
		module: "metanthropes",
		key: "metaNether",
		name: "Enable Metanthropes: Anthologies - Nether",
		hint: `
			Enable this setting to gain access to the Metanthropes Anthologies: Nether features.
			`,
		scope: "world",
		config: false,
		requiresReload: true,
		type: Boolean,
		default: false,
		onChange: null,
	},
];
