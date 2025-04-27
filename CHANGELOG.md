# Latest Changes

These are the latest changes of the Metanthropes System for Foundry VTT.

Included in these notes, is also the changelog for all the Premium Modules for Foundry VTT, by Legitamine Games.

The format is based on [Keep a Changelog.](https://keepachangelog.com/en/1.1.0/)

---

## Early Access Releases

# Early Access v0.13.0 [2025-xx-yy]

## Added:
- theme support & developer environment updates

# Early Access v0.12.2 [2025-01-29]

## Added:
- Added a link to the Metanthropes: Introductory trailer on the Welcome Journal.
- [Core]: Added a new Adventure Compendium to help import the Core Journals to your World.

## Fixed:
- Fixed two broken links on the Welcome Journal.
- [Core]: Fixed the missing Journals from the Core Journals Compendium.

# Early Access v0.12.1 [2025-01-28]

## Added:
- Foundry VTT version 12 is now supported. Latest verified version is v12.331.
- New Actions tab for Actors. This new Actor Sheet tab will consolidate all available actions for the Actor from Metapowers & Possessions in a single tab. This tab will expand to become more dynamic while Combat is active in future releases.
- Metanthropes API is introduced. This is part of the new v1 architecture and will further expand in future releases.
- Multi-language support is introduced. This is foundation work as part of the new v1 architecture and multi-language support will be added as we transition to AppV2 for the UI.
- From this release and onwards, we have adopted Conventional Commits for this project. This will help us better track changes and releases. See [#271](https://github.com/Legitamine/metanthropes/issues/271)
- Updated the Welcome Compendium to include 3 new Journals : How to Play, Protagonists & Rules for Metanthropes TTRPG.
- [Core] Added a new 'Narrator Journal', found under Compendiums - Core - Journals. This Journal brings together many advices, tips & tricks and information for new and experienced Narrators alike. It covers Preparation, World Building, Delivery and Techniques.
- [Core] Updated the Possessions compendium to include a total of 78 items, adding various Armors, Weapons and Gadgets.
- [Homebrew] Initial support for Audio & Visual effects. Items now have a new Tab that will allow to enter Document UUIDs for Macros and Playlist sounds that will be triggered when succesfully activating a Metapower or Possession. This is an initial implementation that will gradually expand to fully automate the Visual/Audio effects for Metapowers and Possessions. See [#323](https://github.com/Legitamine/metanthropes/issues/323)
- [Homebrew] Beta Testing for automated Damage / Healing application. Damage and Healing will now apply as part of successfully activating a Metapower or using a Possession that deal Damage or apply Healing. Damage will take into account the target's resistances. Narrators can click on a new button next to the Actor's Life to undo the latest Life change that was applied automatically.

## Changed:
- All compendiums have been re-organized and **you no longer need to import any content to the World** for the System, Core & Homebrew Modules to work as intended. This will help keep your Worlds clean and organized. If you choose to install the System Adventure, when prompted after the first World load, or later via the Installation folder in the Compendiums tab, it will import the Demo content and a copy of all Journals, Macros and Rollable tables to your World. The Metanthropes: Introductory Module still needs to import the installation adventure, to work as intended.
- [BREAKING CHANGE] Assets have now been consolidated under a new folder structure. This will cause existing Worlds to not show images for actors, items, journals and compendiums properly.
- [BREAKING CHANGE] A good portion of the prototype code is now refactored to utilize the new Metanthropes API. This process continues until everything is refactored to meet the v1 architecture standards. See [#149](https://github.com/Legitamine/metanthropes/issues/149)
- Re-Rolling a result by spending Destiny, will no longer spam the chat with multiple messages, instead it will update the original message and keep track of how many total re-rolls were made.
- Initial Font Awesome implementation: Font Awesome icons are now used instead of Emoji for the Critical Success / Failure message in Chat. We will gradually roll-out Emojis in favor of Font Awesome icons in future releases, this is just a small taste of what's to come.
- Under Game Settings - Configure Settings, all editable options are now grouped under the 'Metanthropes' setting, instead of each Module having their own section. This will help keep the settings more organized and easier to find, especially if you have many other modules installed.

## Fixed:
- Fixed an issue with Combat that could trigger the end of round effects to fire more than once every round.
- Fixed many minor issues and typos.

## Known Issues:
- [Homebrew] When Beta-Testing is enabled, Damage & Healing will apply to targeted actors when you Activate Metapowers or use Possessions, however you are not able to re-roll damage/healing results using Destiny. Workaround: Manually re-roll the damage/healing and apply the new result to the target. This will be addressed in an upcoming hotfix.
- [Core] Opening a Metapower from the 100 Metapowers Journal doesn't allow switching tabs. Workaround: Unlock the Metapowers Compendium so you can click on the other tabs. See [#303](https://github.com/Legitamine/metanthropes/issues/303) for more details.

## Deprecated:
- Foundry VTT Version 11 is no longer supported.

---
## ChangeLog Archives

You may find the previous versions of the Changelog in the [Changelog Archives.](https://github.com/Legitamine/metanthropes/blob/main/CHANGELOGARCHIVES.md)
