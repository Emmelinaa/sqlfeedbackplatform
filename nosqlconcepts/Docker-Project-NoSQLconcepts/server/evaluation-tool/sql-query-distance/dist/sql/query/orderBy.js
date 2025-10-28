"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderBy = void 0;
const hashable_1 = require("./hashable");
const expression_1 = require("./expression");
const util_1 = require("../../util");
// === Order By ===
/**
 * An element of the ORDER-BY-clause.
 */
class OrderBy extends hashable_1.Hashable {
    descending;
    expression;
    constructor(descending = false, expression = null) {
        super((expression ? expression.hash : 0) * 2 + (descending ? 1 : 0), (expression ? expression.hashMax : 1) * 2);
        this.descending = descending;
        this.expression = expression;
    }
    equals(other, thisQuery, otherQuery) {
        if (other === null || this.hash !== other.hash)
            return false;
        if (this.descending !== other.descending)
            return false;
        if (!((this.expression === other.expression) ||
            (this.expression && this.expression.equals(other.expression, thisQuery, otherQuery))))
            return false;
        return true;
    }
    setDescending(descending) {
        return new OrderBy(descending, this.expression);
    }
    setExpression(expression) {
        return new OrderBy(this.descending, expression);
    }
    recursivelyReplaceExpression(multimap, recursionDepth, query, maxHeight = null) {
        if (recursionDepth < 0)
            return [];
        const context = new expression_1.ExpressionContext([], query, maxHeight);
        const res = [];
        (0, util_1.append)(res, multimap(this.expression, context));
        if (this.expression) {
            (0, util_1.append)(res, this.expression.recursivelyReplace(multimap, context, recursionDepth - 1));
        }
        return res;
    }
    static baseOrderBy = new OrderBy();
}
exports.OrderBy = OrderBy;
//# sourceMappingURL=orderBy.js.map