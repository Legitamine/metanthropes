/**
 * Override to make Chat Log able to work with Dark/Light themes
 * Introduced with V13 as a workaround to Light theme being forced for Chat.
 * Expected to be deprecated in V14
 * 
 */
Hooks.on("renderChatLog", async (chatlog, html) => {
	html.classList.remove("themed", "theme-light", "theme-dark");
	html.querySelectorAll(".themed, .theme-light, .theme-dark").forEach((element) => {
		element.classList.remove("themed", "theme-light", "theme-dark");
	});
});
