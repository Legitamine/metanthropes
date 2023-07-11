//* newactor.mjs will be used to help in generating a new actor's stats and characteristics, along with other information.
export async function NewActor(actor) {
	//! Needs new CSS Classes
	let dialogContent = `
	<div class="metanthropes layout-metaroll-dialog">
		<h2>Welcome to creating a new Actor</h2>
		<p>Choose your Actor's Characteristics:</p>
		<form>
			<div class="form-group">
				<label for="primary">Primary:</label>
				<select id="primary" name="primary">
				<option value="Body">Body</option>
				<option value="Mind">Mind</option>
				<option value="Soul">Soul</option>
				</select>
			</div>
			<div class="form-group">
				<label for="secondary">Secondary:</label>
				<select id="secondary" name="secondary">
				<!-- Options will be dynamically updated based on the Primary selection -->
				</select>
			</div>
			<div class="form-group">
				<label for="tertiary">Tertiary:</label>
				<select id="tertiary" name="tertiary">
				<!-- Options will be dynamically updated based on the Primary and Secondary selections -->
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
				callback: (html) => {
					let primary = html.find('[name="primary"]').val();
					let secondary = html.find('[name="secondary"]').val();
					let tertiary = html.find('[name="tertiary"]').val();
					console.log(`Primary: ${primary}, Secondary: ${secondary}, Tertiary: ${tertiary}`);
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
			});
			html.find('[name="secondary"]').change((event) => {
				// Update the options in the Tertiary dropdown based on the Secondary selection
			});
		},
	});
	dialog.render(true);
}