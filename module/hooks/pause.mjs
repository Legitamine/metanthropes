//* Customize Pause Logo
Hooks.on("renderGamePause", (_, html, options) => {
	if (options.cssClass !== "paused") return;
	html.querySelector("img").src = "systems/metanthropes/assets/logos/metanthropes-logo.webp";
});
