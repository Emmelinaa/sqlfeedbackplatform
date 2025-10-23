"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Not = void 0;
const util_1 = require("../../util");
const heightInfo_1 = require("../heightInfo");
const expression_1 = require("./expression");
// === Not ===
/**
 * A logical negation expression, containing a subexpression.
 */
class Not extends expression_1.Expression {
    argument;
    type = expression_1.ExpressionType.NOT;
    constructor(argument = null) {
        super((argument ? argument.hash : 0) * 2 + 1, (argument ? argument.hashMax : 1) * 2, argument ? heightInfo_1.HeightInfo.max(argument.height.increase(), Not.EMPTY_HEIGHT)
            : Not.EMPTY_HEIGHT);
        this.argument = argument;
    }
    static EMPTY_HEIGHT = new heightInfo_1.HeightInfo(-1, -1, 0, -1, -1);
    equals(other, thisQuery, otherQuery) {
        if (!Not.isNot(other) || this.hash !== other.hash)
            return false;
        if (!((this.argument === other.argument) ||
            (this.argument && this.argument.equals(other.argument, thisQuery, otherQuery))))
            return false;
        return true;
    }
    setArgument(argument) {
        return new Not(argument);
    }
    recursivelyReplace(multimap, context, recursionDepth) {
        if (recursionDepth < 0)
            return [];
        context.stack.push(this);
        const res = [];
        (0, util_1.append)(res, multimap(this.argument, context));
        if (this.argument) {
            (0, util_1.append)(res, this.argument.recursivelyReplace(multimap, context, recursionDepth - 1));
        }
        context.stack.pop();
        for (let i = 0; i < res.length; ++i)
            res[i] = this.setArgument(res[i]);
        return res;
    }
    static baseNot = new Not();
    static isNot(e) {
        return (e !== null) && e.type === expression_1.ExpressionType.NOT;
    }
}
exports.Not = Not;
//# sourceMappingURL=not.js.map