Hooks.once("ready", async function () {
	//* Migration
	metanthropes.utils.metaLog(3, "System", "Starting Migration");
	await metanthropes.utils.metaMigrateData();
	metanthropes.utils.metaLog(3, "System", "Finished Migration");

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
		const systemWelcome = await fromUuid("Compendium.metanthropes.welcome.JournalEntry.dP9LgZVr6QDQrI4K");
		systemWelcome.sheet.render(true);
	}

	//* Display Demo Installation Guide
	const installGuide = await game.settings.get("metanthropes", "metaInstall");
	if (installGuide) {
		const metaInstall = await fromUuid("Compendium.metanthropes.install-system.JournalEntry.LtDAG4iDlxFwGo8N");
		metaInstall.sheet.render(true);
		game.settings.set("metanthropes", "metaInstall", false);
	}

	//* Un-pause the World
	const metaPause = await game.settings.get("metanthropes", "metaPause");
	if (metaPause) {
		metanthropes.utils.metaLog(0, "System", "Un-pausing the World after initialization");
		game.togglePause(false);
	}

	//* Finished Loading Metanthropes System
	metanthropes.utils.metaLog(0, "System", "Ready");
});
