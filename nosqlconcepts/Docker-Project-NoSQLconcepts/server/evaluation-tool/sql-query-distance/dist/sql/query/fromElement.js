"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FromElement = exports.JoinType = void 0;
const hashable_1 = require("./hashable");
const expression_1 = require("./expression");
const util_1 = require("../../util");
// === From ===
var JoinType;
(function (JoinType) {
    JoinType[JoinType["INNER"] = 0] = "INNER";
    JoinType[JoinType["LEFT_OUTER"] = 1] = "LEFT_OUTER";
    JoinType[JoinType["RIGHT_OUTER"] = 2] = "RIGHT_OUTER";
    JoinType[JoinType["FULL_OUTER"] = 3] = "FULL_OUTER";
})(JoinType = exports.JoinType || (exports.JoinType = {}));
/**
 * An element of the FROM-clause.
 */
class FromElement extends hashable_1.Hashable {
    table;
    join;
    on;
    as;
    alias;
    constructor(table, join = null, on = null, as = null) {
        super(((on ? on.hash : 0) * 2 + (as != null ? 1 : 0)) * 5 + (join != null ? join + 1 : 0), (on ? on.hashMax : 1) * 2 * 5);
        this.table = table;
        this.join = join;
        this.on = on;
        this.as = as;
        this.alias = as || table;
    }
    equals(other, thisQuery, otherQuery) {
        if (other === null || this.hash !== other.hash)
            return false;
        if (this.table !== other.table)
            return false;
        if (this.join !== other.join)
            return false;
        if (!((this.on === other.on) ||
            (this.on && this.on.equals(other.on, thisQuery, otherQuery))))
            return false;
        if ((this.as === null) != (other.as === null))
            return false;
        return true;
    }
    setTable(table) {
        return new FromElement(table, this.join, this.on, this.as);
    }
    setJoin(join) {
        return new FromElement(this.table, join, this.on, this.as);
    }
    setOn(on) {
        return new FromElement(this.table, this.join, on, this.as);
    }
    setAs(as) {
        return new FromElement(this.table, this.join, this.on, as);
    }
    recursivelyReplaceOn(multimap, recursionDepth, query, maxHeight = null) {
        if (recursionDepth < 0)
            return [];
        const context = new expression_1.ExpressionContext([], query, maxHeight);
        const res = [];
        (0, util_1.append)(res, multimap(this.on, context));
        if (this.on) {
            (0, util_1.append)(res, this.on.recursivelyReplace(multimap, context, recursionDepth - 1));
        }
        return res;
    }
}
exports.FromElement = FromElement;
//# sourceMappingURL=fromElement.js.map