Hooks.once("ready", async function () {
	//* For all Clients
	const mL = metanthropes.utils.metaLog;
	//* Welcome Journal
	if (game.settings.get("metanthropes", "metaWelcome")) {
		const systemWelcome = await fromUuid("Compendium.metanthropes.welcome.JournalEntry.5zynXjK4RTiGzcxQ");
		systemWelcome.sheet.render(true);
		await game.settings.set("metanthropes", "metaWelcome", false);
	}

	//* For Active GM only
	if (!game.user.isActiveGM) return mL(0, "System", "Ready");

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
		const content = await foundry.applications.handlebars.renderTemplate(
			"systems/metanthropes/templates/apps/chat/welcome-message.hbs",
			{ version: game.system.version },
		);
		const enrichedContent = await foundry.applications.ux.TextEditor.enrichHTML(content, { async: true });
		const chatData = {
			content: enrichedContent,
			flags: { metanthropes: {} },
		};
		await metanthropes.applications.MetaChatMessage.create(chatData);
		await game.settings.set("metanthropes", "welcomeMsg", false);
	}

	//* Display System Installation Guide
	const intro =
		game.settings.get("core", "adventureImports")[
			"Compendium.metanthropes-introductory.introductory-installation.Adventure.ESXVGNQu7VybH7nV"
		] ?? false;
	const nether =
		game.settings.get("core", "adventureImports")[
			"Compendium.metanthropes-anthologies-nether.nether-installation.Adventure.5DcNVeJ9fkj0zncj"
		] ?? false;
	//todo update with actual once released
	const astral = false;
	const aether = false;
	const quickstarted = Boolean(intro || nether || astral || aether);
	if (game.settings.get("metanthropes", "metaInstall")) {
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
