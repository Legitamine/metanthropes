import { BUFFS } from "./buffs.mjs";
import { CONDITIONS } from "./conditions.mjs";
import { CORECONDITIONS } from "./core-conditions.mjs";
import { CHARS } from "./chars.mjs";
import { COLORS } from "./colors.mjs";
import { STATS } from "./stats.mjs";
import { MOVEMENT } from "./movement.mjs";
import { TOKENDEFAULTS } from "./prototype-token-overrides.mjs";
import { TABLES } from "./tables/_tables.mjs";
import { DSNSFX } from "./dice-so-nice-sfx.mjs";

export const SYSTEM = Object.freeze({
	id: "metanthropes",
	ASCII: `_____________________________________________________________________________________ 
__  __ ______ _______       _   _ _______ _    _ _____   ____  _____  ______  _____  
|  \\/  |  ____|__   __|/\\   | \\ | |__   __| |  | |  __ \\ / __ \\|  __ \\|  ____|/ ____|
| \\  / | |__     | |  /  \\  |  \\| |  | |  | |__| | |__) | |  | | |__) | |__  | (___  
| |\\/| |  __|    | | / /\\ \\ | .   |  | |  |  __  |  _  /| |  | |  ___/|  __|  \\___ \\ 
| |  | | |____   | |/ ____ \\| |\\  |  | |  | |  | | | \\ \\| |__| | |    | |____ ____) |
|_|  |_|______|  |_/_/    \\_\\_| \\_|  |_|  |_|  |_|_|  \\_\\\\____/|_|    |______|_____/ 
=====================================================================================`,
	BUFFS,
	CONDITIONS,
	CORECONDITIONS,
	CHARS,
	COLORS,
	STATS,
	MOVEMENT, //! deprecate when we remove V1 Actors
	TOKENDEFAULTS,
	TABLES,
	DSNSFX,
});
