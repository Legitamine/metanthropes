//* extracts the number of d10 dice from a given value
export async function metaExtractNumberOfDice(value) {
	const match = value.match(/^(\d+)d10$/);
	if (match) {
		return parseInt(match[1], 10); // Convert the captured string to an integer
	}
	return null; // Return null if the string doesn't match the expected format
}
