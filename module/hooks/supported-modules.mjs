//* Dice So Nice

//? Hides inline rolls until animation completes for updated chat messages
Hooks.on("diceSoNiceInit", (dice3d) => {
	dice3d.setMessageUpdateHideSelector(".meta-roll-inline-results");
});

//? Custom System & Color theme for Dice So Nice
Hooks.once("diceSoNiceReady", async (dice3d) => {
	dice3d.addSystem({ id: "metanthropes", name: "Metanthropes" }, true);
	dice3d.addColorset(
		{
			name: "meta-dark",
			description: "Metanthropes Dark",
			category: "Metanthropes",
			background: "#945d90",
			foreground: "#ffed00",
			outline: "#5e3a5b",
			visibility: "visible",
		},
		"preferred",
	);
	dice3d.addColorset(
		{
			name: "meta-light",
			description: "Metanthropes Light",
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
			description: "Metanthropes Elemental",
			category: "Metanthropes",
			background: "#00595D",
			foreground: "#f2f2f2",
			outline: "#006F73",
			visibility: "visible",
		},
		"default",
	);
	dice3d.addColorset(
		{
			name: "meta-psychic",
			description: "Metanthropes Psychic",
			category: "Metanthropes",
			background: "#9D2B67",
			foreground: "#f2f2f2",
			outline: "#CD3F86",
			visibility: "visible",
		},
		"default",
	);
	dice3d.addColorset(
		{
			name: "meta-material",
			description: "Metanthropes Material",
			category: "Metanthropes",
			background: "#4B4B4D",
			foreground: "#f2f2f2",
			outline: "#58585A",
			visibility: "visible",
		},
		"default",
	);
	dice3d.addColorset(
		{
			name: "meta-cosmic",
			description: "Metanthropes Cosmic",
			category: "Metanthropes",
			background: "#422646",
			foreground: "#f2f2f2",
			outline: "#543558",
			visibility: "visible",
		},
		"default",
	);
	dice3d.addDicePreset({
		type: "d10",
		labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "\ue000"],
		font: "Font Awesome Kit",
		fontScale: 0.8,
		//colorset: "meta-dark",
		system: "metanthropes",
	});
	dice3d.addDicePreset({
		type: "d100",
		labels: ["10", "20", "30", "40", "50", "60", "70", "80", "90", "\ue000\ue000"],
		fontScale: 0.6,
		font: "Font Awesome Kit",
		//colorset: "meta-dark",
		system: "metanthropes",
	});
	await dice3d.preloadPresets("metanthropes");
});
