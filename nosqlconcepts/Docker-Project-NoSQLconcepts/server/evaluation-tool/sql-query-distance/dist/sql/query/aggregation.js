"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregationFunction = exports.AggregationType = void 0;
const util_1 = require("../../util");
const heightInfo_1 = require("../heightInfo");
const expression_1 = require("./expression");
// === Aggregation Function ===
var AggregationType;
(function (AggregationType) {
    AggregationType[AggregationType["COUNT"] = 0] = "COUNT";
    AggregationType[AggregationType["SUM"] = 1] = "SUM";
    AggregationType[AggregationType["AVG"] = 2] = "AVG";
    AggregationType[AggregationType["MIN"] = 3] = "MIN";
    AggregationType[AggregationType["MAX"] = 4] = "MAX";
})(AggregationType = exports.AggregationType || (exports.AggregationType = {}));
/**
 * An aggregation function expression, containing a subexpression.
 */
class AggregationFunction extends expression_1.Expression {
    aggregation;
    distinct;
    argument;
    type = expression_1.ExpressionType.AGGREGATION;
    constructor(aggregation, distinct = false, argument = null) {
        super(((argument ? argument.hash : 0) * 5 + aggregation) * 2 + (distinct ? 1 : 0), (argument ? argument.hashMax : 1) * 5 * 2, argument ? heightInfo_1.HeightInfo.max(argument.height.increase(), AggregationFunction.EMPTY_HEIGHT)
            : AggregationFunction.EMPTY_HEIGHT);
        this.aggregation = aggregation;
        this.distinct = distinct;
        this.argument = argument;
    }
    static EMPTY_HEIGHT = new heightInfo_1.HeightInfo(-1, -1, -1, 0, -1);
    equals(other, thisQuery, otherQuery) {
        if (!AggregationFunction.isAggregationFunction(other) || this.hash !== other.hash)
            return false;
        if (this.aggregation !== other.aggregation)
            return false;
        if (!((this.argument === other.argument) ||
            (this.argument && this.argument.equals(other.argument, thisQuery, otherQuery))))
            return false;
        return true;
    }
    setAggregation(aggregation) {
        return new AggregationFunction(aggregation, this.distinct, this.argument);
    }
    setDistinct(distinct) {
        return new AggregationFunction(this.aggregation, distinct, this.argument);
    }
    setArgument(argument) {
        return new AggregationFunction(this.aggregation, this.distinct, argument);
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
    static isAggregationFunction(e) {
        return (e !== null) && e.type === expression_1.ExpressionType.AGGREGATION;
    }
    static isDistinctValidFor(aggregation) {
        switch (aggregation) {
            case AggregationType.COUNT:
                return true;
            default:
                return false;
        }
    }
}
exports.AggregationFunction = AggregationFunction;
//# sourceMappingURL=aggregation.js.map