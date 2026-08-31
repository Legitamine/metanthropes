//* Metanthropes Sidebar Settings Section
Hooks.on("renderSettings", (_app, html) => {
	const fvttver = encodeURIComponent(game.version);
	const metaver = encodeURIComponent(game.system.version);
	const section = document.createElement("section");
	const website = _loc("METANTHROPES.UI.SIDEBAR.SETTINGS.Website");
	const changes = _loc("METANTHROPES.UI.SIDEBAR.SETTINGS.Changes");
	const feedback = _loc("METANTHROPES.UI.SIDEBAR.SETTINGS.Feedback");
	section.classList.add("metanthropes-settings", "flexcol");

	section.innerHTML = `
		<h3 class="divider">Metanthropes</h3>
		<button type="button" data-url="https://us15.list-manage.com/survey?u=78727f5b63b6656983fd684ab&id=ba6044b7b3&attribution=false" data-tooltip="METANTHROPES.UI.SIDEBAR.SETTINGS.FeedbackTooltip">
			<i class="fa-solid fa-clipboard-list"></i>
			${feedback}
		</button>
		<button type="button" data-url="https://github.com/Legitamine/metanthropes/blob/main/CHANGELOG.md"
		data-tooltip="METANTHROPES.UI.SIDEBAR.SETTINGS.ChangesTooltip">
			<i class="fa-solid fa-scroll"></i>
			${changes}
		</button>
		<button type="button" data-url="https://metanthropes.com/?utm_source=FVTT&utm_medium=${fvttver}&utm_campaign=${metaver}&utm_content=website_button"
		data-tooltip="METANTHROPES.UI.SIDEBAR.SETTINGS.WebsiteTooltip">
			<i class="fa-kit fa-metanthropes"></i>
			${website}
		</button>
	`;

	const firstSection = html.querySelector("section");
	if (firstSection) firstSection.insertAdjacentElement("afterEnd", section);

	section.querySelectorAll("[data-url]").forEach((button) => {
		button.addEventListener("click", (event) => {
			const url = event.currentTarget.dataset.url;
			if (url) window.open(url, "_blank", "noopener,noreferrer");
		});
	});
});
