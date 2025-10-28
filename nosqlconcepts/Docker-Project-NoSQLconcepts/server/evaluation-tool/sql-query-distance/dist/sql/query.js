"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Query = void 0;
const hashable_1 = require("./query/hashable");
const expression_1 = require("./query/expression");
const asterisk_1 = require("./query/asterisk");
const columnReference_1 = require("./query/columnReference");
const aggregation_1 = require("./query/aggregation");
const binaryExpression_1 = require("./query/binaryExpression");
const util_1 = require("../util");
__exportStar(require("./query/hashable"), exports);
__exportStar(require("./query/expression"), exports);
__exportStar(require("./query/asterisk"), exports);
__exportStar(require("./query/columnReference"), exports);
__exportStar(require("./query/literal"), exports);
__exportStar(require("./query/not"), exports);
__exportStar(require("./query/aggregation"), exports);
__exportStar(require("./query/binaryExpression"), exports);
__exportStar(require("./query/selectElement"), exports);
__exportStar(require("./query/fromElement"), exports);
__exportStar(require("./query/orderBy"), exports);
// ===========
//  Query AST 
// ===========
/**
 * The root of an AST representing a SQL query.
 */
class Query extends hashable_1.Hashable {
    distinct;
    select;
    from;
    where;
    groupby;
    having;
    orderby;
    constructor(distinct = false, select = [], from = [], where = null, groupby = [], having = null, orderby = []) {
        const selectLength = select.length;
        const fromLength = from.length;
        const groupbyLength = groupby.length;
        const orderbyLength = orderby.length;
        let hash = distinct ? 2 : 1;
        hash = hash * 4 + selectLength;
        for (let s = 0; s < selectLength; ++s) {
            const se = select[s];
            hash = hash * se.hashMax + se.hash;
        }
        hash = hash * 4 + fromLength;
        for (let f = 0; f < fromLength; ++f) {
            const fe = from[f];
            hash = hash * fe.hashMax + fe.hash;
        }
        hash = where ? hash * where.hashMax + where.hash : hash;
        hash = hash * 4 + groupbyLength;
        for (let g = 0; g < groupbyLength; ++g) {
            const ge = groupby[g];
            hash = ge ? hash * ge.hashMax + ge.hash : hash;
        }
        hash = having ? hash * having.hashMax + having.hash : hash;
        hash = hash * 4 + orderbyLength;
        for (let o = 0; o < orderbyLength; ++o) {
            const oe = orderby[o];
            hash = hash * oe.hashMax + oe.hash;
        }
        super(hash, 1);
        this.distinct = distinct;
        this.select = select;
        this.from = from;
        this.where = where;
        this.groupby = groupby;
        this.having = having;
        this.orderby = orderby;
        this.selectLength = selectLength;
        this.fromLength = fromLength;
        this.groupbyLength = groupbyLength;
        this.orderbyLength = orderbyLength;
    }
    selectLength;
    getSelect(i) { return this.select[i]; }
    copySelect() { return this.select.slice(); }
    fromLength;
    getFrom(i) { return this.from[i]; }
    copyFrom() { return this.from.slice(); }
    groupbyLength;
    getGroupby(i) { return this.groupby[i]; }
    copyGroupby() { return this.groupby.slice(); }
    orderbyLength;
    getOrderby(i) { return this.orderby[i]; }
    copyOrderby() { return this.orderby.slice(); }
    equals(other) {
        if ((other === null) || (this.hash !== other.hash))
            return false;
        if (this.distinct !== other.distinct)
            return false;
        if (this.selectLength !== other.selectLength)
            return false;
        if (this.fromLength !== other.fromLength)
            return false;
        if (this.groupbyLength !== other.groupbyLength)
            return false;
        if (this.orderbyLength !== other.orderbyLength)
            return false;
        for (let i = 0, l = this.selectLength; i < l; ++i) {
            if (!this.select[i].equals(other.select[i], this, other))
                return false;
        }
        for (let i = 0, l = this.fromLength; i < l; ++i) {
            if (!this.from[i].equals(other.from[i], this, other))
                return false;
        }
        if (!((this.where == other.where) ||
            (this.where !== null && this.where.equals(other.where, this, other))))
            return false;
        for (let i = 0, l = this.groupbyLength; i < l; ++i) {
            if (!(this.groupby[i] === other.groupby[i] ||
                (this.groupby[i] && this.groupby[i].equals(other.groupby[i], this, other))))
                return false;
        }
        if (!((this.having == other.having) ||
            (this.having !== null && this.having.equals(other.having, this, other))))
            return false;
        for (let i = 0, l = this.orderbyLength; i < l; ++i) {
            if (!this.orderby[i].equals(other.orderby[i], this, other))
                return false;
        }
        return true;
    }
    // public set(
    //     distinct: boolean = this.distinct,
    //     select: SelectElement[] = this.select,
    //     from: FromElement[] = this.from,
    //     where: Expression = this.where,
    //     groupby: Expression[] = this.groupby,
    //     having: Expression = this.having,
    //     orderby: OrderBy[] = this.orderby): Query {
    //     return new Query(distinct, select, from, where, groupby, having, orderby);
    // }
    setDistinct(distinct) {
        return new Query(distinct, this.select, this.from, this.where, this.groupby, this.having, this.orderby);
    }
    setSelect(select) {
        return new Query(this.distinct, select.slice(), this.from, this.where, this.groupby, this.having, this.orderby);
    }
    setSelectElement(i = this.select.length, s = undefined, override = true) {
        const select = this.copySelect();
        if (s === undefined)
            select.splice(i, override ? 1 : 0);
        else
            select.splice(i, override ? 1 : 0, s);
        return new Query(this.distinct, select, this.from, this.where, this.groupby, this.having, this.orderby);
    }
    setFrom(from) {
        return new Query(this.distinct, this.select, from.slice(), this.where, this.groupby, this.having, this.orderby);
    }
    setFromElement(i = this.from.length, f = undefined, override = true) {
        const from = this.copyFrom();
        if (f === undefined)
            from.splice(i, override ? 1 : 0);
        else
            from.splice(i, override ? 1 : 0, f);
        return new Query(this.distinct, this.select, from, this.where, this.groupby, this.having, this.orderby);
    }
    setWhere(where) {
        return new Query(this.distinct, this.select, this.from, where, this.groupby, this.having, this.orderby);
    }
    setGroupby(groupby) {
        return new Query(this.distinct, this.select, this.from, this.where, groupby.slice(), this.having, this.orderby);
    }
    setGroupbyElement(i = this.groupby.length, e = undefined, override = true) {
        const groupby = this.copyGroupby();
        if (e === undefined)
            groupby.splice(i, override ? 1 : 0);
        else
            groupby.splice(i, override ? 1 : 0, e);
        return new Query(this.distinct, this.select, this.from, this.where, groupby, this.having, this.orderby);
    }
    setHaving(having) {
        return new Query(this.distinct, this.select, this.from, this.where, this.groupby, having, this.orderby);
    }
    setOrderby(orderby) {
        return new Query(this.distinct, this.select, this.from, this.where, this.groupby, this.having, orderby.slice());
    }
    setOrderbyElement(i = this.orderby.length, o = undefined, override = true) {
        const orderby = this.copyOrderby();
        if (o == undefined)
            orderby.splice(i, override ? 1 : 0);
        else
            orderby.splice(i, override ? 1 : 0, o);
        return new Query(this.distinct, this.select, this.from, this.where, this.groupby, this.having, orderby);
    }
    recursivelyReplaceWhere(multimap, recursionDepth, maxHeight = null) {
        if (recursionDepth < 0)
            return [];
        const context = new expression_1.ExpressionContext([], this, maxHeight);
        const res = [];
        (0, util_1.append)(res, multimap(this.where, context));
        if (this.where) {
            (0, util_1.append)(res, this.where.recursivelyReplace(multimap, context, recursionDepth - 1));
        }
        return res;
    }
    recursivelyReplaceGroupby(i, multimap, recursionDepth, maxHeight = null) {
        if (recursionDepth < 0)
            return [];
        const context = new expression_1.ExpressionContext([], this, maxHeight);
        const res = [];
        (0, util_1.append)(res, multimap(this.groupby[i], context));
        if (this.groupby[i]) {
            (0, util_1.append)(res, this.groupby[i].recursivelyReplace(multimap, context, recursionDepth - 1));
        }
        return res;
    }
    recursivelyReplaceHaving(multimap, recursionDepth, maxHeight = null) {
        if (recursionDepth < 0)
            return [];
        const context = new expression_1.ExpressionContext([], this, maxHeight);
        const res = [];
        (0, util_1.append)(res, multimap(this.having, context));
        if (this.having) {
            (0, util_1.append)(res, this.having.recursivelyReplace(multimap, context, recursionDepth - 1));
        }
        return res;
    }
    validateSemantics(schema) {
        const forbidAsterisk = (element) => ((x) => {
            if (asterisk_1.Asterisk.isAsterisk(x))
                throw new Error(element + " contains asterisk.");
            return [];
        });
        const forbidAggregation = (element) => ((x) => {
            if (aggregation_1.AggregationFunction.isAggregationFunction(x))
                throw new Error(element + "contains aggregation function.");
            return [];
        });
        const checkAsterisk = (element) => ((x) => {
            if (asterisk_1.Asterisk.isAsterisk(x) && x.table != null) {
                let found = false;
                for (let f = 0; f < this.fromLength; ++f) {
                    if (this.from[f].alias == x.table) {
                        found = true;
                        break;
                    }
                }
                if (!found)
                    throw new Error(`${element} references all columns of table ` +
                        `"${x.table}", which cannot be found within the from-elements.`);
            }
            return [];
        });
        const checkColumnReference = (element, checkGroupby, fromElements = this.fromLength) => ((x, context) => {
            if (columnReference_1.ColumnReference.isColumnReference(x)) {
                let source = null;
                for (let f = 0; f < fromElements; ++f) {
                    let fe = this.from[f];
                    if (x.table ? fe.alias == x.table : schema.get(fe.table).has(x.column)) {
                        if (source == null)
                            source = fe;
                        else
                            throw new Error(`${element} references column ` +
                                `"${(x.table ? x.table + '.' : '') + x.column}", whose source is ambigous.`);
                    }
                }
                if (source == null)
                    throw new Error(`${element} references column ` +
                        `"${(x.table ? x.table + '.' : '') + x.column}", which cannot be found ` +
                        `within the (preceeding) from-elements.`);
                if (!schema.get(source.table).has(x.column))
                    throw new Error(element +
                        ` references column "${(x.table ? x.table + '.' : '') + x.column}", which is` +
                        ` not part of the schema.`);
                if (checkGroupby && this.groupbyLength) {
                    let legal = false;
                    for (let t = context.stack.length - 1; t >= 0; --t) {
                        if (aggregation_1.AggregationFunction.isAggregationFunction(context.stack[t])) {
                            legal = true;
                            break;
                        }
                    }
                    if (!legal) {
                        for (let g = 0; g < this.groupbyLength; ++g) {
                            const ge = this.groupby[g];
                            if (columnReference_1.ColumnReference.isColumnReference(ge) && ge.column == x.column &&
                                (!ge.table || !x.table || ge.table == x.table)) {
                                legal = true;
                                break;
                            }
                        }
                    }
                    if (!legal)
                        throw new Error(`${element} references column ` +
                            `"${(x.table ? x.table + '.' : '') + x.column}", which is neither grouped by ` +
                            `nor inside an aggregation function.`);
                }
            }
            return [];
        });
        const checkAggregationFunction = (element) => ((x, context) => {
            if (aggregation_1.AggregationFunction.isAggregationFunction(x)) {
                if (x.argument == null && x.aggregation != aggregation_1.AggregationType.COUNT)
                    throw new Error(`${element} contains aggregation function without argument.`);
                for (let t = context.stack.length - 1; t >= 0; --t) {
                    if (aggregation_1.AggregationFunction.isAggregationFunction(context.stack[t]))
                        throw new Error(`${element} contains aggregation function ` +
                            `inside another aggregation function`);
                }
            }
            return [];
        });
        const checkBinaryExpression = (element) => ((x) => {
            if (binaryExpression_1.BinaryExpression.isBinaryExpression(x)) {
                if (x.left == null)
                    throw new Error(`${element} contains binary expression without left argument.`);
                if (x.right == null)
                    throw new Error(`${element} contains binary expression without right argument.`);
            }
            return [];
        });
        if (this.fromLength && this.from[0].join != null)
            throw new Error(`The first from-element cannot have a complex join-type.`);
        for (let f = 0; f < this.fromLength; ++f) {
            const fe = this.from[f], name = `Join-condition of from-element ${f + 1}`;
            if (!schema.has(fe.table))
                throw new Error(`Table "${fe.table}" referenced by from-element ${f + 1} is not part of schema.`);
            for (let f2 = f + 1; f2 < this.fromLength; ++f2) {
                if (fe.alias == this.from[f2].alias)
                    throw new Error(`From-element ${f + 1} and ${f2 + 1} have the same table name/alias.`);
            }
            if (fe.join != null && fe.on == null)
                throw new Error(`From-element ${f + 1} has complex join-type but no join-condition.`);
            if (fe.join == null && fe.on != null)
                throw new Error(`From-element ${f + 1} has join-condition but no complex join-type.`);
            fe.recursivelyReplaceOn(forbidAsterisk(name), Infinity, this);
            fe.recursivelyReplaceOn(checkColumnReference(name, false, f + 1), Infinity, this);
            fe.recursivelyReplaceOn(forbidAggregation(name), Infinity, this);
            fe.recursivelyReplaceOn(checkBinaryExpression(name), Infinity, this);
        }
        this.recursivelyReplaceWhere(forbidAsterisk("Where-clause"), Infinity, null);
        this.recursivelyReplaceWhere(checkColumnReference("Where-clause", false), Infinity, null);
        this.recursivelyReplaceWhere(forbidAggregation("Where-clause"), Infinity, null);
        this.recursivelyReplaceWhere(checkBinaryExpression("Where-clause"), Infinity, null);
        for (let g = 0; g < this.groupbyLength; ++g) {
            const name = `Group-by expression ${g + 1}`;
            this.recursivelyReplaceGroupby(g, forbidAsterisk(name), Infinity, null);
            this.recursivelyReplaceGroupby(g, checkColumnReference(name, false), Infinity, null);
            this.recursivelyReplaceGroupby(g, forbidAggregation(name), Infinity, null);
            this.recursivelyReplaceGroupby(g, checkBinaryExpression(name), Infinity, null);
        }
        if (this.having != null && this.groupbyLength == 0)
            throw new Error(`Query contains having-clause without group-by-clause.`);
        this.recursivelyReplaceHaving(forbidAsterisk("Having-clause"), Infinity, null);
        this.recursivelyReplaceHaving(checkColumnReference("Having-clause", true), Infinity, null);
        this.recursivelyReplaceHaving(checkAggregationFunction("Having-clause"), Infinity, null);
        this.recursivelyReplaceHaving(checkBinaryExpression("Having-clause"), Infinity, null);
        selectLoop: for (let s = 0; s < this.selectLength; ++s) {
            const se = this.select[s], name = `Select-element ${s + 1}`;
            if (se.as != null) {
                for (let s2 = s + 1; s2 < this.selectLength; ++s2) {
                    if (se.as == this.select[s2].as)
                        throw new Error(`Select-element ${s + 1} and ${s2 + 1} have the same alias.`);
                }
            }
            for (let g = 0; g < this.groupbyLength; ++g) {
                if (se.expression == this.groupby[g] ||
                    (se.expression && se.expression.equals(this.groupby[g], this, this)))
                    continue selectLoop;
            }
            se.recursivelyReplaceExpression(checkAsterisk(name), Infinity, this);
            se.recursivelyReplaceExpression(checkColumnReference(name, true), Infinity, this);
            se.recursivelyReplaceExpression(checkAggregationFunction(name), Infinity, this);
            se.recursivelyReplaceExpression(checkBinaryExpression(name), Infinity, this);
        }
        orderbyLoop: for (let o = 0; o < this.orderbyLength; ++o) {
            const oe = this.orderby[o], name = `Order-by-element ${o + 1}`;
            for (let g = 0; g < this.groupbyLength; ++g) {
                if (oe.expression == this.groupby[g] ||
                    (oe.expression && oe.expression.equals(this.groupby[g], this, this)))
                    continue orderbyLoop;
            }
            oe.recursivelyReplaceExpression(checkAsterisk(name), Infinity, this);
            oe.recursivelyReplaceExpression(checkColumnReference(name, true), Infinity, this);
            oe.recursivelyReplaceExpression(checkAggregationFunction(name), Infinity, this);
            oe.recursivelyReplaceExpression(checkBinaryExpression(name), Infinity, this);
        }
        return true;
    }
}
exports.Query = Query;
//# sourceMappingURL=query.js.map