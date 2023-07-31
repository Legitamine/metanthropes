//? MetaRoll function handles the dialog box for selecting multi-actions and bonuses/penalties when rolling a stat
import { MetaEvaluate } from "../helpers/metaeval.mjs";
/*
 * we want to roll against a stat - always
 * we dermine if it's a simple roll, a detailed roll or a re-roll of existing results
 * we determine if we need additional info if it is more than a stat roll
 */


//! genikotero question einai ean thelw na pernaw ta re-rolls apo to MetaRoll prwta
//! px to hunger tha prepei na to pernaw kathe fora poy kanw re-roll? mporw na kanw destiny spend gia re-rolling tou hunger?
//! episis na analavei to MetaRoll ta chat messages? why/why not?
//! testing rq: protagonists, humans, metatherions klp klp linked kai mh, paizoune swsta? emfanizontai ola swsta k me to initiative??
//! thumisou na vgaleis ta ui.notifications.error apo to actor - kai isws na ta kaneis chat messages ???

export async function MetaRoll(actor, action, stat) {
	console.log("Metanthropes RPG System | MetaRoll | Engaged for", actor.type+":", actor.name+"'s", action, "with:", stat);
	const statValue = actor.system.RollStats[stat];
	const disease = actor.system.Characteristics.Body.CoreConditions.Diseased;
	const pain = actor.system.Characteristics.Mind.CoreConditions.Pain;
	const hunger = actor.system.Characteristics.Mind.CoreConditions.Hunger; //also fatigue?
	const unconscious = actor.system.Characteristics.Soul.CoreConditions.Unconscious;
	// placeholder for new Actor/Token logic
	//	let statValue;
	//	if (token.data.actorLink) { //check if the token is linked to an actor
	//		statValue = actor.system.RollStats[stat];
	//	} else { // if not, use the token's data
	//		statValue = token.system.RollStats[stat];
	//	}
	//? Check if we are unconscious
	if (unconscious > 0) {
		ui.notifications.error(actor.name + " is unconscious and can't act!");
		return;
	}
	//? Check if we are ok to do the roll stat-wise
	if (statValue <= 0) {
		ui.notifications.error(actor.name + " can't Roll " + stat + " with a Current value of 0!");
		return;
	}
	//? Check for hunger
	//* if we have hunger, we must beat the hunger roll before attempting to act
	//! to do hunger check
	//? Check for disease
	//* disease is expected to be a positive number, where as penalty is expected to be negative
	let diseasePenalty = 0;
	if (disease > 0) {
		//! not correct placement, need to figure out how to progress thru the logic for this
		//? check if penalty is worse than the disease level and set it accordingly
		if (diseasePenalty > -(disease * 10)) {
			diseasePenalty = -(disease * 10);
		}
	}
	//? ready to call MetaEvaluate for simple roll without any additional bonuses or penalties
	let multiAction = 0;
	let bonus = 0;
	let penalty = diseasePenalty;
	console.log("Metanthropes RPG System | MetaRoll | Engaging MetaEvaluate for:", actor.name+"'s", action, "with:", stat, statValue, "Multi-Action:", multiAction, "Bonus:", bonus, "Penalty:", penalty);
	await MetaEvaluate(actor, action, stat, statValue, multiAction, bonus, penalty);
	let checkresult = await actor.getFlag("metanthropes-system", "lastrolled").metaEvaluate;
	console.log(
		"Metanthropes RPG System | MetaRoll | MetaEvaluate Result for",
		actor.name,
		"Action:",
		action,
		stat,
		":",
		statValue,
		"Result:",
		checkresult
	);
	console.log("Metanthropes RPG System | MetaRoll | Finished");
}

//! different function if called via right-click, allowing to set options
export async function MetaRollCustom(actor, action, stat) {
	const statValue = actor.system.RollStats[stat];
	const disease = actor.system.Characteristics.Body.CoreConditions.Diseased;
	//! add the similar checks as above
	//! could I instead somehow extend the MetaRoll function to accept additional parameters?
	//? calculate the max number of multi-actions possible based on the stat value
	const maxMultiActions = Math.floor((statValue - 1) / 10);
	const multiActionOptions = Array.from({ length: maxMultiActions - 1 }, (_, i) => i + 2);
	//? Title and Buttons for the Dialog
	let dialogtitle = null;
	let dialogbuttonlabel = null;
	if (action === "StatRoll") {
		dialogtitle = `${actor.name}'s ${stat}`;
		dialogbuttonlabel = `Roll ${stat}`;
	} else if (action === "Initiative") {
		dialogtitle = `${actor.name}'s Initiative`;
		dialogbuttonlabel = `Roll Initiative`;
	}
	//? Create the Dialog content
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<p>Select total number of Multi-Actions:</p>
		<select id="multiActionCount">
			<option value="no">None</option>
			${multiActionOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}
		</select>
			<div>
			<br>
				<span class="style-cs-buffs ">Bonus: <input class="style-cs-buffs style-container-input-charstat"
				type="number" id="bonus" min="0" value="0">%		</span>
				<span class="style-cs-conditions">Penalty: <input class="style-cs-conditions style-container-input-charstat"
				type="number" id="penalty" min="0" value="0">%</span><br><br>
			</div>
	</div>
	`;
	//? Create the Dialog
	let dialog = new Dialog({
		title: dialogtitle,
		content: dialogContent,
		buttons: {
			roll: {
				label: dialogbuttonlabel,
				callback: async (html) => {
					//? collect multi-action value
					let multiAction = html.find("#multiActionCount").val();
					if (multiAction === "no") {
						multiAction = 0;
					} else {
						let selectedMultiActions = parseInt(html.find("#multiActionCount").val());
						multiAction = selectedMultiActions * -10;
					}
					//? collect bonus and penalty values
					let bonus = parseInt(html.find("#bonus").val());
					let penalty = -parseInt(html.find("#penalty").val());
					//? Check for disease
					//! is this the right place to do so?
					//* disease is expected to be a positive number, where as penalty is expected to be negative
					if (disease > 0) {
						//? check if penalty is worse than the disease level and set it accordingly
						if (penalty > -(disease * 10)) {
							penalty = -(disease * 10);
						}
					}
					//?send the data we collected to the MetaEvaluate function
					MetaEvaluate(actor, action, stat, statValue, multiAction, bonus, penalty);
				},
			},
		},
	});
	dialog.render(true);
}
