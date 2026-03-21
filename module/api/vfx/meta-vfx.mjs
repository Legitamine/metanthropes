/**
 * Description placeholder
 *
 * @export
 * @async
 * @param {*} actor
 * @param {*} targetedActorsUUIDs
 * @param {*} effect
 * @returns {unknown}
 */
export async function metaVFX(actor, manuallySelectedTargets, effect, elementalDamageRollResult) {
	//!xreiazomai ta tokens apo to game.user.targets oxi ta token documents
	const mL = metanthropes.utils.metaLog;
	mL(3, "metaVFX", "VFX");
	//? Grab the initiating actor's token document
	const actorToken = await actor.getActiveTokens(false, true)[0];
	if (!actorToken) return mL(5, "metaVFX", "No Initiating Actor Token could be found for actor", actor);
	mL(3, "metaVFX", "actorToken", actorToken, "manuallySelectedTargets", manuallySelectedTargets);

	// idea here is probably that we create a bunch of different components and we synthesize them into a single VFXEffect
	// based off the properties of the Item that was used. Would need to create a 'master' animation with all component combinations and test that
	// can we run multiple VFXEffects in parallel? How does clone affect us? Need to decide/define the master combinations
	// Should also think about VFXEffects not triggered by metaExecute, but rather on other triggers like Criticals / Hunger / Cover, Bloodsplats etc

	//* VFX Tests
	const shot = new foundry.canvas.vfx.VFXEffect({
		name: "Meta Shot",
		components: {
			flight: {
				type: "singleAttack",
				path: [
					{ reference: "origin", deltas: { sort: 1 } },
					{ reference: "target", deltas: { sort: 1 } },
				],
				pathType: "arc",
				charge: {
					texture: "systems/metanthropes/assets/artwork/vfx/particle-1.webp",
					duration: 300,
					animations: [{ function: "drawBack", params: {} }],
					//sound: { src: "ogg", align : 2}
				},
				projectile: {
					texture: "systems/metanthropes/assets/artwork/vfx/particle-2.webp",
					speed: 6, // feet per second;  duration computed from path length //? 32f/s is 10m/s
					size: { w: 480, h: 240 }, //number in feet ?
					animations: [{ function: "followPath", params: {} }],
					sound: {
						src: "systems/metanthropes/assets/audio/sfx/Astral_Cue_Metal_Detector_01.ogg",
						align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START, //align: foundry.canvas.sfx.SOUND_ALIGNMENT.START,
					},
				},
				impact: {
					//bloodsplatter?
					texture: "systems/metanthropes/assets/artwork/vfx/particle-3.webp",
					duration: 400,
					sound: {
						src: "systems/metanthropes/assets/audio/sfx/Astral_Cue_Modern_device_beeping_01.ogg",
						align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
					},
				},
			},
		},
		timeline: [{ component: "flight", position: 0 }],
	});
	const impact = new foundry.canvas.vfx.VFXEffect({
		name: "Meta Impact",
		components: {
			burst: {
				type: "singleImpact",
				position: { reference: "target", property: "center" },
				texture: "systems/metanthropes/assets/artwork/vfx/particle-4.webp",
				duration: 2100,
				// size: { w: 2056, h: 2056 },
				size: 10,
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
				duration: 2500,
				scrollDirection: CONST.TEXT_ANCHOR_POINTS.TOP,
				textStyle: { fill: "#ff4400", fontSize: 86, fontWeight: "bold" },
			},
		},
		timeline: [
			{ component: "burst", position: 0 },
			{ component: "shake", position: 100 },
			{ component: "damage", position: 200 },
		],
	});

	const splatter = new foundry.canvas.vfx.VFXEffect({
		name: "bloodSplatter",
		components: {
			splash: {
				type: "singleImpact",
				position: { reference: "target", deltas: { sort: 1 } },
				texture: "systems/metanthropes/assets/artwork/vfx/particle-4.webp",
				size: 2,
				duration: 2000,
				sound: {
					src: "systems/metanthropes/assets/audio/sfx/Astral_Cue_Metal_Detector_01.ogg",
					align: 1,
				},
			},
		},
		timeline: [{ component: "splash" }],
	});
	const metaVFX = new foundry.canvas.vfx.VFXEffect({
		//todo improvements: speed & overlap, random rotation, fades, scaling via token size or life total?, delta positions?
		name: "metaVFX",
		components: {
			// flight: {
			// 	type: "singleAttack",
			// 	path: [
			// 		{ reference: "origin", deltas: { sort: 1 } },
			// 		{ reference: "target", deltas: { sort: 1 } },
			// 	],
			// 	pathType: "arc",
			// 	charge: {
			// 		texture: "systems/metanthropes/assets/artwork/vfx/particle-1.webp",
			// 		duration: 300,
			// 		animations: [{ function: "drawBack", params: {} }],
			// 		//sound: { src: "ogg", align : 2}
			// 	},
			// 	projectile: {
			// 		texture: "systems/metanthropes/assets/artwork/vfx/particle-2.webp",
			// 		speed: 6, // feet per second;  duration computed from path length //? 32f/s is 10m/s
			// 		size: { w: 48, h: 24 }, //number in feet ?
			// 		animations: [{ function: "followPath", params: {} }],
			// 		sound: {
			// 			src: "systems/metanthropes/assets/audio/sfx/Astral_Cue_Metal_Detector_01.ogg",
			// 			align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START, //align: foundry.canvas.sfx.SOUND_ALIGNMENT.START,
			// 		},
			// 	},
			// 	projectile: {
			// 		texture: "systems/metanthropes/assets/artwork/vfx/particle-4.webp",
			// 		speed: 12, // feet per second;  duration computed from path length //? 32f/s is 10m/s
			// 		size: { w: 48, h: 24 }, //number in feet ?
			// 		animations: [{ function: "followPath", params: {} }],
			// 		sound: {
			// 			src: "systems/metanthropes/assets/audio/sfx/Aether_Cue_Brain_electric.ogg",
			// 			align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START, //align: foundry.canvas.sfx.SOUND_ALIGNMENT.START,
			// 		},
			// 	},
			// 	impact: {
			// 		//bloodsplatter?
			// 		texture: "systems/metanthropes/assets/artwork/vfx/particle-3.webp",
			// 		duration: 400,
			// 		sound: {
			// 			src: "systems/metanthropes/assets/audio/sfx/Astral_Cue_Modern_device_beeping_01.ogg",
			// 			align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
			// 		},
			// 	},
			// },
			boom1: {
				type: "singleImpact",
				position: { reference: "target", deltas: { sort: 0 } }, //what does this sort affect?
				texture: "systems/metanthropes/assets/artwork/vfx/boom-1.png",
				size: 10,
				animations: [{ function: "scale", params: {} }],
				duration: 230,
			},
			boom2: {
				type: "singleImpact",
				position: { reference: "target", deltas: { sort: 1 } },
				texture: "systems/metanthropes/assets/artwork/vfx/boom-2.png",
				size: 10,
				animations: [{ function: "scale", params: {} }],
				duration: 230,
			},
			boom3: {
				type: "singleImpact",
				position: { reference: "target", deltas: { sort: 0 } },
				texture: "systems/metanthropes/assets/artwork/vfx/boom-3.png",
				size: 10,
				animations: [{ function: "scale", params: {} }],
				duration: 230,
			},
			boom4: {
				type: "singleImpact",
				position: { reference: "target", deltas: { sort: 1 } },
				texture: "systems/metanthropes/assets/artwork/vfx/boom-4.png",
				size: 10,
				animations: [{ function: "scale", params: {} }],
				duration: 230,
			},
			boom5: {
				type: "singleImpact",
				position: { reference: "target", deltas: { sort: 0 } },
				texture: "systems/metanthropes/assets/artwork/vfx/boom-5.png",
				size: 10,
				animations: [{ function: "scale", params: {} }],
				duration: 230,
			},
			text: {
				type: "scrollingText",
				//origin: { reference: "target", property: "center" }, //origin is confusing here, why not position?
				origin: { reference: "target" },
				//content: { reference: "text" },
				content: `${elementalDamageRollResult} Elemental`,
				duration: 2500, //optional def 2000
				scrollDirection: CONST.TEXT_ANCHOR_POINTS.TOP,
				textAnchor: CONST.TEXT_ANCHOR_POINTS.CENTER, //optional
				textStyle: { fill: "#d21414", fontSize: 28, fontWeight: "bold" },
			},
		},
		timeline: [
			//{ component: "flight", position: 0 },
			{ component: "text", position: 0 },
			{ component: "boom1", position: 100 },
			{ component: "boom2", position: 180 },
			{ component: "boom3", position: 380 },
			{ component: "boom4", position: 580 },
			{ component: "boom5", position: 780 },
		],
	});
	const dmgText = new foundry.canvas.vfx.VFXEffect({
		name: "DmgText",
		components: {
			damage: {
				type: "scrollingText",
				origin: { reference: "target", property: "center" },
				content: { reference: "damageText" },
				duration: 2500, //optional def 2000
				scrollDirection: CONST.TEXT_ANCHOR_POINTS.TOP,
				textAnchor: CONST.TEXT_ANCHOR_POINTS.CENTER, //optional
				textStyle: { fill: "#d21414", fontSize: 46, fontWeight: "bold" },
			},
		},
		timeline: [{ component: "damage", position: 0 }],
	});
	//* We need to iterate for each token from the manuallySelectedTargets
	//? Resolve each targeted actor's token document from the array so we can use them for this effect
	for (const targetedActor of manuallySelectedTargets) {
		//const targetToken = await fromUuid(targetedActor); //todo is Sync here required?
		//const target = game.user.targets.first();
		//mL(3, "metaVFX", "Shot VFX", "Initiating Actor Token", actorToken, "Target Token", target);
		//todo check if shot.started = true; then clone
		//await shot.play({
		// origin: {...actorToken.center, elevation: actorToken.document.elevation, sort: actorToken.document.sort},
		// target: {...targetToken.center, elevation: targetToken.document.elevation, sort: targetToken.document.sort},
		//origin: { ...actorToken.center },
		//target: { ...targetToken.center },
		//});
		//mL(3, "metaVFX", "Impact VFX");
		// await impact.play({
		// 	target: targetToken,
		// 	damageText: `${elementalDamageRollResult} Elemental`,
		// });
		//mL(3, "metaVFX", "Splatter VFX");
		// splatter.play({
		// 	// target: { ...targetToken.center, elevation: targetToken.document.elevation, sort: targetToken.document.sort },
		// 	// target: { ...targetToken.center, elevation: targetToken.document.elevation, sort: targetToken.document.sort },
		// 	target: { ...target.center, elevation: target.document.elevation, sort: target.document.sort },
		// });
		mL(3, "metaVFX", "Target's Name", targetedActor.name);
		// if (dmgText.started) {
		// 	const newVFX = dmgText.clone();
		// 	await newVFX.play({
		// 		target: targetedActor.center,
		// 		damageText: `${elementalDamageRollResult} Elemental`,
		// 	});
		// } else {
		// 	await dmgText.play({
		// 		target: targetedActor.center,
		// 		damageText: `${elementalDamageRollResult} Elemental`,
		// 	});
		// }
		if (metaVFX.started) {
			const newVFX = metaVFX.clone();
			await newVFX.play({
				origin: {
					...actorToken.center,
					//elevation: actorToken.document.elevation,
					//sort: actorToken.document.sort,
				},
				target: {
					...targetedActor.center,
					//elevation: targetedActor.document.elevation,
					//sort: targetedActor.document.sort,
				},
				text: "Elemental",
			});
			continue;
		}
		await metaVFX.play({
			origin: {
				...actorToken.center,
				//elevation: actorToken.document.elevation,
				//sort: actorToken.document.sort,
			},
			target: {
				...targetedActor.center,
				//elevation: targetedActor.document.elevation,
				//sort: targetedActor.document.sort, //?sort controls if the effect will be under or over the token (enabled is over)
			},
			text: `${elementalDamageRollResult} Elemental`,
		});
		continue;
	}
	mL(3, "metaVFX", "Finished");
}
