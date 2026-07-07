/**
 * Custom enricher, similar to built-in `@UUID`, to display a more subtle, inline link to an Item or Actor with the appropriate icon.
 ** Usage: `@METALINK(UUID)`
 * todo add support for other types like macros or scenes, rolltables ...?
 *
 * @export
 * @async
 * @param {string} UUID
 * @returns {HTMLButtonElement}
 */
export async function metaLink(UUID) {
	const doc = await fromUuid(UUID);
	if (!doc) return ui.notifications.warn(_loc("METANTHROPES.UI.NOTIFICATIONS.METALINK.Error") + UUID);
	let icon = null;
	let tooltip = ``;
	switch (doc.documentName) {
		case "Item":
			switch (doc.type) {
				case "Metapower":
					icon = "fa-kit fa-metanthropes";
					tooltip =
						doc.system.MetapowerName.value + ` ` + doc.system.Level.label + ` ` + doc.system.Level.value;
					break;
				case "Possession":
					icon = "fa-solid fa-backpack";
					tooltip = doc.system.Category.value + ` ` + doc.system.AttackType.value;
					break;
				default:
					icon = "fa-solid fa-suitcase";
					tooltip = doc.type;
					break;
			}
			break;
		case "Actor":
			icon = "fa-solid fa-user";
			tooltip = doc.type;
			break;
		default:
			icon = "fa-solid fa-file";
			tooltip = doc.type;
			break;
	}
	const label = doc.name;
	const link = document.createElement("button");
	link.classList.add("meta-link");
	link.dataset.uuid = UUID;
	link.dataset.tooltip = tooltip;
	link.draggable = false;
	link.innerHTML = `<i class="${icon}"></i> ${label}`;
	return link;
}
