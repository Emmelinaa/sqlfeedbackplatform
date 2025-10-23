"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnReference = void 0;
const util_1 = require("../../util");
const heightInfo_1 = require("../heightInfo");
const expression_1 = require("./expression");
// === Column Reference ===
/**
 * A column-reference expression, referencing the name of a column and optionally its table.
 */
class ColumnReference extends expression_1.Expression {
    column;
    table;
    type = expression_1.ExpressionType.COLUMN_REFERENCE;
    constructor(column, table = null) {
        super((0, util_1.cyrb53)(column) + (table !== null ? 2 : 1), 3, ColumnReference.HEIGHT);
        this.column = column;
        this.table = table;
    }
    static HEIGHT = new heightInfo_1.HeightInfo(0, -1, -1, -1, -1);
    equals(other, thisQuery, otherQuery) {
        if (!ColumnReference.isColumnReference(other) || this.hash !== other.hash)
            return false;
        if (this.column !== other.column)
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
    setColumn(column) {
        return new ColumnReference(column, this.table);
    }
    setTable(table) {
        return new ColumnReference(this.column, table);
    }
    recursivelyReplace(_multimap, _context, _recursionDepth) {
        return [];
    }
    static isColumnReference(e) {
        return (e !== null) && e.type === expression_1.ExpressionType.COLUMN_REFERENCE;
    }
}
exports.ColumnReference = ColumnReference;
//# sourceMappingURL=columnReference.js.map