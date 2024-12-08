
/**
 * metaRunMacro executes a Macro document by its UUID.
 *
 * @export
 * @async
 * @param {string} macroDocumentID
 * @returns {*}
 */
export async function metaRunMacro(macroDocumentID) {
	metanthropes.utils.metaLog(3, "metaRunMacro", "Running Macro:", macroDocumentID);
	try {
		const macro = await fromUuid(macroDocumentID);
		if (!(macro instanceof Macro)) {
			metanthropes.utils.metaLog(2, `The UUID does not point to a Macro document: ${macroDocumentID}`);
			return;
		}
		macro.execute();
	} catch (error) {
		metanthropes.utils.metaLog(2, "metaRunMacro", `Error for ${macroDocumentID}:`, error);
	}
}