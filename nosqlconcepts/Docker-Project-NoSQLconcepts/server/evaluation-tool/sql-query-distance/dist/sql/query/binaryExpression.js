"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryExpression = exports.OperatorType = void 0;
const util_1 = require("../../util");
const heightInfo_1 = require("../heightInfo");
const expression_1 = require("./expression");
// === Binary Expression ===
var OperatorType;
(function (OperatorType) {
    OperatorType[OperatorType["EQUALS"] = 0] = "EQUALS";
    OperatorType[OperatorType["AND"] = 1] = "AND";
    OperatorType[OperatorType["OR"] = 2] = "OR";
    OperatorType[OperatorType["LESS"] = 3] = "LESS";
    OperatorType[OperatorType["GREATER"] = 4] = "GREATER";
})(OperatorType = exports.OperatorType || (exports.OperatorType = {}));
/**
 * A binary expression, combining two subexpressions with an operator.
 */
class BinaryExpression extends expression_1.Expression {
    operator;
    left;
    right;
    type = expression_1.ExpressionType.BINARY;
    constructor(operator, left = null, right = null) {
        super(((right ? right.hash : 0) * (left ? left.hashMax : 1) + (left ? left.hash : 0))
            * 5 + operator, (left ? left.hashMax : 1) * (right ? right.hashMax : 1) * 5, (left && right) ?
            heightInfo_1.HeightInfo.max(heightInfo_1.HeightInfo.max(left.height.increase(), right.height.increase()), BinaryExpression.EMPTY_HEIGHT) :
            (left || right) ?
                heightInfo_1.HeightInfo.max((left ? left : right).height.increase(), BinaryExpression.EMPTY_HEIGHT)
                : BinaryExpression.EMPTY_HEIGHT);
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
    static EMPTY_HEIGHT = new heightInfo_1.HeightInfo(-1, -1, -1, -1, 0);
    equals(other, thisQuery, otherQuery) {
        if (!BinaryExpression.isBinaryExpression(other) || this.hash !== other.hash)
            return false;
        if (this.operator !== other.operator)
            return false;
        if (!((this.left === other.left) ||
            (this.left && this.left.equals(other.left, thisQuery, otherQuery))))
            return false;
        if (!((this.right === other.right) ||
            (this.right && this.right.equals(other.right, thisQuery, otherQuery))))
            return false;
        return true;
    }
    setOperator(operator) {
        return new BinaryExpression(operator, this.left, this.right);
    }
    setLeft(left) {
        return new BinaryExpression(this.operator, left, this.right);
    }
    setRight(right) {
        return new BinaryExpression(this.operator, this.left, right);
    }
    recursivelyReplace(multimap, context, recursionDepth) {
        if (recursionDepth < 0)
            return [];
        context.stack.push(this);
        const res = [];
        (0, util_1.append)(res, multimap(this.left, context));
        if (this.left) {
            (0, util_1.append)(res, this.left.recursivelyReplace(multimap, context, recursionDepth - 1));
        }
        const left_length = res.length;
        // if(!(this.left == null && this.right == null)) {
        (0, util_1.append)(res, multimap(this.right, context));
        // }
        if (this.right) {
            (0, util_1.append)(res, this.right.recursivelyReplace(multimap, context, recursionDepth - 1));
        }
        const res_length = res.length;
        context.stack.pop();
        for (let i = 0; i < left_length; ++i)
            res[i] = this.setLeft(res[i]);
        for (let i = left_length; i < res_length; ++i)
            res[i] = this.setRight(res[i]);
        return res;
    }
    static baseBinaryExpressions = (() => {
        const res = [];
        for (let item in OperatorType)
            if (isNaN(Number(item)))
                res.push(new BinaryExpression(OperatorType[item]));
        return res;
    })();
    static isBinaryExpression(expression) {
        return (expression !== null) && expression.type === expression_1.ExpressionType.BINARY;
    }
    static isBoolean(operator) {
        switch (operator) {
            case OperatorType.AND:
            case OperatorType.OR:
            case OperatorType.EQUALS:
                return true;
            default:
                return false;
        }
    }
    static isCommutative(operator) {
        switch (operator) {
            case OperatorType.AND:
            case OperatorType.OR:
            case OperatorType.EQUALS:
                return true;
            default:
                return false;
        }
    }
    static isAssiciative(operator) {
        switch (operator) {
            case OperatorType.AND:
            case OperatorType.OR:
            case OperatorType.EQUALS:
                return true;
            default:
                return false;
        }
    }
    static isDistributive(outer, inner) {
        switch (outer) {
            case OperatorType.AND:
                return inner == OperatorType.OR;
            case OperatorType.OR:
                return inner == OperatorType.AND;
            default:
                return false;
        }
    }
}
exports.BinaryExpression = BinaryExpression;
//# sourceMappingURL=binaryExpression.js.map