//*Narrator's Toolbox - End of Session*//
if (!game.user.isGM) {
	ui.notifications.warn("You must be a Narrator to use this macro.");
	return;
}
let actors = game.actors.contents.filter((a) => a.type === "Protagonist");
let dialogContent = `<form>
<div class="style-form">To be used at the end of each Session to award Experience<br><br></div>
<div class="form-group style-form">
	<div class="style-form">Protagonist</div>
	<div class="style-form">Sessions Played</div>
	<div class="style-form">Arc</div>
	<div class="style-form">Regression</div>
	<div class="style-form">Total Experience</div>
	<div class="style-form">Award Experience</div>
</div>	
`;
for (let actor of actors) {
	dialogContent += `<div class="form-group">
			<div class="style-form">${actor.name}</div>
			<div class="style-form">${actor.system.entermeta.sessions.value}</div>
			<div class="style-form">${actor.system.Vital.arc.value}</div>
			<div class="style-form">${actor.system.entermeta.regression.value}</div>
			<div class="style-form">${actor.system.Vital.Experience.Total}</div>
			<div class="style-form"><input type="number" name="awardExperience-${actor.id}" value="0"></div>
		</div>`;
}
dialogContent += `</form><br><br>`;
dialogContent += `<div class="style-form">Confirming will also increase Session Played by +1 for each Protagonist</div><br><br>`;
let dialogOptions = {
	width: 750,
	height: 520,
	resizable: true,
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
						let sessionsPlayed = parseInt(actor.system.entermeta.sessions.value);
						let newSessionsPlayed = sessionsPlayed + 1;
						await actor.update({
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
