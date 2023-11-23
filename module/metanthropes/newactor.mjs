import { Rolld10 } from "../helpers/extrasroll.mjs";
import { MetapowersList } from "./metapowerlist.mjs";
import { metaLog } from "../helpers/metahelpers.mjs";
import { MetaDialog, metaFilePicker } from "../metanthropes/metaclasses.mjs";

//* newactor.mjs will be used to help in generating a new actor's stats and characteristics, along with other information.
//! Needs new CSS Classes
//todo char picks should drive/indicate which stat rolls should be prioritiezed
// narrator's right click na kanei show ena dialog me ola ta steps k dipla check box (default yes) gia ta poia steps thelei na ginoune random
// if anything is checked na kanei randomize ta reults aytou tou step.
// gia narrators episis prepei na kanw separate setup gia ta diafora alla types peran tou protagonist
// kai episis na kanw expand to new actor function gia na kanei pick mono ta relative fields analoga me to type tou actor

//* Finalizes a Premade Protagonist
export async function FinalizePremadeActor(actor) {
	const playerName = game.user.name;
	try {
		await NewActorControl(actor).catch((error) => {
			metaLog(2, "Finalize Premade Protagonist", "Error at NewActorControl:", error);
			throw error;
		});
		//todo: premade actor summary
		await NewPremadeSummary(actor).catch((error) => {
			metaLog(2, "Finalize Premade Protagonist", "Error at NewPremadeSummary:", error);
			throw error;
		});
		await NewActorFinish(actor).catch((error) => {
			metaLog(2, "Finalize Premade Protagonist", "Error at NewActorFinish:", error);
			throw error;
		});
		await Rolld10(actor, "Destiny", false, 1);
		const NewDestiny = await actor.getFlag("metanthropes-system", "lastrolled").rolld10;
		await actor.update({
			"system.Vital.Destiny.value": Number(NewDestiny),
			"system.Vital.Destiny.max": Number(NewDestiny),
		});
		metaLog(3, "Finalize Premade Protagonist", `${playerName}'s ${actor.type} Starting Destiny:`, NewDestiny);
	} catch (error) {
		metaLog(2, "Finalize Premade Protagonist", "Error:", error);
	} finally {
		//metaLog(3, "Finalize Premade Protagonist", "Creation Complete for:", `${playerName}'s`, actor.type, actor.name);
	}
}

//* New Actor Function
export async function NewActor(actor) {
	try {
		await NewActorControl(actor);
		if (actor.type !== "Vehicle") await NewActorDestiny(actor);
		if (actor.hasEnterMeta) await NewActorPrimeMetapower(actor);
		if (actor.hasCharacteristics) {
			await NewActorCharacteristics(actor);
			await NewActorBodyStats(actor);
			await NewActorMindStats(actor);
			await NewActorSoulStats(actor);
		}
		if (
			actor.type !== "Human" &&
			actor.type !== "Vehicle" &&
			actor.type !== "Animal" &&
			actor.type !== "Animated-Cadaver"
		) {
			await NewActorRoleplay(actor);
		}
		if (actor.type !== "Vehicle") await NewActorProgression(actor);
		await NewActorSummary(actor);
		await NewActorFinish(actor);
	} catch (error) {
		metaLog(2, "New Actor", "Error:", error);
		await actor.update({ "system.metaowner.value": null });
	} finally {
		metaLog(3, "New Actor", "Creation Complete for:", actor.type, actor.name);
	}
}

//* Give Control of an Actor to a Player, to allow showing the chat buttons for rerolls and execution
export async function NewActorControl(actor) {
	const playerName = game.user.name;
	await actor.update({ "system.metaowner.value": playerName });
}

//* Filter function for Prime Metapower Selection
function createFilterDropdown(id, options) {
	let dropdown = document.createElement("select");
	dropdown.id = id;
	let anyOption = document.createElement("option");
	anyOption.value = "Any";
	anyOption.text = "Any";
	dropdown.appendChild(anyOption);
	options.forEach((optionValue) => {
		let option = document.createElement("option");
		option.value = optionValue;
		option.text = optionValue;
		dropdown.appendChild(option);
	});
	return dropdown;
}

export async function NewStatRoll(actor, char, stat, dice) {
	return new Promise((resolve, reject) => {
		Rolld10(actor, stat, true, dice, null, 0, false);
		let statcontent = `
			<div class="metanthropes layout-metaroll-dialog">
				<h3>Confirm your ${actor.type}'s ${stat} 📊 Stat</h3>
			</div>
			`;
		let dialogstat = new MetaDialog({
			title: `${actor.type}'s ${char} 📊 Stats`,
			content: statcontent,
			buttons: {
				ok: {
					label: `Confirm ${stat} 📊 Stat`,
					callback: async () => {
						let statScore = actor.getFlag("metanthropes-system", "lastrolled").rolld10;
						await actor.update({
							[`system.Characteristics.${char}.Stats.${stat}.Initial`]: Number(statScore),
						});
						metaLog(
							3,
							"NewStatRoll",
							`${actor.name}'s new ${stat} Initial Score:`,
							actor.system.Characteristics[char].Stats[stat].Initial
						);
						resolve();
					},
				},
			},
			default: "ok",
		});
		dialogstat.render(true);
	});
}

export async function NewActorDestiny(actor) {
	//? we will store the player's name as declared by the Gamemaster in the World User Settings
	const playerName = game.user.name;
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h3>Choose your ${actor.type}'s 🤞 Destiny</h3>
		<form>
			<div class="form-group">
				<label for="destiny" title="Destiny (🤞) is a resource which Players can spend to reroll any roll with an undesirable outcome, activate powerful Metapowered effects, and even save their Protagonists from dying. Your Narrator will inform you what to enter here">🤞 Destiny Dice:</label>
				<input type="number" id="startdestiny" name="startdestiny" value="3">
			</div>
		</form>
	</div>
	`;
	let dialogOptions = {
		width: 500,
		height: 178,
	};
	return new Promise((resolve, reject) => {
		let dialog = new MetaDialog(
			{
				title: `Step 1 of 10: ${actor.type} 🤞 Destiny`,
				content: dialogContent,
				buttons: {
					ok: {
						label: "Confirm 🤞 Destiny",
						callback: async (html) => {
							let destinydice = html.find('[name="startdestiny"]').val();
							await Rolld10(actor, "Destiny", false, destinydice);
							const NewDestiny = actor.getFlag("metanthropes-system", "lastrolled").rolld10;
							await actor.update({
								"system.Vital.Destiny.value": Number(NewDestiny),
								"system.Vital.Destiny.max": Number(NewDestiny),
								"system.metaowner.value": playerName,
							});
							metaLog(4, "NewActorDestiny", "New Actor Owner:", playerName);
							metaLog(3, "NewActorDestiny", `${playerName}'s ${actor.type} Destiny:`, NewDestiny);
							resolve();
						},
					},
					cancel: {
						label: "Cancel",
						callback: async () => {
							await actor.update({ "system.metaowner.value": null });
							reject("User Canceled");
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
		<h3>Choose your ${actor.type}'s<br>Prime Ⓜ️ Metapower</h3>
		<form>
			<div class="form-group">
			<label for="classification" title="Each Classification includes Metapowers which have a similar role and utilize capabilities and functions in a similar manner">🔣 Classification:</label>
			<select id="classification">
				<option value="">All</option>
				${[...new Set(MetapowersList.map((m) => m.classification))]
					.sort()
					.map((c) => `<option value="${c}">${c}</option>`)
					.join("")}
			</select>
			</div>
			<div class="form-group">
			<label for="energyType" title="Energy Type dictates the Damage and other properties of an effect. Energy Types additionally influence the spending of Experience for unlocking and advancing new Metapowers">✨ Energy Type:</label>
			<select id="energyType">
			<option value="">All</option>
			${[...new Set(MetapowersList.map((m) => m.energyType))]
				.sort()
				.map((e) => `<option value="${e}">${e}</option>`)
				.join("")}
			</select>
			</div>
			<div class="form-group">
			<label for="statRolled" title="Which Stat is rolled when Activating this Metapower">🎲 Stat Rolled:</label>
			<select id="statRolled">
				<option value="">All</option>
				${[...new Set(MetapowersList.map((m) => m.statRolled))]
					.sort()
					.map((s) => `<option value="${s}">${s}</option>`)
					.join("")}
			</select>
			</div>
			<div class="form-group">
			<label for="primeMetapower" title="Each Metanthrope Character begins the game with one level in their first Metapower, called Prime Metapower. No other additional Metapower unlocked can be higher-level than the level of the Prime Metapower. The Classification and the Energy type of the Protagonist's Prime Metapower will influence the Experience cost of unlocking and advancing other Metapowers">Prime Ⓜ️ Metapower:</label>
			<select id="primeMetapower">
				${MetapowersList.map((m) => m.name)
					.sort()
					.map((name) => `<option value="${name}">${name}</option>`)
					.join("")}
			</select>
			</div>
			<div class="form-group">
				<label for="primeMetapowerImg"></label>
				<img id="primeMetapowerImg" src="systems/metanthropes-system/artwork/metapowers/6th Sense.webp" alt="Prime Metapower Image" style="border: none; z-index: 3;" height="256" width="256" />
			</div>
		</form>
	</div>
	`;
	let dialogOptions = {
		width: 485,
		height: 550,
	};
	return new Promise((resolve, reject) => {
		let dialog = new MetaDialog(
			{
				title: `Step 2 of 10: ${actor.type} Prime Ⓜ️ Metapower`,
				content: dialogContent,
				buttons: {
					ok: {
						label: "Confirm Prime Ⓜ️ Metapower",
						callback: async (html) => {
							let primeMetapowerName = html.find("#primeMetapower").val();
							let primeMetapower = MetapowersList.find((m) => m.name === primeMetapowerName);
							await actor.update({
								"system.entermeta.primemetapower.value": primeMetapowerName,
								primeimg: `systems/metanthropes-system/artwork/metapowers/${primeMetapowerName}.png`,
							});
							metaLog(3, "NewActorPrimeMetapower", `New Prime Metapower:`, primeMetapowerName);
							resolve();
						},
					},
				},
				default: "ok",
				render: (html) => {
					//? Get dropdown for Prime Metapower selection
					let primeMetapowerDropdown = html.find("#primeMetapower")[0];
					//? Get dropdowns for filters
					let classificationDropdown = html.find("#classification")[0];
					let energyTypeDropdown = html.find("#energyType")[0];
					let statRolledDropdown = html.find("#statRolled")[0];
					//? Filter function
					html.find("#classification, #energyType, #statRolled").change(() => {
						let selectedClassification = classificationDropdown.value;
						let selectedEnergyType = energyTypeDropdown.value;
						let selectedStatRolled = statRolledDropdown.value;
						let filteredMetapowers = MetapowersList.filter(
							(metapower) =>
								(!selectedClassification || metapower.classification === selectedClassification) &&
								(!selectedEnergyType || metapower.energyType === selectedEnergyType) &&
								(!selectedStatRolled || metapower.statRolled === selectedStatRolled)
						);
						//? Update Prime Metapower dropdown options
						primeMetapowerDropdown.innerHTML = "";
						filteredMetapowers.forEach((metapower, index) => {
							let option = document.createElement("option");
							option.value = metapower.name;
							option.text = metapower.name;
							primeMetapowerDropdown.appendChild(option);
						});
					});
					//? Update Prime Metapower image
					html.find("#primeMetapower").change(() => {
						let primeMetapowerName = primeMetapowerDropdown.value;
						//? making sure the value is not empty before proceeding
						if (primeMetapowerName) {
							let primeMetapowerImg = html.find("#primeMetapowerImg")[0];
							primeMetapowerImg.src = `systems/metanthropes-system/artwork/metapowers/${primeMetapowerName}.webp`;
						}
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
		<h3>Choose your ${actor.type}'s 📊 Characteristics</h3>
		<form>
			<div class="form-group">
				<label for="primary">First Pick:</label>
				<select id="primary" name="primary">
					<option value="Body" title="${actor.system.Characteristics.Body.Title}" selected>Body</option>
					<option value="Mind" title="${actor.system.Characteristics.Mind.Title}" >Mind</option>
					<option value="Soul" title="${actor.system.Characteristics.Soul.Title}">Soul</option>
				</select>
			</div>
			<div class="form-group">
				<label for="secondary">Second Pick:</label>
				<select id="secondary" name="secondary">
					<option value="Mind" title="${actor.system.Characteristics.Mind.Title}" selected>Mind</option>
					<option value="Body" title="${actor.system.Characteristics.Body.Title}">Body</option>
					<option value="Soul" title="${actor.system.Characteristics.Soul.Title}">Soul</option>
				</select>
			</div>
			<div class="form-group">
				<label for="tertiary">Third Pick:</label>
				<select id="tertiary" name="tertiary">
					<option value="Soul" title="${actor.system.Characteristics.Soul.Title}" selected>Soul</option>
					<option value="Body" title="${actor.system.Characteristics.Body.Title}">Body</option>
					<option value="Mind" title="${actor.system.Characteristics.Mind.Title}">Mind</option>
				</select>
			</div>
		</form>
	</div>
	`;
	let dialogOptions = {
		width: 600,
		height: 240,
	};
	return new Promise((resolve, reject) => {
		let dialog = new MetaDialog(
			{
				title: `Step 3 of 10: ${actor.type} 📊 Characteristics`,
				content: dialogContent,
				buttons: {
					ok: {
						label: "Confirm 📊 Characteristics",
						callback: async (html) => {
							let primary = html.find('[name="primary"]').val();
							let secondary = html.find('[name="secondary"]').val();
							let tertiary = html.find('[name="tertiary"]').val();
							await actor.update({
								[`system.Characteristics.${primary}.Initial`]: Number(30),
								[`system.Characteristics.${secondary}.Initial`]: Number(20),
								[`system.Characteristics.${tertiary}.Initial`]: Number(10),
							});
							metaLog(
								3,
								"NewActorCharacteristics",
								`New Primary:`,
								primary,
								actor.system.Characteristics[primary].Initial,
								`New Secondary:`,
								secondary,
								actor.system.Characteristics[secondary].Initial,
								`New Tertiary:`,
								tertiary,
								actor.system.Characteristics[tertiary].Initial
							);
							resolve();
						},
					},
				},
				default: "ok",
				render: (html) => {
					//? Add event listeners to dynamically update the options in the Secondary and Tertiary dropdowns
					html.find('[name="primary"]').change((event) => {
						//? Update the options in the Secondary dropdown based on the Primary selection
						let primary = event.target.value;
						let secondaryOptions = ["Body", "Mind", "Soul"].filter((option) => option !== primary);
						let secondaryDropdown = html.find('[name="secondary"]');
						secondaryDropdown.empty();
						secondaryOptions.forEach((option) => {
							secondaryDropdown.append(new Option(option, option));
						});
						//? Trigger a change event to update the Tertiary dropdown
						secondaryDropdown.trigger("change");
					});
					html.find('[name="secondary"]').change((event) => {
						//? Update the options in the Tertiary dropdown based on the Secondary selection
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
		<h3>Choose your ${actor.type}'s Body 📊 Stats</h3>
		<form>
			<div class="form-group">
				<label for="primary">First Pick:</label>
				<select id="primary" name="primary">
					<option value="Endurance" title="${actor.system.Characteristics.Body.Stats.Endurance.Title}" selected>Endurance</option>
					<option value="Power" title="${actor.system.Characteristics.Body.Stats.Power.Title}">Power</option>
					<option value="Reflexes" title="${actor.system.Characteristics.Body.Stats.Reflexes.Title}">Reflexes</option>
				</select>
			</div>
			<div class="form-group">
				<label for="secondary">Second Pick:</label>
				<select id="secondary" name="secondary">
					<option value="Power" title="${actor.system.Characteristics.Body.Stats.Power.Title}" selected>Power</option>
					<option value="Endurance" title="${actor.system.Characteristics.Body.Stats.Endurance.Title}">Endurance</option>
					<option value="Reflexes" title="${actor.system.Characteristics.Body.Stats.Reflexes.Title}">Reflexes</option>
				</select>
			</div>
			<div class="form-group">
				<label for="tertiary">Third Pick:</label>
				<select id="tertiary" name="tertiary">
					<option value="Reflexes" title="${actor.system.Characteristics.Body.Stats.Reflexes.Title}"selected>Reflexes</option>
					<option value="Endurance" title="${actor.system.Characteristics.Body.Stats.Endurance.Title}">Endurance</option>
					<option value="Power" title="${actor.system.Characteristics.Body.Stats.Power.Title}">Power</option>
				</select>
			</div>
		</form>
	</div>
	`;
	let dialogOptions = {
		width: 600,
		height: 240,
	};
	return new Promise((resolve, reject) => {
		let dialog = new MetaDialog(
			{
				title: `Step 4 of 10: ${actor.type} Body 📊 Stats`,
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
				},
				default: "ok",
				render: (html) => {
					//? Add event listeners to dynamically update the options in the Secondary and Tertiary dropdowns
					html.find('[name="primary"]').change((event) => {
						//? Update the options in the Secondary dropdown based on the Primary selection
						let primary = event.target.value;
						let secondaryOptions = ["Endurance", "Power", "Reflexes"].filter(
							(option) => option !== primary
						);
						let secondaryDropdown = html.find('[name="secondary"]');
						secondaryDropdown.empty();
						secondaryOptions.forEach((option) => {
							secondaryDropdown.append(new Option(option, option));
						});
						//? Trigger a change event to update the Tertiary dropdown
						secondaryDropdown.trigger("change");
					});
					html.find('[name="secondary"]').change((event) => {
						//? Update the options in the Tertiary dropdown based on the Secondary selection
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
		<h3>Choose your ${actor.type}'s Mind 📊 Stats</h3>
		<form>
			<div class="form-group">
				<label for="primary">First Pick:</label>
				<select id="primary" name="primary">
					<option value="Perception" title="${actor.system.Characteristics.Mind.Stats.Perception.Title}">Perception</option>
					<option value="Manipulation" title="${actor.system.Characteristics.Mind.Stats.Manipulation.Title}">Manipulation</option>
					<option value="Creativity" title="${actor.system.Characteristics.Mind.Stats.Creativity.Title}">Creativity</option>
				</select>
			</div>
			<div class="form-group">
				<label for="secondary">Second Pick:</label>
				<select id="secondary" name="secondary">
					<option value="Manipulation" title="${actor.system.Characteristics.Mind.Stats.Manipulation.Title}">Manipulation</option>
					<option value="Perception" title="${actor.system.Characteristics.Mind.Stats.Perception.Title}">Perception</option>
					<option value="Creativity" title="${actor.system.Characteristics.Mind.Stats.Creativity.Title}">Creativity</option>
				</select>
			</div>
			<div class="form-group">
				<label for="tertiary">Third Pick:</label>
				<select id="tertiary" name="tertiary">
					<option value="Creativity" title="${actor.system.Characteristics.Mind.Stats.Creativity.Title}">Creativity</option>
					<option value="Perception" title="${actor.system.Characteristics.Mind.Stats.Perception.Title}">Perception</option>
					<option value="Manipulation" title="${actor.system.Characteristics.Mind.Stats.Manipulation.Title}">Manipulation</option>
				</select>
			</div>
		</form>
	</div>
	`;
	let dialogOptions = {
		width: 600,
		height: 240,
	};
	return new Promise((resolve, reject) => {
		let dialog = new MetaDialog(
			{
				title: `Step 5 of 10: ${actor.type} Mind 📊 Stats`,
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
				},
				default: "ok",
				render: (html) => {
					//? Add event listeners to dynamically update the options in the Secondary and Tertiary dropdowns
					html.find('[name="primary"]').change((event) => {
						//? Update the options in the Secondary dropdown based on the Primary selection
						let primary = event.target.value;
						let secondaryOptions = ["Perception", "Manipulation", "Creativity"].filter(
							(option) => option !== primary
						);
						let secondaryDropdown = html.find('[name="secondary"]');
						secondaryDropdown.empty();
						secondaryOptions.forEach((option) => {
							secondaryDropdown.append(new Option(option, option));
						});
						//? Trigger a change event to update the Tertiary dropdown
						secondaryDropdown.trigger("change");
					});
					html.find('[name="secondary"]').change((event) => {
						//? Update the options in the Tertiary dropdown based on the Secondary selection
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
		<h3>Choose your ${actor.type}'s Soul 📊 Stats</h3>
		<form>
			<div class="form-group">
				<label for="primary">First Pick:</label>
				<select id="primary" name="primary">
					<option value="Willpower" title="${actor.system.Characteristics.Soul.Stats.Willpower.Title}" selected>Willpower</option>
					<option value="Consciousness" title="${actor.system.Characteristics.Soul.Stats.Consciousness.Title}">Consciousness</option>
					<option value="Awareness" title="${actor.system.Characteristics.Soul.Stats.Awareness.Title}">Awareness</option>
				</select>
			</div>
			<div class="form-group">
				<label for="secondary">Second Pick:</label>
				<select id="secondary" name="secondary">
					<option value="Consciousness" title="${actor.system.Characteristics.Soul.Stats.Consciousness.Title}" selected>Consciousness</option>
					<option value="Willpower" title="${actor.system.Characteristics.Soul.Stats.Willpower.Title}">Willpower</option>
					<option value="Awareness" title="${actor.system.Characteristics.Soul.Stats.Awareness.Title}">Awareness</option>
				</select>
			</div>
			<div class="form-group">
				<label for="tertiary">Third Pick:</label>
				<select id="tertiary" name="tertiary">
					<option value="Awareness" title="${actor.system.Characteristics.Soul.Stats.Awareness.Title}" selected>Awareness</option>
					<option value="Willpower" title="${actor.system.Characteristics.Soul.Stats.Willpower.Title}">Willpower</option>
					<option value="Consciousness" title="${actor.system.Characteristics.Soul.Stats.Consciousness.Title}">Consciousness</option>
				</select>
			</div>
		</form>
	</div>
	`;
	let dialogOptions = {
		width: 600,
		height: 240,
	};
	return new Promise((resolve, reject) => {
		let dialog = new MetaDialog(
			{
				title: `Step 6 of 10: ${actor.type} Soul 📊 Stats`,
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
				},
				default: "ok",
				render: (html) => {
					//? Add event listeners to dynamically update the options in the Secondary and Tertiary dropdowns
					html.find('[name="primary"]').change((event) => {
						//? Update the options in the Secondary dropdown based on the Primary selection
						let primary = event.target.value;
						let secondaryOptions = ["Willpower", "Consciousness", "Awareness"].filter(
							(option) => option !== primary
						);
						let secondaryDropdown = html.find('[name="secondary"]');
						secondaryDropdown.empty();
						secondaryOptions.forEach((option) => {
							secondaryDropdown.append(new Option(option, option));
						});
						//? Trigger a change event to update the Tertiary dropdown
						secondaryDropdown.trigger("change");
					});
					html.find('[name="secondary"]').change((event) => {
						//? Update the options in the Tertiary dropdown based on the Secondary selection
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
			<h3>Choose your ${actor.type}'s 🎭 Roleplay</h3>
			<form>
				<div class="form-group">
					<label for="RPbackground" title="A Character's Background is who or what that Character used to be prior to becoming a Metanthrope">Background:</label>
					<input type="text" id="RPbackground" name="RPbackground" value="${actor.type}'s Background">
				</div>
				`;
	if (actor.hasEnterMeta) {
		dialogContent += `
				<div class="form-group">
					<label for="RPmetamorphosis" title="The Metamorphosis is a pivotal moment that defines how, when, why, and under what circumstances your Protagonist crosses the threshold from being a human to becoming a Metanthrope">Metamorphosis:</label>
					<select id="RPmetamorphosis" name="RPmetamorphosis">
						<option value="Cosmic Connection" title="Your Metapowers are bestowed upon you by a cosmic source that exists beyond the confines of this world. The origin of your Cosmic Connection could be extraterrestrial or extradimensional in nature. Your Metamorphosis may have been triggered by an encounter with a cosmic phenomenon, interaction with a Spirit from another Dimension, a comet passing by, celestial alignment, or communication with an alien species, among other otherworldly sources. Since your Metamorphosis, you have been introduced to a vast and unfamiliar world, to which you feel a deep and profound connection" selected>Cosmic Connection</option>
						<option value="Dark Pact" title="Through greed, coercion, or desperate circumstances, you have entered into a binding agreement with a malevolent entity, forging a Dark Pact that grants you Metapowers. The source of your newfound abilities is a mysterious being with overwhelming capabilities that has chosen to bestow you with a portion of its power. Your Metamorphosis may have been a conscious choice, a bargain struck to gain Metapowers, or you may have been thrust into the Pact without fully understanding its implications. This Dark Pact has irrevocably changed you, granting you extraordinary abilities that always come with a price">Dark Pact</option>
						<option value="Elemental Connection" title="Your Metapowers derive from the very planet you inhabit or from neighboring celestial bodies such as the moon or the sun. It could be the result of encountering a powerful storm in the middle of the ocean, discovering a mystical cave deep within the earth, consuming a strange fruit found in the jungle, encountering a unique creature in a forest, or connecting with the energy of the atmosphere. This Elemental Connection may have been established through a rare and singular event or through an ongoing affinity with a particular element, plant, animal, or the circle of life">Elemental Connection</option>
						<option value="Freak Accident" title="Your transformation into a Metanthrope is the result of a series of unforeseen and random events, known as a Freak Accident. This sudden and unexpected occurrence could be triggered by a temporal anomaly, a quantum confluence, an unpredictable series of events, exposed to radioactive energy, or even collateral damage in a conflict between Omnipowered beings. The Freak Accident abruptly and irrevocably changes your life, leaving everyone astonished by the transformation, as it appears to be outside of anyone's machinations">Freak Accident</option>
						<option value="Material Connection" title="Your Metapowers are derived from a tangible source found within the Material Dimension, such as an object made of physical matter. It could be a cursed amulet, a lucky coin, or an ancient artifact with mystical properties. Alternatively, the Material Connection could be linked to any technological means, such as a high-tech gadget, a weapon, or a piece of armor.  This connection could have been established by interacting with an item, vising a physical location, or utilizing any piece of technology to unlock your Metapowers">Material Connection</option>
						<option value="Meta Bloodline" title="Your Metanthrope status is rooted in your bloodline, with the Metapowers flowing within your veins from generations past. Whether you were born with these abilities or unlocked them later in life, they are an innate part of you. The lineage of Metanthropes in your family tree, whether known or unknown, plays a significant role in your Metamorphosis. It connects you to a heritage that can be traced back to the origins of these extraordinary powers, and you have the potential to pass them down to future generations">Meta Bloodline</option>
						<option value="Psychic Connection" title="Your Metapowers originate from the intangible and unseen realms, specifically from a Psychic Connection that exists within your mind or any Psychic-based Dimension. This connection could manifest as telepathic communication with an mysterious entity or a collective consciousness, hearing a voice during meditation or prayer, being the receiver of a signal emission, or experiencing dreams that materialize into reality. The source of your Psychic Connection may have an influence on your actions or simply act as a transmitter of powerful Psychic energies, the reasons for which remain unknown to you">Psychic Connection</option>
						<option value="Scientific Experiment" title="Your transformation into a Metanthrope is the result of a Scientific Experiment conducted on you. Whether as a willing volunteer or a coerced participant, you became the subject of experimental procedures or treatments that unlocked your Metapowers. The circumstances surrounding your Scientific Experiment could range from unexpected positive results to unforeseen consequences, to an experiment gone wrong. You may have been the first test subject, known as patient zero, subjected to years of experimentation. The experiment could be biogenetic, or cybernetic in nature, or tampering with forces unknown">Scientific Experiment</option>
						<option value="Selective Evolution" title="Your Metanthrope existence is the result of a significant leap in evolution. Due to a rare genetic mutation, your DNA contains the encrypted secrets of your incredible abilities. Your Metapowers might have manifested at adolescence, or after a specific event in your life, that pushed you to your limits. You may be part of a new generation of Metapowered people, or the first of your kind, representing the next step in the evolutionary chain. Your Metapowers are innate, evolved on their own, and an integral part of your being, forever tying you to the evolution of your species">Selective Evolution</option>
						<option value="Self-Made" title="You are solely responsible for your Metapowers, which you have achieved through your own efforts and ingenuity. Whether through a spiritual awakening, intense training, a ritualistic encounter, or devotion to a specific practice, you have intentionally and purposefully become a Metanthrope. You are the sole responsible for unlocking your Metapowers, and you have achieved it through hard work, and dedication. By unveiling your abilities to the world, you also reveal your method of becoming a Metanthrope, which may be unique to you and potentially coveted or exploited by others">Self-Made</option>
					</select>
				</div>
				`;
	}
	dialogContent += `
				<div class="form-group">
					<label for="RParc" title="Arc represents the fundamental concept, behavioral patterns, goals, daily agenda, and core beliefs of a Metanthrope. It defines how your Protagonist acts in various situations, establishes their hierarchies during conflicts, determines the ideologies they support in dialogues, and guides their use of Metapowers to achieve their objectives. The Arc embodies the archetype your Protagonist represents">Arc:</label>
					<select id="RParc" name="RParc">
						<option value="Architect" title="You are a creator and innovator, able to conceive groundbreaking designs and pioneer the blueprints of the future. You yearn to construct everlasting structures, develop innovative devices, and establish new theories. As an Architect, your purpose is to solve problems by offering fresh solutions, articulating your ideas, and bringing them to life" selected>Architect</option>
						<option value="Autocrat" title="Your destiny is to rule over humans and Metanthropes alike, under a single banner and cause - your own. You always gravitate towards commanding roles and embrace the responsibilities of decision-making. The weight of leadership may be heavy, but you believe that you are the only one worthy of shouldering it. This world deserves better leadership, and it is your destiny to provide it">Autocrat</option>
						<option value="Catalyst" title="As a Catalyst, your driving force is to seek profound change and transformation, both within yourself and in the environment and people around you. You are constantly pushing for progress, challenging the status quo, and catalyzing shifts in beliefs, systems, and ideologies. For you nothing remains static, and old institutions must undergo profound change. Your purpose is to ignite a spark of revolution in others and reshape the world">Catalyst</option>
						<option value="Harmonizer" title="As a Harmonizer, you are focused on promoting unity, stability, and collaboration within Metanthrope and human society, as well as any other factions. You strive to bridge divides and find common ground, even in the face of deep-seated conflicts. Your ultimate goal is to bring together disparate groups, foster understanding, and create a harmonious coexistence that benefits all">Harmonizer</option>
						<option value="Herald" title="You possess profound knowledge that others do not, becoming the bearer of important tidings. It is your role to inform the rest of the world about upcoming changes, threats, or opportunities. Whether you are a prophet of impending disaster or an evangelist of the new world order, it is your task to convince others to heed your call">Herald</option>
						<option value="Investigator" title="You possess a natural inclination towards investigation and have a keen eye for solving mysteries. Every enigma you encounter is a case to be solved. Your purpose is to delve into the research, study, uncover clues, connect the dots, and unravel the puzzles presented to you. Since your Metamorphosis, you have been exposed to a plethora of cosmic secrets and paradoxes, and you are driven to solve them">Investigator</option>
						<option value="Naturalist" title="As a Naturalist, you have fully embraced the primordial way and the connection with the untamed forces of nature. You find solace and purpose in the raw beauty and wisdom of the natural world. Your heart beats in symphony with the rhythms of the earth, and you hold a deep reverence for the delicate balance of nature. Your mission is to protect and preserve the natural order, advocating for the well-being of animals, plants, and ecosystems">Naturalist</option>
						<option value="Predator" title="As a Predator, you possess a primal mindset that does not fit within civilized society. Your yearning is to become the apex predator, dominating the food chain wherever you find yourself. The awakening of your Metanthrope status has unleashed the feral hunter within you, and everyone you meet is potential prey. The world becomes your domain, and you live for the thrill of the hunt">Predator</option>
						<option value="Protector" title="As a Protector, the Metapowers bestowed upon you serve a noble purpose: to protect those who cannot protect themselves. You stand vigilant in the face of any threat, regardless of the odds. Defending those you care about is its own reward, and it is your duty to be there when they are in need, shielding them from harm at any cost">Protector</option>
						<option value="Wayfarer" title="As a Wayfarer, your purpose as a Metanthrope is to explore new lands, planets, star systems, galaxies, and Dimensions. Nothing holds you back from boldly venturing into uncharted territories. Your quest is to witness indescribable celestial phenomena and be the first to visit undiscovered landscapes of this world and beyond">Wayfarer</option>
					</select>
				</div>
				`;
	if (actor.hasEnterMeta) {
		dialogContent += `
				<div class="form-group">
					<label for="RPregression" title="Regression is a fundamental aspect of a Metanthrope's existence, representing their connection to their human origins. It encompasses the reversion to human behaviors, quirks, and attachments that persist despite their ascension. Regressions can manifest as unique knacks, idiosyncrasies, nostalgic attachments, or self-imposed restrictions. It is important to recognize that Regression is not considered a weakness, as it can be a source of strength, adding depth, drama, complexity, and inner conflict to a Metanthrope's roleplay. Every Metanthrope possesses a Regression, whether they openly embrace it, keep it hidden, or are unaware of its existence">Regression:</label>
					<select id="RPregression" name="RPregression">
						<option value="Anachronism" title="The Anachronism Regression manifests as an anachronistic attachment, a deep affinity for a specific time period or historical era. This attachment is not limited to the past but could extend to the future instead. Metanthropes with this Regression are drawn to the customs, fashion, art, and ideals of their chosen era. Their anachronistic tendencies are evident in their appearance, speech, and choice of activities, making them stand out from others" selected>Anachronism</option>
						<option value="Artisan" title="As a Metanthrope with the Artisan Regression, you find solace and fulfillment in pursuing a hobby or talent that has nothing to do with your Metapowers. Whether it's singing, writing, painting, or any other creative pursuit, this passion provides you with a sense of balance and a connection to your human side. Amidst the complexities of your new existence, you hold onto the simplicity and joy that this hobby brings">Artisan</option>
						<option value="Beloveds" title="Your love interest is the most important thing in your life. It can be your significant other, , your human family or best friend, or even your pet. You hold your loved ones in higher esteem than even your Coalition, your Metanthrope status, or even your own life. Others might misunderstand your reasoning, your motives, and your methods, but they may never have felt the way you do about your beloved">Beloveds</option>
						<option value="Consensus" title="You are greatly concerned with your reputation and how humans view Metanthropes. It is paramount that Metanthropes are seen in a positive light and maintain a good relationship with the humans of the world they share. You must clean up the messes caused by Metanthropes that do not share your values, and sometimes, this may involve concealing massive scandals that have the potential to taint the Metanthrope reputation">Consensus</option>
						<option value="Disbelief" title="You are in a state of disbelief regarding the latest events happening in your life. Ever since the incident, which others call your Metamorphosis, you witness and experience unexplainable things. Even if Metanthropes are real, you do not feel like you are one of them. You could be hallucinating, the victim of an elaborate prank, trapped in a dream, or simply questioning your sanity">Disbelief</option>
						<option value="Heritage" title="With the Heritage Regression, you maintain a deep connection to your cultural or ancestral roots. The traditions, customs, and values of your Heritage hold great significance for you, serving as a source of your identity. Your upbringing and cultural background continues to shape your worldview and influence your actions. The legacy of your forebears resonates within you, guiding your values, choices, and sense of self">Heritage</option>
						<option value="Materialism" title="You are a slave to your unquenching thirst for material wealth. You are drawn to commodities, money, gems, souvenirs, trinkets, indulgences, and gadgets. With your Metapowers, you can now have the things you craved as a human: luxurious commodities, a lavish lifestyle, and all the marbles. You can finally use your newfound Metapowers to obtain everything you ever wanted">Materialism</option>
						<option value="Overenthusiasm" title="Turning out to be a Metanthrope was the best thing that ever happened to you, by far. You do not understand how each other Metanthrope is not equally thrilled about having Metapowers. From a young age, you yearned to have extraordinary abilities and continued daydreaming about superpowers as an adult. Now you cannot wait to share your enthusiasm with the rest of your kin and the whole world too">Overenthusiasm</option>
						<option value="Persona" title="Each time you publicly present yourself as a Metanthrope or activate your Metapowers in the presence of others, you must do so under an alias, an alter ego, or a secret identity - your Persona. You must use your Persona to hide from society. You must make sure no one finds out your identity, leave no clue to trace back to you, and no witnesses who can expose your identity">Persona</option>
						<option value="Suppressed" title="You are afraid to use your Metapowers. Like a cannon made of glass, as soon as you fire, you feel as if you are going to crack. You envy other Metanthropes who use their Metapowers freely without consequences because, for you, there is always a price to pay when activating them. Using your Metapowers always takes a toll on you, and possibly others">Suppressed </option>
					</select>
				</div>
				`;
	}
	dialogContent += `
			</form>
		</div>
		`;
	return new Promise((resolve, reject) => {
		let dialog = new MetaDialog({
			title: `Step 7 of 10: ${actor.type} 🎭 Roleplay`,
			content: dialogContent,
			buttons: {
				ok: {
					label: "Confirm 🎭 Roleplay",
					callback: async (html) => {
						let RPbackgroundpick = html.find('[name="RPbackground"]').val();
						let RPmetamorphosispick = html.find('[name="RPmetamorphosis"]').val();
						let RParcpick = html.find('[name="RParc"]').val();
						let RPregressionpick = html.find('[name="RPregression"]').val();
						if (actor.hasEnterMeta) {
							await actor.update({
								"system.Vital.background.value": RPbackgroundpick,
								"system.entermeta.metamorphosis.value": RPmetamorphosispick,
								"system.Vital.arc.value": RParcpick,
								"system.entermeta.regression.value": RPregressionpick,
							});
						} else {
							await actor.update({
								"system.Vital.background.value": RPbackgroundpick,
								"system.Vital.arc.value": RParcpick,
							});
						}
						metaLog(
							3,
							"NewActorRoleplay",
							"New Background:",
							RPbackgroundpick,
							"New Metamorphosis:",
							RPmetamorphosispick,
							"New Arc:",
							RParcpick,
							"New Regression:",
							RPregressionpick
						);
						resolve();
					},
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
			<h3>Choose your ${actor.type}'s 📈 Progression</h3>
			<form>
				<div class="form-group">
					<label for="startingXP" title="Your Narrator will tell you what to enter here">Starting 📈 Experience:</label>
					<input type="number" id="startingXP" name="startingXP" value="1000">
				</div>
				`;
	if (actor.hasPerks) {
		dialogContent += `
				<div class="form-group">
					<label for="startingPerks" title="Your Narrator will tell you what to enter here">Starting 📚 Perks:</label>
					<input type="number" id="startingPerks" name="startingPerks" value="2">
				</div>
				`;
	}
	dialogContent += `
			</form>
		</div>
		`;
	let dialogOptions = {
		width: 550,
		height: 230,
	};
	return new Promise((resolve, reject) => {
		let dialog = new MetaDialog(
			{
				title: `Step 8 of 10: ${actor.type} 📈 Progression`,
				content: dialogContent,
				buttons: {
					ok: {
						label: "Confirm 📈 Progression",
						callback: async (html) => {
							let startingXP = html.find('[name="startingXP"]').val();
							let startingPerks = null;
							if (actor.hasPerks) {
								startingPerks = html.find('[name="startingPerks"]').val();
								await actor.update({
									"system.Vital.Experience.Total": Number(startingXP),
									"system.Perks.Details.Starting.value": Number(startingPerks),
								});
							} else {
								await actor.update({
									"system.Vital.Experience.Total": Number(startingXP),
								});
							}
							metaLog(
								3,
								"NewActorProgression",
								"New Starting Experience:",
								startingXP,
								"New Starting Perks:",
								startingPerks
							);
							resolve();
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

export async function NewActorSummary(actor) {
	const playerName = game.user.name;
	const narratorName = game.users.activeGM.name;
	let dialogContent = `
		<div class="metanthropes layout-metaroll-dialog">
			<h3>Choose your ${actor.type}'s ✍️ Summary</h3>
			<form>
			<h3>${actor.type} Details:</h3>
				<div class="form-group">
					<label for="actorname" title="Your ${actor.type}'s Name"><span class="style-cs-conditions">(Required)</span> Name: </label>
					<input type="text" dtype="String" id="actorname" name="actorname" value="">
				</div>
				`;
	if (actor.isHumanoid) {
		dialogContent += `
				<div class="form-group">
					<label for="actorgender" title="Your ${actor.type}'s Gender">Gender: </label>
					<input type="text" dtype="String" id="actorgender" name="actorgender" value="">
				</div>
				<div class="form-group">
					<label for="actorgenderpronoun" title="Your ${actor.type}'s Gender Pronouns">Pronouns: </label>
					<input type=text dtype="String" id="actorgenderpronoun" name="actorgenderpronoun" value="">
				</div>
				`;
	}
	dialogContent += `
				<div class="form-group">
					<label for="actorage" title="Your ${actor.type}'s Age">Age: </label>
					<input class="style-container-input-charstat" type="number" dtype="Number" id="actorage" name="actorage" value="">yr
				</div>
				`;
	if (actor.isHumanoid) {
		dialogContent += `
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
				`;
	}
	dialogContent += `
				<h3>Session Details:</h3>
				<div class="form-group">
					<label for="narratorName" title="This should be filled out automatically">Narrator Name: </label>${narratorName}
				</div>
				<div class="form-group">
					<label for="playerName" title="This should be filled out automatically">Player Name: </label>${playerName}
				</div>
				`;
	if (actor.hasEnterMeta) {
		dialogContent += `
				<div class="form-group">
					<label for="saganame" title="The name for this Saga">Saga Name: </label>
					<input type="text" dtype="String" id="saganame" name="saganame" value="">
				</div>
				<div class="form-group">
					<label for="coalitionname" title="The name of your Coalition of Metanthropes">Coalition Name: </label>
					<input type="text" dtype="String" id="coalitionname" name="coalitionname" value="">
				</div>
				<div class="form-group">
					<label for="factionname" title="The name of the Faction your Coalition is a part of">Faction Name: </label>
					<input type="text" dtype="String" id="factionname" name="factionname" value="">
				</div>
				`;
	}
	dialogContent += `
			</form>
		</div>
	`;
	return new Promise((resolve, reject) => {
		let dialog = new MetaDialog({
			title: `Step 9 of 10: ${actor.type} ✍️ Summary`,
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
						const saganame = html.find('[name="saganame"]').val();
						const coalitionname = html.find('[name="coalitionname"]').val();
						const factionname = html.find('[name="factionname"]').val();
						const updateParams = {
							name: actorname,
							"system.Vital.age.value": Number(actorage),
						};
						if (actor.isHumanoid) {
							updateParams["system.humanoids.gender.value"] = actorgender;
							updateParams["system.humanoids.genderpronoun.value"] = actorgenderpronoun;
							updateParams["system.humanoids.height.value"] = Number(actorheight);
							updateParams["system.humanoids.weight.value"] = Number(actorweight);
							updateParams["system.humanoids.birthplace.value"] = actorpob;
						}
						if (actor.hasEnterMeta) {
							updateParams["system.entermeta.narrator.value"] = narratorName;
							updateParams["system.entermeta.sagas.value"] = saganame;
							updateParams["system.entermeta.coalition.value"] = coalitionname;
							updateParams["system.entermeta.faction.value"] = factionname;
						}
						//todo should I just check here for .prototypeToken instead of checking for actor.type?
						if (actor.prototypeToken) {
							updateParams["prototypeToken.name"] = actorname;
						}
						try {
							await actor.update(updateParams);
						} catch (error) {
							metaLog(2, "NewActorSummary", "Error in updating actor data", error);
							reject(error);
							return;
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
							narratorName,
							"Saga Name:",
							saganame,
							"Coalition Name:",
							coalitionname,
							"Faction Name:",
							factionname
						);
						resolve();
					},
				},
			},
			default: "ok",
		});
		dialog.render(true);
	});
}

export async function NewPremadeSummary(actor) {
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
						} catch (error) {
							metaLog(2, "NewPremadeSummary", "Error in updating actor data", error);
							reject(error);
							return;
						} finally {
							//left blank
						}
						//todo should I just check here for .prototypeToken instead of checking for actor.type?
						if (actor.type == "Protagonist" || actor.type == "Metanthrope") {
							await actor.update({ "prototypeToken.name": actorname });
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
						await actor.update({ name: "Premade" });
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
			<h3>${actor.type}: ${actor.name} <br>is ready to enter the Multiverse!</h3>
			<form>
				<div class="form-group">
					
				</div>
			</form>
		</div>
	`;
	let dialogOptions = {
		width: 420,
		height: 300,
	};
	return new Promise((resolve, reject) => {
		let dialog = new MetaDialog(
			{
				title: `Step 10 of 10: Enter Meta`,
				content: dialogContent,
				buttons: {
					ok: {
						label: "and so it begins...",
						callback: async (html) => {
							ui.notifications.info(actor.name + " has entered the Multiverse!");
							resolve();
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
