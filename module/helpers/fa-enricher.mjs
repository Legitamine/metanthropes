/**
 * Tweaked a built-in function to use as an enricher for custom Metanthropes FA Icons
 *
 * Create an HTML element for a FontAwesome icon
 * @param {string} glyph A FontAwesome glyph name, such as "file" or "user"
 * @param {string} color The color for the FA icon
 * @param {string} class1 class1 to class4 are extra classes to use for things like rotate-90, beat and other FA parameters
 * @param {object} [options] Additional options to configure the icon
 * @param {"solid"|"regular"|"duotone"} [options.style="solid"] The style name for the icon
 * @param {boolean} [options.fixedWidth=false] Should icon be fixed-width?
 * @param {string[]} [options.classes] Additional classes to append to the class list
 * @returns {HTMLElement} The configured FontAwesome icon element
 * @see {@link https://fontawesome.com/search}
 */
export function metaCreateFAIcon(
	glyph,
	color = null,
	class1,
	class2,
	class3,
	class4,
	{ style = "solid", fixedWidth = false, classes = [] } = {}
) {
	const glyphClass = glyph.startsWith("fa-") ? glyph : `fa-${glyph}`;
	const styleClass = `fa-${style}`;
	const extraClass1 = `fa-${class1}`;
	const extraClass2 = `fa-${class2}`;
	const extraClass3 = `fa-${class3}`;
	const extraClass4 = `fa-${class4}`;
	const extraClasses = [extraClass1, extraClass2, extraClass3, extraClass4].filter(
		(c) => c !== "fa-undefined" && c !== "fa-null"
	);
	classes = [...classes, ...extraClasses];
	const icon = document.createElement("i");
	if (color) {
		if (color === "custom") {
			const customFAColor = game.settings.get("metanthropes", "metaCustomFAColor");
			icon.style.color = customFAColor;
		} else {
			icon.style.color = color;
		}
	}
	icon.inert = false;
	icon.classList.add(styleClass, ...classes, glyphClass);
	if (fixedWidth) icon.classList.add("fa-fw");
	return icon;
}
/**
 * Creates Font Awesome icons from the custom icon kit.
 *
 * Create an HTML element for a FontAwesome icon
 * @param {string} glyph A FontAwesome glyph name, such as "file" or "user"
 * @param {object} [options] Additional options to configure the icon
 * @param {"solid"|"regular"|"duotone"} [options.style="solid"] The style name for the icon
 * @param {boolean} [options.fixedWidth=false] Should icon be fixed-width?
 * @param {string[]} [options.classes] Additional classes to append to the class list
 * @returns {HTMLElement} The configured FontAwesome icon element
 * @see {@link https://fontawesome.com/search}
 */
export function metaCreateCustomIcon(
	glyph,
	color = null,
	class1,
	class2,
	class3,
	class4,
	{ style = "fa-kit", fixedWidth = false, classes = [] } = {}
) {
	const glyphClass = glyph.startsWith("fa-") ? glyph : `fa-${glyph}`;
	const styleClass = `${style}`;
	const extraClass1 = `fa-${class1}`;
	const extraClass2 = `fa-${class2}`;
	const extraClass3 = `fa-${class3}`;
	const extraClass4 = `fa-${class4}`;
	const extraClasses = [extraClass1, extraClass2, extraClass3, extraClass4].filter(
		(c) => c !== "fa-undefined" && c !== "fa-null"
	);
	classes = [...classes, ...extraClasses];
	const icon = document.createElement("i");
	if (color) {
		if (color === "custom") {
			const customFAColor = game.settings.get("metanthropes", "metaCustomFAColor");
			icon.style.color = customFAColor;
		} else {
			icon.style.color = color;
		}
	}
	icon.inert = false;
	icon.classList.add(styleClass, ...classes, glyphClass);
	if (fixedWidth) icon.classList.add("fa-fw");
	return icon;
}
