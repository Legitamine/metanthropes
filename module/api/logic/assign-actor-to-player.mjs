
/**
 * This app helps Narrators to quickly give ownership of an Actor to a player, allowing them to use the Buttons in the Chat for re-rolls. It also configures the Player Character of the Selected Player to the Actor being assigned.
 *todo review design choice - should we only change the Player Character if it's null? Currently it will ovewrite the Player Character Actor with the one being assigned.
 * @export
 * @async
 * @param {*} actor 
 * @returns {unknown} 
 */
export async function metaAssignActorToPlayer(actor) {
	if (!game.user.isGM) return ui.notifications.warn(_loc("METANTHROPES.LOGIC.ASSIGN_ACTOR_TO_PLAYER.noGM"));
	//? Present a dialog with values from the game.users object
	const dialog = new Dialog({
		title: "Assign Player",
		content: `
	<form>
		<div>When you assign this Actor to a Player, they get the Owner permission on the Actor document and are able to see & interact with the Buttons in the Chat, whenever this Actor makes a roll. In addition, the Actor is configured as the default Player Character for the Selected Player.<br></div>
		<div><br><strong>Only Narrators (Gamemasters) and the assigned Players can see and click the Buttons in the Chat.</strong><br><br></div>
		<div><strong>Current Player: ${actor.system.metaowner.value}<br><br></strong></div>
		<div class="form-group">
			<label>Assign Player</label>
			<select id="player" name="player">
				${game.users.map((user) => `<option value="${user.name}" data-playerid="${user._id}">${user.name}</option>`).join("")}
			</select>
		</div><br>
		<div><p>You can add/remove Players from the Settings - User Management menu.<br><br>To manually change the Player's name, please use the 'Narrator Toolbox - Edit Protagonist Details' Macro.<br><br></p></div>
		<div><p>To change or remove assigned owners from an Actor, use the 'Configure Ownership' App by right clicking on the Actor from the Actors tab of the Sidebar.</p><br></div>
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
							"data-playerid",
						);
					//? Give that player OWNER permission on the actor document and set the metaowner value to that player
					await actor.update({
						"system.metaowner.value": selectedPlayer,
						ownership: { [selectedPlayerID]: 3 },
					});
					//? Give the Selected Player this Actor as their selected Character
					const gameUser = game.users.get(selectedPlayerID);
					gameUser.update({ character: actor.id });
					//? Close the dialog
					metanthropes.utils.metaLog(
						3,
						"metaAssignActorToPlayer",
						"Assigned",
						actor.name,
						actor.id,
						"to",
						selectedPlayer,
						selectedPlayerID,
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
