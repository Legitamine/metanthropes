// /**
//  * Tweaked a built-in function to use as an enricher for custom Metanthropes FA Icons
//  * 
//  * Create an HTML element for a FontAwesome icon
//  * @param {string} glyph A FontAwesome glyph name, such as "file" or "user"
//  * @param {object} [options] Additional options to configure the icon
//  * @param {"solid"|"regular"|"duotone"} [options.style="solid"] The style name for the icon
//  * @param {boolean} [options.fixedWidth=false] Should icon be fixed-width?
//  * @param {string[]} [options.classes] Additional classes to append to the class list
//  * @returns {HTMLElement} The configured FontAwesome icon element
//  * @see {@link https://fontawesome.com/search}
//  */
// export async function createMetanthropesFontAwesomeIcon(glyph, { style = "sharp-duotone", fixedWidth = false, classes = ["fa-solid"] } = {}) {
// 	const glyphClass = glyph.startsWith("fa-") ? glyph : `fa-${glyph}`;
// 	const styleClass = `fa-${style}`;
// 	const icon = document.createElement("i");
// 	icon.inert = true;
// 	icon.classList.add(styleClass, glyphClass, ...classes);
// 	if (fixedWidth) icon.classList.add("fa-fw");
// 	return icon;
// }

// export const metanthropesEnrichFA = async : Promise<string> => {
// 	const enricherConfig = {
// 		pattern: myRegex,
// 		enricher: createMetanthropesFontAwesomeIcon(),
// 		replaceParent: false,
// 	};
// }