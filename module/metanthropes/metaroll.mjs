//? MetaRoll function handles the dialog box for selecting multi-actions and bonuses/penalties when rolling a stat
import { MetaEvaluate } from "../helpers/metaeval.mjs";
/*
 * we want to roll against a stat - always
 * we dermine if it's a simple roll, a detailed roll or a re-roll of existing results
 * we determine if we need additional info if it is more than a stat roll
 */
export async function MetaRoll(actor, stat) {
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
	if (disease > 0) { //! not correct placement, need to figure out how to progress thru the logic for this
		//? check if penalty is worse than the disease level and set it accordingly
		if (diseasePenalty > -(disease * 10)) {
			diseasePenalty = -(disease * 10);
		}
	}
	//! ready to call MetaEvaluate for simple roll without any additional bonuses or penalties
	//* send the data we collected to the MetaRollStat function
	let multiAction = 0;
	let bonus = 0;
	let penalty = diseasePenalty;
	MetaEvaluate(actor, stat, statValue, multiAction, bonus, penalty);
}

//! different function if called via right-click, allowing to set options
export async function MetaRollCustom(actor, stat) {
	const statValue = actor.system.RollStats[stat];
	const disease = actor.system.Characteristics.Body.CoreConditions.Diseased;
	//! add the similar checks as above 
	//? calculate the max number of multi-actions possible based on the stat value
	const maxMultiActions = Math.floor((statValue - 1) / 10);
	const multiActionOptions = Array.from({ length: maxMultiActions - 1 }, (_, i) => i + 2);
	//create the dialog content
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
	let dialog = new Dialog({
		title: `${actor.name}'s ${stat}`,
		content: dialogContent,
		buttons: {
			roll: {
				label: `Roll ${stat}`,
				callback: async (html) => {
					//collect multi-action value
					let multiAction = html.find("#multiActionCount").val();
					if (multiAction === "no") {
						multiAction = 0;
					} else {
						let selectedMultiActions = parseInt(html.find("#multiActionCount").val());
						multiAction = selectedMultiActions * -10;
					}
					// collect bonus and penalty values
					let bonus = parseInt(html.find("#bonus").val());
					let penalty = -parseInt(html.find("#penalty").val());
					//? Check for disease
					//* disease is expected to be a positive number, where as penalty is expected to be negative
					if (disease > 0) {
						//? check if penalty is worse than the disease level and set it accordingly
						if (penalty > -(disease * 10)) {
							penalty = -(disease * 10);
						}
					}
					//send the data we collected to the MetaEvaluate function
					MetaEvaluate(actor, stat, statValue, multiAction, bonus, penalty);
				},
			},
		},
	});
	dialog.render(true);
}
