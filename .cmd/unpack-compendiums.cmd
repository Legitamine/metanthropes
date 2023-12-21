// Run this in a new Git cmd window when you have made changes to Compendiums within FoundryVTT
// Make sure FoundryVTT Electron app is closed before running this
// Select these commands, CTRL+C, and then right click on the Git cmd window, to paste them and press enter
// This should take about a minute and once complete, you can close the Git cmd window
//todo: use recursion and make it so that it's the same for modules and systems
npm install -g @foundryvtt/foundryvtt-cli
fvtt configure set installPath "F:/FoundryVTT/Foundry Virtual Tabletop"
fvtt configure set dataPath "F:/FoundryVTT/"
fvtt package workon "metanthropes" --type "System"
fvtt package unpack "metapowers" --out "F:/FoundryVTT/Data/systems/metanthropes/src/packs/metapowers"
fvtt package unpack "narrator-toolkit" --out "F:/FoundryVTT/Data/systems/metanthropes/src/packs/narrator-toolkit"
fvtt package unpack "possessions" --out "F:/FoundryVTT/Data/systems/metanthropes/src/packs/possessions"
fvtt package unpack "premade-protagonists" --out "F:/FoundryVTT/Data/systems/metanthropes/src/packs/premade-protagonists"
fvtt package unpack "premade-antagonists" --out "F:/FoundryVTT/Data/systems/metanthropes/src/packs/premade-antagonists"
fvtt package unpack "rollable-tables" --out "F:/FoundryVTT/Data/systems/metanthropes/src/packs/rollable-tables"
