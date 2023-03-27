import { MetaRollStat } from "./metarollstat.mjs";

export async function MetaRoll(actor, stat) {
	const statValue = actor.system.RollStats[stat];
	// calculate the max number of multi-actions possible based on the stat value
	const maxMultiActions = Math.floor((statValue - 1) / 10);
	const multiActionOptions = Array.from({ length: maxMultiActions - 1 }, (_, i) => i + 2);
	//create the dialog content
	let dialogContent = `
    <div class="layout-metaroll-dialog">
    <p>Is this part of a Multi-Action?</p>
    <select id="multiAction">
    	<option value="no">No</option>
    	<option value="yes">Yes</option>
    </select>
    <span id="multiActionSelection" style="display: none;">
    <p>Select the number of Multi-Actions: </p>
    <select id="multiActionCount">
    	${multiActionOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}
    </select>
    </span>
	</div>
	`;
	let dialog = new Dialog({
		title: `MetaRoll: ${actor.name}'s ${stat}`,
		content: dialogContent,
		buttons: {
			roll: {
				//! this looks really ugly
				//todo: find a way to make this look better
				//label: "<img src='../systems/metanthropes-system/artwork/metanthropes-dice-roll-small.webp' alt='Roll' />",
				label: "Roll",
				callback: async (html) => {
					let multiAction = html.find("#multiAction").val() === "yes";
					let modifier = 0;
					if (multiAction) {
						let selectedMultiActions = parseInt(html.find("#multiActionCount").val());
						modifier = selectedMultiActions * -10;
					}
					//send the data we collected to the MetaRollStat function
					MetaRollStat(actor, stat, statValue, modifier);
				},
			},
		},
		render: (html) => {
			const multiActionSelect = html.find("#multiAction");
			const multiActionSelectionDiv = html.find("#multiActionSelection");

			multiActionSelect.on("change", (event) => {
				const selectedValue = event.target.value;
				multiActionSelectionDiv.css("display", selectedValue === "yes" ? "inherit" : "none");
			});
		},
	});
	dialog.render(true);
}
