# Latest Changes

These are the latest changes for the Metanthropes™ System for Foundry VTT.

Included in these notes, is also the changelog for all the Metanthropes™ Premium Modules for Foundry VTT, as well as officially supported 3rd-party Modules, labeled as [Module Name].

The format is based on [Keep a Changelog.](https://keepachangelog.com/en/1.1.0/)

---

# Early Access Releases

## Early Access v0.14.205 [2026-06-28]

### Added:

- Added support for the latest Foundry VTT V14 Stable 6 build V14.364.
- [ASTRAL] Added support for the upcoming Metanthropes: Anthologies - ASTRAL Premium Module.
- [Core] Added a new Narrator Journal with guidance on how to Progress Actors during Early Access.
- [DiceSoNice] Added support for the new Dice So Nice! Module version 6, which comes with our own custom Metanthropes d10 & d100 dice and Metanthropes Dark & Light Themes.
- [DiceSoNice] When rolling for Damage, the dice Theme will change according to the Energy Type being used, unless you disable it in the Game Settings. To personalize your dice, while keeping the automatic Theme switching, you can select any combination of Materials & Textures from the 3D Dice configuration screen.
- [DiceSoNice] Comes with pre-configured Special Effects that will play for all players when a d10 results in a splash 10 effect and also when rolling a Critical Success / Failure on a d100 roll.
- Added a new advanced Network Logging feature, available under the Game Settings for Metanthropes. When enabled, it will relay all Metanthropes Console Log messages, from all connected Clients, to the Active GM's Console Log.This will greatly help with ongoing troubleshooting & debugging for network issues. It is recommended to keep it disabled during normal play to reduce the network load.
- The 'Image Picker' App, launched when clicking on an Actor's portrait from the Summary Tab, now includes additional options for Narrators to configure an Actor's Wildcard token (as well as naming options), while selecting the Image for that Actor, saving the trouble of having to do those configuration steps manually for each Actor. You can still manually tweak any of these settings and the app will reflect the actual values for each Actor.
- Added a small text animation to buttons in Chat, to help clarify when a button is clicked & when the button becomes available again, after the animation concludes.
- Added a Metanthropes section on the Settings Sidebar with links to the website, the latest changes (this page) and a placeholder for the upcoming Feedback form (coming soon™).

### Changes:

- [Core] Progressing your Chars, Stats & Perks will no longer be disabled while the 'Beta Testing of new Features' setting is enabled.
- [Core] Added a new Attack Type for Possessions: 'Explosive' and the Possessions Compendium has been updated with a new 'Explosive' folder under 'Weapons'. Various Weapons have been updated to match the new Attack Type. Updated Chat messages when using a Posssession to align with the updated Attack Types.
- The 'Assign Player' app, launched from an Actor's Summary Tab, will now also configure the default Player Character, for that Player, to the Actor being assigned.
- Clicking on a rollable element from an Actor or Item sheet, will now wait for the completion of the roll animation (if Dice So Nice is enabled, or 1sec otherwise) before allowing you to click on a rollable element again. This will prevent any accidental double-clicks on rollable elements and spamming the chat.

### Fixes:

- [Core] Fixed an issue with the createActor Hook that was causing it to give some actors duplicate Strike Items when multiple Narrators (GMs) were online at the same time.
- [Homebrew] Fixed an issue with some of the settings not being accessible under the Game Settings menu.
- [DiceSoNice] Fixed an issue with the Dice animation not showing on Destiny Rerolls after the first re-roll.
- [DiceSoNice] Fixed an issue with the Dice animation showing twice on some Destiny Rerolls.
- [DiceSoNice] Fixed some previously known issues with DSN and animations not playing properly for all players.
- [TheForge] Fixed an issue with the new 'Image Picker' app, which was causing it to display empty folders while running on The Forge.
- Solved a race condition & updated the socket handler. This makes our handling more robust & now when re-rolling Damage/Healing it will resolve up to 3 seconds faster, while ensuring the undoLifeChange completes before applying the new Damage/Healing results.
- Fixed an issue with the Item sheets, which was causing it to always open in a maximized state.
- Fixed an issue with the Possesions Item Sheet, where the Tooltips on the Material Properties tab where not showing up correctly.
- Fixed an issue with the Roll Tables, where the image of the Roll Table grew out of proportion, making it hard to see the interactable buttons and table results in some resolutions.
- Fixed some missing Tooltips on the Actor Sheet.
- Fixed an issue where newly created Protagonists & Metanthropes wouldn't get the Actor Linked enabled by default.
- Fixed the new Welcome Chat message firing for each connected Narrator. Now it will only display once for the Active GM.

### Known Issues:

### Deprecated:

- [Drag Ruler] Removed support for the Drag Ruler Module.
- [Homebrew] Removed the 'Audio/Visual' Tab from Items, as the upcoming new VFX feature won't use the same macro-style inputs this page was using.

---

## Early Access v0.14.175 [2026-05-11]

### Added:

- Added support for the latest Foundry VTT V14 Stable 3 build V14.361.
- Added support for the new **Metanthropes: Anthologies - NETHER** Premium Module. This release allows Kickstarter Backers to receive their Alpha access benefit and give us their feedback on the Alpha release.
- [Nether] Alpha release includes the Journals, Actors, Maps (including walls, lights & ambient audio) as well as their corresponding Compendiums & Adventure. This Alpha release does not include the Animated Doors, Dimensional Effects, Automations and Narrator Macros, some additional Journal pages & tables, and some additional Actor Images; these will be coming in a later update.
- [Nether] Supports the new 'Quickstart' capability, so you can create a new World directly with all the new content ready to go.
- Added a new app to facilitate the selection of an Actor's Portrait & Top-Down Images. The new app allows you to choose a Portrait for your Actor, according to their Actor Type and the available options are populated from all active Metanthropes Premium Modules on your World. The new app will change your Actor's Top Down Token accordingly & prefer animated Tokens when available. It also supports The Forge hosting service. Players need to have the 'Use File Browser' permission to use (or be given the 'Trusted Player' role, which includes this permission by default).

### Changed:

- Added new Welcome Chat Messages that appear on the first load after an update, for each module, highlighting the release notes.
- Adventure Importer should now default to the new App V2.
- Updated the Game Settings menu options, breaking down each Module to have it's own set of Settings, decluttering and presenting the available options in a more consistent way.
- Updates on the Metanthropes API: metaExecute parameters change, new helpers and many small incremental updates & optimizations.

### Fixed:

- Updated the button, radio & checkbox elements of the new UI to make them stand out more clearly when unselected.
- Various minor fixes and adjustments to the new UI.
- Hotfix for the new Image Picker app to support The Forge's File Picker implementation.

### Known Issues:

- When the sidebar is minimized and Chat Cards are enabled for Chat Notifications in the User Interface Configuration, the Chat Card will use the Light Interface theme, regardless of the user's choice. In addition, activating a Metapower / using a Possession from the Chat Card, won't remember that the button was clicked from the Chat Card, when viewed in the Chat later, allowing players to re-activate them.

### Deprecated:

- [Introductory] The new Portrait Image picker app won't show some existing duplicate image assets and they will be removed in a later release.

---

## Early Access v0.14.044 [2026-04-10]

### Added:

- Added support for **Foundry V14** - the latest supported build is 14.360 (Stable 2).
- Added support for Font Awesome v7.2.
- The **New User Interface** is now available! It comes with both **Dark & Light Themes** for the Interface and Applications sections of the UI. Looking forward to your feedback! This update does not include the new Sheets for Actors & Items as these are being developed along with the data models and will arrive soon™. The current Actor & Item Sheets had a small facelift, and remain functionaly the same.
- [Introductory] Now supports the new 'Quickstart' capability, so when you create a new World you can select the Metanthropes: Introductory Adventure during the World creation. This will skip the required installation steps & the new World will be ready to go on the first load.
- [Homebrew] Added support for the new Experimental VFX engine. Metapowers & Possessions that deal Damage automatically, will now trigger a new Visual & Audio effect upon successful activation, before automatically applying the damage. The effect will not trigger on subsequent Damage re-rolls with Destiny. The placeholder particles that show up, the Damage text size & text color will adjust dynamically according to the Energy type & amount of Damage dealt! Requires Alpha Testing Enabled in the Settings.

### Changed:

- Removed support for Foundry VTT V13. With the new features V14 brings like the new Active Effects & the current quality of the build, we feel that there is no need to keep V13 support. You can easily install V14 without affecting your existing V13 installation. If you require assistance, don't hesitate to reach out on our Discord and we'll help you migrate to V14 in no time!
- When creating a new World, you now get the option to name the default Gamemaster user. If you don't, it will be localized to 'The Narrator'.
- Updated the Journals with some new tables and images and minor fixes.
- Extended the Metanthropes API to include the new classes and the experimental VFX.
- Console logging (F12 or Ctrl+Shift+i) now has different colored messages to help distinguish the Advanced Logging ones.
- Updated the `>_ Send to Console` button, to work with both AppV1 and AppV2 sheets of any Document type. This buttons shows up when you enable the 'Advanced Logging' option in the settings and will send to the console both the App & Document for quick inspection during development and to help with debugging.
- Pausing the game now uses a custom class override, rather than a render hook override.

### Fixed:

- Improved the development tools by properly configuring intellisense for the Foundry and Metanthropes API. Further improved compatibility with i18nAlly to work with the new \_loc shorthand.
- When targeting multiple Tokens, it will now check & remove any invalid actors, or duplicate actor-linked Tokens before proceeding with applying damage to them.
- Actor owners will now update their owned Actors directly when applying Damage/Healing, rather than emit a Socket call, improving performance and responsiveness.
- When the Data Migration Engine is running, the progress bar will now correctly update the completion % based on the total number of modules active. It should no longer exceed values of 100%.
- The Adventure import screens will now only show if the user is the Active GM and the World is NOT created using the new Quickstart method.
- Various minor tweaks and improvements in the underlying code & documentation.
- Fixed a previously known issue importing Adventures.
- [DSN] Fixed support for the latest Dice So Nice v5.3.3.

### Known Issues:

- When the sidebar is minimized and Chat Cards are enabled for Chat Notifications in the User Interface Configuration, the Chat Card will use the Light Interface theme, regardless of the user's choice. In addition, activating a Metapower / using a Possession from the Chat Card, won't remember that the button was clicked from the Chat Card, when viewed in the Chat later, allowing players to re-activate them.

### Deprecated:

- Deprecated the old Movement tables. These will be removed once the transition to AppV2 for Actors completes refactoring.
- Removed the ability to trigger the old macro-based VFX/SFX, since these will be now integrated to the new VFX engine. The respective Item tabs are still visible, but no longer apply the configured macros to the Item's activation.
- The @METAFA and @METAICON enrichers no longer take fixed width as a parameter, since this has been deprecated since Font Awesome 7.1 (everything defaults to fw now), and will log a warning in the console if it detects it's use. Support will be removed with Metanthropes v1.0.

---

## Early Access v0.13.104 [2025-12-27]

### Added:

- Added support for Foundry version 13.351.
- Added initial support for Foundry version 14 & verified for up to prototype build 14.352.
- Added the Metanthropes QuickStart 2025 guide (PDF & Journal).

### Changed:

- The 100 Metapowers now come with their new official Icons.
- [Introductory] New Premade Protagonists, each with a unique backstory, ready to play.
- Reset the Actor Active Effects sheet to the new V14 default sheet, in preparation for the changes coming to Actor Active Effects with V14.

### Fixed:

- Text editor elements are now easier to read & edit for longer texts.
- Removed some predefined labels for Summary Tab fields on the Actor Character Sheet for defining an Actor's Height, Weight & Age. These fields do not apply any gameplay effects currently.
- Various minor fixes and build optimizations

### Known Issues:

- [Introductory] If the Introductory Premade Protagonists already exist in the World, aka previously imported via Compendiums, then they will be upgraded, however, if a Player already used the 'Finalize Premade' function, then that Protagonist won't be affected. If they don't exist in the World, the updated Compendium will include the new Introductory Premade Protagonists for you to import and use in your World.
- [Introductory] The new Hammer Premade Protagonist has the Sizeshift Metapower, instead of Meta Strength. If you have the Metanthropes: Core Module enabled, the change will happen automatically during Migration on the first World load, and no further action is required. If you don't, you'll have to import the Hammer Premade Protagonist (Trevor 'The Anvil' Rayes) from the Introductory Actors Compendium to get access to the new Metapower.
- [Introductory/Core] Some Weapon Possessions have missing tables with additional effect information, such as the Conditions applied based on the ammunition type. We are reworking these tables and they will be added in a future build. Those with Narrator Website access can [review them on our website](https://www.metanthropes.com/possessions/).
- [FVTT v14] Importing an Adventure might prompt an error in the console log, and might appear like the import failed, as the Adventure Import window will remain open, while no imported content is visible. Reload the World (F5) and the imported content will display correctly. This seems to be a bug with v14 prototype build and will be addressed with v14 stable.

---

## Early Access v0.13.88 [2025-08-29]

### Added:

- Added support for up to Foundry version 13.348.
- A Critical Success roll result will now add any Bonus to the total Levels of Success.
- A Critical Failure roll result will now add any Penalty to the total Levels of Failure.
- Non-Strike Possessions, now display the Material Properties tab, previously only visible to Homebrew ownwers.
    - This tab displays the Material Properties of the Possession, its category & the Resistances it provides to the wearer (if an Armor type) as well as other properties, such as the item's Durability, Size and Weight.
    - For Armors, the Resistance values of the Possession, are not automatically applied to the Actor. Narrators will have to edit the Actor's Resistance Scores manually, to give them the Armor's protection bonuses and keep track of it's Durability.
    - Added tooltips to better clarify what each property does and renamed some definitions to provide better clarity.
    - This is an early concept for the crafting subsystem of the game & you can [read more about each Material on our website and join the discussion](https://www.metanthropes.com/possessions/📦-items/materials/) (requires [Protagonist Web Access](https://www.metanthropes.com/store/product/16-protagonist-website/), or a community rank of **Instrument** or above).
    - Automatic application of Resistances for Armors and Durability tracking, will come in future builds.
- [Core/Introductory] This version introduces the [**Data Migration Engine**](https://github.com/Legitamine/metanthropes/issues/413), which updates a World's data with the latest content from Compendiums. Currently it will update all Metapowers & Possessions on all World Actors. It will automatically trigger when the World loads for the first time, following an update, and can also be forced to run from within the game settings.
- Extended the Metanthropes™ API with color options, available under `metanthropes.system.colors` to be used with Font Awesome icons as well as other UI elements in upcoming releases.
- Also introducing a new way to create Font Awesome Icons, using text enrichers. See #394 on how to configure your own custom content for Journals and Item fields.

### Changed:

- The first active GM (GameMaster) account that logs into a World will now be renamed to "The Narrator".
- Changed the definitions for a Possessions' Material Properties, specifically their categories: 'Eartly' is now 'Terrestrial', 'Metallic' becomes 'Metals & Alloys', 'Compossed' is now 'Composite' and 'Alien' becomes 'Extraterrestrial'. Metapowers and Possessions refferencing these Materials now refference the new definitions. Kindly note that the Website content is not yet updated to reflect these changes.
- Changed the styling of the Font Awesome Icons to match the styling used by Foundry VTT. Targets and Area of Effect symbols now use the same Target and Measured Template icons from Foundry respectively, since they essentially serve the same practical purpose.
- [Core, Introductory] You no longer have to manually update an Actor's Items after upgrading to a newer system version. When your World loads it will automatically check and upgrade all existing Actors with the latest version for their Items from the respective Compendiums, using the new Data Migration Engine.
- [Core, Introductory] Updated all Effect Description fields for all Possessions and Metapowers to utilize the new Text Enrichers (See #394 on how to use it on your own).
- [Core] Updated all Metapowers and Possessions with the new Material Properties definitions. Kindly note that the website content is not yet updated to reflect this change.
- [Core] Metapower changes: Ancestral Connection Level 5 (Ancestral Roots) now gives 25 Psychic resistance.
- [Homebrew] With the advent of the new Data Migration engine, Homebrew owners who don't wish for their customized Items to be replaced with updated ones from the Compendiums, need to **rename their custom Items**, as the Data Migration, currently, checks and updates Items based on their name.
- Updated all `metanthropes.dice` API functions to utilize the new text enrichers and updated their documentation.
- Updated the Hunger check and Cover check rolls to track Destiny re-rolls and update the initial chat message, reducing chat message spam.
- Updated all Journal pages to utilize the new Text Enrichers.

### Fixed:

- From this release and onwards, we utilize the new Data Migration Engine to also update existing World Actors, so Narrators won't have to re-import Actors from Compendiums to get the new content & fixes.
- [Dice-So-Nice] Fixed various issues with Dice So Nice. Requires DSN version 5.2.1 or newer.
    - Fixed cases where the animation triggered twice.
    - Fixed cases where the animation did not trigger for all players.
    - Fixed the animation triggering when no valid targets were selected.
    - Fixed when re-rolling using Destiny, the chat message did not update/show after the DSN animation finished, now it will wait for the animation to play before showing the new result in chat.
    - Fixed an issue that when the Actor had 0 Destiny remaining, the automatic activate/use would trigger after 5 seconds. Now it will trigger right after the DSN animation finishes, or right away if DSN is not enabled.
    - Known issue: For Damage/Healing Re-Rolls, DSN fails to show the dice animation for the 2nd and subsequent re-rolls, while it will play fine for the first Destiny re-roll. The new Damage/Healing result are applied correctly to targets (if applicable), and the new result shows in chat as expected, however the DSN animation will not trigger properly. We will properly address this issue in a future release.
- [Introductory] Fixed some typos and other minor issues in The Usher's, Shavo's and Niko's Metapowers.
- [Introductory] Increased the top-down Token scale ratio for the Nightmare, Anomaly and Cyborg Antagonists to better reflect their larger than human relative sizes. Also fixed the backgrounds for the Cyborg and Nightmare.
- [Introductory] Renamed the new First Person Scene to 'Cutscene' instead of 'Cinematic'.
- [Core] Fixed various minor issues and typos for Metapowers & Possessions:
    - Fixed various minor issues with the display & sorting of Metapowers in the 100 Metapowers Journal.
    - Fixed Metapower: Ring of Fire had a typo in the effect description.
    - Fixed Metapower: Exonerated Level should be Level 5 instead of 4.
    - Fixed Metapower: Atmospheric Adaptation should be Level 3 instead of 2.
    - Fixed Metapower: Rapid Mass Alteration should be Level 5 instead of 4.
    - Fixed Metapower: Absolute Adaptation should be Level 5 instead of 4.
    - Fixed Possession: Thermal Goggles Category to 'Gadget' instead of 'Strike'.
- [Core] Added missing tables (Coalition, Story Hooks and Rumors) in the Narrator Journal. We will provide rollable tables for these in future builds.
- [Core/Homebrew] Fixed an rare issue that was causing some customized Items with a broken image link, to not show up properly on the Actor character sheet. These Items are now again visible on the Actor sheet.
- Fixed broken links to other Journal pages across all Modules.
- Fixed automated Damage/Healing to only apply to targets when the Duration of the Metapower/Possession is Instantaneous.
- Fixed the default Token Disposition for all non-Protagonist Prototype Tokens to be 'Neutral' instead of 'Secret', allowing players to target them (Secret disposition apperently does not allow targeting). If loading a World that was created before this release, all Prototype Token defaults will be overriden with this new behavior.
- Replaced the loading screen that appears when loading a World, that stays up until the active scene loads. This image now uses the new cover image for the system and should be less prone to cause any motion sickness than the previous artwork used as the loading screen.
- Fixed various minor issues and typos with the Finalize Premade Actor process.
- Fixed the issue with dissappearing Font Awesome icons when editing a Journal page or a Possession's effect description fields. From now on, use the new Text Enrichers to include FA icons in the Journals and in the description fields on Items. See #394 on how to configure your own content.
- Made improvements to chat messages, removing excess line breaks and better aligned the FontAwesome Icons on the Activation of Metapowers and Usage of Possessions.
- Fixed the Known Issues of the v0.13.5 release.
- The Pause screen displays the Metanthropes™ Logo again.

### Known Issues:

- [Dice-So-Nice] For Damage/Healing Re-Rolls, DSN fails to show the dice animation for the 2nd and subsequent re-rolls, while it will play fine for the first Destiny re-roll. The new Damage/Healing result are applied correctly to targets (if applicable), and the new result shows in chat as expected, however the DSN animation will not trigger properly. We will properly address this issue in a future release.

---

## Early Access v0.13.5 [2025-06-05]

### Added:

- Foundry version 13.344 is now supported.
- [INTRODUCTORY] New Entering the Opera Cinematic Scene. A short cinematic of entering and walking around the Opera from a first-person view.
- [CORE] Possessions Compendium now includes a total of 100 Possessions from 3 eras: Archaic, Modern, Futuristic. These are sorted into Weapons, Armors, Gadgets and Drugs.
- [Introductory] New compendiums with Actors, Scenes, Macros and Journals, for the experienced Narrator, so they can import specific content, without having to import the full adventure, if they so choose.

### Changed:

- New Compendium structure is introduced, sorting all our Premium content in a consistent and clean folder structure organized by Compendium type. If you are updating your World from a previous Metanthropes™ version, you will have both the old and the new Compendium structure in your World and you can see [#338](https://github.com/Legitamine/metanthropes/issues/338) on how to fix this.
- New cover images for the System & Premium Modules.
- Reorganized the various Journals; this is the first step in a series of improvements planned for Journals in the road to Metanthropes™ v1.0, more improvements will come in follow up builds.

### Fixed:

- Fixed an issue with the new socket implementation to handle damage and healing application, where it would not trigger for some players.
- Fixed the missing 'Restore Previous Life' button that is visible only for Narrators.
- Fixed the Disease, Hunger and Pain Conditions causing the Actor Sheet to miss-behave when the Actor had any level of those conditions.
- Fixed various minor UI issues with Font Awesome implementation. There are still a few minor typos and missing icons - see known issues below.
- Fixed an issue where in some cases, when re-rolling damage would not apply the previous value correctly before applying the new damage result.
- Fixed an issue where damage would not calculate correctly when having a melee weapon that did not do any Material damage. Now the base Power Stat Score of the Actor will always apply when attacking with a melee weapon, in addition to any other energy damage type.
- Fixed the Projectile thrown weapon type Possession, which was not applying the multi-Action penalty on the Power Score while attacking.

### Known Issues:

- Font Awesome icons dissapear when editing a Journal, or an Item's Effect Description, even if you don't apply any edits to the entry; just opening and closing the Journal/Item will make all Font Awesome icons dissapear. This issue requires us to create a custom text enricher to be able to display Font Awesome icons in such fields. We will provide a solution in an upcoming build. In the meantime, if this issue occurs, please restore the Journal/Item from the corresponding Compendium to return proper functionality.
- With Dice-So-Nice enabled, after re-rolling the result more than twice, the dice roll animation will not trigger. All applicable effects are indeed applied, and the Chat message is updated, however it's missing the Dice-So-Nice animation.
- Some Journal links are broken and we will restore their functionality in an upcoming release that will make another pass at our Journal structure.

---

## Early Access v0.13.1 [2025-05-17]

### Added:

- Foundry VTT version 13 is now supported. New Dark/Light themes and the new UI is not included in this release and is planned for later this summer.
- Activating a Metapower or using a Possession which can deal Damage or apply Healing, and has a Duration of "Instantaneous", now requires you to have a target selected. Damage (taking resistances into account) and Healing will be applied to the targets automatically. If you choose to spend Destiny to re-roll the Damage/Healing, it will undo the last applied result and re-apply the new one.
    - Note that this feature does not take into account if the selected target(s) are valid targets, it will apply the result regardless. The targeting subsystem will be improved in future releases and non-Instantaneous effects will come with the Actor Active Effects subsystem.
- [Introductory] New custom Scene Particle & Filter Effects for when traveling to the Astral, Nether and Aether Dimensions, plus a new custom effect for showcasing the Metanthropes: Multiverse for Scene#3 of the Overture story.
- New fonts and updated tables from our new [quickstart guide](https://metanthropes.com/quickstart).
- [Homebrew] New capability to enable Alpha testing of upcoming features. We are offering Homebrew owners the option to test features in the early prototype stage and give us their feedback during the early stages of development.
- [Core] New capability to enable Beta Testing for new features. This feature was previously part of the Homebrew Module, and is now a part of the Core Module. This will give access to test new features to a broader audience, and allow us to get more feedback.
- New defaults for all prototype Tokens including a Metanthropes™ Logo turn marker
- New API functionality to control dealing damage/healing to multiple targets, including re-rolls.

### Changed:

- All emojis have been replaced by Font Awesome icons, as Metanthropes™ now comes with a Font Awesome Pro license and our own custom icons, starting with the Metanthropes™ Logo. These will be colored and animated automatically, according to contextual information in later releases.
- [Introductory] Deprecated recommended/required 3rd modules until we officially support 3rd party modules. FXMaster that was used previously for Dimensional effects, has been replaced by our custom effects, included with this release.
- Changed the Welcome Lobby / Demo scene with new artwork from Metanthropes: Anthologies.
- Changed API Roll d100 dice functions have been refactored to support localization & using fields API & APP V2. This is effort is ongoing and more App V2 updates are coming in the near future.
- Metanthropes™ Premium Modules have been updated to use & extend the Metanthropes™ API.
- Chat inline rolls now follow our own custom UI/UX style, instead of the default Foundry VTT UI style which was used previously, this is still evolving and will become better in later updates.
- Many Development evironment updates, with an improved process that moves SCSS compiling during release building. Moving to support CSS Cascade layers to align with FVTT V13 structure onwards. We are laying the path to allow contributors in the future and this effort will continue in later releases.
- Improved the documentation for the Metanthropes™ API.
- Deprecated the use of various jQuery and replaced with HTML DOM handling.

### Fixed:

- Fixed not being able to re-roll for damage/healing when beta-testing was enabled.
- Fixed various minor typos and missing tooltips.

### Known Issues:

- Foundry V13 comes with new Dark & Light themes. This release does not come with our new UI for V13 that will include both Dark & Light themes, and the current release offers baseline support to ensure both choices are usable, albeit some graphical glitches might still exist. These will be addressed with the new UI, as we will be refactoring the majority of our CSS that's causing such issues. Let us know by [submitting a bug report on GitHub](https://github.com/Legitamine/metanthropes/issues), or come over on [our Discord System Feedback channel](https://discord.com/channels/690679176528920636/1212941912684765224) and let us know if there is something else we missed! We are currently aware of the following:
    - With the Light theme, some of the buttons that should appear when you right-click a Token on the Canvas, are instead darkened out and not easy to discern, however they do remain usable.
    - On the Chat sidebar, clicking to expand the Roll results from a d100 roll, will display the dice results with a dark background that makes it very hard to read them.

---

## Early Access v0.12.2 [2025-01-29]

### Added:

- Added a link to the Metanthropes: Introductory trailer on the Welcome Journal.
- [Core]: Added a new Adventure Compendium to help import the Core Journals to your World.

### Fixed:

- Fixed two broken links on the Welcome Journal.
- [Core]: Fixed the missing Journals from the Core Journals Compendium.

---

## Early Access v0.12.1 [2025-01-28]

### Added:

- Foundry VTT version 12 is now supported. Latest verified version is v12.331.
- New Actions tab for Actors. This new Actor Sheet tab will consolidate all available actions for the Actor from Metapowers & Possessions in a single tab. This tab will expand to become more dynamic while Combat is active in future releases.
- Metanthropes™ API is introduced. This is part of the new v1 architecture and will further expand in future releases.
- Multi-language support is introduced. This is foundation work as part of the new v1 architecture and multi-language support will be added as we transition to AppV2 for the UI.
- From this release and onwards, we have adopted Conventional Commits for this project. This will help us better track changes and releases. See [#271](https://github.com/Legitamine/metanthropes/issues/271)
- Updated the Welcome Compendium to include 3 new Journals : How to Play, Protagonists & Rules for Metanthropes™ TTRPG.
- [Core] Added a new 'Narrator Journal', found under Compendiums - Core - Journals. This Journal brings together many advices, tips & tricks and information for new and experienced Narrators alike. It covers Preparation, World Building, Delivery and Techniques.
- [Core] Updated the Possessions compendium to include a total of 78 items, adding various Armors, Weapons and Gadgets.
- [Homebrew] Initial support for Audio & Visual effects. Items now have a new Tab that will allow to enter Document UUIDs for Macros and Playlist sounds that will be triggered when succesfully activating a Metapower or Possession. This is an initial implementation that will gradually expand to fully automate the Visual/Audio effects for Metapowers and Possessions. See [#323](https://github.com/Legitamine/metanthropes/issues/323)
- [Homebrew] Beta Testing for automated Damage / Healing application. Damage and Healing will now apply as part of successfully activating a Metapower or using a Possession that deal Damage or apply Healing. Damage will take into account the target's resistances. Narrators can click on a new button next to the Actor's Life to undo the latest Life change that was applied automatically.

### Changed:

- All compendiums have been re-organized and **you no longer need to import any content to the World** for the System, Core & Homebrew Modules to work as intended. This will help keep your Worlds clean and organized. If you choose to install the System Adventure, when prompted after the first World load, or later via the Installation folder in the Compendiums tab, it will import the Demo content and a copy of all Journals, Macros and Rollable tables to your World. The Metanthropes: Introductory Module still needs to import the installation adventure, to work as intended.
- [BREAKING CHANGE] Assets have now been consolidated under a new folder structure. This will cause existing Worlds to not show images for actors, items, journals and compendiums properly.
- [BREAKING CHANGE] A good portion of the prototype code is now refactored to utilize the new Metanthropes™ API. This process continues until everything is refactored to meet the v1 architecture standards. See [#149](https://github.com/Legitamine/metanthropes/issues/149)
- Re-Rolling a result by spending Destiny, will no longer spam the chat with multiple messages, instead it will update the original message and keep track of how many total re-rolls were made.
- Initial Font Awesome implementation: Font Awesome icons are now used instead of Emoji for the Critical Success / Failure message in Chat. We will gradually roll-out Emojis in favor of Font Awesome icons in future releases, this is just a small taste of what's to come.
- Under Game Settings - Configure Settings, all editable options are now grouped under the 'Metanthropes' setting, instead of each Module having their own section. This will help keep the settings more organized and easier to find, especially if you have many other modules installed.

### Fixed:

- Fixed an issue with Combat that could trigger the end of round effects to fire more than once every round.
- Fixed many minor issues and typos.

### Known Issues:

- [Homebrew] When Beta-Testing is enabled, Damage & Healing will apply to targeted actors when you Activate Metapowers or use Possessions, however you are not able to re-roll damage/healing results using Destiny. Workaround: Manually re-roll the damage/healing and apply the new result to the target. This will be addressed in an upcoming hotfix.
- [Core] Opening a Metapower from the 100 Metapowers Journal doesn't allow switching tabs. Workaround: Unlock the Metapowers Compendium so you can click on the other tabs. See [#303](https://github.com/Legitamine/metanthropes/issues/303) for more details.

### Deprecated:

- Foundry VTT Version 11 is no longer supported.

---

## ChangeLog Archives

You may find the previous versions of the Changelog in the [Changelog Archives.](https://github.com/Legitamine/metanthropes/blob/main/CHANGELOGARCHIVES.md)
