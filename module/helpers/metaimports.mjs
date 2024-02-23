import { metaLog } from "../helpers/metahelpers.mjs";
/**
 * Configuration mapping for module identifiers to their paths and setting keys.
 */
const metaModuleConfig = {
	"metanthropes-introductory": {
		path: "../../../../modules/metanthropes-introductory/module/",
		settingKey: "metaIntroductory",
	},
	"metanthropes-core": {
		path: "../../../../modules/metanthropes-core/module/",
		settingKey: "metaCore",
	},
	"metanthropes-homebrew": {
		path: "../../../../modules/metanthropes-homebrew/module/",
		settingKey: "metaHomebrew",
	},
};

/**
 * Helper function to dynamically import functionality from specified modules using predefined configurations.
 *
 * @param {string} moduleId - The identifier of the module from which to import.
 * @param {string} folderName - The name of the folder in the module from which to import.
 * @param {string} fileName - The name of the file in the folder from which to import.
 * @param {string} exportName - The name of the exported function to import from the module.
 * @returns {Promise<Function|undefined>} - The imported module function or undefined.
 */
export async function metaImportFromModule(moduleId, folderName, fileName, exportName) {
	if (!metaModuleConfig[moduleId]) {
		metaLog(
			2,
			"metaImportFromModule",
			"metaModuleConfig",
			`Module identifier '${moduleId}' not found in configuration.`
		);
		return undefined;
	}
	const { path, settingKey } = metaModuleConfig[moduleId];
	const isModuleEnabled = await game.settings.get("metanthropes", settingKey);
	if (isModuleEnabled) {
		try {
			const modulePath = `${path}/${folderName}/${fileName}.mjs`;
			const module = await import(modulePath);
			metaLog(3, "metaImportFromModule", `Import ${exportName} From ${moduleId}`, module);
			return module[exportName];
		} catch (error) {
			metaLog(
				2,
				"metaImportFromModule",
				`Error importing ${exportName} from module with path ${modulePath}`,
				error
			);
			return undefined;
		}
	}
	return undefined;
}
