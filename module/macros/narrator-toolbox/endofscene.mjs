//*Narrator's Toolbox - End of Scene*//
if (game.user.isGM) {
	let actors = game.actors.contents.filter((a) => a.type === "Protagonist");
	let dialogContent = `<form>`;
	for (let actor of actors) {
		dialogContent += `<div class="form-group">
			<label>Protagonist: ${actor.name}</label>
			<div>Arc: ${actor.system.Vital.arc.value}</div>
			<div>Regression: ${actor.system.entermeta.regression.value}</div>
			<div>Award Destiny: <input type="number" name="awardDestiny-${actor.id}" value="1"></div>
			<div></div>
			</div>`;
	}
	dialogContent += `</form>`;
	dialogContent += `<div>Confirming will award Destiny and set Max Destiny accordingly for each Protagonist</div>`;
	let dialogOptions = {
		width: 750,
		height: 520,
		index: 1000,
	};
	let toolboxdialog = new Dialog(
		{
			title: "Narrator's Toolbox - End of Scene",
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm",
					callback: async (html) => {
						for (let actor of actors) {
							let currentDestiny = parseInt(actor.system.Vital.Destiny.value);
							let awardDestiny = parseInt(html.find(`[name="awardDestiny-${actor.id}"]`).val());
							let newDestiny = currentDestiny + awardDestiny;
							let maxDestiny = newDestiny;
							await actor.update({
								"system.Vital.Destiny.value": newDestiny,
								"system.Vital.Destiny.max": maxDestiny,
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
