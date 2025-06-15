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
			animation: "pulse",
			src: "systems/metanthropes/assets/logos/metanthropes-logo-turn-marker.webp",
			disposition: true,
		},
	},
	Protagonist: {
		displayName: CONST.TOKEN_DISPLAY_MODES.HOVER,
		displayBars: CONST.TOKEN_DISPLAY_MODES.HOVER,
		disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY,
		turnMarker: {
			mode: CONST.TOKEN_TURN_MARKER_MODES.CUSTOM,
			animation: "spin",
			src: "systems/metanthropes/assets/logos/metanthropes-logo-turn-marker.webp",
			disposition: true,
		},
	},
	Metanthrope: {},
	Human: {},
	Animal: {},
	Artificial: {},
	Extradimensional: {},
	Extraterrestrial: {},
	"Animated-Cadaver": {},
	"Animated-Plant": {},
	MetaTherion: {},
};
