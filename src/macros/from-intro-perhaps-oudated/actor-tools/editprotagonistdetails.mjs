//*Narrator's Toolbox - Edit Protagonist Details*//
//? This macro allows the Narrator to edit a Protagonist's Details
//? If you'd like to edit another Actor type, change the "Protagonist" in the filter on line 8
if (!game.user.isGM) {
	ui.notifications.warn("You must be a Narrator to use this macro.");
	return;
}
let actors = game.actors.contents.filter((a) => a.type === "Protagonist");
let dialogContent = `<form>
<div class="style-form">To be used to edit a Protagonists's Name, Player, Gender, Life, Experience and Destiny<br><br></div>
<div class="style-form">Note that 'Player Name' needs to be the same as under Settings - 'User Management', for the buttons to appear in the Chat for that player. You can also use the 'Assign Player' on an actor to pass control to a Player.<br><br></div>
<div class="form-group style-form">
	<div class="style-form">Protagonist Name</div>
	<div class="style-form">New Protagonist Name</div>
	<div class="style-form">New Player Name</div>
	<div class="style-form">New Gender</div>
	<div class="style-form">New Life Current</div>
	<div class="style-form">New Total Experience</div>
	<div class="style-form">New Current Destiny</div>
</div>
`;
for (let actor of actors) {
	dialogContent += `<div class="form-group">
			<div class="style-form">${actor.name}</div>
			<div class="style-form"><input type="text" name="newName-${actor.id}" value="${actor.name}"></div>
			<div class="style-form"><input type="text" name="newPlayer-${actor.id}" value="${actor.system.metaowner.value}"></div>
			<div class="style-form"><input type="text" name="newGender-${actor.id}" value="${actor.system.humanoids.gender.value}"></div>
			<div class="style-form"><input type="number" dtype="Number" name="life-${actor.id}" value="${actor.system.Vital.Life.value}"></div>
			<div class="style-form"><input type="number" name="totalExperience-${actor.id}" value="${actor.system.Vital.Experience.Total}"></div>
			<div class="style-form"><input type="number" name="currentDestiny-${actor.id}" value="${actor.system.Vital.Destiny.value}"></div>
		</div>`;
}
dialogContent += `</form><br><br>`;
dialogContent += `<div>Confirming will make the new Current Destiny also the Max Destiny for each Protagonist</div><br><br>`;
let dialogOptions = {
	width: 1000,
	height: 520,
	resizable: true,
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
