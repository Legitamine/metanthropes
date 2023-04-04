// import the PossessionRollStat function
import { PossessionRollStat } from "./posrollstat.mjs";
// MetaRoll function handles the dialog box for selecting multi-actions and bonuses/penalties when rolling a stat
export async function PossessionRoll(actor, stat) {
	const statValue = actor.system.RollStats[stat];
	if (statValue <= 0) {
		ui.notifications.error(actor.name+" can't use a Possession with "+stat+" Current value of 0!");
		return;
	}
	// calculate the max number of multi-actions possible based on the stat value
	const maxMultiActions = Math.floor((statValue - 1) / 10);
	const multiActionOptions = Array.from({ length: maxMultiActions - 1 }, (_, i) => i + 2);
	let modifier = 0;
	//create the dialog content
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
	<p>Is this part of a Multi-Action? If yes, how many total?</p>
	<select id="multiActionCount">
		<option value="no">No</option>
		${multiActionOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}
	</select>
	<div>
	<span class="style-cs-buffs ">Bonus: <input class="style-cs-buffs style-container-input-charstat" type="number" id="bonus" min="0" value="0">%		</span><span class="style-cs-conditions">Penalty: <input class="style-cs-conditions style-container-input-charstat" type="number" id="penalty" min="0" value="0">%</span>
	</div>
	</div>
	`;
	let dialog = new Dialog({
		title: `PosRoll: ${actor.name}'s ${stat}`,
		content: dialogContent,
		buttons: {
			roll: {
				label: "Use Possession",
				callback: async (html) => {
					//collect multi-action value
					let multiAction = html.find("#multiActionCount").val();
					if (multiAction === "no") {
						modifier = 0;
					} else {
						let selectedMultiActions = parseInt(html.find("#multiActionCount").val());
						modifier = selectedMultiActions * -10;
					}
					// collect bonus and penalty values
					let bonus = parseInt(html.find("#bonus").val());
					let penalty = -parseInt(html.find("#penalty").val());
					//send the data we collected to the MetaRollStat function
					PossessionRollStat(actor, stat, statValue, modifier, bonus, penalty);
				},
			},
		},
		// after the dialog is rendered, add an event listener to the multi-action select to unhide the multi-action count select
		//	render: (html) => {
		//		const multiActionSelect = html.find("#multiAction");
		//		const multiActionSelectionDiv = html.find("#multiActionSelection");
		//		multiActionSelect.on("change", (event) => {
		//			const selectedValue = event.target.value;
		//			multiActionSelectionDiv.toggleClass("layout-hide", selectedValue !== "yes");
		//		});
		//},
	});
	dialog.render(true);
}
