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

	//* Display Welcome Screen
	if (game.settings.get("metanthropes", "metaWelcome")) {
		const systemWelcome = await fromUuid("Compendium.metanthropes.welcome.JournalEntry.5zynXjK4RTiGzcxQ");
		systemWelcome.sheet.render(true);
		await game.settings.set("metanthropes", "metaWelcome", false);
	}

	//* Display System Installation Guide
	const quickstarted = game.settings.get("core", "adventureImports")[
		"Compendium.metanthropes-introductory.introductory-installation.Adventure.Rpbcpo6kj4V6LpUv"
	];
	if (game.settings.get("metanthropes", "metaInstall") && game.user.isActiveGM) {
		if (!quickstarted) {
			const metaInstall = await fromUuid("Compendium.metanthropes.system.Adventure.7rKmFXvGJE8UFv2h");
			metaInstall.sheet.render(true);
			await game.settings.set("metanthropes", "metaInstall", false);
		} else {
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
