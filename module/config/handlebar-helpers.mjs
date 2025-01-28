/**
 * Register custom Handlebar helpers
 *
 * @export
 */
export function metaRegisterHandlebarHelpers() {
	
	//? Selected Helper
	//todo This should be deprecated in favor of built-in select helper
	Handlebars.registerHelper("selected", function (option, value) {
		return option === value ? "selected" : "";
	});

	//? Used to join an array into a single string with a space between each item ex: {{join this.value ', '}}
	Handlebars.registerHelper("join", function (array, separator) {
		return array.join(separator);
	});

	//? Used to check if a value is an array
	Handlebars.registerHelper("isArray", function (value) {
		return Array.isArray(value);
	});
	
	//? HTML Stripper Helper (for an Item's Effect as a tooltip)
	//! Built-in data-tooltip could replace this (requires investigation)
	//todo I should review usage case with data-tooltip as it can have HTML as input
	Handlebars.registerHelper("stripHtml", function (htmlString) {
		if (!htmlString) return "";
		const strippedString = htmlString.replace(/<\/?[^>]+(>|$)/g, "");
		return new Handlebars.SafeString(strippedString);
	});
}
