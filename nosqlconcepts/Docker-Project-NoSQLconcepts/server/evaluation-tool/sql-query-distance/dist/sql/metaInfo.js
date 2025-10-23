"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectMetaInfo = exports.MetaInfo = void 0;
const heightInfo_1 = require("./heightInfo");
const query_1 = require("./query");
// ===========
//  META INFO
// ===========
/**
 * A meta-info, containing certain information about the destination.
 * Required by edits in order to ensure termination and for optimization.
 */
class MetaInfo {
    distinct;
    select;
    from;
    where;
    groupby;
    having;
    orderby;
    constructor(query, schema) {
        this.distinct = query.distinct;
        this.select = new SelectMetaInfo(query, schema);
        this.from = new FromMetaInfo(query);
        this.where = new WhereMetaInfo(query);
        this.groupby = new GroupByMetaInfo(query);
        this.having = new HavingMetaInfo(query);
        this.orderby = new OrderByMetaInfo(query);
    }
}
exports.MetaInfo = MetaInfo;
class SelectMetaInfo extends heightInfo_1.HeightInfo {
    length;
    asterisk;
    columns;
    literals;
    aggregations;
    as;
    constructor(query, schema) {
        let maxHeights = heightInfo_1.HeightInfo.EMPTY;
        let length = query.selectLength;
        let columns = new Array();
        let literals = new Array();
        let aggregations = new Array();
        let asterisks = new Array();
        let as = new Array();
        for (let s = 0; s < query.selectLength; ++s) {
            const se = query.getSelect(s);
            if (se.expression)
                maxHeights = heightInfo_1.HeightInfo.max(maxHeights, se.expression.height);
            se.recursivelyReplaceExpression(collect(query, columns, literals, aggregations, asterisks), Infinity, query);
            if (se.as != null && !containsPrimitive(as, se.as))
                as.push(se.as);
        }
        for (let a = 0, n = asterisks.length; a < n; ++a) {
            const as = asterisks[a];
            if (as.table == null) {
                if (query.groupbyLength > 0) {
                    length += query.groupbyLength - 1;
                    for (let g = 0; g < query.groupbyLength; ++g) {
                        // const gb = query.getGroupby(g);
                        // if(!containsExpression(columns, gb, query)) columns.push(gb);
                        query.recursivelyReplaceGroupby(g, collect(query, columns, literals, aggregations, null), Infinity);
                    }
                }
                else {
                    for (let f = 0; f < query.fromLength; ++f) {
                        const table = schema.get(query.getFrom(f).table);
                        if (!table)
                            continue;
                        length += table.size;
                        for (let [c] of table) {
                            const cr = new query_1.ColumnReference(c);
                            if (!containsExpression(columns, cr, query))
                                columns.push(cr);
                        }
                    }
                    --length;
                }
            }
            else {
                let t = as.table;
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
                length += table.size - 1;
                for (let [c] of table) {
                    const cr = new query_1.ColumnReference(c);
                    if (!containsExpression(columns, cr, query))
                        columns.push(cr);
                }
            }
        }
        super(maxHeights.columnReferenceHeight, maxHeights.literalHeight, maxHeights.notHeight, maxHeights.aggregationHeight, maxHeights.binaryExpressionHeight);
        this.length = length;
        this.asterisk = asterisks.length > 0;
        this.columns = columns;
        this.literals = literals;
        this.aggregations = aggregations;
        this.as = as;
    }
}
exports.SelectMetaInfo = SelectMetaInfo;
class FromMetaInfo extends heightInfo_1.HeightInfo {
    length;
    join;
    columns;
    literals;
    tables;
    constructor(query) {
        let maxHeights = heightInfo_1.HeightInfo.EMPTY;
        let join = false;
        let columns = new Array();
        let literals = new Array();
        let tables = new Array();
        for (let f = 0; f < query.fromLength; ++f) {
            const fe = query.getFrom(f);
            if (fe.join != null)
                join = true;
            if (fe.on)
                maxHeights = heightInfo_1.HeightInfo.max(maxHeights, fe.on.height);
            fe.recursivelyReplaceOn(collect(query, columns, literals, [], []), Infinity, query);
            if (fe.table && !containsPrimitive(tables, fe.table))
                tables.push(fe.table);
        }
        super(maxHeights.columnReferenceHeight, maxHeights.literalHeight, maxHeights.notHeight, maxHeights.aggregationHeight, maxHeights.binaryExpressionHeight);
        this.length = query.fromLength;
        this.join = join;
        this.columns = columns;
        this.literals = literals;
        this.tables = tables;
    }
}
class WhereMetaInfo extends heightInfo_1.HeightInfo {
    columns;
    literals;
    constructor(query) {
        let maxHeights = heightInfo_1.HeightInfo.EMPTY;
        let columns = new Array();
        let literals = new Array();
        if (query.where)
            maxHeights = query.where.height;
        query.recursivelyReplaceWhere(collect(query, columns, literals, [], []), Infinity);
        super(maxHeights.columnReferenceHeight, maxHeights.literalHeight, maxHeights.notHeight, maxHeights.aggregationHeight, maxHeights.binaryExpressionHeight);
        this.columns = columns;
        this.literals = literals;
    }
}
class GroupByMetaInfo extends heightInfo_1.HeightInfo {
    length;
    columns;
    literals;
    constructor(query) {
        let maxHeights = heightInfo_1.HeightInfo.EMPTY;
        let columns = new Array();
        let literals = new Array();
        for (let g = 0; g < query.groupbyLength; ++g) {
            const x = query.getGroupby(g);
            if (x)
                maxHeights = heightInfo_1.HeightInfo.max(maxHeights, x.height);
            query.recursivelyReplaceGroupby(g, collect(query, columns, literals, [], []), Infinity);
        }
        super(maxHeights.columnReferenceHeight, maxHeights.literalHeight, maxHeights.notHeight, maxHeights.aggregationHeight, maxHeights.binaryExpressionHeight);
        this.length = query.groupbyLength;
        this.columns = columns;
        this.literals = literals;
    }
}
class HavingMetaInfo extends heightInfo_1.HeightInfo {
    columns;
    literals;
    aggregations;
    constructor(query) {
        let maxHeights = heightInfo_1.HeightInfo.EMPTY;
        let columns = new Array();
        let literals = new Array();
        let aggregations = new Array();
        if (query.having)
            maxHeights = query.having.height;
        query.recursivelyReplaceHaving(collect(query, columns, literals, aggregations, []), Infinity);
        super(maxHeights.columnReferenceHeight, maxHeights.literalHeight, maxHeights.notHeight, maxHeights.aggregationHeight, maxHeights.binaryExpressionHeight);
        this.columns = columns;
        this.literals = literals;
        this.aggregations = aggregations;
    }
}
class OrderByMetaInfo extends heightInfo_1.HeightInfo {
    length;
    columns;
    literals;
    aggregations;
    constructor(query) {
        let maxHeights = heightInfo_1.HeightInfo.EMPTY;
        let columns = new Array();
        let literals = new Array();
        let aggregations = new Array();
        for (let o = 0; o < query.orderbyLength; ++o) {
            const oe = query.getOrderby(o);
            if (oe.expression)
                maxHeights = heightInfo_1.HeightInfo.max(maxHeights, oe.expression.height);
            oe.recursivelyReplaceExpression(collect(query, columns, literals, aggregations, []), Infinity, query);
        }
        super(maxHeights.columnReferenceHeight, maxHeights.literalHeight, maxHeights.notHeight, maxHeights.aggregationHeight, maxHeights.binaryExpressionHeight);
        this.length = query.orderbyLength;
        this.columns = columns;
        this.literals = literals;
        this.aggregations = aggregations;
    }
}
function collect(query, columns, literals, aggregations, asterisks) {
    return (x) => {
        if (query_1.Asterisk.isAsterisk(x)) {
            asterisks.push(x); //specifically no duplicate-elimination for asterisks!
        }
        else if (query_1.ColumnReference.isColumnReference(x)) {
            const cleanX = new query_1.ColumnReference(x.column);
            if (!containsExpression(columns, cleanX, query))
                columns.push(cleanX);
        }
        else if (query_1.Literal.isLiteral(x)) {
            const cleanX = new query_1.Literal(x.value);
            if (!containsExpression(literals, cleanX, query))
                literals.push(cleanX);
        }
        else if (query_1.AggregationFunction.isAggregationFunction(x)) {
            const cleanX = new query_1.AggregationFunction(x.aggregation);
            if (!containsExpression(aggregations, cleanX, query))
                aggregations.push(cleanX);
        }
        return [];
    };
}
function containsExpression(list, x, q) {
    for (let i = 0; i < list.length; ++i) {
        if (list[i].equals(x, q, q))
            return true;
    }
    return false;
}
function containsPrimitive(list, x) {
    for (let i = 0; i < list.length; ++i) {
        if (list[i] == x)
            return true;
    }
    return false;
}
//# sourceMappingURL=metaInfo.js.map