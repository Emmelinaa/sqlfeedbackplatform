"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shortcutEdits = void 0;
const sql_1 = require("../sql");
const atomicEdits_1 = require("./atomicEdits");
const edit_1 = require("./edit");
// ==============
// Shortcut Edits
// ==============
/**
 * The set of shortcut edits, represented as a map, indexed by the edit names.
 */
exports.shortcutEdits = new Map();
function isBoolean(x) {
    return sql_1.Not.isNot(x)
        || (sql_1.BinaryExpression.isBinaryExpression(x) && sql_1.BinaryExpression.isBoolean(x.operator));
}
function applyTautologyLaw(x, context) {
    const res = [];
    //forward application:
    //context.maxHeight >= context.stack.length + x.height + 1 => can I increase tree height by 1?
    if (isBoolean(x) && context.maxHeight.minDiff(x.height) >= context.stack.length + 1) {
        res.push(new sql_1.BinaryExpression(sql_1.OperatorType.AND, x, x));
        res.push(new sql_1.BinaryExpression(sql_1.OperatorType.OR, x, x));
    }
    //backward application:
    if (sql_1.BinaryExpression.isBinaryExpression(x)
        && (x.operator == sql_1.OperatorType.AND || x.operator == sql_1.OperatorType.OR)
        && isBoolean(x.left)
        && (x.left == x.right || (x.left && x.left.equals(x.right, context.query, context.query)))) {
        res.push(x.left);
    }
    return res;
}
function applyDoubleNegationLaw(x, context) {
    const res = [];
    //forward application:
    //context.maxHeight >= context.stack.length + x.height + 2 => can I increase tree height by 2?
    if (isBoolean(x) && context.maxHeight.minDiff(x.height) >= context.stack.length + 2) {
        res.push(new sql_1.Not(new sql_1.Not(x)));
    }
    //backward application:
    if (sql_1.Not.isNot(x) && sql_1.Not.isNot(x.argument) && isBoolean(x.argument.argument)) {
        res.push(x.argument.argument);
    }
    return res;
}
function applyDistributiveLaw(x, context) {
    if (!sql_1.BinaryExpression.isBinaryExpression(x))
        return [];
    const res = [];
    //forward application:
    if (sql_1.BinaryExpression.isBinaryExpression(x.left)
        && sql_1.BinaryExpression.isDistributive(x.operator, x.left.operator)
        && (x.right == null
            || context.maxHeight.minDiff(x.right.height) >= context.stack.length + 2)) {
        res.push(x.setOperator(x.left.operator)
            .setLeft(new sql_1.BinaryExpression(x.operator, x.left.left, x.right))
            .setRight(new sql_1.BinaryExpression(x.operator, x.left.right, x.right)));
    }
    if (sql_1.BinaryExpression.isBinaryExpression(x.right)
        && sql_1.BinaryExpression.isDistributive(x.operator, x.right.operator)
        && (x.left == null
            || context.maxHeight.minDiff(x.left.height) >= context.stack.length + 2)) {
        res.push(x.setOperator(x.right.operator)
            .setLeft(new sql_1.BinaryExpression(x.operator, x.left, x.right.left))
            .setRight(new sql_1.BinaryExpression(x.operator, x.left, x.right.right)));
    }
    //backward application:
    if (sql_1.BinaryExpression.isBinaryExpression(x.left)
        && sql_1.BinaryExpression.isBinaryExpression(x.right)
        && x.left.operator == x.right.operator
        && sql_1.BinaryExpression.isDistributive(x.operator, x.left.operator)) {
        if (x.left.left == x.right.left
            || (x.left.left
                && x.left.left.equals(x.right.left, context.query, context.query))) {
            res.push(x.setOperator(x.left.operator)
                .setLeft(x.left.left)
                .setRight(new sql_1.BinaryExpression(x.operator, x.left.right, x.right.right)));
        }
        if (x.left.right === x.right.right
            || (x.left.right
                && x.left.right.equals(x.right.right, context.query, context.query))) {
            res.push(x.setOperator(x.left.operator)
                .setLeft(new sql_1.BinaryExpression(x.operator, x.left.left, x.right.left))
                .setRight(x.left.right));
        }
    }
    return res;
}
function applyDeMorgan(x) {
    const res = [];
    //forward application:
    if (sql_1.Not.isNot(x) && sql_1.BinaryExpression.isBinaryExpression(x.argument)) {
        if (x.argument.operator == sql_1.OperatorType.AND) {
            res.push(x.argument
                .setOperator(sql_1.OperatorType.OR)
                .setLeft(new sql_1.Not(x.argument.left))
                .setRight(new sql_1.Not(x.argument.right)));
        }
        else if (x.argument.operator == sql_1.OperatorType.OR) {
            res.push(x.argument
                .setOperator(sql_1.OperatorType.AND)
                .setLeft(new sql_1.Not(x.argument.left))
                .setRight(new sql_1.Not(x.argument.right)));
        }
    }
    //backward application:
    else if (sql_1.BinaryExpression.isBinaryExpression(x) && sql_1.Not.isNot(x.left) && sql_1.Not.isNot(x.right)) {
        if (x.operator == sql_1.OperatorType.AND) {
            res.push(new sql_1.Not(x
                .setOperator(sql_1.OperatorType.OR)
                .setLeft(x.left.argument)
                .setRight(x.right.argument)));
        }
        else if (x.operator == sql_1.OperatorType.OR) {
            res.push(new sql_1.Not(x
                .setOperator(sql_1.OperatorType.AND)
                .setLeft(x.left.argument)
                .setRight(x.right.argument)));
        }
    }
    return res;
}
function applyAbsorptionLaw(x, context) {
    if (!sql_1.BinaryExpression.isBinaryExpression(x)
        || (x.operator != sql_1.OperatorType.AND && x.operator != sql_1.OperatorType.OR))
        return [];
    const res = [];
    //forward application:
    if ((x.left == null || isBoolean(x.left))
        && sql_1.BinaryExpression.isBinaryExpression(x.right)
        && (x.right.operator == (x.operator == sql_1.OperatorType.OR ? sql_1.OperatorType.AND : sql_1.OperatorType.OR))
        && (x.left == x.right.left
            || (x.left && x.left.equals(x.right.left, context.query, context.query))
            || x.left == x.right.right
            || (x.left && x.left.equals(x.right.right, context.query, context.query)))) {
        res.push(x.left);
    }
    if ((x.right == null || isBoolean(x.right))
        && sql_1.BinaryExpression.isBinaryExpression(x.left)
        && (x.left.operator == (x.operator == sql_1.OperatorType.OR ? sql_1.OperatorType.AND : sql_1.OperatorType.OR))
        && (x.right == x.left.left
            || (x.right && x.right.equals(x.left.left, context.query, context.query))
            || x.right == x.left.right
            || (x.right && x.right.equals(x.left.right, context.query, context.query)))) {
        res.push(x.right);
    }
    //backward application: would require generating infinitely many expression sub-trees
    //-> instead, forward-version of absorption law should be executed on the destination
    //before starting the search (this is currently not implemented, yet)
    return res;
}
function unsetColumnReferenceUnnecessaryTable(x, context) {
    throw Error("not implemented, yet"); //TODO: implement
}
// === SELECT ===
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applySelectTautologyLaw",
    description: "Apply tautology law in a select-element expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceSelectExpression)(query, result, applyTautologyLaw, meta.select.length, meta.select.binaryExpressionHeight, meta.select);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applySelectDoubleNegationLaw",
    description: "Apply double negation law in a select-element expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceSelectExpression)(query, result, applyDoubleNegationLaw, meta.select.length, meta.select.notHeight, meta.select);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applySelectDistributiveLaw",
    description: "Apply distributive law in a select-element expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceSelectExpression)(query, result, applyDistributiveLaw, meta.select.length, meta.select.binaryExpressionHeight, meta.select);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applySelectDeMorgan",
    description: "Apply De Morgan's law in a select-element expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceSelectExpression)(query, result, applyDeMorgan, meta.select.length, Math.max(meta.select.binaryExpressionHeight, meta.select.notHeight));
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applySelectAbsorptionLaw",
    description: "Apply absorption law in a select-element expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceSelectExpression)(query, result, applyAbsorptionLaw, meta.select.length, meta.select.binaryExpressionHeight);
    }
});
// addEdit(shortcutEdits, {
//     name: "unsetSelectColumnReferenceRedundantTable",
//     description:
//         "Unset (redundant) table name on a column-reference in a select-element expression",
//     cost: 0,
//     perform: (query: Query, _schema: Schema, meta: MetaInfo, result: Query[]) => {
//         replaceSelectExpression(query, result, 
//             unsetColumnReferenceUnnecessaryTable,
//             meta.select.columnReferenceHeight);
//     }
// });
// === FROM ===
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyFromTautologyLaw",
    description: "Apply tautology law in a from-element join-condition",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceFromExpression)(query, result, applyTautologyLaw, meta.from.binaryExpressionHeight, false, false, meta.from);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyFromDoubleNegationLaw",
    description: "Apply double negation law in a from-element join-condition",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceFromExpression)(query, result, applyDoubleNegationLaw, meta.from.notHeight, false, false, meta.from);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyFromDistributiveLaw",
    description: "Apply distributive law in a from-element join-condition",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceFromExpression)(query, result, applyDistributiveLaw, meta.from.binaryExpressionHeight, false, false, meta.from);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyFromDeMorgan",
    description: "Apply De Morgan's law in a from-element join-condition",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceFromExpression)(query, result, applyDeMorgan, Math.max(meta.from.binaryExpressionHeight, meta.from.notHeight));
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyFromAbsorptionLaw",
    description: "Apply absorption law in a from-element join-condition",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceFromExpression)(query, result, applyAbsorptionLaw, meta.from.binaryExpressionHeight);
    }
});
// === WHERE ===
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyWhereTautologyLaw",
    description: "Apply tautology law in the where-clause",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceWhereExpression)(query, result, applyTautologyLaw, meta.where.binaryExpressionHeight, meta.where);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyWhereDoubleNegationLaw",
    description: "Apply double negation law in the where-clause",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceWhereExpression)(query, result, applyDoubleNegationLaw, meta.where.notHeight, meta.where);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyWhereDistributiveLaw",
    description: "Apply distributive law in the where-clause",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceWhereExpression)(query, result, applyDistributiveLaw, meta.where.binaryExpressionHeight, meta.where);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyWhereDeMorgan",
    description: "Apply De Morgan's law in the where-clause",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceWhereExpression)(query, result, applyDeMorgan, Math.max(meta.where.binaryExpressionHeight, meta.where.notHeight));
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyWhereAbsorptionLaw",
    description: "Apply absorption law in the where-clause",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceWhereExpression)(query, result, applyAbsorptionLaw, meta.where.binaryExpressionHeight);
    }
});
// === GROUP BY ===
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyGroupbyTautologyLaw",
    description: "Apply tautology law in a group-by expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceGroupbyExpression)(query, result, applyTautologyLaw, meta.groupby.binaryExpressionHeight, meta.groupby);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyGroupbyDoubleNegationLaw",
    description: "Apply double negation law in a group-by expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceGroupbyExpression)(query, result, applyDoubleNegationLaw, meta.groupby.notHeight, meta.groupby);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyGroupbyDistributiveLaw",
    description: "Apply distributive law in a group-by expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceGroupbyExpression)(query, result, applyDistributiveLaw, meta.groupby.binaryExpressionHeight, meta.groupby);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyGroupbyDeMorgan",
    description: "Apply De Morgan's law in a group-by expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceGroupbyExpression)(query, result, applyDeMorgan, Math.max(meta.groupby.binaryExpressionHeight, meta.groupby.notHeight));
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyGroupbyAbsorptionLaw",
    description: "Apply absorption law in a group-by expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceGroupbyExpression)(query, result, applyAbsorptionLaw, meta.groupby.binaryExpressionHeight);
    }
});
// === Having ===
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyHavingTautologyLaw",
    description: "Apply tautology law in the having-clause",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceHavingExpression)(query, result, applyTautologyLaw, meta.having.binaryExpressionHeight, meta.having);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyHavingDoubleNegationLaw",
    description: "Apply double negation law in the having-clause",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceHavingExpression)(query, result, applyDoubleNegationLaw, meta.having.notHeight - 1, meta.having);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyHavingDistributiveLaw",
    description: "Apply distributive law in the having-clause",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceHavingExpression)(query, result, applyDistributiveLaw, meta.having.binaryExpressionHeight, meta.having);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyHavingDeMorgan",
    description: "Apply De Morgan's law in the having-clause",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceHavingExpression)(query, result, applyDeMorgan, Math.max(meta.having.binaryExpressionHeight, meta.having.notHeight));
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyHavingAbsorptionLaw",
    description: "Apply absorption law in the having-clause",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceHavingExpression)(query, result, applyAbsorptionLaw, meta.having.binaryExpressionHeight);
    }
});
// === Order By ===
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyOrderbyTautologyLaw",
    description: "Apply tautology law in a order-by expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceOrderbyExpression)(query, result, applyTautologyLaw, meta.orderby.binaryExpressionHeight, meta.orderby);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyOrderbyDoubleNegationLaw",
    description: "Apply double negation law in a order-by expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceOrderbyExpression)(query, result, applyDoubleNegationLaw, meta.orderby.notHeight, meta.orderby);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyOrderbyDistributiveLaw",
    description: "Apply distributive law in a order-by expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceOrderbyExpression)(query, result, applyDistributiveLaw, meta.orderby.binaryExpressionHeight, meta.orderby);
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyOrderbyDeMorgan",
    description: "Apply De Morgan's law in a order-by expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceOrderbyExpression)(query, result, applyDeMorgan, Math.max(meta.orderby.binaryExpressionHeight, meta.orderby.notHeight));
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "applyOrderbyAbsorptionLaw",
    description: "Apply absorption law in a order-by expression",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        (0, atomicEdits_1.replaceOrderbyExpression)(query, result, applyAbsorptionLaw, meta.orderby.binaryExpressionHeight);
    }
});
// === Multi-clause transformations ===
function extractFirstLevelConjugate(removed) {
    return (x, context) => {
        if (!sql_1.BinaryExpression.isBinaryExpression(x) || x.operator != sql_1.OperatorType.AND)
            return [];
        for (let s = context.stack.length - 1; s >= 0; --s) {
            const se = context.stack[s];
            if (!sql_1.BinaryExpression.isBinaryExpression(se)
                || se.operator != sql_1.OperatorType.AND)
                return [];
        }
        const res = [];
        if (x.left != null) {
            removed.push(x.left);
            res.push(x.right);
        }
        if (x.right != null) {
            removed.push(x.right);
            res.push(x.left);
        }
        return res;
    };
}
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "moveInnerJoinConditionToWhere",
    description: "Move the join-condition of an INNER JOIN to the where-clause",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        if ((meta.where.binaryExpressionHeight < 0
            && meta.where.columnReferenceHeight < 0
            && meta.where.literalHeight < 0)
            || (query.where && meta.where.minDiff(query.where.height) < 1))
            return;
        for (let f = 1; f < query.fromLength; ++f) {
            const fe = query.getFrom(f);
            if (fe.on == null || fe.join != sql_1.JoinType.INNER)
                continue;
            const removed = [];
            const expressions = fe.recursivelyReplaceOn(extractFirstLevelConjugate(removed), Infinity, query);
            removed.push(fe.on);
            expressions.push(null);
            for (let e = 0, n = expressions.length; e < n; ++e) {
                if (removed[e]
                    && meta.where.minDiff(removed[e].height) < (query.where == null ? 0 : 1)) {
                    continue;
                }
                result.push(query.setFromElement(f, fe
                    .setJoin(expressions[e] == null ? null : fe.join)
                    .setOn(expressions[e])).setWhere(query.where == null ? removed[e] :
                    new sql_1.BinaryExpression(sql_1.OperatorType.AND, removed[e], query.where)));
            }
        }
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "moveWhereToInnerJoinCondition",
    description: "Move expression from the where-clause to the join-condition of an INNER JOIN",
    cost: 0,
    perform: (query, _schema, meta, result) => {
        if (query.where == null
            || (meta.from.binaryExpressionHeight < 0
                && meta.from.columnReferenceHeight < 0
                && meta.from.literalHeight < 0))
            return;
        const removed = [];
        const expressions = query.recursivelyReplaceWhere(extractFirstLevelConjugate(removed), meta.where.binaryExpressionHeight);
        removed.push(query.where);
        expressions.push(null);
        for (let f = 1; f < query.fromLength; ++f) {
            const fe = query.getFrom(f);
            if ((fe.join != null && fe.join != sql_1.JoinType.INNER)
                || (fe.on && meta.from.minDiff(fe.on.height) < 1))
                continue;
            for (let e = 0, n = expressions.length; e < n; ++e) {
                if (removed[e]
                    && meta.from.minDiff(removed[e].height) < (fe.on == null ? 0 : 1)) {
                    continue;
                }
                result.push(query
                    .setWhere(expressions[e])
                    .setFromElement(f, fe
                    .setJoin(sql_1.JoinType.INNER)
                    .setOn(fe.on == null ? removed[e] :
                    new sql_1.BinaryExpression(sql_1.OperatorType.AND, removed[e], fe.on))));
            }
        }
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "expandAsterisk",
    description: "Replace an asterisk with the expressions it represents",
    cost: 0,
    perform: (query, schema, meta, result) => {
        if (query.groupbyLength > 0) {
            for (let s = 0; s < query.selectLength && s < meta.select.length; ++s) {
                const se = query.getSelect(s);
                if (!sql_1.Asterisk.isAsterisk(se.expression) || se.expression.table != null)
                    continue;
                let groups = [];
                for (let g = 0; g < query.groupbyLength; ++g) {
                    groups.push(new sql_1.SelectElement(query.getGroupby(g)));
                }
                let select = query.copySelect();
                select.splice(s, 1, ...groups);
                result.push(query.setSelect(select));
            }
        }
        else {
            for (let s = 0; s < query.selectLength && s < meta.select.length; ++s) {
                const se = query.getSelect(s);
                if (!sql_1.Asterisk.isAsterisk(se.expression))
                    continue;
                let columns = [];
                if (se.expression.table == null) {
                    if (query.fromLength <= 0)
                        continue;
                    for (let f = 0; f < query.fromLength; ++f) {
                        let fe = query.getFrom(f);
                        let table = fe.table;
                        for (let [column] of schema.get(table)) {
                            let tableAliasRequired = false;
                            for (let [otherTable] of schema) {
                                if (otherTable == table)
                                    continue;
                                if (schema.get(otherTable).has(column)) {
                                    tableAliasRequired = true;
                                    break;
                                }
                            }
                            columns.push(new sql_1.SelectElement(new sql_1.ColumnReference(column, tableAliasRequired ? fe.alias : null)));
                        }
                    }
                }
                else {
                    let t = se.expression.table;
                    for (let f = 0; f < query.fromLength; ++f) {
                        const fe = query.getFrom(f);
                        if (fe.alias == t) {
                            t = fe.table;
                            break;
                        }
                    }
                    const table = schema.get(t);
                    if (!table)
                        continue;
                    for (let [column] of table) {
                        let tableAliasRequired = false;
                        for (let [otherTable] of schema) {
                            if (otherTable == t)
                                continue;
                            if (schema.get(otherTable).has(column)) {
                                tableAliasRequired = true;
                                break;
                            }
                        }
                        columns.push(new sql_1.SelectElement(new sql_1.ColumnReference(column, tableAliasRequired ? se.expression.table : null)));
                    }
                }
                //if(query.selectLength + columns.length - 1 <= meta.select.length)
                let select = query.copySelect();
                select.splice(s, 1, ...columns);
                result.push(query.setSelect(select));
            }
        }
    }
});
(0, edit_1.addEdit)(exports.shortcutEdits, {
    name: "collapseAsterisk",
    description: "Replace a number of expressions with an asterisk representing them",
    cost: 0,
    perform: (query, schema, meta, result) => {
        if (!meta.select.asterisk)
            return;
        if (query.groupbyLength > 0) {
            // TODO
        }
        else if (query.fromLength > 0) {
            for (let s = 0; s < query.selectLength && s < meta.select.length; ++s) {
                let replaceAll = true;
                let sAll = s;
                for (let f = 0; f < query.fromLength; ++f) {
                    const fe = query.getFrom(f);
                    if (!schema.has(fe.table) || schema.get(fe.table).size > query.selectLength - s) {
                        replaceAll = false;
                        continue;
                    }
                    let replaceOne = true;
                    let sOne = s;
                    for (let [column] of schema.get(fe.table)) {
                        if (replaceAll && sAll < query.selectLength) {
                            const se = query.getSelect(sAll);
                            if (!sql_1.ColumnReference.isColumnReference(se.expression)
                                || se.expression.column != column
                                || (se.expression.table != null && se.expression.table != fe.alias)) {
                                replaceAll = false;
                            }
                            ++sAll;
                            if (sAll > query.selectLength)
                                replaceAll = false;
                        }
                        if (replaceOne && sOne < query.selectLength) {
                            const se = query.getSelect(sOne);
                            if (!sql_1.ColumnReference.isColumnReference(se.expression)
                                || se.expression.column != column
                                || (se.expression.table != null && se.expression.table != fe.alias)) {
                                replaceOne = false;
                            }
                            ++sOne;
                            if (sOne > query.selectLength)
                                replaceOne = false;
                        }
                        if (!(replaceAll || replaceOne))
                            break;
                    }
                    if (replaceOne && sOne > s) {
                        let select = query.copySelect();
                        select.splice(s, sOne - s, new sql_1.SelectElement(new sql_1.Asterisk(fe.alias)));
                        result.push(query.setSelect(select));
                    }
                }
                if (replaceAll && sAll > s) {
                    let select = query.copySelect();
                    select.splice(s, sAll - s, new sql_1.SelectElement(sql_1.Asterisk.baseAsterisk));
                    result.push(query.setSelect(select));
                }
            }
        }
    }
});
//TODO: other Shortcut edits
//# sourceMappingURL=shortcutEdits.js.map