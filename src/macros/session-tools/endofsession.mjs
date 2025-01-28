//*Narrator's Toolbox - End of Session*//
if (!game.user.isGM) {
	ui.notifications.warn("You must be a Narrator to use this macro.");
	return;
}
let actors = game.actors.contents.filter((a) => a.type === "Protagonist");
let assignedActors = actors.filter((actor) => actor.system.metaowner.value !== "The Composer");
let arcTitle = actors[0]?.system.Vital.arc.title || "";
let regressionTitle = actors[0]?.system.entermeta.regression.title || "";
let dialogContent = `<form>
<div class="style-form">To be used at the end of each Session to award EXP.<br><br></div>
<div class="style-form">Award a number of tally marks (typically up to 5) for each category below and you may also give Bonus EXP to each Protagonist.</div>
<div class="style-form">Please reffer to the <a title="Requires Narrator access on Metanthropes.com" href="https://www.metanthropes.com/techniques/">Narrator's Techniques</a> on how to award EXP. An in-game Journal will be added at a later time.<br></div>
<div class="form-group style-form">EXP awarded for each tally mark:  <input type="number" data-dtype="Number" name="tallyEXP" value="100"><br><br></div>
<div class="form-group style-form">
	<div class="style-form">Protagonist</div>
	<div class="style-form">Sessions Played</div>
	<div class="style-form" title="${arcTitle}">Arc</div>
	<div class="style-form" title="${regressionTitle}">Regression</div>
	<div class="style-form">Current EXP</div>
	<div class="style-form" title="Roleplay rewards Players for authentically embodying the essence of their Protagonists and living out their lives.">Roleplay</div>
	<div class="style-form" title="Acting is awarded for the effort Players put into bringing their Protagonists to life through performance.">Acting</div>
	<div class="style-form" title="Goals rewards Players for setting and advancing towards significant objectives that align with the broader narrative of the Saga.">Goals</div>
	<div class="style-form" title="Adversity is awarded to Players when their Protagonists engage in dangerous situations, when they face their fears, overcome adversity, and overpower their adversaries.">Adversity</div>
	<div class="style-form" title="Influence should be given to Players whose actions and roleplay instigate change by affecting the lives of NPCs.">Influence</div>
	<div class="style-form" title="Discovery is awarded when Protagonists learn more about the world they inhabit, explore new lands, cultures, and ideas, or when they encounter new people or discover new clues.">Discovery</div>
	<div class="style-form" title="Award this number of bonus EXP to the Protagonist.">Bonus EXP</div>
</div>	
`;
for (let actor of assignedActors) {
	let regressionValue = actor.system.entermeta.regression.value;
	let regressionTitle =
		actor.system.entermeta.regression.options[regressionValue]?.title ||
		"This is not an officially supported Regression";
	let arcValue = actor.system.Vital.arc.value;
	let arcTitle = actor.system.Vital.arc.options[arcValue]?.title || "This is not an officially supported Arc";
	dialogContent += `<div class="form-group">
			<div class="style-form">${actor.name}</div>
			<div class="style-form"><align=center>${actor.system.entermeta.sessions.value}</align></div>
			<div class="style-form" title="${arcTitle}">${arcValue}</div>
			<div class="style-form" title="${regressionTitle}">${regressionValue}</div>
			<div class="style-form">${actor.system.Vital.Experience.Total}</div>
			<div class="style-form"><input type="number" name="roleplayTallyMarks-${actor.id}" value="0"></div>
			<div class="style-form"><input type="number" name="actingTallyMarks-${actor.id}" value="0"></div>
			<div class="style-form"><input type="number" name="goalsTallyMarks-${actor.id}" value="0"></div>
			<div class="style-form"><input type="number" name="adversityTallyMarks-${actor.id}" value="0"></div>
			<div class="style-form"><input type="number" name="influenceTallyMarks-${actor.id}" value="0"></div>
			<div class="style-form"><input type="number" name="discoveryTallyMarks-${actor.id}" value="0"></div>
			<div class="style-form"><input type="number" name="bonusEXP-${actor.id}" value="0"></div>
		</div>`;
}
dialogContent += `</form><br><br>`;
dialogContent += `<div class="style-form">Confirming will also increase the Sessions Played by 1, for each Protagonist on this list.</div><br><br>`;
let dialogOptions = {
	width: 1500,
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
					for (let actor of assignedActors) {
						let currentEXP = parseInt(actor.system.Vital.Experience.Total);
						let tallyEXP = parseInt(html.find(`[name="tallyEXP"]`).val());
						let roleplayEXP =
						parseInt(html.find(`[name="roleplayTallyMarks-${actor.id}"]`).val()) * tallyEXP;
						let actingEXP = parseInt(html.find(`[name="actingTallyMarks-${actor.id}"]`).val()) * tallyEXP;
						let goalsEXP = parseInt(html.find(`[name="goalsTallyMarks-${actor.id}"]`).val()) * tallyEXP;
						let adversityEXP =
						parseInt(html.find(`[name="adversityTallyMarks-${actor.id}"]`).val()) * tallyEXP;
						let influenceEXP =
						parseInt(html.find(`[name="influenceTallyMarks-${actor.id}"]`).val()) * tallyEXP;
						let discoveryEXP =
						parseInt(html.find(`[name="discoveryTallyMarks-${actor.id}"]`).val()) * tallyEXP;
						let bonusEXP = parseInt(html.find(`[name="bonusEXP-${actor.id}"]`).val());
						let newExperience =
							currentEXP +
							roleplayEXP +
							actingEXP +
							goalsEXP +
							adversityEXP +
							influenceEXP +
							discoveryEXP +
							bonusEXP;
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
