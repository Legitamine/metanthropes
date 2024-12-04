/**
 * Expects to receive Items as input and will sort them by placing Possessions on top, followed by Metapowers, descending by their Level.
 * @param {*} actions 
 * @returns 
 */
export function metaSortActions(actions) {
    return actions.sort((a, b) => {
        if (a.type === "Possession" && b.type !== "Possession") {
            return -1;
        }
        if (a.type !== "Possession" && b.type === "Possession") {
            return 1;
        }
        if (a.type === "Metapower" && b.type === "Metapower") {
            return b.system.Level.value - a.system.Level.value;
        }
        return 0;
    });
}