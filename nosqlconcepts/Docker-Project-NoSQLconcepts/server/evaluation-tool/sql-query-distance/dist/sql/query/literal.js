"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Literal = void 0;
const util_1 = require("../../util");
const heightInfo_1 = require("../heightInfo");
const expression_1 = require("./expression");
// === Literal Value ===
/**
 * A literal expression, consisting of a string or number value.
 */
class Literal extends expression_1.Expression {
    value;
    type = expression_1.ExpressionType.LITERAL;
    constructor(value) {
        super(typeof value == "string" ? (0, util_1.cyrb53)(value) : value, 2, Literal.HEIGHT);
        this.value = value;
    }
    static HEIGHT = new heightInfo_1.HeightInfo(-1, 0, -1, -1, -1);
    equals(other, thisQuery, otherQuery) {
        if (!Literal.isLiteral(other) || this.hash !== other.hash)
            return false;
        if (this.value !== other.value)
            return false;
        return true;
    }
    setValue(value) {
        return new Literal(value);
    }
    recursivelyReplace(_multimap, _context, _recursionDepth) {
        return [];
    }
    static isLiteral(e) {
        return (e !== null) && e.type === expression_1.ExpressionType.LITERAL;
    }
}
exports.Literal = Literal;
//# sourceMappingURL=literal.js.map