//*Narrator's Toolbox - End of Scene*//
if (!game.user.isGM) {
	ui.notifications.warn("You must be a Narrator to use this Macro.");
	return;
}
let actors = game.actors.contents.filter((a) => a.type === "Protagonist");
//todo: instead of just checking for our Premade characters that come with 'The Composer' we should also exclude null values? or even better only actors that are controlled by active players instead?
let assignedActors = actors.filter((actor) => actor.system.metaowner.value !== "The Composer");
let arcTitle = actors[0]?.system.Vital.arc.title || "";
let regressionTitle = actors[0]?.system.entermeta.regression.title || "";
let dialogContent = `<form>
<div class="style-form">To be used at the end of each Scene to award Destiny</div>
<div class="style-form"><br>Only Protagonists with Assigned Players will be shown in the list below</div>
<div class="style-form">You can mouse-over their Arc & Regression, for a quick reminder<br><br></div>
<hr/>
<div class="style-form">Confirming will award Destiny and set Max Destiny accordingly for each Protagonist</div>
<div class="style-form">Protagonists with Luck Bending will be automatically awarded the extra Destiny</div><br><br>
<div class="form-group style-form">
	<div class="style-form">Protagonist</div>
	<div class="style-form" title="${arcTitle}">Arc</div>
	<div class="style-form" title="${regressionTitle}">Regression</div>
	<div class="style-form">Award Destiny</div>
</div>
`;
for (let actor of assignedActors) {
	let regressionValue = actor.system.entermeta.regression.value;
	let regressionTitle =
		actor.system.entermeta.regression.options[regressionValue]?.title ||
		"This is not an officially supported Regression";
	let arcValue = actor.system.Vital.arc.value;
	let arcTitle = actor.system.Vital.arc.options[arcValue]?.title || "This is not an officially supported Arc";
	dialogContent += `<div class="form-group style-form">
			<div class="style-form">${actor.name}</div>
			<div class="style-form" title="${arcTitle}">${arcValue}</div>
			<div class="style-form" title="${regressionTitle}">${regressionValue}</div>
			<div class="style-form"><input type="number" name="awardDestiny-${actor.id}" value="1"></div>
			</div>`;
}
dialogContent += `</form><br><br>`;
let dialogOptions = {
	width: 750,
	height: 380,
	resizable: true,
};
let toolboxdialog = new Dialog(
	{
		title: "Narrator's Toolbox - End of Scene",
		content: dialogContent,
		buttons: {
			ok: {
				label: "Confirm",
				callback: async (html) => {
					for (let actor of assignedActors) {
						const currentDestiny = parseInt(actor.system.Vital.Destiny.value);
						const awardDestiny = parseInt(html.find(`[name="awardDestiny-${actor.id}"]`).val());
						//? Check for Luck Bending that would affect Destiny awards
						let extraDestiny = 0;
						const equippedItems = actor.items.toObject();
						const equippedMetapowers = equippedItems.filter((item) => item.type === "Metapower");
						const equippedLuck = equippedMetapowers.filter(
							(item) => item.system.MetapowerName.value === "Luck Bending"
						);
						if (equippedLuck.length > 0) {
							const levels = equippedLuck.map((item) => item.system.Level.value);
							const maxLevel = Math.max(...levels);
							extraDestiny = maxLevel;
						}
						const newDestiny = currentDestiny + awardDestiny + extraDestiny;
						await actor.update({
							"system.Vital.Destiny.value": newDestiny,
							"system.Vital.Destiny.max": newDestiny,
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
