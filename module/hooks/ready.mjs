Hooks.once("ready", async function () {
	//* Migration
	metanthropes.utils.metaLog(3, "System", "Getting Ready", "Starting Migration");
	await metanthropes.utils.metaMigrateData();
	metanthropes.utils.metaLog(3, "System", "Getting Ready", "Finished Migration");

	//* Override Protype Token Defaults
	const applied = await game.settings.get("metanthropes", "prototypeTokenOverridesApplied");
	if (applied) {
		metanthropes.utils.metaLog(0, "System", "Getting Ready", "System Default Token Overrides already established");
	} else {
		metanthropes.utils.metaLog(0, "System", "Getting Ready", "Establishing System Default Token Overrides");
		const newTokenDefaults = metanthropes.system.TOKENDEFAULTS;
		await game.settings.set("core", "prototypeTokenOverrides", newTokenDefaults);
		await game.settings.set("metanthropes", "prototypeTokenOverridesApplied", true);
	}
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
