//* Drag Ruler Integration
Hooks.once("dragRuler.ready", (SpeedProvider) => {
	metanthropes.utils.metaLog(3, "Drag Ruler Integration Started");
	class MetanthropesSystemSpeedProvider extends SpeedProvider {
		get colors() {
			return [
				{ id: "movement", default: 0x00ff00, name: "physical.movement.value" },
				{ id: "additional", default: 0xffff00, name: "physical.movement.additional" },
				{ id: "sprint", default: 0xff8000, name: "physical.movement.sprint" },
			];
		}
		getRanges(token) {
			const baseSpeed = token.actor.system.physical.movement.value;
			// A character can choose to move an additional lenght equal to their base movement, and sprint up to 5 times their base movement
			const ranges = [
				{ range: baseSpeed * 2, color: "movement" },
				{ range: baseSpeed * 4, color: "additional" },
				{ range: baseSpeed * 10, color: "sprint" },
			];
			//todo	I can add special modifiers to speed (like flying, etc) - perhaps Metapowers that affect Movement directly?
			// Example: Characters that aren't wearing armor are allowed to run with three times their speed
			//		if (!token.actor.data.isWearingArmor) {
			//			ranges.push({range: baseSpeed * 3, color: "dash"})
			//		}
			return ranges;
		}
	}
	dragRuler.registerSystem("metanthropes", MetanthropesSystemSpeedProvider);
	metanthropes.utils.metaLog(3, "Drag Ruler Integration Finished");
});

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
