export const settings = [
	{
		module: "metanthropes",
		key: "migrationVersion",
		name: "Last Migration Performed",
		hint: `
		This setting is used to keep track of the last migration script that was performed.
		This setting is not visible in the UI and only used by the migration scripts.
		`,
		scope: "world",
		config: false,
		requiresReload: false,
		type: String,
		default: "0.13",
		onChange: null,
	},
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
	{
		module: "metanthropes",
		key: "metaWelcome",
		name: "Show Welcome Screen",
		hint: `
		Enable this setting to display the Metanthropes Welcome Screen when the World loads.
		`,
		scope: "world",
		config: true,
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
		config: true,
		requiresReload: false,
		type: Boolean,
		default: true,
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
	{
		module: "metanthropes",
		key: "prototypeTokenOverridesApplied",
		name: "Apply Override Token Settings in this World",
		hint: ``,
		scope: "world",
		config: false,
		requiresReload: false,
		type: Boolean,
		default: false,
		onChange: null,
	},
];
