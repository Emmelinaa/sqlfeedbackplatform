"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultConfig = exports.shortcutEdits = exports.horizontalEdits = exports.atomicEdits = void 0;
const atomicEdits_1 = require("./edits/atomicEdits");
const horizontalEdits_1 = require("./edits/horizontalEdits");
const shortcutEdits_1 = require("./edits/shortcutEdits");
var atomicEdits_2 = require("./edits/atomicEdits");
Object.defineProperty(exports, "atomicEdits", { enumerable: true, get: function () { return atomicEdits_2.atomicEdits; } });
var horizontalEdits_2 = require("./edits/horizontalEdits");
Object.defineProperty(exports, "horizontalEdits", { enumerable: true, get: function () { return horizontalEdits_2.horizontalEdits; } });
var shortcutEdits_2 = require("./edits/shortcutEdits");
Object.defineProperty(exports, "shortcutEdits", { enumerable: true, get: function () { return shortcutEdits_2.shortcutEdits; } });
/**
 * Copies the entries of one set of edits to another.
 *
 * @param from the set of edits to copy from
 * @param to the set of edit to copy to
 */
function copyEntries(from, to) {
    for (let [key, value] of from)
        to.set(key, Object.assign({}, value));
}
/**
 * Creates and returns a new set of edits with default cost configuration
 * by merging [[`atomicEdits`]], [[`horizontalEdits`]] and [[`shortcutEdits`]].
 *
 * @returns a set of edits with default configuration
 */
function createDefaultConfig() {
    let defaultConfig = new Map();
    copyEntries(atomicEdits_1.atomicEdits, defaultConfig);
    copyEntries(horizontalEdits_1.horizontalEdits, defaultConfig);
    copyEntries(shortcutEdits_1.shortcutEdits, defaultConfig);
    return defaultConfig;
}
exports.createDefaultConfig = createDefaultConfig;
//# sourceMappingURL=config.js.map