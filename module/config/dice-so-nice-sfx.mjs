export const DSNSFX = [
	{
		mode: "basic",
		diceType: "d10",
		onResult: ["x"],
		specialEffect: "PlayAnimationParticleSpiral",
		options: {
			isGlobal: true,
			muteSound: false,
		},
	},
	{
		mode: "basic",
		diceType: "d100",
		onResult: ["1"],
		specialEffect: "PlaySoundEpicWin",
		options: {
			isGlobal: true,
			muteSound: false,
		},
	},
	{
		mode: "basic",
		diceType: "d100",
		onResult: ["1"],
		specialEffect: "PlayAnimationParticleSparkles",
		options: {
			isGlobal: true,
			muteSound: false,
		},
	},
	{
		mode: "basic",
		diceType: "d100",
		onResult: ["100"],
		specialEffect: "PlaySoundEpicFail",
		options: {
			isGlobal: true,
			muteSound: false,
		},
	},
	{
		mode: "basic",
		diceType: "d100",
		onResult: ["100"],
		specialEffect: "PlayAnimationParticleVortex",
		options: {
			isGlobal: true,
			muteSound: false,
		},
	},
];
