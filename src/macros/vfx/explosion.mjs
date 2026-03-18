const impact = new foundry.canvas.vfx.VFXEffect({
	name: "Meta Impact",
	components: {
		burst: {
			type: "singleImpact",
			position: { reference: "target", property: "center" },
			texture: "systems/metanthropes/assets/artwork/vfx/particle-4.webp",
			duration: 1200,
			size: { w: 256, h: 256 },
			animations: [{ function: "scale", params: {} }],
			sound: {
				src: "systems/metanthropes/assets/audio/sfx/Astral_Cue_Metal_Detector_01.ogg",
			},
		},
		shake: {
			type: "shake",
			duration: 800,
			maxDisplacement: 20,
			smoothness: 0.6,
		},
		damage: {
			type: "scrollingText",
			origin: { reference: "target", property: "center" },
			content: { reference: "damageText" },
			duration: 1500,
			scrollDirection: CONST.TEXT_ANCHOR_POINTS.TOP,
			textStyle: { fill: "#ff4400", fontSize: 36, fontWeight: "bold" },
		},
	},
	timeline: [
		{ component: "burst", position: 0 },
		{ component: "shake", position: 100 },
		{ component: "damage", position: 200 },
	],
});

await impact.play({
	target: targetToken.document,
	damageText: `${totalDamage} fire`,
});
