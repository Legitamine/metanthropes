/**
 * Proof of concept function to trigger VFX
 * Should be called during the applyDamage step
 *
 * @export
 * @async
 * @param {*} actor
 * @param {*} manuallySelectedTargets
 * @param {*} effect
 * @param {*} elementalDamageRollResult
 * @returns {unknown}
 */
export async function metaVFX({
	//todo rename values cleanly
	initiatingTokenUUID,
	targetTokensUUIDs,
	cosmicDamageRollResult,
	elementalDamageRollResult,
	materialDamageRollResult,
	psychicDamageRollResult,
	itemUUID,
}) {
	const mL = metanthropes.utils.metaLog;
	mL(
		3,
		"metaVFX",
		"VFX",
		"params:",
		initiatingTokenUUID,
		targetTokensUUIDs,
		cosmicDamageRollResult,
		elementalDamageRollResult,
		materialDamageRollResult,
		psychicDamageRollResult,
		itemUUID,
	);
	//? Grab the initiating actor's Token
	const actor = await fromUuid(initiatingTokenUUID);
	const actorToken = await actor.getActiveTokens(false, false)[0];
	mL(3, "metaVFX", "Initiating Actor: UUID/actor/actorToken", initiatingTokenUUID, actor, actorToken);
	///scene.uuid // actorToken.uuid,
	if (!actorToken) return mL(5, "metaVFX", "No Initiating Actor Token could be found for actor", actor);
	//? mL(3, "metaVFX", "actorToken", actorToken, "manuallySelectedTargets", manuallySelectedTargets);

	// idea here is probably that we create a bunch of different components and we synthesize them into a single VFXEffect
	// based off the properties of the Item that was used. Would need to create a 'master' animation with all component combinations and test that
	// can we run multiple VFXEffects in parallel? How does clone affect us? Need to decide/define the master combinations
	// Should also think about VFXEffects not triggered by metaExecute, but rather on other triggers like Criticals / Hunger / Cover, Bloodsplats etc
	// Also, we should be able to call a specific effect (like textscroll for other things too like when losing life (vs damage dealt) and others (portal opens, trap triggered!))
	// Also the animation should trigger ONCE after all potential re-rolls happen, not multiple times for each damage re-roll for eg.
	// Need a way to scale the animation to the size of the Token or not?
	// eventually we'll need to define our own custom VFXComponents see [the api for more details](https://foundryvtt.com/api/v14/modules/foundry.canvas.vfx.html)
	//* single VFX Effect Tests
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
	// * Customize the effect
	//? item
	const item = await fromUuid(itemUUID);
	const damageTextures = [];
	let totalDamage = 0;
	if (cosmicDamageRollResult > 0) {
		damageTextures.push("systems/metanthropes/assets/artwork/vfx/particle-1.webp");
		totalDamage += cosmicDamageRollResult;
	}
	if (elementalDamageRollResult > 0) {
		damageTextures.push("systems/metanthropes/assets/artwork/vfx/particle-2.webp");
		totalDamage += elementalDamageRollResult;
	}
	if (materialDamageRollResult > 0) {
		damageTextures.push("systems/metanthropes/assets/artwork/vfx/particle-3.webp");
		totalDamage += materialDamageRollResult;
	}
	if (psychicDamageRollResult > 0) {
		damageTextures.push("systems/metanthropes/assets/artwork/vfx/particle-4.webp");
		totalDamage += psychicDamageRollResult;
	}
	const damageCount = Math.clamp(totalDamage / 4, 1, 100);
	const minScale = Math.clamp(damageCount * 0.1, 0.1, 0.3);
	const maxScale = Math.clamp(damageCount * 0.5, 0.4, 0.8);
	//* meta (combined) VFX Effect test
	const metaVFX = await new foundry.canvas.vfx.VFXEffect({
		//todo improvements: speed & overlap, random rotation, fades, scaling via token size or life total?, delta positions?
		name: "metaVFX",
		components: {
			//?the type of the component matters, not the key name
			//? use key name in timeline
			kame: {
				type: "singleAttack",
				path: [
					{ reference: "origin", deltas: { sort: 0 } },
					{ reference: "target", deltas: { sort: 0 } },
				],
				pathType: "arc",
				charge: {
					texture: item.img,
					size: 4,
					duration: 1500,
					animations: [{ function: "drawBack" }],
					// sound: {
						// 	//defaults to the music track vs the interface or environment
						// 	src: "systems/metanthropes/assets/audio/sfx/reload-heavy-03.wav",
						// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
						// 	channel: "environment",
						// 	volume: 0.3,
						// },
					},
					projectile: {
						texture: item.img,
						// size: { w: 48, h: 24 }, //number in feet ?
						size: 2, // feet
						speed: 32, // feet per second;  duration computed from path length //? 32f/s is 10m/s
						animations: [{ function: "followPath" }],
						// sound: {
							// 	src: "systems/metanthropes/assets/audio/sfx/astral-cue-metal-detector-01.ogg",
							// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START, //align: foundry.canvas.sfx.SOUND_ALIGNMENT.START,
							// 	channel: "environment",
							// 	volume: 0.1,
							// },
						},
						impact: {
							//bloodsplatter?
							texture: item.img,
							size: 4,
							duration: 2000,
							// sound: {
								// 	src: "systems/metanthropes/assets/audio/sfx/distant-explosion-03.wav",
								// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
								// 	channel: "environment",
								// 	volume: 0.3,
								// },
							},
						},
			boom1: {
				type: "singleImpact",
				position: { reference: "target", deltas: { sort: 0 } }, //timeline position? what does this sort affect?
				texture: "systems/metanthropes/assets/artwork/vfx/boom-1.png",
				size: 10,
				animations: [{ function: "scale", params: {} }],
				duration: 230,
				// sound: {
				// 	src: "systems/metanthropes/assets/audio/sfx/small-explosion-01.wav",
				// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
				// 	channel: "environment",
				// 	radius: 120, //def 60 - what is this, feet?
				// 	volume: 0.3,
				// },
			},
			boom2: {
				type: "singleImpact",
				position: { reference: "target", deltas: { sort: 1 } },
				texture: "systems/metanthropes/assets/artwork/vfx/boom-2.png",
				size: 10,
				animations: [{ function: "scale", params: {} }],
				duration: 230,
				// sound: {
				// 	src: "systems/metanthropes/assets/audio/sfx/small-explosion-02.wav",
				// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
				// 	radius: 120, //def 60 - what is this, feet?
				// 	channel: "environment",
				// 	volume: 0.3,
				// },
				shake: {
					//doesn't seem to get triggered here, perhaps it's not a valid component in the singleImpact?
					type: "shake",
					target: "stage", //can also target individual canvas layers or groups
					duration: 200,
					maxDisplacement: 20, //35 def
					smoothness: 0.6,
				},
			},
			boom3: {
				type: "singleImpact",
				position: { reference: "target", deltas: { sort: 0 } },
				texture: "systems/metanthropes/assets/artwork/vfx/boom-3.png",
				size: 10,
				animations: [{ function: "scale", params: {} }],
				duration: 230,
				// sound: {
				// 	src: "systems/metanthropes/assets/audio/sfx/small-explosion-03.wav",
				// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
				// 	radius: 120, //def 60 - what is this, feet?
				// 	channel: "environment",
				// 	volume: 0.3,
				// },
			},
			boom4: {
				type: "singleImpact",
				position: { reference: "target", deltas: { sort: 1 } },
				texture: "systems/metanthropes/assets/artwork/vfx/boom-4.png",
				size: 10,
				animations: [{ function: "scale", params: {} }],
				duration: 230,
				// sound: {
				// 	src: "systems/metanthropes/assets/audio/sfx/small-explosion-04.wav",
				// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
				// 	radius: 120, //def 60 - what is this, feet?
				// 	channel: "environment",
				// 	volume: 0.3,
				// },
			},
			boom5: {
				type: "singleImpact",
				position: { reference: "target", deltas: { sort: 0 } },
				texture: "systems/metanthropes/assets/artwork/vfx/boom-5.png",
				size: 10,
				animations: [{ function: "scale", params: {} }],
				duration: 230,
				// sound: {
				// 	src: "systems/metanthropes/assets/audio/sfx/small-explosion-05.wav",
				// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
				// 	radius: 120, //def 60 - what is this, feet?
				// 	channel: "environment",
				// 	volume: 0.3,
				// },
			},
			particles: {
				type: "particleGenerator",
				textures: damageTextures,
				area: { reference: "target" },
				count: damageCount,
				duration: 3500,
				lifetime: { min: 300, max: 700 },
				fade: { in: 50, out: 200 },
				scale: { min: minScale, max: maxScale },
				velocity: { speed: 1, angle: 1 },
				config: {
					constraints: { mode: "none" },
					drift: { enabled: true, intensity: 0.8 },
				},
			},
			text: {
				type: "scrollingText",
				//content: "${elementalDamageRollResult} Elemental",
				content: { reference: "text" },
				//distance: 5, // no idea, no default
				duration: 5000, //optional def 2000
				//jitter: 1, //def 0
				//origin: { reference: "target", property: "center" }, //origin is confusing here, why not position?
				origin: { reference: "target", deltas: { sort: 0 } },
				scrollDirection: CONST.TEXT_ANCHOR_POINTS.TOP,
				//textAnchor: CONST.TEXT_ANCHOR_POINTS.TOP, //optional
				//todo color based on damagetype
				textStyle: { fill: "#d21414", fontSize: 64, fontWeight: "bold" },
			},
		},
		timeline: [
			{ component: "kame", position: 0 }, //can I have relative positions in the timeline - how do you know how much time it takes for the projectile to reach the target?
			{ component: "boom1", position: 3100 },
			{ component: "boom2", position: 3180 },
			{ component: "boom3", position: 3380 },
			{ component: "boom4", position: 3580 },
			{ component: "boom5", position: 3780 },
			{ component: "particles", position: 3840 },
			{ component: "text", position: 4000 },
		],
	});

	//* Go thru each Token from the manuallySelectedTargets - future input from Targeting validation
	for (const targetedActorUUID of JSON.parse(targetTokensUUIDs)) {
		const actor = await fromUuid(targetedActorUUID);
		const targetedActor = await actor.getActiveTokens(false, false)[0]; //?would that work for target tokens too?
		mL(3, "metaVFX", "TargetedActor UUID/actor/TargetedActor", targetedActorUUID, actor, targetedActor);
		let damageMessage = ``;
		//todo localize
		if (cosmicDamageRollResult > 0) damageMessage += `Cosmic: ${cosmicDamageRollResult} `;
		if (elementalDamageRollResult > 0) damageMessage += ` Elemental: ${elementalDamageRollResult} `;
		if (materialDamageRollResult > 0) damageMessage += ` Material: ${materialDamageRollResult} `;
		if (psychicDamageRollResult > 0) damageMessage += ` Psychic: ${psychicDamageRollResult}`;
		//! if we await the VFX then it goes from one target to the next, if we don't, it does all at the same time.
		//! Are there metapowers/possessions where we would want an effect to be awaited instead ?
		//? what if there is a miss??
		//! Multi-action is essentially multiple separate activations, not subject to this
		// rather check to see if there are any metapowers that would require us to re-roll for EACH target, then it would need an await
		if (metaVFX.started) {
			mL(3, "metaVFX", "Cloning VFX");
			const newVFX = metaVFX.clone();
			newVFX.play({
				origin: {
					...actorToken.center,
					elevation: actorToken.document.elevation,
					sort: actorToken.document.sort,
				},
				target: {
					...targetedActor.center,
					elevation: targetedActor.document.elevation,
					sort: targetedActor.document.sort,
				},
				text: damageMessage,
			});
			continue;
		}
		metaVFX.play({
			origin: {
				...actorToken.center,
				elevation: actorToken.document.elevation,
				sort: actorToken.document.sort,
			},
			target: {
				...targetedActor.center,
				elevation: targetedActor.document.elevation,
				sort: targetedActor.document.sort, //?sort controls if the effect will be under or over the token (enabled is over)
			},
			text: damageMessage,
		});
		continue;
	}
	mL(3, "metaVFX", "Finished");
}
