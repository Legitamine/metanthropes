export const TABLES = Object.freeze({
	speed: {
		"-10": {
			score: -10,
			movement: 1,
			average: "LOCALIZED.STRING",
			example: "LOCALIZED STRING",
		},
	},
	weight: {
		score: 1,
		movement: 1,
		prowess: -50,
		average: "",
		example: "",
		lift: "",
		toss: "",
		push: "",
	}, //plus lift toss push/pull
	size: {
		score: 1,
		movement: 1,
		reach: fromRangeTable,
		strike: 5, //damage dice number
		altLife: -20,
		average: "",
		example: "",
	},
	area: {
		area: 1,
		name: "Room",
		straight: 50,
		diagonal: 80,
	},
	actions: {},
	strikes: {}, //and similar for weapons, ammo and others and special (athletics) strikes
});
