//* newactor.mjs will be used to help in generating a new actor's stats and characteristics, along with other information.
export async function NewActor(actor) {
	//! Needs new CSS Classes
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Welcome to creating a new ${actor.type}</h2>
		<p>Choose your ${actor.type}'s Characteristics:</p>
		<form>
			<div class="form-group">
				<label for="primary">Primary:</label>
				<select id="primary" name="primary">
					<option value="Body" selected>Body</option>
					<option value="Mind">Mind</option>
					<option value="Soul">Soul</option>
				</select>
			</div>
			<div class="form-group">
				<label for="secondary">Secondary:</label>
				<select id="secondary" name="secondary">
					<option value="Mind" selected>Mind</option>
					<option value="Body">Body</option>
					<option value="Soul">Soul</option>
				</select>
			</div>
			<div class="form-group">
				<label for="tertiary">Tertiary:</label>
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
