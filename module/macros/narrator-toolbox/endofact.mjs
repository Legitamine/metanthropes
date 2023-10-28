//*Narrator's Toolbox - End of Act*//
if (game.user.isGM) {
	let actors = game.actors.contents.filter((a) => a.type === "Protagonist");
	let dialogContent = `<form>`;
	for (let actor of actors) {
		dialogContent += `<div class="form-group">
			<label>Protagonist: ${actor.name}</label>
			<div>Arc: ${actor.system.Vital.arc.value}</div>
			<div>New Arc: <input type="text" name="newArc-${actor.id}" value="${actor.system.Vital.arc.value}"></div>
			<div>Regression: ${actor.system.entermeta.regression.value}</div>
			<div>New Regression: <input type="text" name="newRegression-${actor.id}" value="${actor.system.entermeta.regression.value}"></div>
			<div>Starting/Free Perks: ${actor.system.Perks.Details.Starting.value}</div>
			<div>Award Free Perks: <input type="number" name="awardPerks-${actor.id}" value="0"></div>
		</div>`;
	}
	dialogContent += `</form>`;
	dialogContent += `<div></div>`;
	let dialogOptions = {
		width: 750,
		height: 520,
		index: 1000,
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
} else {
	ui.notifications.warn("You must be a Narrator to use this macro.");
}
