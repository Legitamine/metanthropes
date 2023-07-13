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
					await actor.update({ [`system.Characteristics.${primary}.Initial`]: Number(30)});
					await actor.update({ [`system.Characteristics.${secondary}.Initial`]: Number(20)});
					await actor.update({ [`system.Characteristics.${tertiary}.Initial`]: Number(10)});
					console.log(`New primary: ${primary}`, actor.system.Characteristics[primary].Initial);
					console.log(`New secondary: ${secondary}`, actor.system.Characteristics[secondary].Initial);
					console.log(`New tertiary: ${tertiary}`, actor.system.Characteristics[tertiary].Initial);
					//! reminder to set initial=max life after doing the statistics
				},
			},
			cancel: {
				label: "Cancel",
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
					<option value="Reflexes">Creativity</option>
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
	let dialog = new Dialog({
		title: `${actor.name}'s Body Stats`,
		content: dialogContent,
		buttons: {
			ok: {
				label: "Confirm & Roll 📊 Body Stats",
				callback: async (html) => {
					let primary = html.find('[name="primary"]').val();
					let secondary = html.find('[name="secondary"]').val();
					let tertiary = html.find('[name="tertiary"]').val();
					await actor.update({ [`system.Characteristics.Body.Stats.${primary}.Initial`]: Number(30)});
					await actor.update({ [`system.Characteristics.Body.Stats.${secondary}.Initial`]: Number(20)});
					await actor.update({ [`system.Characteristics.Body.Stats.${tertiary}.Initial`]: Number(10)});
					console.log(`New Body Stat primary: ${primary}`, actor.system.Characteristics.Body.Stats[primary].Initial);
					console.log(`New Body Stat secondary: ${secondary}`, actor.system.Characteristics.Body.Stats[secondary].Initial);
					console.log(`New Body Stat tertiary: ${tertiary}`, actor.system.Characteristics.Body.Stats[tertiary].Initial);
					//! reminder to set initial=max life after doing the statistics
				},
			},
			cancel: {
				label: "Cancel",
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
					await actor.update({ [`system.Characteristics.Mind.Stats.${primary}.Initial`]: Number(30)});
					await actor.update({ [`system.Characteristics.Mind.Stats.${secondary}.Initial`]: Number(20)});
					await actor.update({ [`system.Characteristics.Mind.Stats.${tertiary}.Initial`]: Number(10)});
					console.log(`New Mind Stat primary: ${primary}`, actor.system.Characteristics.Mind.Stats[primary].Initial);
					console.log(`New Mind Stat secondary: ${secondary}`, actor.system.Characteristics.Mind.Stats[secondary].Initial);
					console.log(`New Mind Stat tertiary: ${tertiary}`, actor.system.Characteristics.Mind.Stats[tertiary].Initial);
					//! reminder to set initial=max life after doing the statistics
				},
			},
			cancel: {
				label: "Cancel",
			},
		},
		default: "ok",
		render: (html) => {
			// Add event listeners to dynamically update the options in the Secondary and Tertiary dropdowns
			html.find('[name="primary"]').change((event) => {
				// Update the options in the Secondary dropdown based on the Primary selection
				let primary = event.target.value;
				let secondaryOptions = ["Perception", "Manipulation", "Creativity"].filter((option) => option !== primary);
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
					await actor.update({ [`system.Characteristics.Soul.Stats.${primary}.Initial`]: Number(30)});
					await actor.update({ [`system.Characteristics.Soul.Stats.${secondary}.Initial`]: Number(20)});
					await actor.update({ [`system.Characteristics.Soul.Stats.${tertiary}.Initial`]: Number(10)});
					console.log(`New Soul Stat primary: ${primary}`, actor.system.Characteristics.Soul.Stats[primary].Initial);
					console.log(`New Soul Stat secondary: ${secondary}`, actor.system.Characteristics.Soul.Stats[secondary].Initial);
					console.log(`New Soul Stat tertiary: ${tertiary}`, actor.system.Characteristics.Soul.Stats[tertiary].Initial);
					//! reminder to set initial=max life after doing the statistics
				},
			},
			cancel: {
				label: "Cancel",
			},
		},
		default: "ok",
		render: (html) => {
			// Add event listeners to dynamically update the options in the Secondary and Tertiary dropdowns
			html.find('[name="primary"]').change((event) => {
				// Update the options in the Secondary dropdown based on the Primary selection
				let primary = event.target.value;
				let secondaryOptions = ["Willpower", "Consciousness", "Awareness"].filter((option) => option !== primary);
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
}