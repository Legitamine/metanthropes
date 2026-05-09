Hooks.once("ready", async function () {
	const mL = metanthropes.utils.metaLog;
	//* Migration Engine
	mL(0, "System", "Getting Ready", "Initializing Data Migration Engine");
	//todo can I wait for en.json to finish loading descriptions first?
	await metanthropes.utils.metaMigration();
	mL(0, "System", "Getting Ready", "Data Migration Finished");

	//* Add support for Moulinette
	//todo should be moved to supported-modules instead
	if (game.moulinette) {
		//* Metanthropes Content Moulinette Integration
		//? Add Metanthropes Metapowers Artwork to Moulinette
		game.moulinette.sources.push({
			type: "images",
			publisher: "Metanthropes",
			pack: "Metapowers",
			source: "data",
			path: "systems/metanthropes/assets/artwork/metapowers",
		});
	}

	//* Display Welcome Message
	if (game.settings.get("metanthropes", "welcomeMsg")) {
		const version = game.system.version;
		const content = `<h3>METANTHROPES</h3>
<p class="welcome-message">Welcome to <strong><span style="font-family: &#x27;Metanthropes&#x27;">Metanthropes</span></strong>, a new setting-flexible, d100 TTRPG that embraces classless progression & boundless creativity, about ordinary individuals with extraordinary gifts. With <strong>100 @METAICON(metanthropes) Metapowers</strong> and over 500 unique abilities at your fingertips, possibilities are limitless, shaped only by the stories you choose to tell.</p><br>
<p class="welcome-message"><strong>Early Access Release v${version}</strong> brings support for the <strong>Metanthropes: Anthologies - <span style="font-family: &#x27;Metanthropes&#x27;">NETHER</span></strong> Premium Module for our Alpha Kickstarter Backers. It also comes with updates on the UI and a new app, the Actor Image Picker. Read the <a href="https://github.com/Legitamine/metanthropes/blob/main/CHANGELOG.md" title="Straight from Github">latest release notes</a> for more information.</p><br>
<p class="welcome-message">View the @UUID[Compendium.metanthropes.welcome.JournalEntry.5zynXjK4RTiGzcxQ]{Welcome Journal} & import the @UUID[Compendium.metanthropes.system.Adventure.7rKmFXvGJE8UFv2h]{System Toolkit & Quickstart}. Visit <a href="https://metanthropes.com" title="Metanthropes.com">our website</a> to learn more about the game & <a href="https://metanthropes.com/discord" title="Register using your Discord account">join our community on Discord!</a>.</p><br>
<p class="welcome-message"><strong>Metanthropes Premium Modules</strong> are available as rewards for our Kickstarter Backers or for purchase on <a href="https://metanthropes.com/store" title="Many bundles and promotions available!">our store</a> and on the <a href="https://www.foundryvtt.store/creators/legitamine-games" title="Legitamine Games on Foundry VTT Marketplace">official Foundry Marketplace</a>.</p>`;
		const chatData = {
			content: content,
			flags: { metanthropes: {} },
		};
		await metanthropes.applications.MetaChatMessage.create(chatData);
		await game.settings.set("metanthropes", "welcomeMsg", false);
	}
	//* Welcome Journal
	if (game.settings.get("metanthropes", "metaWelcome")) {
		const systemWelcome = await fromUuid("Compendium.metanthropes.welcome.JournalEntry.5zynXjK4RTiGzcxQ");
		systemWelcome.sheet.render(true);
		await game.settings.set("metanthropes", "metaWelcome", false);
	}

	//* Display System Installation Guide
	const intro = game.settings.get("core", "adventureImports")[
		"Compendium.metanthropes-introductory.introductory-installation.Adventure.ESXVGNQu7VybH7nV"
	];
	const nether = game.settings.get("core", "adventureImports")[
		"Compendium.metanthropes-anthologies-nether.nether-installation.Adventure.5DcNVeJ9fkj0zncj"
	];
	const quickstarted = Boolean(intro || nether);
	if (game.settings.get("metanthropes", "metaInstall") && game.user.isActiveGM) {
		if (!quickstarted) {
			const metaInstall = await fromUuid("Compendium.metanthropes.system.Adventure.7rKmFXvGJE8UFv2h");
			metaInstall.sheet.render(true);
			await game.settings.set("metanthropes", "metaInstall", false);
		}
	}

	//* Un-pause the World
	if (game.settings.get("metanthropes", "metaPause")) {
		mL(0, "System", "Getting Ready", "Un-pausing the World after initialization");
		game.togglePause(false);
	}

	//* Finished Loading Metanthropes System
	mL(0, "System", "Ready");
});
