export function metaLog(logType = 0, ...variables) {
	//? Check if Advanced Logging is enabled
	const metaAdvancedLogging = game.settings.get("metanthropes-system", "metaAdvancedLogging");
	//? Only show Advanced Logs in the console if the setting is enabled
	if (!metaAdvancedLogging && logType > 2) {
		return;
	}
	let logFunction = console.log;
	let logMessage = `%cMetanthropes %c | `;
	let logStyle0 = "background-color: #5C16C5; color: #fff";
	switch (logType) {
		case 0 || 3:
			logFunction = console.log;
			break;
		case 1 || 4:
			logFunction = console.warn;
			break;
		case 2 || 5:
			logFunction = console.error;
			break;
		default:
			logFunction = console.log;
			break;
	}
	let logVariables = variables.map((variable) => {
		if (!variable) {
			return "";
		}
		return `%c ${variable}`;
	});
	logFunction(
		`${logMessage}${logVariables.join(` %c | `)}`,
		logStyle0,
		...Array(logVariables.length + 1).fill(`"background-color: #5C16C5; color: #fff",`)
	);
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
