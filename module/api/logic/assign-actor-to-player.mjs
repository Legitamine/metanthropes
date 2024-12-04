export async function metaAssignActorToPlayer(actor) {
	if (!game.user.isGM) {
		ui.notifications.warn("You must be a Narrator (Gamemaster) to use this function.");
		return;
	}
	//? Present a dialog with values from the game.users object
	const gameUsers = game.users;
	if (gameUsers.length === 0) {
		ui.notifications.warn("There are no configured users to choose from");
		return;
	}
	//? Create a new Dialog
	const dialog = new Dialog({
		title: "Assign Player",
		content: `
	<form>
		<div>When you assign this Actor to a Player, they get the Owner permission on the Actor document & are able to see & interact with the buttons in the chat.<br></div>
		<div><br>Only Narrators (Gamemasters) and the assigned Player can see and click the Buttons in the Chat<br><br></div>
		<div><p>You can add/remove Players from the Settings - User Management<br><br> To manually change the Player's name, please use the 'Narrator Toolbox - Edit Protagonist Details' Macro<br><br></p></div>
		<div><p>Current Player: ${actor.system.metaowner.value}</p><br></div>
		<div class="form-group">
			<label>Assign Player</label>
			<select id="player" name="player">
				${gameUsers.map((user) => `<option value="${user.name}" data-playerid="${user._id}">${user.name}</option>`).join("")}
			</select>
		</div>
	</form>
	`,
		buttons: {
			select: {
				label: "Confirm",
				callback: async (html) => {
					//? Get the selected player
					const selectedPlayerElement = html.find("#player")[0];
					const selectedPlayer = selectedPlayerElement.value;
					const selectedPlayerID =
						selectedPlayerElement.options[selectedPlayerElement.selectedIndex].getAttribute(
							"data-playerid"
						);
					//? Give that player OWNER permission on the actor document and set the metaowner value to that player
					await actor.update({
						"system.metaowner.value": selectedPlayer,
						ownership: { [selectedPlayerID]: 3 },
					});
					//? Close the dialog
					metanthropes.utils.metaLog(
						3,
						"metaAssignActorToPlayer",
						"Assigned",
						actor.name,
						"to",
						selectedPlayer,
						"with ID",
						selectedPlayerID
					);
					dialog.close();
				},
			},
			cancel: {
				label: "Cancel",
			},
		},
		default: "select",
	});
	//? Render the dialog
	dialog.render(true);
}
