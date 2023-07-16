//* newactor.mjs will be used to help in generating a new actor's stats and characteristics, along with other information.
//! Needs new CSS Classes
//! here is the layout for the forms
// step 1: destiny roll 3d10x10 default but input to change
// step 2: drop down for 100 alphabetically / random rolltable - icon of prime metapower in CS
// step 3: characteristics -  https://www.metanthropes.com/myprotagonist/
//	stats same as characteristics that will roll in chat x3 for pri/sec/ter and offer re-rolls - need to confirm rerolling all 3 works properly
// step 4: roleplay: Background: input field or random button - from 2x rolltables
// 	and Metamorphosis, Arc, Regression - drop down x 10 {{and/or input field}}
//step 5: {{ input (default 2): number of free perks / option to add more free perks later? }}
// step 6: protagonist Name, Gender, Age, DoB, PoB - prompt for Note taking?
//SUmmary step 6 - add new Nav named Summary, moving all header properties to that tab
//resize CS to logo background. cleanup old artwork files.
//me promises mporw na kanw ena step-by-step dialog poy na kanei guide new player experience
// narrator's right click na kanei show ena dialog me ola ta steps k dipla check box (default yes) gia ta poia steps thelei na ginoune random
// if anything is checked na kanei randomize ta reults aytou tou step.
// gia narrators episis prepei na kanw separate setup gia ta diafora alla types peran tou protagonist

export async function NewActor(actor) {
	await NewActorDestiny(actor);
	await NewActorPrimeMetapower(actor);
	await NewActorCharacteristics(actor);
	await NewActorBodyStats(actor);
	await NewActorMindStats(actor);
	await NewActorSoulStats(actor);
	await NewActorRoleplay(actor);
	//await NewActorPerks(actor);
	//await NewActorSummary(actor);
}

export async function Rolld10(actor, what, destinyreroll, dice) {
	//? This functions rolls a number of d10 and allow rerolls if destiny is set to 1
	//? destiny allows for rerolling the result by spending 1 Destiny Point
	//! thelw info apo bro gia to poia metapowers allazoune ta dice poy kaneis reroll gia na ta kanw include edw
	//! review CSS classes
	//? dice is the number of d10 to roll
	const rolld10 = await new Roll(`${dice}d10x10`).evaluate({ async: true });
	const total = rolld10.total;
	//* Message to be printed to chat
	let message = `${actor.name} rolls for ${what} with ${dice} * d10 and gets a total of ${total}. <br>`;
	//? if destiny is set to 1, allow rerolling the result by spending 1 Destiny Point
	if (destinyreroll === 1) {
		let currentDestiny = actor.system.Vital.Destiny.value;
		message += `<br><br> ${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>
		<div><button class="hide-button layout-hide rolld10x10" data-actor-id="${actor.id}"
		data-what="${what}" data-destinyreroll="${destinyreroll}" data-dice="${dice}">Spend 🤞 Destiny to reroll
		</button></div> <br>`;
	}
	await actor.setFlag("metanthropes-system", "lastrolled", {
		rolld10: total,
	});
	//print message to chat and enable Dice So Nice to roll the dice and display the message
	rolld10.toMessage({
		speaker: ChatMessage.getSpeaker({ actor: actor }),
		flavor: message,
		rollMode: game.settings.get("core", "rollMode"),
		flags: { "metanthropes-system": { actorId: actor.id } },
	});
}
//* This is the function that is called when the destiny re-roll button is clicked
export async function Rolld10ReRoll(event) {
	event.preventDefault();
	const button = event.target;
	const actorId = button.dataset.idactor;
	const what = button.dataset.what;
	const destinyreroll = parseInt(button.dataset.destinyreroll);
	const dice = parseInt(button.dataset.dice);
	const actor = game.actors.get(actorId);
	let currentDestiny = actor.system.Vital.Destiny.value;
	// make this function only available to the owner of the actor
	if ((actor && actor.isOwner) || game.user.isGM) {
		// Reduce Destiny.value by 1
		if (currentDestiny > 0) {
			currentDestiny -= 1;
			await actor.update({ "system.Vital.Destiny.value": Number(currentDestiny) });
			// Update re-roll button visibility
			const message = game.messages.get(button.dataset.messageId);
			if (message) {
				message.render();
			}
			Rolld10(actor, what, destinyreroll, dice);
		}
	}
}

export async function NewActorDestiny(actor) {
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Roll your starting Destiny</h2>
		<form>
			<div class="form-group">
				<label for="destiny">🤞 Destiny Dice:</label>
				<input type="number" id="startdestiny" name="startdestiny" value="3">
			</div>
		</form>
	</div>
	`;
	return new Promise((resolve, reject) => {
		let dialog = new Dialog({
			title: `${actor.name}'s Starting Destiny`,
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm 📊 Destiny",
					callback: async (html) => {
						let destinydice = html.find('[name="startdestiny"]').val();
						await Rolld10(actor, "Destiny", 0, destinydice);
						const total = actor.getFlag("metanthropes-system", "lastrolled").rolld10;
						await actor.update({ "system.Vital.Destiny.value": Number(total) });
						await actor.update({ "system.Vital.Destiny.max": Number(total) });
						console.log(`New Destiny: ${total}`);
						resolve();
					},
				},
				cancel: {
					label: "Cancel",
					callback: () => reject(),
				},
			},
			default: "ok",
		});
		dialog.render(true);
	});
}

export async function NewActorPrimeMetapower(actor) {
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Choose your Prime Metapower</h2>
		<form>
			<div class="form-group">
				<label for="primemetapower">Prime Metapower:</label>
				<select id="primemetapower" name="primemetapower">
					<option value="yes" selected>Yes</option>
					<option value="no">No</option>
				</select>
			</div>
		</form>
	</div>
	`;
	return new Promise((resolve, reject) => {
		let dialog = new Dialog({
			title: `${actor.name}'s Prime Metapower`,
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm Prime Ⓜ️ Metapower",
					callback: async (html) => {
						let primemetapower = html.find('[name="primemetapower"]').val();
						await actor.update({ "system.entermeta.primemetapower.value": primemetapower });
						console.log(`New Prime Metapower: ${primemetapower}`);
						resolve();
					},
				},
				cancel: {
					label: "Cancel",
					callback: () => reject(),
				},
			},
			default: "ok",
		});
		dialog.render(true);
	});
}

export async function NewActorCharacteristics(actor) {
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Choose your ${actor.type}'s Characteristics</h2>
		<form>
			<div class="form-group">
				<label for="primary">First Pick:</label>
				<select id="primary" name="primary">
					<option value="Body" selected>Body</option>
					<option value="Mind">Mind</option>
					<option value="Soul">Soul</option>
				</select>
			</div>
			<div class="form-group">
				<label for="secondary">Second Pick:</label>
				<select id="secondary" name="secondary">
					<option value="Mind" selected>Mind</option>
					<option value="Body">Body</option>
					<option value="Soul">Soul</option>
				</select>
			</div>
			<div class="form-group">
				<label for="tertiary">Third Pick:</label>
				<select id="tertiary" name="tertiary">
					<option value="Soul" selected>Soul</option>
					<option value="Body">Body</option>
					<option value="Mind">Mind</option>
				</select>
			</div>
		</form>
	</div>
	`;
	return new Promise((resolve, reject) => {
		let dialog = new Dialog({
			title: `${actor.name}'s Characteristics`,
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm 📊 Characteristics",
					callback: async (html) => {
						let primary = html.find('[name="primary"]').val();
						let secondary = html.find('[name="secondary"]').val();
						let tertiary = html.find('[name="tertiary"]').val();
						await actor.update({ [`system.Characteristics.${primary}.Initial`]: Number(30) });
						await actor.update({ [`system.Characteristics.${secondary}.Initial`]: Number(20) });
						await actor.update({ [`system.Characteristics.${tertiary}.Initial`]: Number(10) });
						console.log(`New primary: ${primary}`, actor.system.Characteristics[primary].Initial);
						console.log(`New secondary: ${secondary}`, actor.system.Characteristics[secondary].Initial);
						console.log(`New tertiary: ${tertiary}`, actor.system.Characteristics[tertiary].Initial);
						resolve();
						//! reminder to set initial=max life after doing the statistics
					},
				},
				cancel: {
					label: "Cancel",
					callback: () => reject(),
				},
			},
			default: "ok",
			render: (html) => {
				// Add event listeners to dynamically update the options in the Secondary and Tertiary dropdowns
				html.find('[name="primary"]').change((event) => {
					// Update the options in the Secondary dropdown based on the Primary selection
					let primary = event.target.value;
					let secondaryOptions = ["Body", "Mind", "Soul"].filter((option) => option !== primary);
					let secondaryDropdown = html.find('[name="secondary"]');
					secondaryDropdown.empty();
					secondaryOptions.forEach((option) => {
						secondaryDropdown.append(new Option(option, option));
					});
					// Trigger a change event to update the Tertiary dropdown
					secondaryDropdown.trigger("change");
				});
				html.find('[name="secondary"]').change((event) => {
					// Update the options in the Tertiary dropdown based on the Secondary selection
					let primary = html.find('[name="primary"]').val();
					let secondary = event.target.value;
					let tertiaryOptions = ["Body", "Mind", "Soul"].filter(
						(option) => option !== primary && option !== secondary
					);
					let tertiaryDropdown = html.find('[name="tertiary"]');
					tertiaryDropdown.empty();
					tertiaryOptions.forEach((option) => {
						tertiaryDropdown.append(new Option(option, option));
					});
				});
			},
		});
		dialog.render(true);
	});
}
export async function NewActorBodyStats(actor) {
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Choose your ${actor.type}'s Body Stats</h2>
		<form>
			<div class="form-group">
				<label for="primary">First Pick:</label>
				<select id="primary" name="primary">
					<option value="Endurance" selected>Endurance</option>
					<option value="Power">Power</option>
					<option value="Reflexes">Reflexes</option>
				</select>
			</div>
			<div class="form-group">
				<label for="secondary">Second Pick:</label>
				<select id="secondary" name="secondary">
					<option value="Power" selected>Power</option>
					<option value="Endurance">Endurance</option>
					<option value="Reflexes">Reflexes</option>
				</select>
			</div>
			<div class="form-group">
				<label for="tertiary">Third Pick:</label>
				<select id="tertiary" name="tertiary">
					<option value="Reflexes" selected>Reflexes</option>
					<option value="Endurance">Endurance</option>
					<option value="Power">Power</option>
				</select>
			</div>
		</form>
	</div>
	`;
	return new Promise((resolve, reject) => {
		let dialog = new Dialog({
			title: `${actor.name}'s Body Stats`,
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm & Roll 📊 Body Stats",
					callback: async (html) => {
						//! maybe it's better to do them one at a time, this way I can use the lastrolled flag to set the values
						//! that would require to kick off multiple promises ?
						let primary = html.find('[name="primary"]').val();
						let secondary = html.find('[name="secondary"]').val();
						let tertiary = html.find('[name="tertiary"]').val();
						await actor.update({ [`system.Characteristics.Body.Stats.${primary}.Initial`]: Number(30) });
						await actor.update({ [`system.Characteristics.Body.Stats.${secondary}.Initial`]: Number(20) });
						await actor.update({ [`system.Characteristics.Body.Stats.${tertiary}.Initial`]: Number(10) });
						console.log(
							`New Body Stat primary: ${primary}`,
							actor.system.Characteristics.Body.Stats[primary].Initial
						);
						console.log(
							`New Body Stat secondary: ${secondary}`,
							actor.system.Characteristics.Body.Stats[secondary].Initial
						);
						console.log(
							`New Body Stat tertiary: ${tertiary}`,
							actor.system.Characteristics.Body.Stats[tertiary].Initial
						);
						let maxlife = actor.system.Vital.Life.max;
						await actor.update({ [`system.Vital.Life.value`]: Number(maxlife) });
						resolve();
					},
				},
				cancel: {
					label: "Cancel",
					callback: () => reject(),
				},
			},
			default: "ok",
			render: (html) => {
				// Add event listeners to dynamically update the options in the Secondary and Tertiary dropdowns
				html.find('[name="primary"]').change((event) => {
					// Update the options in the Secondary dropdown based on the Primary selection
					let primary = event.target.value;
					let secondaryOptions = ["Endurance", "Power", "Reflexes"].filter((option) => option !== primary);
					let secondaryDropdown = html.find('[name="secondary"]');
					secondaryDropdown.empty();
					secondaryOptions.forEach((option) => {
						secondaryDropdown.append(new Option(option, option));
					});
					// Trigger a change event to update the Tertiary dropdown
					secondaryDropdown.trigger("change");
				});
				html.find('[name="secondary"]').change((event) => {
					// Update the options in the Tertiary dropdown based on the Secondary selection
					let primary = html.find('[name="primary"]').val();
					let secondary = event.target.value;
					let tertiaryOptions = ["Endurance", "Power", "Reflexes"].filter(
						(option) => option !== primary && option !== secondary
					);
					let tertiaryDropdown = html.find('[name="tertiary"]');
					tertiaryDropdown.empty();
					tertiaryOptions.forEach((option) => {
						tertiaryDropdown.append(new Option(option, option));
					});
				});
			},
		});
		dialog.render(true);
	});
}
export async function NewActorMindStats(actor) {
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Choose your ${actor.type}'s Mind Stats</h2>
		<form>
			<div class="form-group">
				<label for="primary">First Pick:</label>
				<select id="primary" name="primary">
					<option value="Perception" selected>Perception</option>
					<option value="Manipulation">Manipulation</option>
					<option value="Creativity">Creativity</option>
				</select>
			</div>
			<div class="form-group">
				<label for="secondary">Second Pick:</label>
				<select id="secondary" name="secondary">
					<option value="Manipulation" selected>Manipulation</option>
					<option value="Perception">Perception</option>
					<option value="Creativity">Creativity</option>
				</select>
			</div>
			<div class="form-group">
				<label for="tertiary">Third Pick:</label>
				<select id="tertiary" name="tertiary">
					<option value="Creativity" selected>Creativity</option>
					<option value="Perception">Perception</option>
					<option value="Manipulation">Manipulation</option>
				</select>
			</div>
		</form>
	</div>
	`;
	return new Promise((resolve, reject) => {
		let dialog = new Dialog({
			title: `${actor.name}'s Mind Stats`,
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm & Roll 📊 Mind Stats",
					callback: async (html) => {
						let primary = html.find('[name="primary"]').val();
						let secondary = html.find('[name="secondary"]').val();
						let tertiary = html.find('[name="tertiary"]').val();
						await actor.update({ [`system.Characteristics.Mind.Stats.${primary}.Initial`]: Number(30) });
						await actor.update({ [`system.Characteristics.Mind.Stats.${secondary}.Initial`]: Number(20) });
						await actor.update({ [`system.Characteristics.Mind.Stats.${tertiary}.Initial`]: Number(10) });
						console.log(
							`New Mind Stat primary: ${primary}`,
							actor.system.Characteristics.Mind.Stats[primary].Initial
						);
						console.log(
							`New Mind Stat secondary: ${secondary}`,
							actor.system.Characteristics.Mind.Stats[secondary].Initial
						);
						console.log(
							`New Mind Stat tertiary: ${tertiary}`,
							actor.system.Characteristics.Mind.Stats[tertiary].Initial
						);
						resolve();
						//! reminder to set initial=max life after doing the statistics
					},
				},
				cancel: {
					label: "Cancel",
					callback: () => reject(),
				},
			},
			default: "ok",
			render: (html) => {
				// Add event listeners to dynamically update the options in the Secondary and Tertiary dropdowns
				html.find('[name="primary"]').change((event) => {
					// Update the options in the Secondary dropdown based on the Primary selection
					let primary = event.target.value;
					let secondaryOptions = ["Perception", "Manipulation", "Creativity"].filter(
						(option) => option !== primary
					);
					let secondaryDropdown = html.find('[name="secondary"]');
					secondaryDropdown.empty();
					secondaryOptions.forEach((option) => {
						secondaryDropdown.append(new Option(option, option));
					});
					// Trigger a change event to update the Tertiary dropdown
					secondaryDropdown.trigger("change");
				});
				html.find('[name="secondary"]').change((event) => {
					// Update the options in the Tertiary dropdown based on the Secondary selection
					let primary = html.find('[name="primary"]').val();
					let secondary = event.target.value;
					let tertiaryOptions = ["Perception", "Manipulation", "Creativity"].filter(
						(option) => option !== primary && option !== secondary
					);
					let tertiaryDropdown = html.find('[name="tertiary"]');
					tertiaryDropdown.empty();
					tertiaryOptions.forEach((option) => {
						tertiaryDropdown.append(new Option(option, option));
					});
				});
			},
		});
		dialog.render(true);
	});
}
export async function NewActorSoulStats(actor) {
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Choose your ${actor.type}'s Soul Stats</h2>
		<form>
			<div class="form-group">
				<label for="primary">First Pick:</label>
				<select id="primary" name="primary">
					<option value="Willpower" selected>Willpower</option>
					<option value="Consciousness">Consciousness</option>
					<option value="Awareness">Awareness</option>
				</select>
			</div>
			<div class="form-group">
				<label for="secondary">Second Pick:</label>
				<select id="secondary" name="secondary">
					<option value="Consciousness" selected>Consciousness</option>
					<option value="Willpower">Willpower</option>
					<option value="Awareness">Awareness</option>
				</select>
			</div>
			<div class="form-group">
				<label for="tertiary">Third Pick:</label>
				<select id="tertiary" name="tertiary">
					<option value="Awareness" selected>Awareness</option>
					<option value="Willpower">Willpower</option>
					<option value="Consciousness">Consciousness</option>
				</select>
			</div>
		</form>
	</div>
	`;
	return new Promise((resolve, reject) => {
		let dialog = new Dialog({
			title: `${actor.name}'s Soul Stats`,
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm & Roll 📊 Soul Stats",
					callback: async (html) => {
						let primary = html.find('[name="primary"]').val();
						let secondary = html.find('[name="secondary"]').val();
						let tertiary = html.find('[name="tertiary"]').val();
						await actor.update({ [`system.Characteristics.Soul.Stats.${primary}.Initial`]: Number(30) });
						await actor.update({ [`system.Characteristics.Soul.Stats.${secondary}.Initial`]: Number(20) });
						await actor.update({ [`system.Characteristics.Soul.Stats.${tertiary}.Initial`]: Number(10) });
						console.log(
							`New Soul Stat primary: ${primary}`,
							actor.system.Characteristics.Soul.Stats[primary].Initial
						);
						console.log(
							`New Soul Stat secondary: ${secondary}`,
							actor.system.Characteristics.Soul.Stats[secondary].Initial
						);
						console.log(
							`New Soul Stat tertiary: ${tertiary}`,
							actor.system.Characteristics.Soul.Stats[tertiary].Initial
						);
						//! reminder to set initial=max life after doing the statistics
						resolve();
					},
				},
				cancel: {
					label: "Cancel",
					callback: () => reject(),
				},
			},
			default: "ok",
			render: (html) => {
				// Add event listeners to dynamically update the options in the Secondary and Tertiary dropdowns
				html.find('[name="primary"]').change((event) => {
					// Update the options in the Secondary dropdown based on the Primary selection
					let primary = event.target.value;
					let secondaryOptions = ["Willpower", "Consciousness", "Awareness"].filter(
						(option) => option !== primary
					);
					let secondaryDropdown = html.find('[name="secondary"]');
					secondaryDropdown.empty();
					secondaryOptions.forEach((option) => {
						secondaryDropdown.append(new Option(option, option));
					});
					// Trigger a change event to update the Tertiary dropdown
					secondaryDropdown.trigger("change");
				});
				html.find('[name="secondary"]').change((event) => {
					// Update the options in the Tertiary dropdown based on the Secondary selection
					let primary = html.find('[name="primary"]').val();
					let secondary = event.target.value;
					let tertiaryOptions = ["Willpower", "Consciousness", "Awareness"].filter(
						(option) => option !== primary && option !== secondary
					);
					let tertiaryDropdown = html.find('[name="tertiary"]');
					tertiaryDropdown.empty();
					tertiaryOptions.forEach((option) => {
						tertiaryDropdown.append(new Option(option, option));
					});
				});
			},
		});
		dialog.render(true);
	});
}

export async function NewActorRoleplay(actor) {
		let dialogContent = `
		<div class="metanthropes layout-metaroll-dialog">
			<h2>Choose your Roleplay</h2>
			<form>
				<div class="form-group">
					<label for="RPbackground">Background:</label>
					<select id="RPbackground" name="RPbackground">
						<option value="yes" selected>Yes</option>
						<option value="no">No</option>
					</select>
				</div>
				<div class="form-group">
				<label for="RPmetamorphosis">Metamorphosis:</label>
				<select id="RPmetamorphosis" name="RPmetamorphosis">
					<option value="yes" selected>Yes</option>
					<option value="no">No</option>
				</select>
			</div>
			<div class="form-group">
			<label for="RParc">Arc:</label>
			<select id="RParc" name="RParc">
				<option value="yes" selected>Yes</option>
				<option value="no">No</option>
			</select>
		</div>
		<div class="form-group">
		<label for="RPregression">Regression:</label>
		<select id="RPregression" name="RPregression">
			<option value="yes" selected>Yes</option>
			<option value="no">No</option>
		</select>
	</div>
			</form>
		</div>
		`;
		return new Promise((resolve, reject) => {
			let dialog = new Dialog({
				title: `${actor.name}'s Roleplay`,
				content: dialogContent,
				buttons: {
					ok: {
						label: "Confirm Roleplay",
						callback: async (html) => {
							let RPbackgroundpick = html.find('[name="RPbackground"]').val();
							await actor.update({ "system.Vital.background.value": RPbackgroundpick });
							console.log(`New Background: ${RPbackgroundpick}`);
							let RPmetamorphosispick = html.find('[name="RPmetamorphosis"]').val();
							await actor.update({ "system.entermeta.metamorphosis.value": RPmetamorphosispick });
							console.log(`New Metamorphosis: ${RPmetamorphosispick}`);
							let RParcpick = html.find('[name="RParc"]').val();
							await actor.update({ "system.Vital.arc.value": RParcpick });
							console.log(`New Arc: ${RParcpick}`);
							let RPregressionpick = html.find('[name="RPregression"]').val();
							await actor.update({ "system.entermeta.regression.value": RPregressionpick });
							console.log(`New Regression: ${RPregressionpick}`);
							resolve();
						},
					},
					cancel: {
						label: "Cancel",
						callback: () => reject(),
					},
				},
				default: "ok",
			});
			dialog.render(true);
		});
	}

//	export async function NewActorPerks {
//		let dialogContent = `
//		`;
//	}
//		
//	export async function NewActorSummary {
//		let dialogContent = `
//		`;
//	}