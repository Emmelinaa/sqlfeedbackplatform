"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceOrderbyExpression = exports.replaceHavingExpression = exports.replaceGroupbyExpression = exports.replaceWhereExpression = exports.replaceFromExpression = exports.replaceSelectExpression = exports.atomicEdits = void 0;
const sql_1 = require("../sql");
const edit_1 = require("./edit");
// ============
// Atomic Edits
// ============
/**
 * The set of atomic edits, represented as a map, indexed by the edit names.
 */
exports.atomicEdits = new Map();
// === Asterisk ===
function addAsterisk(x) {
    return (x == null) ? [sql_1.Asterisk.baseAsterisk] : [];
}
function removeAsterisk(x) {
    return sql_1.Asterisk.isAsterisk(x) ? [null] : [];
}
function setAsteriskTable(x, context) {
    if (!sql_1.Asterisk.isAsterisk(x) || x.table)
        return [];
    const res = new Array(context.query.fromLength);
    for (let f = 0; f < context.query.fromLength; ++f) {
        res[f] = x.setTable(context.query.getFrom(f).alias);
    }
    return res;
}
function unsetAsteriskTable(x, context) {
    return (sql_1.Asterisk.isAsterisk(x) && x.table) ? [x.setTable(null)] : [];
}
// === ColumnReference ===
function addColumnReference(columnReferences) {
    return (x) => x == null ? columnReferences : [];
}
function removeColumnReference(x) {
    return sql_1.ColumnReference.isColumnReference(x) ? [null] : [];
}
function setColumnReferenceTable(x, context) {
    if (!sql_1.ColumnReference.isColumnReference(x) || x.table)
        return [];
    const res = new Array(context.query.fromLength);
    for (let f = 0; f < context.query.fromLength; ++f) {
        res[f] = x.setTable(context.query.getFrom(f).alias);
    }
    return res;
}
function unsetColumnReferenceTable(x) {
    return (sql_1.ColumnReference.isColumnReference(x) && x.table) ? [x.setTable(null)] : [];
}
// === Literal ===
function addLiteral(literals) {
    return (x) => x == null ? literals : [];
}
function removeLiteral(x) {
    return sql_1.Literal.isLiteral(x) ? [null] : [];
}
// === Not ===
function addNot(x, context) {
    //context.maxHeight < context.stack.length + x.height + 1 => can't increase tree height by 1
    if (x != null && context.maxHeight.minDiff(x.height) < context.stack.length + 1)
        return [];
    return (x != null) ? [new sql_1.Not(x)] : [sql_1.Not.baseNot];
}
function removeNot(x) {
    return sql_1.Not.isNot(x) ? [x.argument] : [];
}
// === AggregationFunction ===
function addAggregationFunction(aggregations) {
    return (x, context) => {
        //context.maxHeight < context.stack.length + x.height + 1 => can't increase tree height by 1
        if (x != null && context.maxHeight.minDiff(x.height) < context.stack.length + 1)
            return [];
        //prevent aggregation functions from being inside each other
        if (x != null && x.height.aggregationHeight >= 0)
            return [];
        for (let t = 0, n = context.stack.length; t < n; ++t) {
            if (sql_1.AggregationFunction.isAggregationFunction(context.stack[t]))
                return [];
        }
        const res = new Array(aggregations.length);
        for (let a = 0, n = aggregations.length; a < n; ++a) {
            res[a] = x != null ? aggregations[a].setArgument(x) : aggregations[a];
        }
        return res;
    };
}
function removeAggregationFunction(x) {
    return sql_1.AggregationFunction.isAggregationFunction(x) ? [x.argument] : [];
}
function setAggregationFunctionDistinct(x) {
    return (sql_1.AggregationFunction.isAggregationFunction(x) &&
        sql_1.AggregationFunction.isDistinctValidFor(x.aggregation) &&
        !x.distinct) ? [x.setDistinct(true)] : [];
}
function unsetAggregationFunctionDistinct(x) {
    return (sql_1.AggregationFunction.isAggregationFunction(x) && x.distinct) ?
        [x.setDistinct(false)] : [];
}
// === BinaryExpression ===
function addBaseBinaryExpression(x, context) {
    //context.maxHeight < context.stack.length + x.height + 1 => can't increase tree height by 1
    if (x != null && context.maxHeight.minDiff(x.height) < context.stack.length + 1)
        return [];
    const res = new Array(sql_1.BinaryExpression.baseBinaryExpressions.length);
    for (let b = 0, n = sql_1.BinaryExpression.baseBinaryExpressions.length; b < n; ++b) {
        if (x == null) {
            res[b] = sql_1.BinaryExpression.baseBinaryExpressions[b];
        }
        else {
            res[b] = sql_1.BinaryExpression.baseBinaryExpressions[b].setLeft(x);
            res.push(sql_1.BinaryExpression.baseBinaryExpressions[b].setRight(x));
        }
    }
    return res;
}
function removeBinaryExpression(x) {
    return (sql_1.BinaryExpression.isBinaryExpression(x) && (x.left == null || x.right == null))
        ? [(x.left != null) ? x.left : x.right] : [];
}
// === DISTINCT ===
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setDistinct",
    description: "Set (missing) distinct-declaration",
    cost: 2,
    perform: (query, _schema, meta, result) => {
        if (!meta.distinct || query.distinct == true)
            return;
        result.push(query.setDistinct(true));
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetDistinct",
    description: "Unset (excess) distinct-declaration",
    cost: 2,
    perform: (query, _schema, meta, result) => {
        if (meta.distinct || query.distinct == false)
            return;
        result.push(query.setDistinct(false));
    }
});
// === SELECT ===
function replaceSelectExpression(query, result, multimap, selectLength, recursionDepth, maxHeight = null) {
    if (recursionDepth < 0)
        return;
    for (let s = 0; s < query.selectLength && s < selectLength; ++s) {
        const select = query.getSelect(s);
        const expressions = select.recursivelyReplaceExpression(multimap, recursionDepth, query, maxHeight);
        for (let e = 0, n = expressions.length; e < n; ++e) {
            result.push(query.setSelectElement(s, select.setExpression(expressions[e])));
        }
    }
}
exports.replaceSelectExpression = replaceSelectExpression;
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addSelectElement",
    description: "Add (missing) element in select-clause",
    cost: 1,
    perform: (query, schema, meta, result) => {
        if ((new sql_1.SelectMetaInfo(query, schema).length >= Math.max(meta.select.length, 1))
            || (query.fromLength <= 0))
            return;
        for (let s = 0; s <= query.selectLength; ++s) {
            result.push(query.setSelectElement(s, new sql_1.SelectElement(), false));
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeSelectElement",
    description: "Remove (excess) element in select-clause",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        for (let s = 0; s < query.selectLength; ++s) {
            result.push(query.setSelectElement(s, undefined));
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addSelectAsterisk",
    description: "Add (missing) asterisk-selection to a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        if (!meta.select.asterisk)
            return;
        replaceSelectExpression(query, result, addAsterisk, meta.select.length, 1);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeSelectAsterisk",
    description: "Remove (excess) asterisk-selection from a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, removeAsterisk, meta.select.length, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setSelectAsteriskTable",
    description: "Set (missing) table name on an asterisk in a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, setAsteriskTable, meta.select.length, meta.select.asterisk ? 1 : 0);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetSelectAsteriskTable",
    description: "Unset (excess) table name on an asterisk in a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, unsetAsteriskTable, meta.select.length, meta.select.asterisk ? 1 : 0);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addSelectColumnReference",
    description: "Add (missing) column-reference to a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, addColumnReference(meta.select.columns), meta.select.length, meta.select.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeSelectColumnReference",
    description: "Remove (excess) column-reference from a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, removeColumnReference, meta.select.length, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setSelectColumnReferenceTable",
    description: "Set (missing) table name on a column-reference in a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, setColumnReferenceTable, meta.select.length, meta.select.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetSelectColumnReferenceTable",
    description: "Unset (excess) table name on a column-reference in a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, unsetColumnReferenceTable, meta.select.length, meta.select.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addSelectLiteral",
    description: "Add (missing) literal to a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, addLiteral(meta.select.literals), meta.select.length, meta.select.literalHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeSelectLiteral",
    description: "Remove (excess) literal from a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, removeLiteral, meta.select.length, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addSelectNot",
    description: "Add (missing) NOT to a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, addNot, meta.select.length, meta.select.notHeight, meta.select);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeSelectNot",
    description: "Remove (excess) NOT from a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, removeNot, meta.select.length, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addSelectAggregationFunction",
    description: "Add (missing) aggregation-function to a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, addAggregationFunction(meta.select.aggregations), meta.select.length, meta.select.aggregationHeight, meta.select);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeSelectAggregationFunction",
    description: "Remove (excess) aggregation-function from a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, removeAggregationFunction, meta.select.length, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setSelectAggregationFunctionDistinct",
    description: "Set (missing) distinct-declaration on an aggregation-function " +
        "in a select-element expression",
    cost: 2,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, setAggregationFunctionDistinct, meta.select.length, meta.select.aggregationHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetSelectAggregationFunctionDistinct",
    description: "Unset (excess) distinct-declaration on an aggregation-function " +
        "in a select-element expression",
    cost: 2,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, unsetAggregationFunctionDistinct, meta.select.length, meta.select.aggregationHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addSelectBinaryExpression",
    description: "Add (missing) binary-expression to a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, addBaseBinaryExpression, meta.select.length, meta.select.binaryExpressionHeight, meta.select);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeSelectBinaryExpression",
    description: "Remove (excess) binary-expression from a select-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceSelectExpression(query, result, removeBinaryExpression, meta.select.length, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setSelectAlias",
    description: "Set (missing) explicit alias on a select-element",
    cost: 2,
    perform: (query, _schema, meta, result) => {
        if (meta.select.as.length <= 0)
            return;
        for (let s = 0; s < query.selectLength && s < meta.select.length; ++s) {
            const select = query.getSelect(s);
            if (select.as != null)
                continue;
            for (let a = 0, n = meta.select.as.length; a < n; ++a) {
                result.push(query.setSelectElement(s, select.setAs(meta.select.as[a])));
            }
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetSelectAlias",
    description: "Unset (excess) explicit alias on a select-element",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        for (let s = 0; s < query.selectLength && s < meta.select.length; ++s) {
            const select = query.getSelect(s);
            if (select.as != null)
                result.push(query.setSelectElement(s, select.setAs(null)));
        }
    }
});
// === FROM ===
function replaceFromExpression(query, result, multimap, recursionDepth, applyToFirst = false, applyWithoutComplexJoin = false, maxHeight = null) {
    if (recursionDepth < 0)
        return;
    for (let f = (applyToFirst ? 0 : 1); f < query.fromLength; ++f) {
        const from = query.getFrom(f);
        if (!(applyWithoutComplexJoin || from.join != null))
            continue;
        const expressions = from.recursivelyReplaceOn(multimap, recursionDepth, query, maxHeight);
        for (let e = 0, n = expressions.length; e < n; ++e) {
            result.push(query.setFromElement(f, from.setOn(expressions[e])));
        }
    }
}
exports.replaceFromExpression = replaceFromExpression;
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addFromElement",
    description: "Add (missing) element in from-clause",
    cost: 2,
    perform: (query, _schema, meta, result) => {
        if (query.fromLength >= meta.from.length)
            return;
        for (let f = 0; f <= query.fromLength; ++f) {
            for (let table of meta.from.tables) {
                result.push(query.setFromElement(f, new sql_1.FromElement(table), false));
            }
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeFromElement",
    description: "Remove (excess) element in from-clause",
    cost: 2,
    perform: (query, _schema, _meta, result) => {
        for (let f = 0; f < query.fromLength; ++f) {
            result.push(query.setFromElement(f, undefined));
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setTableJoinType",
    description: "Set (missing) complex join-type on a from-element (change cross join to a complex join)",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        if (!meta.from.join)
            return;
        //start at second element because first cannot have complex join
        for (let f = 1; f < query.fromLength; ++f) {
            const from = query.getFrom(f);
            if (from.join != null)
                continue;
            for (let item in sql_1.JoinType) {
                if (isNaN(Number(item))) {
                    result.push(query.setFromElement(f, from.setJoin(sql_1.JoinType[item])));
                }
            }
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetTableJoinType",
    description: "Unset (excess) complex join-type on a from-element (change complex join to cross join)",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        for (let f = 0; f < query.fromLength; ++f) {
            const from = query.getFrom(f);
            if (from.join != null) {
                result.push(query.setFromElement(f, from.setJoin(null)));
            }
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addFromColumnReference",
    description: "Add (missing) column-reference to a from-element join-condition",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceFromExpression(query, result, addColumnReference(meta.from.columns), meta.from.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeFromColumnReference",
    description: "Remove (excess) column-reference from a from-element join-condition",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceFromExpression(query, result, removeColumnReference, Infinity, true, true);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setFromColumnReferenceTable",
    description: "Set (missing) table name on a column-reference in a from-element join-condition",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceFromExpression(query, result, setColumnReferenceTable, meta.from.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetFromColumnReferenceTable",
    description: "Unset (excess) table name on a column-reference in a from-element join-condition",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceFromExpression(query, result, unsetColumnReferenceTable, meta.from.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addFromLiteral",
    description: "Add (missing) literal to a from-element join-condition",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceFromExpression(query, result, addLiteral(meta.from.literals), meta.from.literalHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeFromLiteral",
    description: "Remove (excess) literal from a from-element join-condition",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceFromExpression(query, result, removeLiteral, Infinity, true, true);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addFromNot",
    description: "Add (missing) NOT to a from-element join-condition",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceFromExpression(query, result, addNot, meta.from.notHeight, false, false, meta.from);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeFromNot",
    description: "Remove (excess) NOT from a from-element join-condition",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceFromExpression(query, result, removeNot, Infinity, true, true);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addFromBinaryExpression",
    description: "Add (missing) binary-expression to a from-element join-condition",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceFromExpression(query, result, addBaseBinaryExpression, meta.from.binaryExpressionHeight, false, false, meta.from);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeFromBinaryExpression",
    description: "Remove (excess) binary-expression from a from-element join-condition",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceFromExpression(query, result, removeBinaryExpression, Infinity, true, true);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setFromAlias",
    description: "Set (missing) explicit alias on from-element",
    cost: 1,
    perform: (query, schema, _meta, result) => {
        for (let f = 0; f < query.fromLength; ++f) {
            const from = query.getFrom(f);
            if (from.as !== null || !schema.has(from.table))
                continue;
            let as = schema.get(from.table).name.charAt(0);
            let asNr = 0;
            for (let exists = true; exists; asNr++) {
                exists = false;
                for (let f2 = 0; f2 < query.fromLength; ++f2) {
                    if (query.getFrom(f2).as == (as + asNr)) {
                        exists = true;
                        break;
                    }
                }
            }
            result.push(query.setFromElement(f, from.setAs(as + asNr)));
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetFromAlias",
    description: "Remove (excess) explicit alias from from-element",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        for (let f = 0; f < query.fromLength; ++f) {
            const from = query.getFrom(f);
            if (from.as !== null) {
                result.push(query.setFromElement(f, from.setAs(null)));
            }
        }
    }
});
// === Where ===
function replaceWhereExpression(query, result, multimap, recursionDepth, maxHeight = null) {
    if (recursionDepth < 0)
        return;
    const expressions = query.recursivelyReplaceWhere(multimap, recursionDepth, maxHeight);
    for (let e = 0, n = expressions.length; e < n; ++e) {
        result.push(query.setWhere(expressions[e]));
    }
}
exports.replaceWhereExpression = replaceWhereExpression;
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addWhereColumnReference",
    description: "Add (missing) column-reference to the where-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceWhereExpression(query, result, addColumnReference(meta.where.columns), meta.where.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeWhereColumnReference",
    description: "Remove (excess) column-reference from the where-clause",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceWhereExpression(query, result, removeColumnReference, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setWhereColumnReferenceTable",
    description: "Set (missing) table name on a column-reference in the where-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceWhereExpression(query, result, setColumnReferenceTable, meta.where.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetWhereColumnReferenceTable",
    description: "Unset (excess) table name on a column-reference in the where-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceWhereExpression(query, result, unsetColumnReferenceTable, meta.where.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addWhereLiteral",
    description: "Add (missing) literal to the where-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceWhereExpression(query, result, addLiteral(meta.where.literals), meta.where.literalHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeWhereLiteral",
    description: "Remove (excess) literal from the where-clause",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceWhereExpression(query, result, removeLiteral, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addWhereNot",
    description: "Add (missing) NOT to the where-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceWhereExpression(query, result, addNot, meta.where.notHeight, meta.where);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeWhereNot",
    description: "Remove (excess) NOT from the where-clause",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceWhereExpression(query, result, removeNot, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addWhereBinaryExpression",
    description: "Add (missing) binary-expression to the where-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceWhereExpression(query, result, addBaseBinaryExpression, meta.where.binaryExpressionHeight, meta.where);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeWhereBinaryExpression",
    description: "Remove (excess) binary-expression from the where-clause",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceWhereExpression(query, result, removeBinaryExpression, Infinity);
    }
});
// === Group By ===
function replaceGroupbyExpression(query, result, multimap, recursionDepth, maxHeight = null) {
    if (recursionDepth < 0)
        return;
    for (let g = 0; g < query.groupbyLength; ++g) {
        const expressions = query.recursivelyReplaceGroupby(g, multimap, recursionDepth, maxHeight);
        for (let e = 0, n = expressions.length; e < n; ++e) {
            result.push(query.setGroupbyElement(g, expressions[e]));
        }
    }
}
exports.replaceGroupbyExpression = replaceGroupbyExpression;
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addGroupbyElement",
    description: "Add (missing) element in group-by-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        if (query.groupbyLength >= meta.groupby.length)
            return;
        for (let g = 0; g <= query.groupbyLength; ++g) {
            result.push(query.setGroupbyElement(g, null, false));
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeGroupbyElement",
    description: "Remove (excess) element in group-by-clause",
    cost: 2,
    perform: (query, _schema, _meta, result) => {
        for (let g = 0; g < query.groupbyLength; ++g) {
            result.push(query.setGroupbyElement(g, undefined));
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addGroupbyColumnReference",
    description: "Add (missing) column-reference to a group-by expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceGroupbyExpression(query, result, addColumnReference(meta.groupby.columns), meta.groupby.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeGroupbyColumnReference",
    description: "Remove (excess) column-reference from a group-by expression",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceGroupbyExpression(query, result, removeColumnReference, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setGroupbyColumnReferenceTable",
    description: "Set (missing) table name on a column-reference in a group-by expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceGroupbyExpression(query, result, setColumnReferenceTable, meta.groupby.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetGroupbyColumnReferenceTable",
    description: "Unset (excess) table name on a column-reference in a group-by expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceGroupbyExpression(query, result, unsetColumnReferenceTable, meta.groupby.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addGroupbyLiteral",
    description: "Add (missing) literal to a group-by expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceGroupbyExpression(query, result, addLiteral(meta.groupby.literals), meta.groupby.literalHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeGroupbyLiteral",
    description: "Remove (excess) literal from a group-by expression",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceGroupbyExpression(query, result, removeLiteral, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addGroupbyNot",
    description: "Add (missing) NOT to a group-by expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceGroupbyExpression(query, result, addNot, meta.groupby.notHeight, meta.groupby);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeGroupbyNot",
    description: "Remove (excess) NOT from a group-by expression",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceGroupbyExpression(query, result, removeNot, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addGroupbyBinaryExpression",
    description: "Add (missing) binary-expression to a group-by expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceGroupbyExpression(query, result, addBaseBinaryExpression, meta.groupby.columnReferenceHeight, meta.groupby);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeGroupbyBinaryExpression",
    description: "Remove (excess) binary-expression from a group-by expression",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceGroupbyExpression(query, result, removeBinaryExpression, Infinity);
    }
});
// === Having ===
function replaceHavingExpression(query, result, multimap, recursionDepth, maxHeight = null) {
    if (recursionDepth < 0)
        return;
    const expressions = query.recursivelyReplaceHaving(multimap, recursionDepth, maxHeight);
    for (let e = 0, n = expressions.length; e < n; ++e) {
        result.push(query.setHaving(expressions[e]));
    }
}
exports.replaceHavingExpression = replaceHavingExpression;
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addHavingColumnReference",
    description: "Add (missing) column-reference to the having-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceHavingExpression(query, result, addColumnReference(meta.having.columns), meta.having.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeHavingColumnReference",
    description: "Remove (excess) column-reference from the having-clause",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceHavingExpression(query, result, removeColumnReference, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setHavingColumnReferenceTable",
    description: "Set (missing) table name on a column-reference in the having-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceHavingExpression(query, result, setColumnReferenceTable, meta.having.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetHavingColumnReferenceTable",
    description: "Unset (excess) table name on a column-reference in the having-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceHavingExpression(query, result, unsetColumnReferenceTable, meta.having.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addHavingLiteral",
    description: "Add (missing) literal to the having-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceHavingExpression(query, result, addLiteral(meta.having.literals), meta.having.literalHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeHavingLiteral",
    description: "Remove (excess) literal from the having-clause",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceHavingExpression(query, result, removeLiteral, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addHavingNot",
    description: "Add (missing) NOT to the having-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceHavingExpression(query, result, addNot, meta.having.notHeight, meta.having);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeHavingbyNot",
    description: "Remove (excess) NOT from the having-clause",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceHavingExpression(query, result, removeNot, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addHavingAggregationFunction",
    description: "Add (missing) aggregation-function to the having-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceHavingExpression(query, result, addAggregationFunction(meta.having.aggregations), meta.having.aggregationHeight, meta.having);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeHavingAggregationFunction",
    description: "Remove (excess) aggregation-function from the having-clause",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceHavingExpression(query, result, removeAggregationFunction, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setHavingAggregationFunctionDistinct",
    description: "Set (missing) distinct-declaration on an aggregation function in the having-clause",
    cost: 2,
    perform: (query, _schema, meta, result) => {
        replaceHavingExpression(query, result, setAggregationFunctionDistinct, meta.having.aggregationHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetHavingAggregationFunctionDistinct",
    description: "Unset (excess) distinct-declaration on an aggregation function in the having-clause",
    cost: 2,
    perform: (query, _schema, meta, result) => {
        replaceHavingExpression(query, result, unsetAggregationFunctionDistinct, meta.having.aggregationHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addHavingBinaryExpression",
    description: "Add (missing) binary-expression to the having-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceHavingExpression(query, result, addBaseBinaryExpression, meta.having.binaryExpressionHeight, meta.having);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeHavingBinaryExpression",
    description: "Remove (excess) binary-expression from the having-clause",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceHavingExpression(query, result, removeBinaryExpression, Infinity);
    }
});
// === Order By ===
function replaceOrderbyExpression(query, result, multimap, recursionDepth, maxHeight = null) {
    if (recursionDepth < 0)
        return;
    for (let o = 0; o < query.orderbyLength; ++o) {
        const orderby = query.getOrderby(o);
        const expressions = orderby.recursivelyReplaceExpression(multimap, recursionDepth, query, maxHeight);
        for (let e = 0, n = expressions.length; e < n; ++e) {
            result.push(query.setOrderbyElement(o, orderby.setExpression(expressions[e])));
        }
    }
}
exports.replaceOrderbyExpression = replaceOrderbyExpression;
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addOrderbyElement",
    description: "Add (missing) element in order-by-clause",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        if (query.orderbyLength >= meta.orderby.length)
            return;
        for (let o = 0; o <= query.orderbyLength; ++o) {
            result.push(query.setOrderbyElement(o, sql_1.OrderBy.baseOrderBy, false));
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeOrderbyElement",
    description: "Remove (excess) element in order-by-clause",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        for (let o = 0; o < query.orderbyLength; ++o) {
            result.push(query.setOrderbyElement(o));
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setOrderbyDescending",
    description: "Set (missing) order of order-by-element from ascending to descending",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        for (let o = 0; o < query.orderbyLength; ++o) {
            const orderby = query.getOrderby(o);
            if (orderby.descending == false) {
                result.push(query.setOrderbyElement(o, orderby.setDescending(true)));
            }
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetOrderbyDescending",
    description: "Set (missing) order of order-by-element from descending to ascending",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        for (let o = 0; o < query.orderbyLength; ++o) {
            const orderby = query.getOrderby(o);
            if (orderby.descending == true) {
                result.push(query.setOrderbyElement(o, orderby.setDescending(false)));
            }
        }
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addOrderbyColumnReference",
    description: "Add (missing) column-reference to a order-by-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceOrderbyExpression(query, result, addColumnReference(meta.orderby.columns), meta.orderby.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeOrderbyColumnReference",
    description: "Remove (excess) column-reference from a order-by-element expression",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceOrderbyExpression(query, result, removeColumnReference, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setOrderbyColumnReferenceTable",
    description: "Set (missing) table name on a column-reference in a order-by-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceOrderbyExpression(query, result, setColumnReferenceTable, meta.orderby.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetOrderbyColumnReferenceTable",
    description: "Unset (excess) table name on a column-reference in a order-by-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceOrderbyExpression(query, result, unsetColumnReferenceTable, meta.orderby.columnReferenceHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addOrderbyLiteral",
    description: "Add (missing) literal to a order-by-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceOrderbyExpression(query, result, addLiteral(meta.orderby.literals), meta.orderby.literalHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeOrderbyLiteral",
    description: "Remove (excess) literal from a order-by-element expression",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceOrderbyExpression(query, result, removeLiteral, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addOrderbyNot",
    description: "Add (missing) NOT to a order-by-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceOrderbyExpression(query, result, addNot, meta.orderby.notHeight, meta.orderby);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeOrderbyNot",
    description: "Remove (excess) NOT from a order-by-element expression",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceOrderbyExpression(query, result, removeNot, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addOrderbyAggregationFunction",
    description: "Add (missing) aggregation-function to a order-by-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceOrderbyExpression(query, result, addAggregationFunction(meta.orderby.aggregations), meta.orderby.aggregationHeight, meta.orderby);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeOrderbyAggregationFunction",
    description: "Remove (excess) aggregation-function from a order-by-element expression",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceOrderbyExpression(query, result, removeAggregationFunction, Infinity);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "setOrderbyAggregationFunctionDistinct",
    description: "Set (missing) distinct-declaration on an aggregation function " +
        "in an order-by-element expression",
    cost: 2,
    perform: (query, _schema, meta, result) => {
        replaceOrderbyExpression(query, result, setAggregationFunctionDistinct, meta.orderby.aggregationHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "unsetOrderbyAggregationFunctionDistinct",
    description: "Unset (excess) distinct-declaration on an aggregation function " +
        "in an order-by-element expression",
    cost: 2,
    perform: (query, _schema, meta, result) => {
        replaceOrderbyExpression(query, result, unsetAggregationFunctionDistinct, meta.orderby.aggregationHeight);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "addOrderbyBinaryExpression",
    description: "Add (missing) binary-expression to a order-by-element expression",
    cost: 1,
    perform: (query, _schema, meta, result) => {
        replaceOrderbyExpression(query, result, addBaseBinaryExpression, meta.orderby.binaryExpressionHeight, meta.orderby);
    }
});
(0, edit_1.addEdit)(exports.atomicEdits, {
    name: "removeOrderbyBinaryExpression",
    description: "Remove (excess) binary-expression from a order-by-element expression",
    cost: 1,
    perform: (query, _schema, _meta, result) => {
        replaceOrderbyExpression(query, result, removeBinaryExpression, Infinity);
    }
});
//# sourceMappingURL=atomicEdits.js.map