//*Narrator's Toolbox - End of Act*//
if (!game.user.isGM) {
	ui.notifications.warn("You must be a Narrator to use this macro.");
	return;
}
let actors = game.actors.contents.filter((a) => a.type === "Protagonist");
let dialogContent = `<form>
<div class="style-form">To be used at the end of each Act, to reward free Perks and to change Arc & Regression<br><br></div>
<div class="form-group">
	<div>Protagonist</div>
	<div>Arc</div>
	<div>New Arc</div>
	<div>Regression</div>
	<div>New Regression</div>
	<div>Starting/Free Perks</div>
	<div>Award Perks</div>
</div>`;
for (let actor of actors) {
	dialogContent += `<div class="form-group">
	<label>${actor.name}</label>
	<div>${actor.system.Vital.arc.value}</div>
	<div><input type="text" name="newArc-${actor.id}" value="${actor.system.Vital.arc.value}"></div>
	<div>${actor.system.entermeta.regression.value}</div>
	<div><input type="text" name="newRegression-${actor.id}" value="${actor.system.entermeta.regression.value}"></div>
	<div>${actor.system.Perks.Details.Starting.value}</div>
	<div><input type="number" name="awardPerks-${actor.id}" value="0"></div>
	</div>`;
}
dialogContent += `</form><br><br>`;
dialogContent += `<div>Awarding Perks will be considered as Starting/Free Perks and won't require spending Experience<br><br></div>`;
let dialogOptions = {
	width: 750,
	height: 520,
	resizable: true,
};
let toolboxdialog = new Dialog(
	{
		title: "Narrator's Toolbox - End of Act",
		content: dialogContent,
		buttons: {
			ok: {
				label: "Confirm",
				callback: async (html) => {
					for (let actor of actors) {
						let freePerks = parseInt(actor.system.Perks.Details.Starting.value);
						let awardPerks = parseInt(html.find(`[name="awardPerks-${actor.id}"]`).val());
						let newFreePerks = freePerks + awardPerks;
						let newArc = html.find(`[name="newArc-${actor.id}"]`).val();
						let newRegression = html.find(`[name="newRegression-${actor.id}"]`).val();
						await actor.update({
							"system.Perks.Details.Starting.value": newFreePerks,
							"system.Vital.arc.value": newArc,
							"system.entermeta.regression.value": newRegression,
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
