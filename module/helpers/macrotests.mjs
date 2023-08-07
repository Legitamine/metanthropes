//*Narrator's Toolbox v0.1
if (game.user.isGM) {
	let actors = game.actors.contents.filter((a) => a.type === "Protagonist");
	let dialogContent = `<form>`;
	for (let actor of actors) {
		dialogContent += `<div class="form-group">
            <label>${actor.name}</label>
			<div>New Name: <input type="text" name="newName-${actor.id}" value="${actor.name}"></div>
			<div>New Player: <input type="text" name="newPlayer-${actor.id}" value="${actor.system.metaowner.value}"></div>
            <div>Total Experience: <input type="number" name="totalExperience-${actor.id}" value="${actor.system.Vital.Experience.Total}"></div>
            <div>Current Destiny: <input type="number" name="currentDestiny-${actor.id}" value="${actor.system.Vital.Destiny.value}"></div>
            <div>Max Destiny: <input type="number" name="maxDestiny-${actor.id}" value="${actor.system.Vital.Destiny.max}"></div>
        </div>`;
	}
	dialogContent += `</form>`;
	let dialogOptions = {
		width: 750,
		height: 520,
		index: 1000,
	};
	let toolboxdialog = new Dialog(
		{
			title: "Narrator's Toolbox",
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm",
					callback: async (html) => {
						for (let actor of actors) {
							let totalExperience = html.find(`[name="totalExperience-${actor.id}"]`).val();
							let currentDestiny = html.find(`[name="currentDestiny-${actor.id}"]`).val();
							let maxDestiny = html.find(`[name="maxDestiny-${actor.id}"]`).val();
							let newName = html.find(`[name="newName-${actor.id}"]`).val();
							let newPlayer = html.find(`[name="newPlayer-${actor.id}"]`).val();
							await actor.update({
								name: newName,
								"system.metaowner.value": newPlayer,
								"system.Vital.Experience.Total": totalExperience,
								"system.Vital.Destiny.value": currentDestiny,
								"system.Vital.Destiny.max": maxDestiny,
								"prototypeToken.name": newName,
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
