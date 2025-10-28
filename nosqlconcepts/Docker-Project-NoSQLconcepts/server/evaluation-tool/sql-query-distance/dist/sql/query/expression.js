"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpressionContext = exports.Expression = exports.ExpressionType = void 0;
const hashable_1 = require("./hashable");
// === Expression ===
var ExpressionType;
(function (ExpressionType) {
    ExpressionType[ExpressionType["ASTERISK"] = 0] = "ASTERISK";
    ExpressionType[ExpressionType["COLUMN_REFERENCE"] = 1] = "COLUMN_REFERENCE";
    ExpressionType[ExpressionType["LITERAL"] = 2] = "LITERAL";
    ExpressionType[ExpressionType["NOT"] = 3] = "NOT";
    ExpressionType[ExpressionType["AGGREGATION"] = 4] = "AGGREGATION";
    ExpressionType[ExpressionType["BINARY"] = 5] = "BINARY";
})(ExpressionType = exports.ExpressionType || (exports.ExpressionType = {}));
/**
 * An expression.
 */
class Expression extends hashable_1.Hashable {
    height;
    type;
    constructor(hash, hashMax, height) {
        super(hash, hashMax);
        this.height = height;
    }
}
exports.Expression = Expression;
/**
 * A container for information about the context of the current expression.
 * Passed through recursivelyReplace(), which keeps track of the stack, into multimap().
 */
class ExpressionContext {
    stack;
    query;
    maxHeight;
    constructor(
    /**
     * The stack of parent-expressions containing the current expression.
     * (The top of the stack is the direct parent, the bottom is the root expression.)
     */
    stack, 
    /**
     * The query containing the current expression (sub-)tree.
     * (Used for comparing and further information e.g., tables referenced in the FROM-clause.)
     */
    query, 
    /**
     * The maximum height the root of the current expression (sub-)tree is allowed to have
     * after recursivelyReplace() replaces the current expression (sub-)tree
     * with any of the results of multimap().
     * (Used to limit the height of an expression tree, so it does not grow infinitely.)
     */
    maxHeight) {
        this.stack = stack;
        this.query = query;
        this.maxHeight = maxHeight;
    }
}
exports.ExpressionContext = ExpressionContext;
//# sourceMappingURL=expression.js.map