# Latest Changes

These are the latest changes of the Metanthropes System for Foundry VTT.

Included in these notes, is also the changelog for all the Premium Modules for Foundry VTT, by Legitamine Games.

The format is based on [Keep a Changelog.](https://keepachangelog.com/en/1.1.0/)

---

## Early Access Releases

# Early Access v0.13.6 [2025-06-xx]

## Added:

-   Foundry version 13.345 is now supported.
-   You can now pick a custom color that will be applied to Font Awesome Icons for Destiny (+++??).
-   A new way to create Font Awesome Icons, with our own FA styling (sharp-duotone solid), using text enrichers. See #394 on how to configure your own content (requires a valid Font Awesome Pro license).

## Fixed:

-   Replaced the loading screen that appears when first initializing a World, that stays up until the active scene loads. This image now uses the new cover image from the system. The old image was reported to cause motion sickness.
-   Fixed the issue with dissappearing Font Awesome icons when editing a Journal page or a Possession's effect description fields.
-   Better aligned the FontAwesome Icons that show up on chat during the Activation of Metapowers and Usage of Possessions.

# Early Access v0.13.5 [2025-06-05]

## Added:

-   Foundry version 13.344 is now supported.
-   [INTRODUCTORY] New Entering the Opera Cinematic Scene. A short cinematic of entering and walking around the Opera from a first-person view.
-   [CORE] Possessions Compendium now includes a total of 100 Possessions from 3 eras: Archaic, Modern, Futuristic. These are sorted into Weapons, Armors, Gadgets and Drugs.
-   [Introductory] New compendiums with Actors, Scenes, Macros and Journals, for the experienced Narrator, so they can import specific content, without having to import the full adventure, if they so choose.

## Changed:

-   New Compendium structure is introduced, sorting all our Premium content in a consistent and clean folder structure organized by Compendium type. If you are updating your World from a previous Metanthropes version, you will have both the old and the new Compendium structure in your World and you can see [#338](https://github.com/Legitamine/metanthropes/issues/338) on how to fix this.
-   New cover images for the System & Premium Modules.
-   Reorganized the various Journals; this is the first step in a series of improvements planned for Journals in the road to Metanthropes v1.0, more improvements will come in follow up builds.

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
-   New defaults for all prototype Tokens including a Metanthropes Logo turn marker
-   New API functionality to control dealing damage/healing to multiple targets, including re-rolls.

## Changed:

-   All emojis have been replaced by Font Awesome icons, as Metanthropes now comes with a Font Awesome Pro license and our own custom icons, starting with the Metanthropes Logo. These will be colored and animated automatically, according to contextual information in later releases.
-   [Introductory] Deprecated recommended/required 3rd modules until we officially support 3rd party modules. FXMaster that was used previously for Dimensional effects, has been replaced by our custom effects, included with this release.
-   Changed the Welcome Lobby / Demo scene with new artwork from Metanthropes: Anthologies.
-   Changed API Roll d100 dice functions have been refactored to support localization & using fields API & APP V2. This is effort is ongoing and more App V2 updates are coming in the near future.
-   Metanthropes Premium Modules have been updated to use & extend the Metanthropes API.
-   Chat inline rolls now follow our own custom UI/UX style, instead of the default Foundry VTT UI style which was used previously, this is still evolving and will become better in later updates.
-   Many Development evironment updates, with an improved process that moves SCSS compiling during release building. Moving to support CSS Cascade layers to align with FVTT V13 structure onwards. We are laying the path to allow contributors in the future and this effort will continue in later releases.
-   Improved the documentation for the Metanthropes API.
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
-   Metanthropes API is introduced. This is part of the new v1 architecture and will further expand in future releases.
-   Multi-language support is introduced. This is foundation work as part of the new v1 architecture and multi-language support will be added as we transition to AppV2 for the UI.
-   From this release and onwards, we have adopted Conventional Commits for this project. This will help us better track changes and releases. See [#271](https://github.com/Legitamine/metanthropes/issues/271)
-   Updated the Welcome Compendium to include 3 new Journals : How to Play, Protagonists & Rules for Metanthropes TTRPG.
-   [Core] Added a new 'Narrator Journal', found under Compendiums - Core - Journals. This Journal brings together many advices, tips & tricks and information for new and experienced Narrators alike. It covers Preparation, World Building, Delivery and Techniques.
-   [Core] Updated the Possessions compendium to include a total of 78 items, adding various Armors, Weapons and Gadgets.
-   [Homebrew] Initial support for Audio & Visual effects. Items now have a new Tab that will allow to enter Document UUIDs for Macros and Playlist sounds that will be triggered when succesfully activating a Metapower or Possession. This is an initial implementation that will gradually expand to fully automate the Visual/Audio effects for Metapowers and Possessions. See [#323](https://github.com/Legitamine/metanthropes/issues/323)
-   [Homebrew] Beta Testing for automated Damage / Healing application. Damage and Healing will now apply as part of successfully activating a Metapower or using a Possession that deal Damage or apply Healing. Damage will take into account the target's resistances. Narrators can click on a new button next to the Actor's Life to undo the latest Life change that was applied automatically.

## Changed:

-   All compendiums have been re-organized and **you no longer need to import any content to the World** for the System, Core & Homebrew Modules to work as intended. This will help keep your Worlds clean and organized. If you choose to install the System Adventure, when prompted after the first World load, or later via the Installation folder in the Compendiums tab, it will import the Demo content and a copy of all Journals, Macros and Rollable tables to your World. The Metanthropes: Introductory Module still needs to import the installation adventure, to work as intended.
-   [BREAKING CHANGE] Assets have now been consolidated under a new folder structure. This will cause existing Worlds to not show images for actors, items, journals and compendiums properly.
-   [BREAKING CHANGE] A good portion of the prototype code is now refactored to utilize the new Metanthropes API. This process continues until everything is refactored to meet the v1 architecture standards. See [#149](https://github.com/Legitamine/metanthropes/issues/149)
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
