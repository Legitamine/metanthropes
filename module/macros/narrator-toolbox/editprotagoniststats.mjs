//*Narrator's Toolbox - Edit Protagonist Stats*//
if (!game.user.isGM) {
	ui.notifications.warn("You must be a Narrator to use this macro.");
	return;
}
let actors = game.actors.contents.filter((a) => a.type === "Protagonist");
let dialogContent = `<form>`;
dialogContent += `<div class="form-group">
<div>Protagonist Name</div>
<div>BODY</div>
<div>Endurance</div>
<div>Power</div>
<div>Reflexes</div>
<div>MIND</div>
<div>Creativity</div>
<div>Manipulation</div>
<div>Perception</div>
<div>SOUL</div>
<div>Awareness</div>
<div>Consciousness</div>
<div>Willpower</div>
</div>
`;
for (let actor of actors) {
	dialogContent += `<div class="form-group">
		<label>${actor.name}</label>
		<div><input type="number" name="newBody-${actor.id}" value="${actor.system.Characteristics.Body.Initial}"></div>
		<div><input type="number" name="newEndurance-${actor.id}" value="${actor.system.Characteristics.Body.Stats.Endurance.Initial}"></div>
		<div><input type="number" name="newPower-${actor.id}" value="${actor.system.Characteristics.Body.Stats.Power.Initial}"></div>
		<div><input type="number" name="newReflexes-${actor.id}" value="${actor.system.Characteristics.Body.Stats.Reflexes.Initial}"></div>
		<div><input type="number" name="newMind-${actor.id}" value="${actor.system.Characteristics.Mind.Initial}"></div>
		<div><input type="number" name="newCreativity-${actor.id}" value="${actor.system.Characteristics.Mind.Stats.Creativity.Initial}"></div>
		<div><input type="number" name="newManipulation-${actor.id}" value="${actor.system.Characteristics.Mind.Stats.Manipulation.Initial}"></div>
		<div><input type="number" name="newPerception-${actor.id}" value="${actor.system.Characteristics.Mind.Stats.Perception.Initial}"></div>
		<div><input type="number" name="newSoul-${actor.id}" value="${actor.system.Characteristics.Soul.Initial}"></div>
		<div><input type="number" name="newAwareness-${actor.id}" value="${actor.system.Characteristics.Soul.Stats.Awareness.Initial}"></div>
		<div><input type="number" name="newConsciousness-${actor.id}" value="${actor.system.Characteristics.Soul.Stats.Consciousness.Initial}"></div>
		<div><input type="number" name="newWillpower-${actor.id}" value="${actor.system.Characteristics.Soul.Stats.Willpower.Initial}"></div>
		</div>`;
}
dialogContent += `</form>`;
dialogContent += `<br><div>Confirming will set Protagonists' Current Life to Max Life</div><br>`;
let dialogOptions = {
	width: 1250,
	height: 720,
};
let toolboxdialog = new Dialog(
	{
		title: "Narrator's Toolbox - Edit Protagonist Stats",
		content: dialogContent,
		buttons: {
			ok: {
				label: "Confirm",
				callback: async (html) => {
					for (let actor of actors) {
						let newBody = parseInt(html.find(`[name="newBody-${actor.id}"]`).val());
						let newEndurance = parseInt(html.find(`[name="newEndurance-${actor.id}"]`).val());
						let newPower = parseInt(html.find(`[name="newPower-${actor.id}"]`).val());
						let newReflexes = parseInt(html.find(`[name="newReflexes-${actor.id}"]`).val());
						let newMind = parseInt(html.find(`[name="newMind-${actor.id}"]`).val());
						let newCreativity = parseInt(html.find(`[name="newCreativity-${actor.id}"]`).val());
						let newManipulation = parseInt(html.find(`[name="newManipulation-${actor.id}"]`).val());
						let newPerception = parseInt(html.find(`[name="newPerception-${actor.id}"]`).val());
						let newSoul = parseInt(html.find(`[name="newSoul-${actor.id}"]`).val());
						let newAwareness = parseInt(html.find(`[name="newAwareness-${actor.id}"]`).val());
						let newConsciousness = parseInt(html.find(`[name="newConsciousness-${actor.id}"]`).val());
						let newWillpower = parseInt(html.find(`[name="newWillpower-${actor.id}"]`).val());
						await actor.update({
							"system.Characteristics.Body.Initial": newBody,
							"system.Characteristics.Body.Stats.Endurance.Initial": newEndurance,
							"system.Characteristics.Body.Stats.Power.Initial": newPower,
							"system.Characteristics.Body.Stats.Reflexes.Initial": newReflexes,
							"system.Characteristics.Mind.Initial": newMind,
							"system.Characteristics.Mind.Stats.Creativity.Initial": newCreativity,
							"system.Characteristics.Mind.Stats.Manipulation.Initial": newManipulation,
							"system.Characteristics.Mind.Stats.Perception.Initial": newPerception,
							"system.Characteristics.Soul.Initial": newSoul,
							"system.Characteristics.Soul.Stats.Awareness.Initial": newAwareness,
							"system.Characteristics.Soul.Stats.Consciousness.Initial": newConsciousness,
							"system.Characteristics.Soul.Stats.Willpower.Initial": newWillpower,
						});
						//? Set Current Life = Max Life
						let maxlife = await actor.system.Vital.Life.max;
						await actor.update({ "system.Vital.Life.value": Number(maxlife) });
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
