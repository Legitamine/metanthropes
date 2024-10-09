Hooks.on("renderPause", (app, html, options) => {
	//* Customize Pause Logo
	if (options.paused) {
		const img = html.find("img")[0];
		img.src = "systems/metanthropes/artwork/ui/logos/metanthropes-logo.webp";
	}
});
