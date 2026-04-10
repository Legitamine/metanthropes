//example from https://foundryvtt.com/api/v14/modules/foundry.canvas.vfx.html
const effect = new foundry.canvas.vfx.VFXEffect({
	name: "Meta Shot",
	components: {
		flight: {
			type: "singleAttack",
			path: [
				{ reference: "origin", property: "center" },
				{ reference: "target", property: "center" },
			],
			pathType: "arc",
			charge: {
				texture: "systems/metanthropes/assets/artwork/vfx/particle-1.webp",
				duration: 300,
				animations: [{ function: "drawBack", params: {} }],
			},
			projectile: {
				texture: "systems/metanthropes/assets/artwork/vfx/particle-2.webp",
				speed: 150, // feet per second; duration computed from path length
				size: { w: 48, h: 24 },
				animations: [{ function: "followPath", params: {} }],
				sound: {
					src: "systems/metanthropes/assets/audio/sfx/Astral_Cue_Metal_Detector_01.ogg",
					align: foundry.canvas.vfx.SOUND_ALIGNMENT.START,
				},
			},
			impact: {
				texture: "systems/metanthropes/assets/artwork/vfx/particle-3.webp",
				duration: 400,
				sound: {
					src: "systems/metanthropes/assets/audio/sfx/Astral_Cue_Modern_device_beeping_01.ogg",
					align: foundry.canvas.vfx.SOUND_ALIGNMENT.START,
				},
			},
		},
	},
	timeline: [{ component: "flight", position: 0 }],
});

await effect.play({
	origin: attackerToken.document,
	target: targetToken.document,
});
