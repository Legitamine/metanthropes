//*Narrator's Toolbox - End of Session*//
if (game.user.isGM) {
	let actors = game.actors.contents.filter((a) => a.type === "Protagonist");
	let dialogContent = `<form>`;
	for (let actor of actors) {
		dialogContent += `<div class="form-group">
            <label>Protagonist: ${actor.name}</label>
			<div>Sessions Played: ${actor.system.entermeta.sessions.value}</div>
			<div>Arc: ${actor.system.Vital.arc.value}</div>
			<div>Regression: ${actor.system.entermeta.regression.value}</div>
			<div>Total Experience: ${actor.system.Vital.Experience.Total}</div>
			<div>Award Experience: <input type="number" name="awardExperience-${actor.id}" value="0"></div>
			<div>Award Destiny: <input type="number" name="awardDestiny-${actor.id}" value="1"></div>
        </div>`;
	}
	dialogContent += `</form>`;
	dialogContent += `<div>Confirming will increase Session Played by +1 and reset Max Destiny for each Protagonist</div>`;
	let dialogOptions = {
		width: 750,
		height: 520,
		index: 1000,
	};
	let toolboxdialog = new Dialog(
		{
			title: "Narrator's Toolbox - End of Session",
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm",
					callback: async (html) => {
						for (let actor of actors) {
							let currentExperience = parseInt(actor.system.Vital.Experience.Total);
							let awardExperience = parseInt(html.find(`[name="awardExperience-${actor.id}"]`).val());
							let newExperience = currentExperience + awardExperience;
							let currentDestiny = parseInt(actor.system.Vital.Destiny.value);
							let awardDestiny = parseInt(html.find(`[name="awardDestiny-${actor.id}"]`).val());
							let newDestiny = currentDestiny + awardDestiny;
							let newMaxDestiny = newDestiny;
							let sessionsPlayed = parseInt(actor.system.entermeta.sessions.value);
							let newSessionsPlayed = sessionsPlayed + 1;
							await actor.update({
								"system.Vital.Destiny.value": newDestiny,
								"system.Vital.Destiny.max": newMaxDestiny,
								"system.Vital.Experience.Total": newExperience,
								"system.entermeta.sessions.value": newSessionsPlayed,
							});
						}
					},
				},
				cancel: {
					label: "Cancel",
				},
			},
			default: "ok",
		},
		dialogOptions
	);
	toolboxdialog.render(true);
} else {
	ui.notifications.warn("You must be a GM to use this macro.");
}