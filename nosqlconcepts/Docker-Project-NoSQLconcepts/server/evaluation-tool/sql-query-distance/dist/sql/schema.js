"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = void 0;
const columnReference_1 = require("./query/columnReference");
/**
 * A databse schema, containing tables indexed by their name.
 */
class Schema extends Map {
    static collectAllColumnReferences(query) {
        const columnReferences = [];
        const collect = (x) => {
            if (columnReference_1.ColumnReference.isColumnReference(x))
                columnReferences.push(x);
            return [];
        };
        for (let s = 0; s < query.selectLength; ++s)
            query.getSelect(s).recursivelyReplaceExpression(collect, Infinity, query);
        for (let f = 0; f < query.fromLength; ++f)
            query.getFrom(f).recursivelyReplaceOn(collect, Infinity, query);
        query.recursivelyReplaceWhere(collect, Infinity);
        for (let g = 0; g < query.groupbyLength; ++g)
            query.recursivelyReplaceGroupby(g, collect, Infinity);
        query.recursivelyReplaceHaving(collect, Infinity);
        for (let o = 0; o < query.orderbyLength; ++o)
            query.getOrderby(o).recursivelyReplaceExpression(collect, Infinity, query);
        return columnReferences;
    }
    static deduceSchema(query) {
        if (!query)
            throw new Error("Query required to deduce the schema from.");
        const schema = new Schema();
        const columnReferences = Schema.collectAllColumnReferences(query);
        for (let f = 0; f < query.fromLength; ++f) {
            const table = Object.assign(new Map(), { name: query.getFrom(f).table });
            schema.set(table.name, table);
            for (let c = 0; c < columnReferences.length; ++c) {
                if ((!columnReferences[c].table)
                    || columnReferences[c].table == query.getFrom(f).alias)
                    table.set(columnReferences[c].column, { name: columnReferences[c].column });
            }
        }
        return schema;
    }
}
exports.Schema = Schema;
//# sourceMappingURL=schema.js.map