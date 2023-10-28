//*Narrator's Toolbox - Edit Protagonist Details*//
if (game.user.isGM) {
	let actors = game.actors.contents.filter((a) => a.type === "Protagonist");
	let dialogContent = `<form>`;
	for (let actor of actors) {
		dialogContent += `<div class="form-group">
			<label>Protagonist Name: ${actor.name}</label>
			<div>New Protagonist Name: <input type="text" name="newName-${actor.id}" value="${actor.name}"></div>
			<div>New Player Name: <input type="text" name="newPlayer-${actor.id}" value="${actor.system.metaowner.value}"></div>
			<div>New Gender: <input type="text" name="newGender-${actor.id}" value="${actor.system.humanoids.gender.value}"></div>
			<div>New Life Current: <input type="number" dtype="Number" name="life-${actor.id}" value="${actor.system.Vital.Life.value}"></div>
			<div>New Total Experience: <input type="number" name="totalExperience-${actor.id}" value="${actor.system.Vital.Experience.Total}"></div>
			<div>New Current Destiny: <input type="number" name="currentDestiny-${actor.id}" value="${actor.system.Vital.Destiny.value}"></div>
			<div></div>
		</div>`;
	}
	dialogContent += `</form>`;
	dialogContent += `<div>Confirming will make the new Current Destiny also the Max Destiny for each Protagonist</div>`;
	let dialogOptions = {
		width: 750,
		height: 520,
		index: 1000,
	};
	let toolboxdialog = new Dialog(
		{
			title: "Narrator's Toolbox - Edit Protagonist Details",
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm",
					callback: async (html) => {
						for (let actor of actors) {
							let totalExperience = html.find(`[name="totalExperience-${actor.id}"]`).val();
							let currentDestiny = html.find(`[name="currentDestiny-${actor.id}"]`).val();
							let maxDestiny = currentDestiny;
							let newName = html.find(`[name="newName-${actor.id}"]`).val();
							let newPlayer = html.find(`[name="newPlayer-${actor.id}"]`).val();
							let newGender = html.find(`[name="newGender-${actor.id}"]`).val();
							let life = html.find(`[name="life-${actor.id}"]`).val();
							await actor.update({
								name: newName,
								"system.metaowner.value": newPlayer,
								"system.humanoids.gender.value": newGender,
								"system.Vital.Experience.Total": totalExperience,
								"system.Vital.Destiny.value": currentDestiny,
								"system.Vital.Destiny.max": maxDestiny,
								"prototypeToken.name": newName,
								"system.Vital.Life.value": life,
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
