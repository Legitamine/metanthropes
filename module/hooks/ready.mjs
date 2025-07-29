Hooks.once("ready", async function () {
	//* Migration Engine
	metanthropes.utils.metaLog(0, "System", "Getting Ready", "Initializing Data Migration Engine");
	await metanthropes.utils.metaMigration();
	metanthropes.utils.metaLog(0, "System", "Getting Ready", "Data Migration Finished");

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
	const welcome = await game.settings.get("metanthropes", "metaWelcome");
	if (welcome) {
		const systemWelcome = await fromUuid("Compendium.metanthropes.welcome.JournalEntry.5zynXjK4RTiGzcxQ");
		systemWelcome.sheet.render(true);
		await game.settings.set("metanthropes", "metaWelcome", false);
	}

	//* Display System Installation Guide
	const installGuide = await game.settings.get("metanthropes", "metaInstall");
	if (installGuide) {
		const metaInstall = await fromUuid("Compendium.metanthropes.system.Adventure.7rKmFXvGJE8UFv2h");
		metaInstall.sheet.render(true);
		await game.settings.set("metanthropes", "metaInstall", false);
	}

	//* Un-pause the World
	const metaPause = await game.settings.get("metanthropes", "metaPause");
	if (metaPause) {
		metanthropes.utils.metaLog(0, "System", "Getting Ready", "Un-pausing the World after initialization");
		game.togglePause(false);
	}

	//* Finished Loading Metanthropes System
	metanthropes.utils.metaLog(0, "System", "Ready");
});
