const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;
import gsap from "/scripts/greensock/esm/all.js";
/**
 * Application V2 Sheet with animated tabs and footer with save/saveAndClose buttons
 *
 * @export
 * @class MetanthropesSheetV2
 * @typedef {MetanthropesSheetV2}
 * @extends {HandlebarsApplicationMixin(ItemSheetV2)}
 */
export class MetanthropesSheetV2 extends HandlebarsApplicationMixin(ItemSheetV2) {
	static DEFAULT_OPTIONS = {
		classes: ["metanthropes", "sheet"],
		tag: "form",
		position: {
			width: 720,
			height: "auto",
		},
		form: {
			closeOnSubmit: false,
			submitOnChange: false,
			submitOnClose: false,
		},
		actions: {
			saveAndClose: MetanthropesSheetV2.#onSaveAndClose,
		},
		window: {
			resizable: false,
			//? break down for content only tabs
			contentClasses: ["standard-form"],
		},
	};

	static PARTS = {
		header: {
			template: "systems/metanthropes/templates/apps/sheets/common/header.hbs",
		},
		tabs: {
			template: "systems/metanthropes/templates/apps/sheets/common/nav-bar.hbs",
		},
		footer: {
			template: "systems/metanthropes/templates/apps/sheets/common/footer.hbs",
		},
	};

	/**
	 * Save & Close the app
	 *
	 * @static
	 */
	static async #onSaveAndClose(event, target) {
		await this.submit();
		await this.close();
	}

	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		context.isNarrator = game.user.isGM;
		const docLabel = "TYPES." + this.document.documentName + "." + this.document.type;
		context.docTypeName = _loc(docLabel);
		console.log(docLabel);
		return context;
	}

	/**
	 * Change Sheet Tabs with an animation
	 *
	 * @param {*} tab
	 * @param {*} group
	 * @param {{}} [options={}]
	 */
	changeTab(tab, group, options = {}) {
		const changeOptions = {
			...options,
			updatePosition: options.updatePosition ?? true,
		};
		//* GSAP animation
		//? Clean up previous animations still in progress
		this._tabAnimation?.kill();
		this._tabAnimation = null;
		//? Skip the animation if photosensitiveMode is enabled
		if (game.settings.get("core", "photosensitiveMode")) {
			this._tabAnimation?.kill();
			this._tabAnimation = null;
			return super.changeTab(tab, group, changeOptions);
		}
		const previousTab = this.tabGroups[group];
		const clearProps = { clearProps: "opacity,visibility,transform,overflow" };
		const panels = [...this.element.querySelectorAll(".tab")].filter((panel) => panel.dataset.group === group);
		const previousPanel = panels.find((panel) => panel.dataset.tab === previousTab);
		const nextPanel = panels.find((panel) => panel.dataset.tab === tab);
		gsap.set(panels, clearProps);
		//? Fallback if panels break or clicking on the same tab
		if (!previousPanel || !nextPanel || previousPanel === nextPanel) {
			return super.changeTab(tab, group, changeOptions);
		}
		//? Animation states
		const collapsed = {
			autoAlpha: 0,
			scaleY: 0,
			y: -40,
			transformOrigin: "top center",
			//overflow: "hidden",
		};
		const expanded = {
			autoAlpha: 1,
			scaleY: 1,
			y: 0,
			duration: 0.33,
			ease: "power2.out",
		};
		//? Timeline
		this._tabAnimation = gsap.timeline({
			onComplete: () => {
				this._tabAnimation = null;
			},
		});
		//? Animation
		this._tabAnimation
			.to(previousPanel, {
				...collapsed,
				duration: 0.33,
				ease: "power2.in",
			})
			.set(previousPanel, clearProps)
			.call(() => {
				super.changeTab(tab, group, changeOptions);
			})
			.set(nextPanel, collapsed)
			.to(nextPanel, expanded);
	}
}
