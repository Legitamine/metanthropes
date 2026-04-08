/**
 * Proof of concept function to trigger VFX
 * !Experimental
 * Should be called during the applyDamage step
 * idea here is probably that we create a bunch of different components and we synthesize them into a single VFXEffect
 * based off the properties of the Item that was used. Would need to create a 'master' animation with all component combinations and test that
 * can we run multiple VFXEffects in parallel? How does clone affect us? Need to decide/define the master combinations
 * Should also think about VFXEffects not triggered by metaExecute, but rather on other triggers like Criticals / Hunger / Cover, Bloodsplats etc
 * Also, we should be able to call a specific effect (like textscroll for other things too like when losing life (vs damage dealt) and others (portal opens, trap triggered!))
 * Also the animation should trigger ONCE after all potential re-rolls happen, not multiple times for each damage re-roll for eg.
 * Need a way to scale the animation to the size of the Token or not?
 * eventually we'll need to define our own custom VFXComponents see [the api for more details](https://foundryvtt.com/api/v14/modules/foundry.canvas.vfx.html)

 *
 * @export
 * @async
 * @param {*} actor
 * @param {*} manuallySelectedTargets
 * @param {*} effect
 * @param {*} elementalDamage
 * @returns {unknown}
 */
export async function metaVFX({
	//todo rename values cleanly
	initiatingTokenUUID,
	targetTokensUUIDs = [],
	cosmicDamage = 0,
	elementalDamage = 0,
	materialDamage = 0,
	psychicDamage = 0,
	itemUUID = null,
}) {
	const mL = metanthropes.utils.metaLog;
	mL(
		3,
		"metaVFX",
		"VFX",
		"params:",
		initiatingTokenUUID,
		targetTokensUUIDs,
		cosmicDamage,
		elementalDamage,
		materialDamage,
		psychicDamage,
		itemUUID,
	);
	//? Grab the initiating actor's Token
	const actor = await fromUuid(initiatingTokenUUID);
	if (!actor) return mL(5, "metaVFX", "Could find Actor", actor, "from UUID", initiatingTokenUUID);
	const actorToken = await actor.getActiveTokens(false, false)[0];
	if (!actorToken) return mL(5, "metaVFX", "No Initiating Actor Token could be found for actor", actor);
	mL(3, "metaVFX", "Initiating Actor: UUID/actor/actorToken", initiatingTokenUUID, actor, actorToken);
	//? Crusible way of checking for DSN being active and await the animation to finish - assuming the animation is getting triggered from the message.id
	//! if ( this.rolls.length && ("dice3d" in game) ) await game.dice3d.waitFor3DAnimationByMessageID(this.id);
	//? Crusible way of checking if the user's token is in the scene?
	//todo we need to come up with something similar
	//! if ( !this.token?.parent.isView ) return;
	//* Custom Damage Color additive hex combinations
	//todo poc - is there a better util ready somewhere else?
	function hexToRgb(hex) {
		const clean = hex.replace("#", "");
		return {
			r: parseInt(clean.slice(0, 2), 16),
			g: parseInt(clean.slice(2, 4), 16),
			b: parseInt(clean.slice(4, 6), 16),
		};
	}

	function rgbToHex({ r, g, b }) {
		return (
			"#" +
			[Math.min(255, r), Math.min(255, g), Math.min(255, b)]
				.map((value) => value.toString(16).padStart(2, "0"))
				.join("")
		);
	}

	function addHexColors(colors = []) {
		const total = { r: 0, g: 0, b: 0 };

		for (const hex of colors) {
			const { r, g, b } = hexToRgb(hex);
			total.r += r;
			total.g += g;
			total.b += b;
		}

		return rgbToHex(total);
	}
	// * Customize the effect
	//? item
	const item = await fromUuid(itemUUID);
	const damageTextures = [];
	const damageColors = [];
	let totalDamage = 0;
	if (cosmicDamage > 0) {
		damageTextures.push("systems/metanthropes/assets/artwork/vfx/particle-1.webp");
		damageColors.push(metanthropes.system.COLORS.cosmic);
		totalDamage += cosmicDamage;
	}
	if (elementalDamage > 0) {
		damageTextures.push("systems/metanthropes/assets/artwork/vfx/particle-2.webp");
		damageColors.push(metanthropes.system.COLORS.elemental);
		totalDamage += elementalDamage;
	}
	if (materialDamage > 0) {
		damageTextures.push("systems/metanthropes/assets/artwork/vfx/particle-3.webp");
		damageColors.push(metanthropes.system.COLORS.material);
		totalDamage += materialDamage;
	}
	if (psychicDamage > 0) {
		damageTextures.push("systems/metanthropes/assets/artwork/vfx/particle-4.webp");
		damageColors.push(metanthropes.system.COLORS.psychic);
		totalDamage += psychicDamage;
	}
	//todo review min/max clamp values based off the system performance setting
	//todo see the mode implementation from the weather in introductory
	const damageCount = Math.clamp(totalDamage, 25, 100);
	const minScale = Math.clamp(damageCount * 0.1, 0.1, 0.3);
	const maxScale = Math.clamp(damageCount * 0.5, 0.4, 0.8);
	const damageColor = damageColors.length ? addHexColors(damageColors) : "#fff";
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
					duration: 500,
					animations: [{ function: "drawBack" }],
					sound: {
						//defaults to the music track vs the interface or environment
						src: "systems/metanthropes/assets/audio/sfx/reload-heavy-03.ogg",
						align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
						channel: "environment", //! is this working as expected?
						volume: 0.3,
					},
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
					duration: 500,
					// sound: {
					// 	src: "systems/metanthropes/assets/audio/sfx/distant-explosion-03.wav",
					// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
					// 	channel: "environment",
					// 	volume: 0.3,
					// },
				},
			},
			// boom1: {
			// 	type: "singleImpact",
			// 	position: { reference: "target", deltas: { sort: 0 } }, //timeline position? what does this sort affect?
			// 	texture: "systems/metanthropes/assets/artwork/vfx/boom-1.png",
			// 	size: 10,
			// 	animations: [{ function: "scale", params: {} }],
			// 	duration: 230,
			// 	// sound: {
			// 	// 	src: "systems/metanthropes/assets/audio/sfx/small-explosion-01.wav",
			// 	// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
			// 	// 	channel: "environment",
			// 	// 	radius: 120, //def 60 - what is this, feet?
			// 	// 	volume: 0.3,
			// 	// },
			// },
			// boom2: {
			// 	type: "singleImpact",
			// 	position: { reference: "target", deltas: { sort: 1 } },
			// 	texture: "systems/metanthropes/assets/artwork/vfx/boom-2.png",
			// 	size: 10,
			// 	animations: [{ function: "scale", params: {} }],
			// 	duration: 230,
			// 	// sound: {
			// 	// 	src: "systems/metanthropes/assets/audio/sfx/small-explosion-02.wav",
			// 	// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
			// 	// 	radius: 120, //def 60 - what is this, feet?
			// 	// 	channel: "environment",
			// 	// 	volume: 0.3,
			// 	// },
			// 	shake: {
			// 		//doesn't seem to get triggered here, perhaps it's not a valid component in the singleImpact?
			// 		type: "shake",
			// 		target: "stage", //can also target individual canvas layers or groups
			// 		duration: 200,
			// 		maxDisplacement: 20, //35 def
			// 		smoothness: 0.6,
			// 	},
			// },
			// boom3: {
			// 	type: "singleImpact",
			// 	position: { reference: "target", deltas: { sort: 0 } },
			// 	texture: "systems/metanthropes/assets/artwork/vfx/boom-3.png",
			// 	size: 10,
			// 	animations: [{ function: "scale", params: {} }],
			// 	duration: 230,
			// 	// sound: {
			// 	// 	src: "systems/metanthropes/assets/audio/sfx/small-explosion-03.wav",
			// 	// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
			// 	// 	radius: 120, //def 60 - what is this, feet?
			// 	// 	channel: "environment",
			// 	// 	volume: 0.3,
			// 	// },
			// },
			// boom4: {
			// 	type: "singleImpact",
			// 	position: { reference: "target", deltas: { sort: 1 } },
			// 	texture: "systems/metanthropes/assets/artwork/vfx/boom-4.png",
			// 	size: 10,
			// 	animations: [{ function: "scale", params: {} }],
			// 	duration: 230,
			// 	// sound: {
			// 	// 	src: "systems/metanthropes/assets/audio/sfx/small-explosion-04.wav",
			// 	// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
			// 	// 	radius: 120, //def 60 - what is this, feet?
			// 	// 	channel: "environment",
			// 	// 	volume: 0.3,
			// 	// },
			// },
			// boom5: {
			// 	type: "singleImpact",
			// 	position: { reference: "target", deltas: { sort: 0 } },
			// 	texture: "systems/metanthropes/assets/artwork/vfx/boom-5.png",
			// 	size: 10,
			// 	animations: [{ function: "scale", params: {} }],
			// 	duration: 230,
			// 	// sound: {
			// 	// 	src: "systems/metanthropes/assets/audio/sfx/small-explosion-05.wav",
			// 	// 	align: foundry.canvas.vfx.constants.SOUND_ALIGNMENT.START,
			// 	// 	radius: 120, //def 60 - what is this, feet?
			// 	// 	channel: "environment",
			// 	// 	volume: 0.3,
			// 	// },
			// },
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
				//content: "${elementalDamage} Elemental",
				content: { reference: "text" },
				//distance: 5, // no idea, no default
				duration: 5000, //optional def 2000
				//jitter: 1, //def 0
				//origin: { reference: "target", property: "center" }, //origin is confusing here, why not position?
				origin: { reference: "target", deltas: { sort: 0 } },
				scrollDirection: CONST.TEXT_ANCHOR_POINTS.TOP,
				textAnchor: CONST.TEXT_ANCHOR_POINTS.TOP, //optional
				//textStyle: { fill: "#d21414", fontSize: 64, fontWeight: "bold" },
				textStyle: { reference: "textStyle" },
			},
		},
		timeline: [
			{ component: "kame", position: 0 }, //can I have relative positions in the timeline - how do you know how much time it takes for the projectile to reach the target?
			// { component: "boom1", position: 3100 },
			// { component: "boom2", position: 3180 },
			// { component: "boom3", position: 3380 },
			// { component: "boom4", position: 3580 },
			// { component: "boom5", position: 3780 },
			// { component: "particles", position: 3840 },
			// { component: "text", position: 4000 },
			{ component: "particles", position: 1000 },
			{ component: "text", position: 3000 },
		],
	});

	//* Go thru each Token from the manuallySelectedTargets - future input from Targeting validation
	for (const targetedActorUUID of JSON.parse(targetTokensUUIDs)) {
		const actor = await fromUuid(targetedActorUUID);
		const targetedActor = await actor.getActiveTokens(false, false)[0]; //?would that work for target tokens too?
		mL(3, "metaVFX", "TargetedActor UUID/actor/TargetedActor", targetedActorUUID, actor, targetedActor);
		let damageMessage = ``;
		const textStyleOptions = { fill: damageColor, fontSize: Number(damageCount), fontWeight: "bold" };
		if (cosmicDamage > 0) damageMessage += `${_loc("METANTHROPES.COMMON.Cosmic")}: ${cosmicDamage} `;
		if (elementalDamage > 0) damageMessage += ` ${_loc("METANTHROPES.COMMON.Elemental")}: ${elementalDamage} `;
		if (materialDamage > 0) damageMessage += ` ${_loc("METANTHROPES.COMMON.Material")}: ${materialDamage} `;
		if (psychicDamage > 0) damageMessage += ` ${_loc("METANTHROPES.COMMON.Psychic")}: ${psychicDamage}`;
		mL(
			3,
			"metaVFX",
			"Damage Message/Count/Color",
			damageMessage,
			damageCount,
			damageColor,
			"textStyleOptions",
			textStyleOptions,
		);
		//! if we await the VFX then it goes from one target to the next, if we don't, it does all at the same time.
		//todo what if there is a miss??
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
				textStyle: textStyleOptions,
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
			textStyle: textStyleOptions,
		});
		continue;
	}
	mL(3, "metaVFX", "Finished");
}
