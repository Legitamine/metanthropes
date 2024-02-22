import { metaRolld10 } from "../helpers/extrasroll.mjs";
import { metaLog } from "../helpers/metahelpers.mjs";
import { metaActorControl } from "../metanthropes/actorcontrol.mjs";
//* Finalizes a Premade Protagonist
export async function metaFinalizePremadeActor(actor) {
	const playerName = game.user.name;
	try {
		await metaActorControl(actor).catch((error) => {
			metaLog(2, "Finalize Premade Protagonist", "Error at metaActorControl:", error);
			throw error;
		});
		//todo: premade actor summary
		await metaNewPremadeSummary(actor).catch((error) => {
			metaLog(2, "Finalize Premade Protagonist", "Error at NewPremadeSummary:", error);
			throw error;
		});
		//todo: review the finished action to change the portrait as the last step
		// await NewActorFinish(actor).catch((error) => {
			// metaLog(2, "Finalize Premade Protagonist", "Error at NewActorFinish:", error);
			// throw error;
		// });
		await metaRolld10(actor, "Destiny", false, 1);
		const NewDestiny = await actor.getFlag("metanthropes", "lastrolled").rolld10;
		await actor.update({
			"system.Vital.Destiny.value": Number(NewDestiny),
			"system.Vital.Destiny.max": Number(NewDestiny),
		});
		metaLog(3, "Finalize Premade Protagonist", `${playerName}'s ${actor.type} Starting Destiny:`, NewDestiny);
	} catch (error) {
		metaLog(2, "Finalize Premade Protagonist", "Error:", error);
	} finally {
		//intentionaly left blank for future use
	}
}

export async function metaNewPremadeSummary(actor) {
	const playerName = game.user.name;
	const narratorName = game.users.activeGM.name;
	let dialogContent = `
		<div class="metanthropes layout-metaroll-dialog">
			<h3>Choose your ${actor.type}'s ✍️ Summary</h3>
			<form>
			<h3>Protagonist Details:</h3>
				<div class="form-group">
					<label for="actorname" title="Your ${actor.type}'s Name"><span class="style-cs-conditions">(Required)</span> Name: </label>
					<input type="text" dtype="String" id="actorname" name="actorname" value="">
				</div>
				<div class="form-group">
					<label for="actorgender" title="Your ${actor.type}'s Gender">Gender: </label>
					<input type="text" dtype="String" id="actorgender" name="actorgender" value="">
				</div>
				<div class="form-group">
					<label for="actorgenderpronoun" title="Your ${actor.type}'s Gender Pronouns">Pronouns: </label>
					<input type=text dtype="String" id="actorgenderpronoun" name="actorgenderpronoun" value="">
				</div>
				<div class="form-group">
					<label for="actorage" title="Your ${actor.type}'s Age">Age: </label>
					<input class="style-container-input-charstat" type="number" dtype="Number" id="actorage" name="actorage" value="">yr
				</div>
				<div class="form-group">
					<label for="actorheight" title="Your ${actor.type}'s Height">Height: </label>
					<input class="style-container-input-charstat" type="number" dtype="Number" id="actorheight" name="actorheight" value="">m
				</div>
				<div class="form-group">
					<label for="actorweight" title="Your ${actor.type}'s Weight">Weight: </label>
					<input class="style-container-input-charstat" type="number" dtype="Number" id="actorweight" name="actorweight" value="">kg
				</div>
				<div class="form-group">
					<label for="actorpob" title="Your ${actor.type}'s Place of Birth">Place of Birth: </label>
					<input type="text" dtype="String" id="actorpob" name="actorpob" value="">
				</div>
				<h3>Session Details:</h3>
				<div class="form-group">
					<label for="narratorName" title="This should be filled out automatically">Narrator Name: </label>${narratorName}
				</div>
				<div class="form-group">
					<label for="playerName" title="This should be filled out automatically">Player Name: </label>${playerName}
				</div>
			</form>
		</div>
	`;
	return new Promise((resolve, reject) => {
		let dialog = new Dialog({
			title: `Finalize Premade: ${actor.type} ✍️ Summary`,
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm ✍️ Summary",
					callback: async (html) => {
						const actorname = html.find('[name="actorname"]').val();
						const actorage = html.find('[name="actorage"]').val();
						const actorgender = html.find('[name="actorgender"]').val();
						const actorgenderpronoun = html.find('[name="actorgenderpronoun"]').val();
						const actorheight = html.find('[name="actorheight"]').val();
						const actorweight = html.find('[name="actorweight"]').val();
						const actorpob = html.find('[name="actorpob"]').val();
						if (!actorname) {
							ui.notifications.error("Please enter a name for your " + actor.type);
							async () => {
								await actor.update({ name: "Premade" });
								reject();
							};
							return;
						}
						try {
							await actor.update({
								name: actorname,
								"system.Vital.age.value": Number(actorage),
								"system.humanoids.gender.value": actorgender,
								"system.humanoids.genderpronoun.value": actorgenderpronoun,
								"system.humanoids.height.value": Number(actorheight),
								"system.humanoids.weight.value": Number(actorweight),
								"system.humanoids.birthplace.value": actorpob,
								"system.entermeta.narrator.value": narratorName,
							});
							const prototype = actor.prototypeToken || false;
							if (prototype) {
								//? Update Prototype Token first
								await actor.update({ "prototypeToken.name": actorname });
								//? Update Iterate over all scenes
								for (const scene of game.scenes) {
									let tokensToUpdate = [];
									//? Find tokens that represent the actor
									for (const token of scene.tokens.contents) {
										if (token.actorId === actor.id) {
											tokensToUpdate.push({ _id: token.id, name: actorname });
										}
									}
									//? Update the tokens
									if (tokensToUpdate.length > 0) {
										try {
											await scene.updateEmbeddedDocuments("Token", tokensToUpdate);
										} catch (error) {
											metaLog(
												2,
												"metaChangePortrait",
												"Error updating token:",
												error,
												"tokens to update:",
												tokensToUpdate
											);
										}
									}
								}
							} else {
								//? Update only the current token if this was called from the canvas instead of the sidebar
								const token = actor.token;
								await token.update({ name: actorname });
							}
						} catch (error) {
							metaLog(2, "NewPremadeSummary", "Error in updating actor data", error);
							reject(error);
							return;
						} finally {
							//intentionally left blank
						}
						metaLog(
							3,
							"NewActorSummary",
							`New ${actor.type}'s Name:`,
							actorname,
							"Age:",
							actorage,
							"Gender:",
							actorgender,
							"Pronouns:",
							actorgenderpronoun,
							"Height:",
							actorheight,
							"Weight:",
							actorweight,
							"Place of Birth:",
							actorpob,
							"Player Name:",
							playerName,
							"Narrator Name:",
							narratorName
						);
						resolve();
					},
				},
				cancel: {
					label: "Cancel",
					callback: async () => {
						reject();
					},
				},
			},
			default: "ok",
		});
		dialog.render(true);
	});
}
