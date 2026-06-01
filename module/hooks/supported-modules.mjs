//* Dice So Nice

//? Hides inline rolls until animation completes for updated chat messages
Hooks.on("diceSoNiceInit", (dice3d) => {
	dice3d.setMessageUpdateHideSelector(".meta-roll-inline-results");
});

//? Custom System & Color theme for Dice So Nice
Hooks.once("diceSoNiceReady", async (dice3d) => {
	dice3d.addSystem({ id: "metanthropes", name: "Metanthropes" }, true);
	//? Add our color theme for Dark/Light & the Energy Types
	dice3d.addColorset(
		{
			name: "meta-dark",
			description: "Metanthropes Dark Theme",
			category: "Metanthropes",
			background: "#5e3a5b",
			foreground: "#ffed00",
			outline: "#945d90",
			visibility: "visible",
		},
		"preferred",
	);
	dice3d.addColorset(
		{
			name: "meta-light",
			description: "Metanthropes Light Theme",
			category: "Metanthropes",
			background: "#94d1d8",
			foreground: "#e6007e",
			outline: "#006e74",
			visibility: "visible",
		},
		"default",
	);
	dice3d.addColorset(
		{
			name: "meta-elemental",
			description: "Energy Type - Elemental",
			category: "Metanthropes",
			background: "#00595D",
			foreground: "#f2f2f2",
			outline: "#006F73",
			visibility: "hidden",
		},
		"default",
	);
	dice3d.addColorset(
		{
			name: "meta-psychic",
			description: "Energy Type - Psychic",
			category: "Metanthropes",
			background: "#9D2B67",
			foreground: "#f2f2f2",
			outline: "#CD3F86",
			visibility: "hidden",
		},
		"default",
	);
	dice3d.addColorset(
		{
			name: "meta-material",
			description: "Energy Type - Material",
			category: "Metanthropes",
			background: "#4B4B4D",
			foreground: "#f2f2f2",
			outline: "#58585A",
			visibility: "hidden",
		},
		"default",
	);
	dice3d.addColorset(
		{
			name: "meta-cosmic",
			description: "Energy Type - Cosmic",
			category: "Metanthropes",
			background: "#422646",
			foreground: "#f2f2f2",
			outline: "#543558",
			visibility: "hidden",
		},
		"default",
	);
	//? Add the Metanthropes Logo on the d10
	dice3d.addDicePreset({
		type: "d10",
		labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "\ue000"],
		font: "Font Awesome Kit",
		fontScale: 0.8,
		//colorset: "meta-dark",
		system: "metanthropes",
	});
	//? Add the Metanthropes Logo on the d100
	dice3d.addDicePreset({
		type: "d100",
		labels: ["10", "20", "30", "40", "50", "60", "70", "80", "90", "\ue000\ue000"],
		fontScale: 0.6,
		font: "Font Awesome Kit",
		//colorset: "meta-dark",
		system: "metanthropes",
	});
	//? Preload our presets so it should not lag on first roll.
	await dice3d.preloadPresets("metanthropes");
	//? Add our default SFX - done only once for the active GM
	if (!game.user.isActiveGM) return metanthropes.utils.metaLog(0, "Dice So Nice", "Player Integration Finished");
	if (game.settings.get("metanthropes", "metaDSNSFX"))
		return metanthropes.utils.metaLog(0, "Dice So Nice", "Narrator Integration Finished");
	await game.user.setFlag("dice-so-nice", "sfxList", metanthropes.system.DSNSFX);
	await game.settings.set("metanthropes", "metaDSNSFX", true);
	return metanthropes.utils.metaLog(0, "Dice So Nice", "Setting Default SFX", "&", "Narrator Integration Finished");
});
