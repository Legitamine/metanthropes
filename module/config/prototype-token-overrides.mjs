export const TOKENDEFAULTS = {
	base: {
		bar1: { attribute: "Vital.Life" },
		bar2: { attribute: "Vital.Destiny" },
		displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
		displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
		sight: {
			enabled: true,
		},
		ring: {
			enabled: false,
		},
		disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
		lockRotation: false,
		turnMarker: {
			mode: CONST.TOKEN_TURN_MARKER_MODES.CUSTOM,
			animation: "spin",
			src: "systems/metanthropes/assets/logos/Metanthropes-White-Transparent.webp",
			disposition: true,
		},
	},
	Protagonist: {
		displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
		displayBars: CONST.TOKEN_DISPLAY_MODES.HOVER,
		disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
		turnMarker: {
			mode: CONST.TOKEN_TURN_MARKER_MODES.CUSTOM,
			animation: "spinPulse",
			src: "systems/metanthropes/assets/logos/Metanthropes-White-Transparent.webp",
			disposition: true,
		},
	},
	Metanthrope: {
		disposition: CONST.TOKEN_DISPOSITIONS.SECRET,
	},
	Human: {
		disposition: CONST.TOKEN_DISPOSITIONS.SECRET,
	},
	Animal: {
		disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
	},
	Artificial: {
		disposition: CONST.TOKEN_DISPOSITIONS.SECRET,
	},
	Extradimensional: {
		disposition: CONST.TOKEN_DISPOSITIONS.SECRET,
	},
	Extraterrestrial: {
		disposition: CONST.TOKEN_DISPOSITIONS.SECRET,
	},
	"Animated-Cadaver": {
		disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE,
	},
	"Animated-Plant": {
		disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
	},
	MetaTherion: {
		disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL,
	},
};
