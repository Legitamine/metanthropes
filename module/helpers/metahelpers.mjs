export function metaLog(logType = 0, ...variables) {
	//? Check if Advanced Logging is enabled from the UI
	const metaAdvancedLogging = game.settings.get("metanthropes-system", "metaAdvancedLogging");
	//? Only show Advanced Logs in the console if the setting is enabled
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
	variables.forEach((variable, index) => {
		if (variable !== null && variable !== undefined) {
			let style = index % 2 === 0 ? logStyle : altLogStyle;
			logStrings.push(`%c${variable}`);
			styles.push(style);
			if (index !== variables.length - 1) {
				logStrings.push("%c | ");
				styles.push(logStyle);
			}
		}
	});
	logFunction(logStrings.join(""), ...styles);
}

/**
 * Helper function to extract the number of d10 dice from a given value
 *
 * @param {String} value
 * @returns integer
 */
export async function metaExtractNumberOfDice(value) {
	const match = value.match(/^(\d+)d10$/);
	if (match) {
		return parseInt(match[1], 10); // Convert the captured string to an integer
	}
	return null; // Return null if the string doesn't match the expected format
}
/**
 *
 * Helper function to extract data from a form element
 *
 * @param {*} formElement
 * @returns
 */
export function metaExtractFormData(formElement) {
	const formData = new FormData(formElement);
	let extractedData = {};
	for (let [key, value] of formData.entries()) {
		extractedData[key] = value;
	}
	return extractedData;
}
