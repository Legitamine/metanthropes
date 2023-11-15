# Latest Changes

These are the latest changes to the Metanthropes RPG System for Foundry VTT

Based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format

# Early Access v0.8

## New Features:

-   Added buttons on the header of the Actor sheet to resize the Actor sheet to 5 preconfigured states: Single Column, Small, Medium, Normal (default) and Extended. You can still resize the sheet manually to your liking and now the UI will change the ammount of information it displays based on the width of the new size when you release the button. Clicking on the first two, will also switch your active tab to the Actors' Stats
-   Added the Effects tab in the Actor sheet, where you can see all the Active Effects that the Actor has, the Immunities, Detections and Shifts as well as a section with Movement, Resistances and Cover information. This tab will be further expanded in future releases
-   Beta Testing of New Features (Narrator Only): You can find a new setting in the 'Configure Settings -> Metanthropes' Section where you can turn on the 'Enable Beta Testing of New Features' option. This will allow you to test new features that are currently in development. This feature is turned off by default
-   New Console Logging functionality: Added a new setting that can be found in the 'Configure Settings -> Metanthropes' Section where you can turn on the 'Enable Advanced Logging' feature. This becomes handy, if you encounter a bug, to collect more information that will assist us in troubleshooting. This setting also enables a new icon on the Actor and Item sheets that outputs the document to the Console. This feature is turned off by default
-   Added the 'Narrator Toolkit' Compendium, a collection of Macros designed to help the Narrator with the game flow and automate the End of Scene/Session/Arc player awards. Two utilities to help you manage your Protagonists' Details and Stats also exist. You can find it in the Compendiums Tab of the Sidebar - available for Narrators and Assistants only
-   Added 'Reduction' to the Custom Roll dialog, when Right Clicking on an Item Roll. This integrates with the existing automations when Rolling and will show the effects on the Chat. This acts as a placeholder for the upcoming Aiming & Targeting system
-   Added the 'Random Location' Roll Table to be able to quickly roll a random location on the body. This is a placeholder for the upcoming Aiming & Targeting system
-   Added the Cover Roll by clicking on any of the 4 Cover Types under the new Effects Tab. This is a random d100 roll that you can spend Destiny to reroll. This is a placeholder for the upcoming Aiming & Targeting system
-   Added automation for the Bleeding Core Condition. During Combat, if an Actor has the Bleeding Condition, they will now automatically lose 1 Life per Level of Bleeding, at the end of each Combat Round
-   Added automation for the Hunger Core Condition. Every time the Actor attempts a roll, they will now first have to overcome a Hunger Check. If they fail, their action is canceled and they can spend Destiny to reroll the Hunger Check until they succeed. Once they do, ther initial attempted action will resume execution
-   Added automation for the Fatigue, Unconsious and Asphyxiation Core Conditions. During Combat, if an Actor has any of these Conditions, they will now be informed in the chat at the end of each Combat Round about what is the effect of that Condition. This will help keep the Narrator and Player informed about the status of the Actor and any further rolls or actions that might be required
-   Added automation for the Duplicate Self Metapower. It used to require many extra manual steps from the Narrator, now the process is fully-automated, requiring the Narrator to only do a right-click on the Actor in the Sidebar and select 'Duplicate' for the Protagonist (or Metanthrope) that has successfully activated the Duplicate Self Metapower. Then the Narrator can drag the new Duplicate to the Canvas, as many times as the number of Clones required and nothing further is required from the Narrator. The Duplicates will have the correct Stat Scores and Maximum Life, will not have any Effects, Conditions or Buffs applied, will not have any Metapowers or Possessions besides 'Strike' and will be unlinked from the original Actor, allowing for multiple clones. Players can fully control their Duplicates and can use the Tab key to switch between them
-   Added Automation to equip the Possession 'Strike' to all applicable New Actors

## Changed:

-   Cleaned up and improved the majority of the code documentation. This is a non-visual change that won't affect the gameplay in any way, but will help other developers (and myself) when reviewing and making further changes to the code
-   The World now automatically becomes unpaused when the Metanthropes System Finishes Loading
-   When using a Possession that requires a Perk Skill at a certain Level, it will now Reduce the result of the roll, instead of imposing a Penalty on it. Note that Reductions stack with each other, so trying a Multi-Action, together with missing Perk Skill Levels, will now greatly reduce your chances of using that Possession successfully
-   When you mouse-over the Name of a Metapower or Possession, you will now see a tooltip with the Effect of that Item. Clicking on the Name will open the Item sheet, as before
-   Removed the 'Sheet' Button from the Header of the Actor and Item sheets. This was used in development and no longer needed
-   Removed the Close and Cancel buttons (as well as the ability to close the dialog with 'Esc') from the Roll New Actor process. You can still cancel the process, before you make your first roll. If any error is detected during the process, it will automatically reset itself and you can start over
-   Added the word 'Spend' to re-rolling d10 button in the chat, to make it more clear that you are spending Destiny to reroll the dice
-   Refactored the Actor Sheet, consolidated 11 sheets (per Type) into a single document that is dynamically created & rendered based on the Actor Type and features that Actor needs
-   Added some validation logic to the 'New Actor' and the 'Finalize Premade Protagonist' processes, to ensure required values are set properly
-   Added support for 3rd party Module [Hide Player UI](https://foundryvtt.com/packages/hide-player-ui) to conseal UI elements not used by players, great for the New Player Experience
-   Added a field called 'Permanent Effects' to Items (Metapowers/Possessions) to distinguish between activated Effects that show up in Chat and Permanent Effects that are always active. Renamed 'Effect Description' to just 'Effect'
-   Added new fields to Items to indicate the VS Stat Roll, any Permanent Buffs and the Area Effect (Type). These will show when applicable in the Item Sheet and the Chat
-   Duplicate Clones now behave properly when having multiple Duplicates from various Actors in a Combat Encounter. They will now be properly shorted at the end of each Combat Round, based on their Reflexes Score, with the ones that have higher Reflexes going first
-   Gave the Narrator the ability to change an Actor's available Destiny on the fly, by changing the value in the Actor's sheet. Note that Destiny is awarded properly via the 'Narrator Toolkit' Macros and this is only meant to be used manually in special cases
-   Changed the tooltip system to take advantage of Foundry's built-in tooltip system. This results in bigger tooltips that are faster to render and easier to read

### Fixed:

-   Fixed various minor issues and optimized the code for better performance and error handling
-   Fixed Pain Condition to only change your result to Failure if it is greater than your Levels of Success. Previously it would also give you Levels of Failure, which was not intended
-   Fixed an issue that was causing d10 rolls to explode on 1's and 2's when it was not intended to do so

### Known Issues:

-   Adding a new Item (Metapower, Possession) to an Actor, will hide the Stat Scores on the Item pages. This is a visual bug and to fix, either make any roll with the Actor, or change the Actor Sheet size via the icons on the header, or close and re-open the Sheet
-   When a new Combat Encounter begins, players see 3 Error Notifications saying something similar to: 'Player cannot update the combat document'. This issue is not affecting the gameplay and can be safely ignored. We are investigating the root cause and will be addressing this in a future release
-   Resizing the Actor Sheet manually, is not a real-time effect and needs a second after releasing the resize control to change the UI. We'd like to make it real-time in the future, after we investigate the performance impact this change would have

### Deprecated:

-   Old Cover system is now deprecated and will be removed in v0.9

### Removed:

-   Removed the old Item and Actor definitions that were deprecated in v0.7

### In Beta Testing:

-   New Progression process: Added a new button on the Actor Sheet that will start the Actor progression process, to spend Experience points to increase Characteristics, Stats, Metapowers and Perks. It will also award a Protagonist with additional 25 Life, for every 5.000 Experience points accumulated. This feature is in early development and not functional.
-   Active Effects: Added a new section to the Actor Sheet that displays all Active Effects that the Actor has. This feature is in early development and not functional.
-   Targeting: Testing the new Targeting feature, now when Activating a Metapower or Using a Posssession, there will be an extra Chat message, indicating the targets that were selected. This feature is for testing the targeting feature and evaluating how it will be used in conjuction with the Execution of Metapowers/Possessions and not truly functional yet.

# Previous Version: v0.7.85

## Added:

-   Fully automated Stat, Initiative, Metapower, Possession and Strike Rolls. Right clicking allows the player to set custom options
-   New approach to rolling a new Protagonist. 10 steps designed to guide the player throughout the creation process
-   New tooltips (mouse over to see information) for the majority of the UI elements of the Actorsheet
-   New Protagonist ActorSheet sections: Notes & Summary
-   Movement Score is now automatically calculated based on Speed, Weight and Size and is reflected in the grid when you move your Actor. Green is for normal movement, Yellow for Additional Movement, Orange for Sprint and Red for no more movement. (requires Drag Ruler module)
-   Besides being able to click (or right-click) on the Stat for a Metapower or Possession tabs in your Actorsheet to roll it, you may now click on the Stat on the top of the Metapower or Possession sheet to roll it as well
-   Possessions now may require a Perk to be a certain Level and will add a -10% Penalty to the roll for each Level missing
-   Activations for Metapowers and Possessions that are 'Always Active', now properly prevent you from rolling the dice and display an information message in the client instead
-   When Activating a Metapower and when Using a Possession and an Actor' Rolls a Critical Success/Failure and/or when the Actordoesn't have enough Destiny to spend on rerolls, the Metapower or Possession will auto-activate and the result will be displayed in the chat
-   An Actor's Initiative will now automatically roll with the highest amongst Awareness, Reflexes and Perception, as long as the Actorhas the appropriate Metapower like Danger Sense (6th Sense) and Temporal Awareness (Time Bending)
-   Pain now is automatically calculated, lowering your levels of success and informing you about it in the chat
-   Non-linked Actors are now available to Narrators
-   Introduced Narrator's Toolbox: a set of Narrator-only macros designed to help with the game flow and automate the end of Scene/Session/Arc player awards
-   New Supported module: Carousel Combat Tracker (PR pending)
-   New Supported module: DF Chat Enhancements
-   New Supported module: Monks' Token Bar
-   New Supported module: Streamer View

## Changed:

-   Foundry version 11 is now required
-   Change Log (this page) will from now on follow the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format
-   Revamped the Actorsheet to be more intuitive and take less screen 'real estate'
-   Metapowers and Possessions details are now only editable by Narrators
-   Revamped the Items sheets (Metapowers & Possessions) to be more intuitive and take less screen 'real estate'
-   Changed Destiny Reroll button in chat, to now only be visible to the owner of that Actorand the Narrator (currently requires module DF Chat Enhancements)
-   Protagonists and Metanthropes are now Actor-Linked to their tokens, all other Actor types are not linked by default
-   New Actors will now have their token default values change once the 'Roll new Actor' 10-step process is completed. The 'Finish Premade Protagonist' button will also trigger similar changes. This controls the visibility of the Name, Life & Destiny Bars and disposition towards other actors: Protagonists are Friendly to each other, Metatherions are Hostile and other actors are Neutral by default.
-   All built-in d20 references have been changed to d10 dice
-   When an Actor's maximum Life drops (because of Burned condition for example) and their current Life is now greater than their new maximum Life, their current Life will now be set to the new maximum

### Fixed:

-   Fixed a known issue with the Metapower & Possession Sheets not displaying Stat Scores correctly after rolling
-   Fixed an issue where chat displayed 'null' when using an item with an empty Effect Description
-   Fixed an issue where the Combat Tracker did not display the correct values for the current Cycle and Round
-   Fixed an issue where after changing into a new Cycle and rolling a new initiative, the Combat Tracker did not order the Turn order correctly
-   Fixed a minor bug where Maximum Life would sometimes not calculate correctly if the Actor had negative Stored Experience

### Deprecated:

-   Deprecated the Items and Actors from previous versions. They will still open in v0.7 allowing you to migrate any data you need to the new Actors and Items. These will be removed in v0.8

### Unreleased:

-   Progression of Characteristics and Stats, Metapowers and Perks (scheduled for v0.8)
-   Official support for modules: Terrain Ruler and Enhanced Terrain Layer (scheduled for v0.9)
-   Size Score will now properly buff unarmed strike dice damage (scheduled for v0.9)

# Archived Versions

You may find the previous versions of the Changelog in the [Changelog Archives](https://github.com/Legitamine/metanthropes-system/blob/main/CHANGELOGARCHIVES.md)

Our eternal gratitude goes to the amazing community of Foundry Developers <3
