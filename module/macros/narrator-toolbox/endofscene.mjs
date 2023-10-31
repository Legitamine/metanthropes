//*Narrator's Toolbox - End of Scene*//
if (!game.user.isGM) {
	ui.notifications.warn("You must be a Narrator to use this macro.");
	return;
}
let actors = game.actors.contents.filter((a) => a.type === "Protagonist");
let arcTitle = actors[0]?.system.Vital.arc.title || "";
let regressionTitle = actors[0]?.system.entermeta.regression.title || "";
let dialogContent = `<form>
<div class="style-form">To be used at the end of each Scene to award Destiny</div>
<div class="style-form">You can mouse-over the Arc & Regression, for a quick reminder of each<br><br></div>
<div class="form-group style-form">
	<div class="style-form">Protagonist</div>
	<div class="style-form" title="${arcTitle}">Arc</div>
	<div class="style-form" title="${regressionTitle}">Regression</div>
	<div class="style-form">Award Destiny</div>
</div>
`;
for (let actor of actors) {
	let regressionValue = actor.system.entermeta.regression.value;
	let regressionTitle = actor.system.entermeta.regression.options[regressionValue]?.title || "This is not an officially supported Regression";
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
dialogContent += `<div class="style-form">Confirming will award Destiny and set Max Destiny accordingly for each Protagonist</div>`;
dialogContent += `<div class="style-form">Protagonists with Luck Bending will be automatically awarded the extra Destiny</div><br><br>`;
let dialogOptions = {
	width: 750,
	height: 520,
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
					for (let actor of actors) {
						let currentDestiny = parseInt(actor.system.Vital.Destiny.value);
						let awardDestiny = parseInt(html.find(`[name="awardDestiny-${actor.id}"]`).val());
						//? Check for Luck Bending that would affect Destiny awards
						let extraDestiny = 0;
						let equippedItems = actor.items.toObject();
						let equippedMetapowers = equippedItems.filter((item) => item.type === "Metapower");
						let equippedLuck = equippedMetapowers.filter(
							(item) => item.system.MetapowerName.value === "Luck Bending"
						);
						if (equippedLuck.length > 0) {
							const levels = equippedLuck.map((item) => item.system.Level.value);
							const maxLevel = Math.max(...levels);
							extraDestiny = maxLevel;
						}
						let newDestiny = currentDestiny + awardDestiny + extraDestiny;
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
