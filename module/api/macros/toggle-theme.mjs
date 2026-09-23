//* Toggles the FVTT Theme between Dark / Light
//? from https://foundryvtt.wiki/en/development/api/applicationv2
export async function toggleTheme(event, target) {
	const uiConfig = game.settings.get("core", "uiConfig");
	const color = uiConfig.colorScheme.applications;
	const newColor = color === "light" ? "dark" : "light";
	uiConfig.colorScheme.applications = newColor;
	uiConfig.colorScheme.interface = newColor;
	await game.settings.set("core", "uiConfig", uiConfig);
}
