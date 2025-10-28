"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEdit = void 0;
/**
 * Adds a given edit to a given set of edits.
 *
 * @param set the set of edit to add to
 * @param edit the edit to add
 * @throws an error if there already is an edit with the same name in the set
 *         or the edit's cost is not an integer
 */
function addEdit(set, edit) {
    if (set.has(edit.name))
        throw new Error(`Edit ${edit.name} already exists.`);
    if (edit.cost % 1 !== 0)
        throw new Error(`Edit cost ${edit.cost} is not an integer.`);
    set.set(edit.name, edit);
}
exports.addEdit = addEdit;
//# sourceMappingURL=edit.js.map