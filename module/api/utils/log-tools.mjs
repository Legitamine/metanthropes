/**
 * metaLog allows our console messages to stand out. Advanced & Network Logging options available (enable via Game Settings) to show more verbose console logs (with different colors to stand out) and to replay all Clients console logs to the Active GM console.
 *
 * * It is accessible via metanthropes.utils.metaLog(logType, ...variables)
 * * logType 0 (console.log), 1 (console.warn), 2 (console.error) show up in the console by default.
 * * logType 3 (console.log), 4 (console.warn), 5 (console.error) show up in the console only with Advanced Logging enabled and show in different colors.
 *
 * @export
 * @param {number} [logType=0]
 * @param {...{}} variables
 * @example
 * Typical Metanthropes System & Module usage: metanthropes.utils.metaLog(3, "module/phase", "name of the function", "some notation or comment", "variable1", variable1, "variable2", variable2);
 * Usage example: metanthropes.utils.metaLog(3, "System", "_onSomeHook", "Should display the Actor Name", actor.name);
 */
export function metaLog(logType = 0, ...variables) {
	const metaAdvancedLogging = game.settings.get("metanthropes", "metaAdvancedLogging");
	if (!metaAdvancedLogging && logType > 2) {
		return;
	}
	const metaNetworkLogging = game.settings.get("metanthropes", "metaNetworkLogging");
	let logFunction = console.log;
	let logMessage = `%cMetanthropes`;
	let logStyle = "background-color: #9A5D9B; color: #fff";
	if (logType > 2) logStyle = "background-color: #b084ff; color: #fff";
	let altLogStyle = "background-color: #0CA79F; color: #fff";
	if (logType > 2) altLogStyle = "background-color: #EC008C; color: #fff";
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
	let logStrings = [logMessage, " | "];
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
	//? Add support for Network Logging - note it needs to check for game.ready or it won't work, due to the API being unavailable during init.
	if (game.ready && metaNetworkLogging && !game.user.isActiveGM) {
		let netLogObjects;
		try {
			netLogObjects = JSON.stringify(logObjects);
		} catch (error) {
			netLogObjects = "[Objects omitted from Network Log]";
		}
		const payload = {
			action: "metaNetLog",
			playerName: game.user.name,
			logType,
			message: logStrings.join(""),
			styles,
			logObjects: netLogObjects,
		};
		game.socket.emit("system.metanthropes", payload);
	}
}

/**
 * metaLogDocument prints the currently open App & Document to the console.
 *
 * * Inspired by a similar functionality from [DevMode](https://foundryvtt.com/packages/_dev-mode).
 * * Initial version kindly provided by TyphonJS(Michael) from the FoundryVTT Discord.
 * * See [ApplicationHeaderControlsEntry on the FVTT API](https://foundryvtt.com/api/v13/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html) for more info on how to properly configure this.
 * * Also see [this issue from FVTT](https://github.com/foundryvtt/foundryvtt/issues/11668).
 *
 * @export
 * @param {*} app
 * @param {*} buttons
 */
export function metaLogDocument(app, buttons) {
	if (!game.settings.get("metanthropes", "metaAdvancedLogging")) return;
	buttons.unshift({
		action: "logDocument",
		icon: "fas fa-terminal",
		label: "METANTHROPES.COMMON.Logging",
		//title: "METANTHROPES.COMMON.Logging", //todo is there a way to display a tooltip instead of a label?
		class: "meta-log", //? seems to work? not part of ApplicationHeaderControlsEntry interface
		onclick: async () => {
			const uuid = app?.object?.uuid;
			if (typeof uuid === "string") {
				const doc = await fromUuid(uuid);
				if (doc) {
					metanthropes.utils.metaLog(3, "metaLogDocument", "App", app, "UUID", uuid, "Document", doc);
				}
			}
		},
	});
}

/**
 * metaLogDocumentV2 prints the currently open App & Document to the console.
 *
 * * Similar functionality to metaLogDocument, but for V2 Apps
 * @export
 * @param {*} app
 * @param {*} buttons
 */
export function metaLogDocumentV2(app, buttons) {
	if (!game.settings.get("metanthropes", "metaAdvancedLogging")) return;
	buttons.unshift({
		action: "logDocument",
		icon: "fas fa-terminal",
		label: "METANTHROPES.COMMON.Logging",
		//title: "METANTHROPES.COMMON.Logging", //todo is there a way to display a tooltip instead of (or in addition to) a label?
		class: "meta-log", //? seems to work? not part of ApplicationHeaderControlsEntry interface
		onClick: async () => {
			const doc = app?.document;
			//todo do we need better error handling here?
			metanthropes.utils.metaLog(3, "metaLogDocumentV2", "App", app, "Document", doc);
		},
	});
}
