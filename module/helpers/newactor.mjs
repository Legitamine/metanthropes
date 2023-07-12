//* newactor.mjs will be used to help in generating a new actor's stats and characteristics, along with other information.
export async function NewActor(actor) {
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
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Welcome to creating a new ${actor.type}</h2>
		<p>Choose your ${actor.type}'s Characteristics:</p>
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
