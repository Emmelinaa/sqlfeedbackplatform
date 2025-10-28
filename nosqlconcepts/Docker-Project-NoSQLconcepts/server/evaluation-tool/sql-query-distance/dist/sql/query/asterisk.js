"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asterisk = void 0;
const expression_1 = require("./expression");
const columnReference_1 = require("./columnReference");
const util_1 = require("../../util");
// === Asterisk ===
/**
 * An asterisk expression, optionally referencing a specific table.
 */
class Asterisk extends expression_1.Expression {
    table;
    type = expression_1.ExpressionType.ASTERISK;
    constructor(table = null) {
        super(table !== null ? (0, util_1.cyrb53)(table) : 1, 3, columnReference_1.ColumnReference.HEIGHT);
        this.table = table;
    }
    equals(other, thisQuery, otherQuery) {
        if (!Asterisk.isAsterisk(other) || this.hash !== other.hash)
            return false;
        if (!thisQuery || !otherQuery)
            return false;
        for (let f = 0, fl = Math.max(thisQuery.fromLength, otherQuery.fromLength); f < fl; ++f) {
            if ((f < thisQuery.fromLength && this.table === thisQuery.getFrom(f).alias) !==
                (f < otherQuery.fromLength && other.table === otherQuery.getFrom(f).alias))
                return false;
        }
        return true;
    }
    setTable(table) {
        return new Asterisk(table);
    }
    recursivelyReplace(_multimap, _context, _recursionDepth) {
        return [];
    }
    static baseAsterisk = new Asterisk();
    static isAsterisk(e) {
        return (e !== null) && e.type === expression_1.ExpressionType.ASTERISK;
    }
}
exports.Asterisk = Asterisk;
//# sourceMappingURL=asterisk.js.map