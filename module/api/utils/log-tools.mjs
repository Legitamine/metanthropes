/**
 * * metaLog function controls how console logging happens.
 *
 * ? It is accessible via metanthropes.utils.metaLog()
 * example: metanthropes.utils.metaLog(3, "name of the function", "description of the log", "variable1", variable1, "variable2", variable2);
 *
 * metaLog 0 (console.log), 1 (console.warn), 2 (console.error) show up in the console by default
 * metaLog 3 (console.log), 4 (console.warn), 5 (console.error) show up in the console if the advanced logging setting is enabled in the system settings
 * Advanced logging is disabled by default and is designed to be used for troubleshooting and debugging
 *
 * @param {Number} logType
 * @param  {...any} variables
 * @returns
 */
export function metaLog(logType = 0, ...variables) {
	const metaAdvancedLogging = game.settings.get("metanthropes", "metaAdvancedLogging");
	if (!metaAdvancedLogging && logType > 2) {
		return;
	}
	let logFunction = console.log;
	let logMessage = `%cMetanthropes | `;
	let logStyle = "background-color: #5C16C5; color: #fff";
	let altLogStyle = "background-color: #00695c; color: #fff";
	switch (logType) {
		case 1:
		case 4:
			logFunction = console.warn;
			break;
		case 2:
		case 5:
			logFunction = console.error;
			break;
	}
	let styles = [logStyle];
	let logStrings = [logMessage];
	let logObjects = [];
	variables.forEach((variable, index) => {
		if (variable !== null && variable !== undefined) {
			let style = index % 2 === 0 ? logStyle : altLogStyle;
			if (typeof variable === "object") {
				logStrings.push("%c[See Below the Object returned]");
				logObjects.push(variable);
			} else {
				logStrings.push(`%c${variable}`);
			}
			styles.push(style);
			if (index !== variables.length - 1) {
				logStrings.push("%c | ");
				styles.push(logStyle);
			}
		}
	});
	logFunction(logStrings.join(""), ...styles, ...logObjects);
}

/**
 *
 * Helper function to print the currently open Document to the console
 * Initial version kindly provided by TyphonJS(Michael) from the FoundryVTT Discord
 * Inspired by a similar functionality from DevMode (https://foundryvtt.com/packages/_dev-mode)
 *
 * @param {*} app
 * @param {*} buttons
 */
export function metaLogDocument(app, buttons) {
	if (!game.settings.get("metanthropes", "metaAdvancedLogging")) return;
	buttons.unshift({
		icon: "fas fa-terminal",
		//visible: game.users.isGM,
		label: "METANTHROPES.SHEET.OTHER.CONSOLE",
		//class: "metalog-doc", //for custom button styling perhaps?
		onClick: () => {
			const uuid = app?.document?.uuid;
			//todo do we need more graceful handling here?
			//if (typeof uuid === "string") {
			const doc = fromUuidSync(uuid);
			// if (doc) {
			metanthropes.utils.metaLog(3, "Advanced Logging", "app", app, "uuid", uuid, "document", doc);
			// }
			//}
		},
	});
}
