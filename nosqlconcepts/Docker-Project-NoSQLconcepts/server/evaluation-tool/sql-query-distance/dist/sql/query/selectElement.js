"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectElement = void 0;
const hashable_1 = require("./hashable");
const expression_1 = require("./expression");
const util_1 = require("../../util");
// === Select ===
/**
 * An element of the SELECT-clause.
 */
class SelectElement extends hashable_1.Hashable {
    expression;
    as;
    constructor(expression = null, as = null) {
        super((expression ? expression.hash : 0) * 2 + (as != null ? 1 : 0), (expression ? expression.hashMax : 1) * 2);
        this.expression = expression;
        this.as = as;
    }
    equals(other, thisQuery, otherQuery) {
        if (other === null || this.hash !== other.hash)
            return false;
        if (!((this.expression === other.expression) ||
            (this.expression && this.expression.equals(other.expression, thisQuery, otherQuery))))
            return false;
        if (this.as !== other.as)
            return false;
        return true;
    }
    setExpression(expression) {
        return new SelectElement(expression, this.as);
    }
    setAs(as) {
        return new SelectElement(this.expression, as);
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
}
exports.SelectElement = SelectElement;
//# sourceMappingURL=selectElement.js.map