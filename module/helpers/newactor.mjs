//* newactor.mjs will be used to help in generating a new actor's stats and characteristics, along with other information.
//! Needs new CSS Classes
//! issues: filepicker opening in correct folder each time
//! issues: char picks should drive which stat rolls are made first
// narrator's right click na kanei show ena dialog me ola ta steps k dipla check box (default yes) gia ta poia steps thelei na ginoune random
// if anything is checked na kanei randomize ta reults aytou tou step.
// gia narrators episis prepei na kanw separate setup gia ta diafora alla types peran tou protagonist
// kai episis na kanw expand to new actor function gia na kanei pick mono ta relative fields analoga me to type tou actor
export async function NewActor(actor) {
	try {
		await NewActorDestiny(actor);
		await NewActorPrimeMetapower(actor);
		await NewActorCharacteristics(actor);
		await NewActorBodyStats(actor);
		await NewActorMindStats(actor);
		await NewActorSoulStats(actor);
		await NewActorRoleplay(actor);
		await NewActorProgression(actor);
		await NewActorSummary(actor);
		await NewActorFinish(actor);
	} catch (error) {
		console.log("Metanthropes RPG New Actor Error:", error);
	}
}

export async function NewStatRoll(actor, char, stat, number) {
	return new Promise((resolve, reject) => {
		Rolld10(actor, stat, 1, number);
		let statcontent = `
			<div class="metanthropes layout-metaroll-dialog">
				<h2>Confirm your ${actor.type}'s ${stat} 📊 Stat</h2>
			</div>
			`;
		let dialogstat = new Dialog({
			title: `${actor.type}'s ${char} 📊 Stats`,
			content: statcontent,
			buttons: {
				ok: {
					label: `Confirm ${stat} 📊 Stat`,
					callback: async () => {
						let statvalue = actor.getFlag("metanthropes-system", "lastrolled").rolld10;
						await actor.update({
							[`system.Characteristics.${char}.Stats.${stat}.Initial`]: Number(statvalue),
						});
						console.log(`New ${stat} Stat:`, actor.system.Characteristics[char].Stats[stat].Initial);
						resolve();
					},
				},
			},
			default: "ok",
		});
		dialogstat.render(true);
	});
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
		message += `<br>${actor.name} has ${currentDestiny} * 🤞 Destiny remaining.<br>
		<div class="hide-button hidden"><br><button class="rolld10-reroll" data-idactor="${actor.id}"
		data-what="${what}" data-destinyreroll="${destinyreroll}" data-dice="${dice}">Spend 🤞 Destiny to reroll
		</button><br></div>`;
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
			//! Currently unused
			//? Update re-roll button visibility
			const message = game.messages.get(button.dataset.messageId);
			if (message) {
				message.render();
			}
			Rolld10(actor, what, destinyreroll, dice);
		}
	}
}
export async function NewActorDestiny(actor) {
	//? we will store the player's name as declared by the Gamemaster in the World User Settings
	let playername = game.user.name;
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Choose your ${actor.type}'s 🤞 Destiny</h2>
		<form>
			<div class="form-group">
				<label for="destiny">🤞 Destiny Dice:</label>
				<input type="number" id="startdestiny" name="startdestiny" value="3">
			</div>
		</form>
	</div>
	`;
	let dialogOptions = {
		width: 500,
		height: 178,
		z: 1000,
	};
	return new Promise((resolve, reject) => {
		let dialog = new Dialog(
			{
				title: `Step 1 of 10: ${actor.type}'s 🤞 Destiny`,
				content: dialogContent,
				buttons: {
					ok: {
						label: "Confirm 🤞 Destiny",
						callback: async (html) => {
							let destinydice = html.find('[name="startdestiny"]').val();
							await Rolld10(actor, "Destiny", 0, destinydice);
							const total = actor.getFlag("metanthropes-system", "lastrolled").rolld10;
							await actor.update({ "system.Vital.Destiny.value": Number(total) });
							await actor.update({ "system.Vital.Destiny.max": Number(total) });
							await actor.update({ "system.metaowner.value": playername });
							console.log(`New Destiny: ${total}`);
							console.log(`New Actor Owner: ${playername}`);
							resolve();
						},
					},
					cancel: {
						label: "Cancel",
						callback: async () => {
							await actor.update({ "system.metaowner.value": null });
							reject();
						},
					},
				},
				default: "ok",
			},
			dialogOptions
		);
		dialog.render(true);
	});
}
export async function NewActorPrimeMetapower(actor) {
	let dialogContent = `
    <div class="metanthropes layout-metaroll-dialog">
        <h2>Choose your ${actor.type}'s Prime Ⓜ️ Metapower</h2>
        <form>
            <div class="form-group">
                <label for="primeimg">Prime Ⓜ️ Metapower:</label>
                <img id="primeimg" src="${
					actor.primeimg
				}" title="Choose your Prime Ⓜ️ Metapower" height="215" width="215" style="cursor:pointer;"/>
                <span id="primemetapower">${actor.primeimg.split("/").pop().replace(".png", "")}</span>
            </div>
        </form>
    </div>
    `;
	let dialogOptions = {
		width: 600,
		height: 360,
		index: 1000,
	};
	return new Promise((resolve, reject) => {
		let dialog = new Dialog(
			{
				title: `Step 2 of 10: ${actor.type}'s Prime Ⓜ️ Metapower`,
				content: dialogContent,
				buttons: {
					ok: {
						label: "Confirm Prime Ⓜ️ Metapower",
						callback: async (html) => {
							let primeimg = html.find("#primeimg").attr("src");
							let primemetapower = decodeURIComponent(primeimg.split("/").pop().replace(".png", ""));
							await actor.update({
								primeimg: primeimg,
								"system.entermeta.primemetapower.value": primemetapower,
							});
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
				render: (html) => {
					html.find("#primeimg").click((ev) => {
						new FilePicker({
							resource: "data",
							current: "systems/metanthropes-system/artwork/metapowers",
							displayMode: "thumbs",
							callback: (path) => {
								html.find("#primeimg").attr("src", path);
								let primemetapower = decodeURIComponent(path.split("/").pop().replace(".png", ""));
								html.find("#primemetapower").text(primemetapower);
							},
						}).browse();
					});
				},
			},
			dialogOptions
		);
		dialog.render(true);
	});
}
export async function NewActorCharacteristics(actor) {
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Choose your ${actor.type}'s 📊 Characteristics</h2>
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
	let dialogOptions = {
		width: 600,
		height: 240,
		index: 1000,
	};
	return new Promise((resolve, reject) => {
		let dialog = new Dialog(
			{
				title: `Step 3 of 10: ${actor.type}'s 📊 Characteristics`,
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
			},
			dialogOptions
		);
		dialog.render(true);
	});
}
export async function NewActorBodyStats(actor) {
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Choose your ${actor.type}'s Body 📊 Stats</h2>
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
	let dialogOptions = {
		width: 600,
		height: 240,
		index: 1000,
	};
	return new Promise((resolve, reject) => {
		let dialog = new Dialog(
			{
				title: `Step 4 of 10: ${actor.type}'s Body 📊 Stats`,
				content: dialogContent,
				buttons: {
					ok: {
						label: "Confirm & Roll Body 📊 Stats",
						callback: async (html) => {
							let char = "Body";
							let primary = html.find('[name="primary"]').val();
							let secondary = html.find('[name="secondary"]').val();
							let tertiary = html.find('[name="tertiary"]').val();
							try {
								await NewStatRoll(actor, char, primary, 3);
								await NewStatRoll(actor, char, secondary, 2);
								await NewStatRoll(actor, char, tertiary, 1);
								//? max life is already set after changing the initial endurance & body values, so we are setting the current life to the new max
								let maxlife = actor.system.Vital.Life.max;
								await actor.update({ [`system.Vital.Life.value`]: Number(maxlife) });
								resolve();
							} catch (error) {
								reject();
							}
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
						let secondaryOptions = ["Endurance", "Power", "Reflexes"].filter(
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
			},
			dialogOptions
		);
		dialog.render(true);
	});
}
export async function NewActorMindStats(actor) {
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Choose your ${actor.type}'s Mind 📊 Stats</h2>
		<form>
			<div class="form-group">
				<label for="primary">First Pick:</label>
				<select id="primary" name="primary">
					<option value="Perception">Perception</option>
					<option value="Manipulation">Manipulation</option>
					<option value="Creativity">Creativity</option>
				</select>
			</div>
			<div class="form-group">
				<label for="secondary">Second Pick:</label>
				<select id="secondary" name="secondary">
					<option value="Manipulation">Manipulation</option>
					<option value="Perception">Perception</option>
					<option value="Creativity">Creativity</option>
				</select>
			</div>
			<div class="form-group">
				<label for="tertiary">Third Pick:</label>
				<select id="tertiary" name="tertiary">
					<option value="Creativity">Creativity</option>
					<option value="Perception">Perception</option>
					<option value="Manipulation">Manipulation</option>
				</select>
			</div>
		</form>
	</div>
	`;
	let dialogOptions = {
		width: 600,
		height: 240,
		index: 1000,
	};
	return new Promise((resolve, reject) => {
		let dialog = new Dialog(
			{
				title: `Step 5 of 10: ${actor.type}'s Mind 📊 Stats`,
				content: dialogContent,
				buttons: {
					ok: {
						label: "Confirm & Roll Mind 📊 Stats",
						callback: async (html) => {
							let char = "Mind";
							let primary = html.find('[name="primary"]').val();
							let secondary = html.find('[name="secondary"]').val();
							let tertiary = html.find('[name="tertiary"]').val();
							try {
								await NewStatRoll(actor, char, primary, 3);
								await NewStatRoll(actor, char, secondary, 2);
								await NewStatRoll(actor, char, tertiary, 1);
								resolve();
							} catch (error) {
								reject();
							}
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
			},
			dialogOptions
		);
		dialog.render(true);
	});
}
export async function NewActorSoulStats(actor) {
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Choose your ${actor.type}'s Soul 📊 Stats</h2>
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
	let dialogOptions = {
		width: 600,
		height: 240,
		index: 1000,
	};
	return new Promise((resolve, reject) => {
		let dialog = new Dialog(
			{
				title: `Step 6 of 10: ${actor.type}'s Soul 📊 Stats`,
				content: dialogContent,
				buttons: {
					ok: {
						label: "Confirm & Roll Soul 📊 Stats",
						callback: async (html) => {
							let char = "Soul";
							let primary = html.find('[name="primary"]').val();
							let secondary = html.find('[name="secondary"]').val();
							let tertiary = html.find('[name="tertiary"]').val();
							try {
								await NewStatRoll(actor, char, primary, 3);
								await NewStatRoll(actor, char, secondary, 2);
								await NewStatRoll(actor, char, tertiary, 1);
								resolve();
							} catch (error) {
								reject();
							}
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
			},
			dialogOptions
		);
		dialog.render(true);
	});
}
export async function NewActorRoleplay(actor) {
	let dialogContent = `
		<div class="metanthropes layout-metaroll-dialog">
			<h2>Choose your ${actor.type}'s 🎭 Roleplay</h2>
			<form>
				<div class="form-group">
					<label for="RPbackground">Background:</label>
					<input type="text" id="RPbackground" name="RPbackground" value="${actor.type}'s Background">
				</div>
				<div class="form-group">
				<label for="RPmetamorphosis">Metamorphosis:</label>
				<select id="RPmetamorphosis" name="RPmetamorphosis">
					<option value="Cosmic Connection" selected>Cosmic Connection</option>
					<option value="Dark Pact">Dark Pact</option>
					<option value="Elemental Connection">Elemental Connection</option>
					<option value="Freak Accident">Freak Accident</option>
					<option value="Material Connection">Material Connection</option>
					<option value="Meta Bloodline">Meta Bloodline</option>
					<option value="Psychic Connection">Psychic Connection</option>
					<option value="Scientific Experiment">Scientific Experiment</option>
					<option value="Selective Evolution">Selective Evolution</option>
					<option value="Self-Made">Self-Made</option>
				</select>
			</div>
			<div class="form-group">
			<label for="RParc">Arc:</label>
			<select id="RParc" name="RParc">
				<option value="Architect" selected>Architect</option>
				<option value="Autocrat">Autocrat</option>
				<option value="Catalyst">Catalyst</option>
				<option value="Harmonizer">Harmonizer</option>
				<option value="Herald">Herald</option>
				<option value="Investigator">Investigator</option>
				<option value="Naturalist">Naturalist</option>
				<option value="Predator">Predator</option>
				<option value="Protector">Protector</option>
				<option value="Wayfarer">Wayfarer</option>
			</select>
		</div>
		<div class="form-group">
		<label for="RPregression">Regression:</label>
		<select id="RPregression" name="RPregression">
			<option value="Anachronism" selected>Anachronism</option>
			<option value="Artisan">Artisan</option>
			<option value="Beloveds">Beloveds</option>
			<option value="Consensus">Consensus</option>
			<option value="Disbelief">Disbelief</option>
			<option value="Heritage">Heritage</option>
			<option value="Materialism">Materialism</option>
			<option value="Overenthusiasm">Overenthusiasm</option>
			<option value="Persona">Persona</option>
			<option value="Suppressed">Suppressed </option>
		</select>
		</div>
		</form>
		</div>
		`;
	return new Promise((resolve, reject) => {
		let dialog = new Dialog({
			title: `Step 7 of 10: ${actor.type}'s 🎭 Roleplay`,
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm 🎭 Roleplay",
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
export async function NewActorProgression(actor) {
	let dialogContent = `
		<div class="metanthropes layout-metaroll-dialog">
			<h2>Choose your ${actor.type}'s 📈 Progression</h2>
			<form>
				<div class="form-group">
					<label for="startingxp">Starting 📈 Experience:</label>
					<input type="number" id="startingxp" name="startingxp" value="1000">
				</div>
				<div class="form-group">
					<label for="startingperks">Starting 📚 Perks:</label>
					<input type="number" id="startingperks" name="startingperks" value="2">
				</div>
			</form>
		</div>
		`;
	let dialogOptions = {
		width: 550,
		height: 210,
		index: 1000,
	};
	return new Promise((resolve, reject) => {
		let dialog = new Dialog(
			{
				title: `Step 8 of 10: ${actor.type}'s 📈 Progression`,
				content: dialogContent,
				buttons: {
					ok: {
						label: "Confirm 📈 Progression",
						callback: async (html) => {
							let startingxp = html.find('[name="startingxp"]').val();
							await actor.update({ "system.Vital.Experience.Total": Number(startingxp) });
							console.log(`${actor.type}'s Starting Experience: ${startingxp}`);
							let startingperks = html.find('[name="startingperks"]').val();
							//? setting the starting perks count to the database to be used later in determining XP costs
							await actor.update({ "system.Perks.Details.Starting.value": startingperks });
							console.log(`${actor.type}'s Starting Perks: ${startingperks}`);
							resolve();
						},
					},
					cancel: {
						label: "Cancel",
						callback: () => reject(),
					},
				},
				default: "ok",
			},
			dialogOptions
		);
		dialog.render(true);
	});
}
export async function NewActorSummary(actor) {
	let playername = game.user.name;
	let narratorname = game.users.activeGM.name;
	let dialogContent = `
		<div class="metanthropes layout-metaroll-dialog">
			<h2>Choose your ${actor.type}'s ✍️ Summary</h2>
			<form>
			<p>Protagonist Details:</p>
				<div class="form-group">
					<label for="actorname">Name: </label>
					<input type="text" id="actorname" name="actorname" value="${actor.type}'s Name">
				</div>
				<div class="form-group">
					<label for="actorgender">Gender: </label>
					<input type="text" id="actorgender" name="actorgender" value="">
				</div>
				<div class="form-group">
					<label for="actorage">Age: </label>
					<input class="style-container-input-charstat" type="number" id="actorage" name="actorage" value="">yr
				</div>
				<div class="form-group">
					<label for="actorheight">Height: </label>
					<input class="style-container-input-charstat" type="number" id="actorheight" name="actorheight" value="">m
				</div>
				<div class="form-group">
					<label for="actorweight">Weight: </label>
					<input class="style-container-input-charstat" type="number" id="actorweight" name="actorweight" value="">kg
				</div>
				<div class="form-group">
					<label for="actorpob">Place of Birth: </label>
					<input type="text" id="actorpob" name="actorpob" value="">
				</div>
				<p>Session Details:</p>
				<div class="form-group">
					<label for="narratorname">Narrator Name: </label>${narratorname}
				</div>
				<div class="form-group">
					<label for="playername">Player Name: </label>${playername}
				</div>
				<div class="form-group">
					<label for="saganame">Saga Name: </label>
					<input type="text" id="saganame" name="saganame" value="">
				</div>
				<div class="form-group">
					<label for="coalitionname">Coalition Name: </label>
					<input type="text" id="coalitionname" name="coalitionname" value="">
				</div>
				<div class="form-group">
					<label for="factionname">Faction Name: </label>
					<input type="text" id="factionname" name="factionname" value="">
				</div>
			</form>
		</div>
	`;
	return new Promise((resolve, reject) => {
		let dialog = new Dialog({
			title: `Step 9 of 10: ${actor.type}'s ✍️ Summary`,
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm ✍️ Summary",
					callback: async (html) => {
						let actorname = html.find('[name="actorname"]').val();
						await actor.update({ name: actorname });
						if (actor.type == "Protagonist") {
							await actor.update({ "prototypeToken.name": actorname });
						}
						console.log(`${actor.type}'s Name: ${actorname}`);
						let actorage = html.find('[name="actorage"]').val();
						await actor.update({ "system.Vital.age.value": Number(actorage) });
						console.log(`${actor.type}'s Age: ${actorage}`);
						let actorgender = html.find('[name="actorgender"]').val();
						await actor.update({ "system.humanoids.gender.value": actorgender });
						console.log(`${actor.type}'s Gender: ${actorgender}`);
						let actorheight = html.find('[name="actorheight"]').val();
						await actor.update({ "system.humanoids.height.value": Number(actorheight) });
						console.log(`${actor.type}'s Height: ${actorheight}`);
						let actorweight = html.find('[name="actorweight"]').val();
						await actor.update({ "system.humanoids.weight.value": Number(actorweight) });
						console.log(`${actor.type}'s Weight: ${actorweight}`);
						let actorpob = html.find('[name="actorpob"]').val();
						await actor.update({ "system.humanoids.birthplace.value": actorpob });
						console.log(`${actor.type}'s Place of Birth: ${actorpob}`);
						await actor.update({ "system.metaowner.value": playername });
						console.log(`${actor.type}'s Player Name: ${playername}`);
						await actor.update({ "system.entermeta.narrator.value": narratorname });
						console.log(`${actor.type}'s Narrator Name: ${narratorname}`);
						let saganame = html.find('[name="saganame"]').val();
						await actor.update({ "system.entermeta.sagas.value": saganame });
						console.log(`${actor.type}'s Saga Name: ${saganame}`);
						let coalitionname = html.find('[name="coalitionname"]').val();
						await actor.update({ "system.entermeta.coalition.value": coalitionname });
						console.log(`${actor.type}'s Coalition Name: ${coalitionname}`);
						let factionname = html.find('[name="factionname"]').val();
						await actor.update({ "system.entermeta.faction.value": factionname });
						console.log(`${actor.type}'s Faction Name: ${factionname}`);

						resolve();
					},
				},
				cancel: {
					label: "Cancel",
					callback: async () => {
						await actor.update({ "system.metaowner.value": null });
						reject();
					},
				},
			},
			default: "ok",
		});
		dialog.render(true);
	});
}
export async function NewActorFinish(actor) {
	let dialogContent = `
		<div class="metanthropes layout-metaroll-dialog">
			<h2>${actor.type}: ${actor.name} is ready to enter the Multiverse!</h2>
			<form>
            <div class="form-group">
                <label for="actorimg">${actor.type} Image:</label>
                <img id="actorimg" src="${actor.img}" title="Choose your ${actor.type}'s Image" height="320" width="320" style="cursor:pointer;"/>
            </div>
        </form>
		</div>
	`;
	let dialogOptions = {
		width: 520,
		height: 520,
		index: 1000,
	};
	return new Promise((resolve, reject) => {
		let dialog = new Dialog(
			{
				title: `Step 10 of 10: Enter Meta`,
				content: dialogContent,
				buttons: {
					ok: {
						label: "and so it begins...",
						callback: async (html) => {
							let actorimg = html.find("#actorimg").attr("src");
							await actor.update({
								img: actorimg,
							});
							ui.notifications.info(actor.name + " has entered the Multiverse!");
							resolve();
						},
					},
				},
				default: "ok",
				render: (html) => {
					html.find("#actorimg").click((ev) => {
						new FilePicker({
							resource: "data",
							current: "systems/metanthropes-system/artwork/tokens/portraits/",
							displayMode: "tiles",
							callback: (path) => {
								html.find("#actorimg").attr("src", path);
							},
						}).browse();
					});
				},
			},
			dialogOptions
		);
		dialog.render(true);
	});
}
