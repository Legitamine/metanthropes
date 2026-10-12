import { compilePack, extractPack } from "@foundryvtt/foundryvtt-cli";
import * as fs from "fs";
import path from "path";

const SOURCE = path.join("src", "packs");
const DESTINATION = "packs";

let fn;
switch(process.argv[2]) {
  case "pack": fn = compilePacks; break;
  case "unpack": fn = extractPacks; break;
}

// Exit with failure.
if (!fn) process.exit(1);
await fn();

/* -------------------------------------------------- */
/*   Compile Packs                                    */
/* -------------------------------------------------- */

/**
 * Compile the source JSON files into compendium packs.
 */
async function compilePacks() {
  // Determine which source folders to process
  const folders = fs.readdirSync(SOURCE, { withFileTypes: true }).filter(file => file.isDirectory());

  for (const folder of folders) {
    const src = path.join(SOURCE, folder.name);
    const dest = path.join(DESTINATION, folder.name);
    console.log(`Compiling pack ${folder.name}`);
    await compilePack(src, dest, { recursive: true, log: true });
  }
}

/* -------------------------------------------------- */
/*   Extract Packs                                    */
/* -------------------------------------------------- */

/**
 * Extract the contents of compendium packs to JSON files.
 */
async function extractPacks() {
  // Load manifest.
  const manifest = JSON.parse(fs.readFileSync("./system.json", { encoding: "utf8" }));

  // Determine which source packs to process.
  const packs = manifest.packs;

  for (const packInfo of packs) {
    const dest = path.join(SOURCE, packInfo.name);
    console.log(`Extracting pack ${packInfo.name}`);

    await extractPack(path.join(DESTINATION, packInfo.name), dest, {
      log: false,
      clean: true,
      folders: true,
      nedb: false,
      yaml: false,
      jsonOptions: { space: 2 },
      transformEntry: (entry, context = {}) => {},
      transformFolderName: (entry, context = {}) => {
        let name = `${slugify(entry.name)}-${entry._id}`;
        if (context.folder) name = path.join(context, context.folder, name);
        return name;
      },
      transformName: (entry, context = {}) => {
        let name = `${slugify(entry.name)}-${entry._id}.json`;

        if (context.documentType === "Folder") {
          name = path.join(`${slugify(entry.name)}-${entry._id}`, "_folder.json");
        }

        if (context.folder) {
          name = path.join(context.folder, name);
        }
        return name;
      },
    });
  }
}

/* -------------------------------------------------- */

/**
 * Standardize name format.
 * @param {string} name
 * @returns {string}
 */
function slugify(name) {
  return name.toLowerCase().replace("'", "").replace(/[^a-z0-9]+/gi, " ").trim().replace(/\s+|-{2,}/g, "-");
}
