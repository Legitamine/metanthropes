# Latest Changes

These are the latest changes for the Metanthropes™ System for Foundry VTT.

Included in these notes, is also the changelog for all the Metanthropes™ Premium Modules for Foundry VTT, labeled as [Module Name].

The format is based on [Keep a Changelog.](https://keepachangelog.com/en/1.1.0/)

---

## Early Access Releases

# Early Access v0.13.90 [2025-10-]

## Added:

- Added support for Foundry version 13.350.
- Added initial support for Foundry version 14.

## Changed:

- Updated Font Awesome support for the latest Font Awesome version 7.1

## Fixed:



# Early Access v0.13.88 [2025-08-29]

## Added:

-   Added support for up to Foundry version 13.348.
-   A Critical Success roll result will now add any Bonus to the total Levels of Success.
-   A Critical Failure roll result will now add any Penalty to the total Levels of Failure.
-   Non-Strike Possessions, now display the Material Properties tab, previously only visible to Homebrew ownwers.
    -   This tab displays the Material Properties of the Possession, its category & the Resistances it provides to the wearer (if an Armor type) as well as other properties, such as the item's Durability, Size and Weight.
    -   For Armors, the Resistance values of the Possession, are not automatically applied to the Actor. Narrators will have to edit the Actor's Resistance Scores manually, to give them the Armor's protection bonuses and keep track of it's Durability.
    -   Added tooltips to better clarify what each property does and renamed some definitions to provide better clarity.
    -   This is an early concept for the crafting subsystem of the game & you can [read more about each Material on our website and join the discussion](https://www.metanthropes.com/possessions/📦-items/materials/) (requires [Protagonist Web Access](https://www.metanthropes.com/store/product/16-protagonist-website/), or a community rank of **Instrument** or above).
    -   Automatic application of Resistances for Armors and Durability tracking, will come in future builds.
-   [Core/Introductory] This version introduces the [**Data Migration Engine**](https://github.com/Legitamine/metanthropes/issues/413), which updates a World's data with the latest content from Compendiums. Currently it will update all Metapowers & Possessions on all World Actors. It will automatically trigger when the World loads for the first time, following an update, and can also be forced to run from within the game settings.
-   Extended the Metanthropes™ API with color options, available under `metanthropes.system.colors` to be used with Font Awesome icons as well as other UI elements in upcoming releases.
-   Also introducing a new way to create Font Awesome Icons, using text enrichers. See #394 on how to configure your own custom content for Journals and Item fields.

## Changed:

-   The first active GM (GameMaster) account that logs into a World will now be renamed to "The Narrator".
-   Changed the definitions for a Possessions' Material Properties, specifically their categories: 'Eartly' is now 'Terrestrial', 'Metallic' becomes 'Metals & Alloys', 'Compossed' is now 'Composite' and 'Alien' becomes 'Extraterrestrial'. Metapowers and Possessions refferencing these Materials now refference the new definitions. Kindly note that the Website content is not yet updated to reflect these changes.
-   Changed the styling of the Font Awesome Icons to match the styling used by Foundry VTT. Targets and Area of Effect symbols now use the same Target and Measured Template icons from Foundry respectively, since they essentially serve the same practical purpose.
-   [Core, Introductory] You no longer have to manually update an Actor's Items after upgrading to a newer system version. When your World loads it will automatically check and upgrade all existing Actors with the latest version for their Items from the respective Compendiums, using the new Data Migration Engine.
-   [Core, Introductory] Updated all Effect Description fields for all Possessions and Metapowers to utilize the new Text Enrichers (See #394 on how to use it on your own).
-   [Core] Updated all Metapowers and Possessions with the new Material Properties definitions. Kindly note that the website content is not yet updated to reflect this change.
-   [Core] Metapower changes: Ancestral Connection Level 5 (Ancestral Roots) now gives 25 Psychic resistance.
-   [Homebrew] With the advent of the new Data Migration engine, Homebrew owners who don't wish for their customized Items to be replaced with updated ones from the Compendiums, need to **rename their custom Items**, as the Data Migration, currently, checks and updates Items based on their name.
-   Updated all `metanthropes.dice` API functions to utilize the new text enrichers and updated their documentation.
-   Updated the Hunger check and Cover check rolls to track Destiny re-rolls and update the initial chat message, reducing chat message spam.
-   Updated all Journal pages to utilize the new Text Enrichers.

## Fixed:

-   From this release and onwards, we utilize the new Data Migration Engine to also update existing World Actors, so Narrators won't have to re-import Actors from Compendiums to get the new content & fixes.
-   [Dice-So-Nice] Fixed various issues with Dice So Nice. Requires DSN version 5.2.1 or newer.
    -   Fixed cases where the animation triggered twice.
    -   Fixed cases where the animation did not trigger for all players.
    -   Fixed the animation triggering when no valid targets were selected.
    -   Fixed when re-rolling using Destiny, the chat message did not update/show after the DSN animation finished, now it will wait for the animation to play before showing the new result in chat.
    -   Fixed an issue that when the Actor had 0 Destiny remaining, the automatic activate/use would trigger after 5 seconds. Now it will trigger right after the DSN animation finishes, or right away if DSN is not enabled.
    -   Known issue: For Damage/Healing Re-Rolls, DSN fails to show the dice animation for the 2nd and subsequent re-rolls, while it will play fine for the first Destiny re-roll. The new Damage/Healing result are applied correctly to targets (if applicable), and the new result shows in chat as expected, however the DSN animation will not trigger properly. We will properly address this issue in a future release.
-   [Introductory] Fixed some typos and other minor issues in The Usher's, Shavo's and Niko's Metapowers.
-   [Introductory] Increased the top-down Token scale ratio for the Nightmare, Anomaly and Cyborg Antagonists to better reflect their larger than human relative sizes. Also fixed the backgrounds for the Cyborg and Nightmare.
-   [Introductory] Renamed the new First Person Scene to 'Cutscene' instead of 'Cinematic'.
-   [Core] Fixed various minor issues and typos for Metapowers & Possessions:
    -   Fixed various minor issues with the display & sorting of Metapowers in the 100 Metapowers Journal.
    -   Fixed Metapower: Ring of Fire had a typo in the effect description.
    -   Fixed Metapower: Exonerated Level should be Level 5 instead of 4.
    -   Fixed Metapower: Atmospheric Adaptation should be Level 3 instead of 2.
    -   Fixed Metapower: Rapid Mass Alteration should be Level 5 instead of 4.
    -   Fixed Metapower: Absolute Adaptation should be Level 5 instead of 4.
    -   Fixed Possession: Thermal Goggles Category to 'Gadget' instead of 'Strike'.
-   [Core] Added missing tables (Coalition, Story Hooks and Rumors) in the Narrator Journal. We will provide rollable tables for these in future builds.
-   [Core/Homebrew] Fixed an rare issue that was causing some customized Items with a broken image link, to not show up properly on the Actor character sheet. These Items are now again visible on the Actor sheet.
-   Fixed broken links to other Journal pages across all Modules.
-   Fixed automated Damage/Healing to only apply to targets when the Duration of the Metapower/Possession is Instantaneous.
-   Fixed the default Token Disposition for all non-Protagonist Prototype Tokens to be 'Neutral' instead of 'Secret', allowing players to target them (Secret disposition apperently does not allow targeting). If loading a World that was created before this release, all Prototype Token defaults will be overriden with this new behavior.
-   Replaced the loading screen that appears when loading a World, that stays up until the active scene loads. This image now uses the new cover image for the system and should be less prone to cause any motion sickness than the previous artwork used as the loading screen.
-   Fixed various minor issues and typos with the Finalize Premade Actor process.
-   Fixed the issue with dissappearing Font Awesome icons when editing a Journal page or a Possession's effect description fields. From now on, use the new Text Enrichers to include FA icons in the Journals and in the description fields on Items. See #394 on how to configure your own content.
-   Made improvements to chat messages, removing excess line breaks and better aligned the FontAwesome Icons on the Activation of Metapowers and Usage of Possessions.
-   Fixed the Known Issues of the v0.13.5 release.
-   The Pause screen displays the Metanthropes™ Logo again.

## Known Issues:

-   [Dice-So-Nice] For Damage/Healing Re-Rolls, DSN fails to show the dice animation for the 2nd and subsequent re-rolls, while it will play fine for the first Destiny re-roll. The new Damage/Healing result are applied correctly to targets (if applicable), and the new result shows in chat as expected, however the DSN animation will not trigger properly. We will properly address this issue in a future release.

# Early Access v0.13.5 [2025-06-05]

## Added:

-   Foundry version 13.344 is now supported.
-   [INTRODUCTORY] New Entering the Opera Cinematic Scene. A short cinematic of entering and walking around the Opera from a first-person view.
-   [CORE] Possessions Compendium now includes a total of 100 Possessions from 3 eras: Archaic, Modern, Futuristic. These are sorted into Weapons, Armors, Gadgets and Drugs.
-   [Introductory] New compendiums with Actors, Scenes, Macros and Journals, for the experienced Narrator, so they can import specific content, without having to import the full adventure, if they so choose.

## Changed:

-   New Compendium structure is introduced, sorting all our Premium content in a consistent and clean folder structure organized by Compendium type. If you are updating your World from a previous Metanthropes™ version, you will have both the old and the new Compendium structure in your World and you can see [#338](https://github.com/Legitamine/metanthropes/issues/338) on how to fix this.
-   New cover images for the System & Premium Modules.
-   Reorganized the various Journals; this is the first step in a series of improvements planned for Journals in the road to Metanthropes™ v1.0, more improvements will come in follow up builds.

## Fixed:

-   Fixed an issue with the new socket implementation to handle damage and healing application, where it would not trigger for some players.
-   Fixed the missing 'Restore Previous Life' button that is visible only for Narrators.
-   Fixed the Disease, Hunger and Pain Conditions causing the Actor Sheet to miss-behave when the Actor had any level of those conditions.
-   Fixed various minor UI issues with Font Awesome implementation. There are still a few minor typos and missing icons - see known issues below.
-   Fixed an issue where in some cases, when re-rolling damage would not apply the previous value correctly before applying the new damage result.
-   Fixed an issue where damage would not calculate correctly when having a melee weapon that did not do any Material damage. Now the base Power Stat Score of the Actor will always apply when attacking with a melee weapon, in addition to any other energy damage type.
-   Fixed the Projectile thrown weapon type Possession, which was not applying the multi-Action penalty on the Power Score while attacking.

## Known Issues:

-   Font Awesome icons dissapear when editing a Journal, or an Item's Effect Description, even if you don't apply any edits to the entry; just opening and closing the Journal/Item will make all Font Awesome icons dissapear. This issue requires us to create a custom text enricher to be able to display Font Awesome icons in such fields. We will provide a solution in an upcoming build. In the meantime, if this issue occurs, please restore the Journal/Item from the corresponding Compendium to return proper functionality.
-   With Dice-So-Nice enabled, after re-rolling the result more than twice, the dice roll animation will not trigger. All applicable effects are indeed applied, and the Chat message is updated, however it's missing the Dice-So-Nice animation.
-   Some Journal links are broken and we will restore their functionality in an upcoming release that will make another pass at our Journal structure.

# Early Access v0.13.1 [2025-05-17]

## Added:

-   Foundry VTT version 13 is now supported. New Dark/Light themes and the new UI is not included in this release and is planned for later this summer.
-   Activating a Metapower or using a Possession which can deal Damage or apply Healing, and has a Duration of "Instantaneous", now requires you to have a target selected. Damage (taking resistances into account) and Healing will be applied to the targets automatically. If you choose to spend Destiny to re-roll the Damage/Healing, it will undo the last applied result and re-apply the new one.
    -   Note that this feature does not take into account if the selected target(s) are valid targets, it will apply the result regardless. The targeting subsystem will be improved in future releases and non-Instantaneous effects will come with the Actor Active Effects subsystem.
-   [Introductory] New custom Scene Particle & Filter Effects for when traveling to the Astral, Nether and Aether Dimensions, plus a new custom effect for showcasing the Metanthropes: Multiverse for Scene#3 of the Overture story.
-   New fonts and updated tables from our new [quickstart guide](https://metanthropes.com/quickstart).
-   [Homebrew] New capability to enable Alpha testing of upcoming features. We are offering Homebrew owners the option to test features in the early prototype stage and give us their feedback during the early stages of development.
-   [Core] New capability to enable Beta Testing for new features. This feature was previously part of the Homebrew Module, and is now a part of the Core Module. This will give access to test new features to a broader audience, and allow us to get more feedback.
-   New defaults for all prototype Tokens including a Metanthropes™ Logo turn marker
-   New API functionality to control dealing damage/healing to multiple targets, including re-rolls.

## Changed:

-   All emojis have been replaced by Font Awesome icons, as Metanthropes™ now comes with a Font Awesome Pro license and our own custom icons, starting with the Metanthropes™ Logo. These will be colored and animated automatically, according to contextual information in later releases.
-   [Introductory] Deprecated recommended/required 3rd modules until we officially support 3rd party modules. FXMaster that was used previously for Dimensional effects, has been replaced by our custom effects, included with this release.
-   Changed the Welcome Lobby / Demo scene with new artwork from Metanthropes: Anthologies.
-   Changed API Roll d100 dice functions have been refactored to support localization & using fields API & APP V2. This is effort is ongoing and more App V2 updates are coming in the near future.
-   Metanthropes™ Premium Modules have been updated to use & extend the Metanthropes™ API.
-   Chat inline rolls now follow our own custom UI/UX style, instead of the default Foundry VTT UI style which was used previously, this is still evolving and will become better in later updates.
-   Many Development evironment updates, with an improved process that moves SCSS compiling during release building. Moving to support CSS Cascade layers to align with FVTT V13 structure onwards. We are laying the path to allow contributors in the future and this effort will continue in later releases.
-   Improved the documentation for the Metanthropes™ API.
-   Deprecated the use of various jQuery and replaced with HTML DOM handling.

## Fixed:

-   Fixed not being able to re-roll for damage/healing when beta-testing was enabled.
-   Fixed various minor typos and missing tooltips.

## Known Issues:

-   Foundry V13 comes with new Dark & Light themes. This release does not come with our new UI for V13 that will include both Dark & Light themes, and the current release offers baseline support to ensure both choices are usable, albeit some graphical glitches might still exist. These will be addressed with the new UI, as we will be refactoring the majority of our CSS that's causing such issues. Let us know by [submitting a bug report on GitHub](https://github.com/Legitamine/metanthropes/issues), or come over on [our Discord System Feedback channel](https://discord.com/channels/690679176528920636/1212941912684765224) and let us know if there is something else we missed! We are currently aware of the following:
    -   With the Light theme, some of the buttons that should appear when you right-click a Token on the Canvas, are instead darkened out and not easy to discern, however they do remain usable.
    -   On the Chat sidebar, clicking to expand the Roll results from a d100 roll, will display the dice results with a dark background that makes it very hard to read them.

# Early Access v0.12.2 [2025-01-29]

## Added:

-   Added a link to the Metanthropes: Introductory trailer on the Welcome Journal.
-   [Core]: Added a new Adventure Compendium to help import the Core Journals to your World.

## Fixed:

-   Fixed two broken links on the Welcome Journal.
-   [Core]: Fixed the missing Journals from the Core Journals Compendium.

# Early Access v0.12.1 [2025-01-28]

## Added:

-   Foundry VTT version 12 is now supported. Latest verified version is v12.331.
-   New Actions tab for Actors. This new Actor Sheet tab will consolidate all available actions for the Actor from Metapowers & Possessions in a single tab. This tab will expand to become more dynamic while Combat is active in future releases.
-   Metanthropes™ API is introduced. This is part of the new v1 architecture and will further expand in future releases.
-   Multi-language support is introduced. This is foundation work as part of the new v1 architecture and multi-language support will be added as we transition to AppV2 for the UI.
-   From this release and onwards, we have adopted Conventional Commits for this project. This will help us better track changes and releases. See [#271](https://github.com/Legitamine/metanthropes/issues/271)
-   Updated the Welcome Compendium to include 3 new Journals : How to Play, Protagonists & Rules for Metanthropes™ TTRPG.
-   [Core] Added a new 'Narrator Journal', found under Compendiums - Core - Journals. This Journal brings together many advices, tips & tricks and information for new and experienced Narrators alike. It covers Preparation, World Building, Delivery and Techniques.
-   [Core] Updated the Possessions compendium to include a total of 78 items, adding various Armors, Weapons and Gadgets.
-   [Homebrew] Initial support for Audio & Visual effects. Items now have a new Tab that will allow to enter Document UUIDs for Macros and Playlist sounds that will be triggered when succesfully activating a Metapower or Possession. This is an initial implementation that will gradually expand to fully automate the Visual/Audio effects for Metapowers and Possessions. See [#323](https://github.com/Legitamine/metanthropes/issues/323)
-   [Homebrew] Beta Testing for automated Damage / Healing application. Damage and Healing will now apply as part of successfully activating a Metapower or using a Possession that deal Damage or apply Healing. Damage will take into account the target's resistances. Narrators can click on a new button next to the Actor's Life to undo the latest Life change that was applied automatically.

## Changed:

-   All compendiums have been re-organized and **you no longer need to import any content to the World** for the System, Core & Homebrew Modules to work as intended. This will help keep your Worlds clean and organized. If you choose to install the System Adventure, when prompted after the first World load, or later via the Installation folder in the Compendiums tab, it will import the Demo content and a copy of all Journals, Macros and Rollable tables to your World. The Metanthropes: Introductory Module still needs to import the installation adventure, to work as intended.
-   [BREAKING CHANGE] Assets have now been consolidated under a new folder structure. This will cause existing Worlds to not show images for actors, items, journals and compendiums properly.
-   [BREAKING CHANGE] A good portion of the prototype code is now refactored to utilize the new Metanthropes™ API. This process continues until everything is refactored to meet the v1 architecture standards. See [#149](https://github.com/Legitamine/metanthropes/issues/149)
-   Re-Rolling a result by spending Destiny, will no longer spam the chat with multiple messages, instead it will update the original message and keep track of how many total re-rolls were made.
-   Initial Font Awesome implementation: Font Awesome icons are now used instead of Emoji for the Critical Success / Failure message in Chat. We will gradually roll-out Emojis in favor of Font Awesome icons in future releases, this is just a small taste of what's to come.
-   Under Game Settings - Configure Settings, all editable options are now grouped under the 'Metanthropes' setting, instead of each Module having their own section. This will help keep the settings more organized and easier to find, especially if you have many other modules installed.

## Fixed:

-   Fixed an issue with Combat that could trigger the end of round effects to fire more than once every round.
-   Fixed many minor issues and typos.

## Known Issues:

-   [Homebrew] When Beta-Testing is enabled, Damage & Healing will apply to targeted actors when you Activate Metapowers or use Possessions, however you are not able to re-roll damage/healing results using Destiny. Workaround: Manually re-roll the damage/healing and apply the new result to the target. This will be addressed in an upcoming hotfix.
-   [Core] Opening a Metapower from the 100 Metapowers Journal doesn't allow switching tabs. Workaround: Unlock the Metapowers Compendium so you can click on the other tabs. See [#303](https://github.com/Legitamine/metanthropes/issues/303) for more details.

## Deprecated:

-   Foundry VTT Version 11 is no longer supported.

---

## ChangeLog Archives

You may find the previous versions of the Changelog in the [Changelog Archives.](https://github.com/Legitamine/metanthropes/blob/main/CHANGELOGARCHIVES.md)
