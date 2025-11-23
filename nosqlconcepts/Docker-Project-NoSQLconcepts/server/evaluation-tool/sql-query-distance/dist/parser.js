"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyDistance = exports.stringifyConfig = exports.parseConfig = exports.stringifyEdit = exports.validateQuerySyntaxAndSemantics = exports.validateQuerySyntax = exports.stringifyQuery = exports.parseQuery = exports.parseSchema = exports.clean = void 0;
const NodeSQLParser = require("node-sql-parser");
const config_1 = require("./config");
const SQL = require("./sql");
// ========
//  SCHEMA
// ========
/**
 * Removes whitespace from a string.
 *
 * @param x the string to remove whitespace from.
 * @returns the string without whitespace
 */
let clean = (x) => x.replace(/\s+/g, '');
exports.clean = clean;
/**
 * Parses the description of a schema.
 *
 * @param description the description of the schema
 * @returns the parsed schema
 * @throws an error if the description cannot be parsed into a schema
 */
function parseSchema(description) {
    function parseColumn(description) {
        // let primaryKey = false;
        // let foreignKey = false;
        // let foreignTable: string = null;
        let firstBracket = description.indexOf('[');
        if (firstBracket >= 0) {
            let lastBracket = description.lastIndexOf(']');
            if (lastBracket < 0)
                throw Error(`Missing closing bracket for opening bracket:\n${description}`);
            // foreignKey = true;
            // foreignTable = description.substring(firstBracket + 1, lastBracket);
            description = description.substring(0, firstBracket) +
                description.substring(lastBracket + 1, description.length);
        }
        if (description.charAt(0) == '_' && description.charAt(description.length - 1) == '_') {
            // primaryKey = true;
            description = description.substring(1, description.length - 1);
        }
        return {
            name: description,
            // datatype: SQL.DataType.VARCHAR,
            // not_null: primaryKey,
            // unique: primaryKey,
            // primary_key: primaryKey,
            // foreign_key: foreignKey,
            // foreign_table: foreignTable,
        };
    }
    function parseTable(description) {
        let firstBracket = description.indexOf('(');
        if (firstBracket < 0)
            throw Error(`Missing opening bracket in line:\n${description}`);
        else if (firstBracket < 1)
            throw Error(`Missing table name in line:\n${description}`);
        let lastBracket = description.lastIndexOf(')');
        if (lastBracket < 0)
            throw Error(`Missing closing bracket in line:\n${description}`);
        let name = description.substring(0, firstBracket);
        let columns = description.substring(firstBracket + 1, lastBracket)
            .split(',').map(parseColumn);
        // if(columns.filter((x: SQL.Column) => x.primary_key).length == 0)
        //     throw Error(`Missing primaryKey for table ${name}`);
        return Object.assign(new Map(columns.map(x => [x.name, x])), { name: name });
    }
    let schema = new SQL.Schema();
    description.split('\n').map(exports.clean).filter(x => x.length > 0).map(parseTable).forEach((x) => {
        if (schema.has(x.name))
            throw new Error(`Duplicate table name ${x.name} in schema.`);
        schema.set(x.name, x);
    });
    // schema.forEach((table: SQL.Table) => table.forEach((column: SQL.Column) => {
    //     if(column.foreign_key && !schema.has(column.foreign_table))
    //         throw Error(`Table ${column.foreign_table} referenced by `+
    //             '${table.name}.${column.name} not found.');
    // }));
    return schema;
}
exports.parseSchema = parseSchema;
// =======
//  QUERY
// =======
const parser = new NodeSQLParser.Parser();
function isSelectAST(ast) {
    return ast.type === "select";
}
function isColumn(column) {
    if (!("as" in column))
        return false;
    if (!("expr" in column))
        return false;
    return true;
}
function isFrom(from) {
    if (!("db" in from))
        return false;
    if (!("table" in from))
        return false;
    if (!("as" in from))
        return false;
    return true;
}
function isJoin(from) {
    if (!isFrom(from))
        return false;
    if (!("join" in from))
        return false;
    if (!("on" in from))
        return false;
    return true;
}
function isColumnRef(expression) {
    if (!("type" in expression))
        return false;
    if (expression.type != "column_ref")
        return false;
    if (!("table" in expression))
        return false;
    if (!("column" in expression))
        return false;
    return true;
}
function parseJoinType(description) {
    switch (description) {
        case "INNER JOIN":
            return SQL.JoinType.INNER;
        case "LEFT JOIN":
            return SQL.JoinType.LEFT_OUTER;
        case "RIGHT JOIN":
            return SQL.JoinType.RIGHT_OUTER;
        case "FULL JOIN":
            return SQL.JoinType.FULL_OUTER;
        default:
            throw new Error(`Join type "${description}" cannot be parsed (yet).`);
    }
}
function stringifyJoinType(join) {
    switch (join) {
        case SQL.JoinType.INNER:
            return "INNER JOIN";
        case SQL.JoinType.LEFT_OUTER:
            return "LEFT JOIN";
        case SQL.JoinType.RIGHT_OUTER:
            return "RIGHT JOIN";
        case SQL.JoinType.FULL_OUTER:
            return "FULL JOIN";
        case null:
            return null;
        default:
            throw new Error(`Join type "${join}" could not be stringified.`);
    }
}
function parseAggregationType(description) {
    switch (description) {
        case "COUNT":
            return SQL.AggregationType.COUNT;
        case "SUM":
            return SQL.AggregationType.SUM;
        case "AVG":
            return SQL.AggregationType.AVG;
        case "MIN":
            return SQL.AggregationType.MIN;
        case "MAX":
            return SQL.AggregationType.MAX;
        default:
            throw new Error(`Aggregation type "${description}" cannot be parsed (yet).`);
    }
}
function stringifyAggregationType(type) {
    switch (type) {
        case SQL.AggregationType.COUNT:
            return "COUNT";
        case SQL.AggregationType.SUM:
            return "SUM";
        case SQL.AggregationType.AVG:
            return "AVG";
        case SQL.AggregationType.MIN:
            return "MIN";
        case SQL.AggregationType.MAX:
            return "MAX";
        default:
            throw new Error(`Aggregation type "${type}" could not be stringified.`);
    }
}
function parseOperatorType(description) {
    switch (description) {
        case "=":
            return SQL.OperatorType.EQUALS;
        case "AND":
            return SQL.OperatorType.AND;
        case "OR":
            return SQL.OperatorType.OR;
        case "<":
            return SQL.OperatorType.LESS;
        case ">":
            return SQL.OperatorType.GREATER;
        default:
            throw new Error(`Operator type "${description}" cannot be parsed (yet).`);
    }
}
function stringifyOperatorType(type) {
    switch (type) {
        case SQL.OperatorType.EQUALS:
            return "=";
        case SQL.OperatorType.AND:
            return "AND";
        case SQL.OperatorType.OR:
            return "OR";
        case SQL.OperatorType.LESS:
            return "<";
        case SQL.OperatorType.GREATER:
            return ">";
        default:
            throw new Error(`Operator type "${type}" could not be stringified.`);
    }
}
function parseExpression(expr) {
    if (!expr)
        return null;
    if ((!("type" in expr)) || !expr.type)
        throw new Error(`Expression ${JSON.stringify(expr)} cannot be parsed (yet).`);
    if (expr.type == "star") {
        return SQL.Asterisk.baseAsterisk;
    }
    else if (expr.type == "column_ref") {
        if (expr.column == "*")
            return new SQL.Asterisk(expr.table);
        return new SQL.ColumnReference(expr.column, expr.table);
    }
    else if (expr.type == "number" || expr.type == "string" || expr.type == "single_quote_string") {
        return new SQL.Literal(expr.value);
    }
    else if (expr.type == "aggr_func") {
        const aggregation = parseAggregationType(expr.name);
        return new SQL.AggregationFunction(aggregation, "distinct" in expr.args && expr.args.distinct != null, (expr.args.expr != null && expr.args.expr.type == "star"
            && aggregation == SQL.AggregationType.COUNT) ?
            null : parseExpression(expr.args.expr));
    }
    else if (expr.type == "binary_expr") {
        return new SQL.BinaryExpression(parseOperatorType(expr.operator), parseExpression(expr.left), parseExpression(expr.right));
    }
    else if (expr.type == "unary_expr") {
        if (expr.operator == "NOT")
            return new SQL.Not(parseExpression(expr.expr));
        else
            throw new Error(`Operator type "${expr.operator}" cannot be parsed (yet).`);
    }
    else {
        throw new Error(`Expression type ${expr.type} cannot be parsed (yet).`);
    }
}
const emptyExpression = { type: "column_ref", table: null, column: "   " };
function stringifyExpression(e, avoidNull = true) {
    if (!e)
        return avoidNull ? emptyExpression : null;
    if (SQL.Asterisk.isAsterisk(e)) {
        return { type: "column_ref", table: e.table, column: "*" };
    }
    else if (SQL.ColumnReference.isColumnReference(e)) {
        return { type: "column_ref", table: e.table, column: e.column };
    }
    else if (SQL.Literal.isLiteral(e)) {
        return { type: (typeof e.value == "number") ? "number" : "string", value: e.value };
    }
    else if (SQL.Not.isNot(e)) {
        return { type: "unary_expr", operator: "NOT", parentheses: true,
            expr: stringifyExpression(e.argument) };
    }
    else if (SQL.AggregationFunction.isAggregationFunction(e)) {
        return { type: "aggr_func", name: stringifyAggregationType(e.aggregation), args: {
                distinct: e.distinct ? "DISTINCT" : null,
                expr: (e.aggregation == SQL.AggregationType.COUNT && e.argument == null) ?
                    { type: "star", value: "*" } : stringifyExpression(e.argument)
            } };
    }
    else if (SQL.BinaryExpression.isBinaryExpression(e)) {
        return { type: "binary_expr", operator: stringifyOperatorType(e.operator), parentheses: true,
            left: stringifyExpression(e.left), right: stringifyExpression(e.right) };
    }
    else {
        throw new Error(`Expression ${e} could not be stringified.`);
    }
}
/**
 * Parses the description of a query.
 *
 * @param description the description of the query
 * @returns the parsed query
 * @throws an error if the description cannot be parsed into a query
 */
function parseQuery(description) {
    let ast = parser.astify(description);
    if (!ast)
        return null;
    if (Array.isArray(ast)) {
        if (ast.length > 1) {
            throw new Error(`Only one Query is allowed here, but ${ast.length} have been found.`);
        }
        ast = ast[0];
    }
    if (!isSelectAST(ast))
        throw new Error(`Query is not of type "select" but of type "${ast.type}",` +
            ` which cannot be processed (yet).`);
    if (ast.with != null)
        throw new Error(`Query has a "with"-clause, which cannot be processed (yet).`);
    if (ast.options != null)
        throw new Error(`Query has "options", which cannot be processed (yet).`);
    let selectElements;
    if (ast.columns == '*') {
        selectElements = [new SQL.SelectElement(SQL.Asterisk.baseAsterisk)];
    }
    else {
        selectElements = new Array(ast.columns.length);
        for (let i = 0; i < ast.columns.length; ++i) {
            let column = ast.columns[i];
            if (!isColumn(column))
                throw new Error(`Column ${i + 1} of query cannot be processed.`);
            selectElements[i] = new SQL.SelectElement(parseExpression(column.expr), column.as);
        }
    }
    const fromElements = new Array(ast.from ? ast.from.length : 0);
    if (ast.from != null) {
        for (let i = 0; i < ast.from.length; ++i) {
            let from = ast.from[i];
            if (!isFrom(from))
                throw new Error(`Element ${i + 1} of the query's from clause is not a simple`
                    + ` table-reference (but probably a sub-query)`
                    + ` and therefore cannot be processed (yet).`);
            if ("using" in from)
                throw new Error(`Element ${i + 1} of the query's from clause contains "USING", ` +
                    `which cannot be processed (yet).`);
            fromElements[i] = new SQL.FromElement(from.table, isJoin(from) ? parseJoinType(from.join) : null, isJoin(from) ? parseExpression(from.on) : null, from.as);
        }
    }
    const groupbyElements = new Array(ast.groupby ? ast.groupby.length : 0);
    if (ast.groupby != null) {
        for (let i = 0; i < ast.groupby.length; ++i) {
            groupbyElements[i] = isColumnRef(ast.groupby[i])
                ? new SQL.ColumnReference(ast.groupby[i].column, ast.groupby[i].table)
                : parseExpression(ast.groupby[i]);
        }
    }
    const orderbyElements = new Array(ast.orderby ? ast.orderby.length : 0);
    if (ast.orderby != null) {
        for (let i = 0; i < ast.orderby.length; ++i) {
            orderbyElements[i] = new SQL.OrderBy(ast.orderby[i].type == "DESC", parseExpression(ast.orderby[i].expr));
        }
    }
    if (ast.limit != null)
        throw new Error(`Query has a "limit"-clause, which cannot be processed (yet).`);
    if ("union" in ast)
        throw new Error(`Query is in union with another query, which cannot be processed (yet).`);
    return new SQL.Query(ast.distinct == "DISTINCT", selectElements, fromElements, parseExpression(ast.where), groupbyElements, parseExpression(ast.having), orderbyElements);
}
exports.parseQuery = parseQuery;
/**
 * Stringifies a given query.
 *
 * @param query the query to stringify
 * @returns the stringified query
 */
function stringifyQuery(query) {
    const ast = {
        with: null,
        type: "select",
        options: null,
        distinct: query.distinct ? "DISTINCT" : null,
        columns: query.selectLength == 0 ? null
            : query.copySelect().map((x) => ({ expr: stringifyExpression(x.expression), as: x.as })),
        from: query.fromLength == 0 ? null
            : query.copyFrom().map((x) => ({ db: null, table: x.table, as: x.as, join: stringifyJoinType(x.join),
                on: stringifyExpression(x.on, false) })),
        where: stringifyExpression(query.where, false),
        groupby: query.groupbyLength == 0 ? null
            : query.copyGroupby().map((x) => stringifyExpression(x)),
        having: stringifyExpression(query.having, false),
        orderby: query.orderbyLength == 0 ? null
            : query.copyOrderby().map((x) => ({ type: x.descending ? "DESC" : "ASC", expr: stringifyExpression(x.expression) })),
        limit: null,
    };
    return parser.sqlify(ast).split('`').join('');
}
exports.stringifyQuery = stringifyQuery;
/**
 * Validates the syntax of a query description by trying to parse it.
 *
 * @param description the description to validate
 * @returns true if the description is syntactically correct
 * @throws an error if the description is not syntactically correct
 */
function validateQuerySyntax(description) {
    parseQuery(description);
    return true;
}
exports.validateQuerySyntax = validateQuerySyntax;
/**
 * Validates the syntax of a query description by trying to parse it
 * and then validates its semantics against a given schema description.
 * If no schema is specified, it is tried to deduce it from the query.
 *
 * @param description the description to validate
 * @param schemaDescription the description of the schema to validate against, optional
 * @returns true if the description is syntactically and semantically correct
 * @throws an error if the description is syntactically or semantically incorrect
 */
function validateQuerySyntaxAndSemantics(description, schemaDescription) {
    const query = parseQuery(description);
    if (!query)
        throw new Error("The query description is empty.");
    const schema = schemaDescription && (0, exports.clean)(schemaDescription) != ""
        ? parseSchema(schemaDescription)
        : SQL.Schema.deduceSchema(query);
    return query.validateSemantics(schema);
}
exports.validateQuerySyntaxAndSemantics = validateQuerySyntaxAndSemantics;
// ========
//  CONFIG
// ========
/**
 * Stringifies a given edit by stating its cost and description.
 *
 * @param edit the edit to stringify
 * @returns the stringified edit
 */
function stringifyEdit(edit) {
    return `Cost ${edit.cost}: ${edit.description}`;
}
exports.stringifyEdit = stringifyEdit;
/**
 * Parses the description of a cost configuration by setting the costs in a given set of edits.
 * If no set of edits is passed, [[`createDefaultConfig`]] is used instead.
 * Returns the given set of edits with the described costs.
 *
 * @param description the description of the cost configuration
 * @param config the set of edits to set the costs on, optional
 * @returns the given set of edits with the described costs
 */
function parseConfig(description, config = (0, config_1.createDefaultConfig)()) {
    if (!description || description == "")
        return config;
    for (let line of description.split('\n')) {
        if (!line.includes(':'))
            continue;
        let elements = line.split(':');
        let edit = (0, exports.clean)(elements[0]);
        let cost = Number(elements[1]);
        if (!config.has(edit))
            throw new Error(`Edit "${edit}" could not be found in config.`);
        else if (isNaN(cost))
            throw new Error(`Cost ${elements[1]} of edit ${edit}` +
                ` could not be parsed into a number.`);
        config.get(edit).cost = cost;
    }
    return config;
}
exports.parseConfig = parseConfig;
/**
 * Stringifies the cost configuration of a given set of edits into a format parseable by [[`parseConfig`]].
 * If no set of edits is passed, [[`createDefaultConfig`]] is used instead.
 *
 * @param config the set of edits to stringify the costs of, optional
 * @returns the stringified cost configuration
 */
function stringifyConfig(config = (0, config_1.createDefaultConfig)()) {
    return Array.from(config.values()).map(x => `${x.name}:${x.cost}`).join('\n');
}
exports.stringifyConfig = stringifyConfig;
// ==========
//  COMBINED
// ==========
/**
 * Stringifies the a distance and optionally also the edit-steps and/or queries of a shortest path.
 * The total distance is in the first line of the returned string.
 * If the distance is infinite, the result only says that the destination could not be reached.
 * If either the edit-steps or the path's queries are specified, they are listed below in order.
 * If both are specified, they are listed alternatingly, starting with a query.
 *
 * @param distance the distance to stringify
 * @param steps the edit-steps to stringify, optional
 * @param path the path's queries to stringify, optional
 * @returns the stringified distance, edit-steps and path's queries
 */
function stringifyDistance(distance, steps = null, path = null) {
    if (distance == Infinity)
        return `Destination could not be reached within the maximum distance.`;
    // 1) Total Distance:
    let result = `Total Distance: ${distance}\n`;
    let stringifySteps = steps != null, stringifyPath = path != null;
    if (stringifySteps || stringifyPath) {
        result += '\n';
        // number of edits
        let editCount = stringifySteps ? steps.length : 0;
        // number of queries
        let queryCount = stringifyPath ? path.length : 0;
        let combinedCount = Math.max(0, Math.min(editCount, queryCount - 1));
        for (let i = 0; i < combinedCount; ++i) {

            // Erzeugung vom query (pre & edited)
            if (stringifyPath)
                result += `\n\n(${i}) ${stringifyQuery(path[i])};`;
            // Erzeugung vom Fehlertext
            if (stringifySteps)
                result += `\n\n>>> (${i}) ${stringifyEdit(steps[i])}.`;

        }

        // Left over edits without queries
        for (let i = combinedCount; i < editCount; ++i) {
            result += `\n\n>(${i}) - >> ${stringifyEdit(steps[i])}.`;
        }
        // Left over queries without edits
        for (let i = combinedCount; i < queryCount; ++i) {
            result += `\n\n(${i}) - ${stringifyQuery(path[i])};`;
        }
    }
    return result;
}

function tokenize(queryString) {
  return queryString.split( /(,|\s+)/ ).map( s => s.trim() ).filter(Boolean);
}

function diff(a, b) {
  const moreQuery = tokenize(a);
  const lessQuery = tokenize(b);
  let result = "";

  // Left pointer marks the first difference from the left
  let leftShardedPointer = 0;
  for (let i = 0; i < Math.max(moreQuery.length, lessQuery.length); i++) {
    if (moreQuery[i] !== lessQuery[i]) {
        leftShardedPointer = i;
        break
    }
  }

  // Right pointers mark the first difference from the right
  let rightMorePointer = moreQuery.length - 1;
  let rightLessPointer = lessQuery.length - 1;
  while (
    rightMorePointer >= leftShardedPointer &&
    rightLessPointer >= leftShardedPointer &&
    moreQuery[rightMorePointer] === lessQuery[rightLessPointer]
  ) {
    rightMorePointer--;
    rightLessPointer--;
  }

  // Get the String between two pointers
  for (let i = leftShardedPointer; i <= rightMorePointer; i++) {
    result += (moreQuery[i] || "") + " ";
  }

  console.log("Diff Result:", result);
  return result.trim();
}


function stringifyDistance_new(distance, steps = null, path = null) {
    if (distance == Infinity)
        return `Destination could not be reached within the maximum distance.`;
    // let result = `Total Distance: ${distance}\n`;
    let diffElement = "";
    let newOrder =  `Total Distance: ${distance}\n`;
    let stringifySteps = steps != null, stringifyPath = path != null;

    if (stringifySteps || stringifyPath) {
        newOrder += '\n';
        let editCount = stringifySteps ? steps.length : 0;
        let queryCount = stringifyPath ? path.length : 0;
        let combinedCount = Math.max(0, Math.min(editCount, queryCount - 1));

        for (let i = 0; i < combinedCount; ++i) {
            if (stringifySteps) {
                newOrder += `\n\n>>>${stringifyEdit(steps[i])}.`;
            }
                
            if (stringifySteps) {

                // ---------------------- atomicEdits ----------------------
                if (stringifyEdit(steps[i]).includes("excess")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\nThe following is not needed: ${diffElement}`;

                } else if (stringifyEdit(steps[i]).includes("missing")) {
                    diffElement = diff(stringifyQuery(path[i+1]), stringifyQuery(path[i]));
                    newOrder += `\n\nThe following is missing: ${diffElement}`;
                
                // -------------------- horizontalEdits --------------------
                } else if (stringifyEdit(steps[i]).includes("Swap arguments of")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\nThe following arguments need to be swapped: ${diffElement}`;
                
                } else if (stringifyEdit(steps[i]).includes("Swap nesting of")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\nThe following nesting needs to be swapped: ${diffElement}`;
                    
                } else if (stringifyEdit(steps[i]).includes("Mirror")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\nThe following needs to be mirrored: ${diffElement}`;
                
                } else if (stringifyEdit(steps[i]).includes("Swap elements")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\nThe following elements need to be swapped: ${diffElement}`;

                } else if (stringifyEdit(steps[i]).includes("Change positions")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\nThe following needs to change positions: ${diffElement}`;
                
                } else if (stringifyEdit(steps[i]).includes("Change (incorrect)")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\nThe following incorrect value needs to be changed: ${diffElement}`;

                // -------------------- shortcutEdits --------------------
                } else if (stringifyEdit(steps[i]).includes("tautology law")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\n-------------------: ${diffElement}`;
                
                } else if (stringifyEdit(steps[i]).includes("double negation law")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\n-------------------: ${diffElement}`;
                
                } else if (stringifyEdit(steps[i]).includes("distributive law")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\n-------------------: ${diffElement}`;

                } else if (stringifyEdit(steps[i]).includes("De Morgan's law")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\n-------------------:: ${diffElement}`;
                
                } else if (stringifyEdit(steps[i]).includes("absorption law")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\n-------------------: ${diffElement}`;

                } else if (stringifyEdit(steps[i]).includes("Move the join-condition")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\n-------------------: ${diffElement}`;
                
                } else if (stringifyEdit(steps[i]).includes("Move expression from")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\n-------------------: ${diffElement}`;

                } else if (stringifyEdit(steps[i]).includes("Replace an asterisk with")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\nReplace an asterisk with ${diffElement}`;

                } else if (stringifyEdit(steps[i]).includes("Replace a number of expressions")) {
                    diffElement = diff(stringifyQuery(path[i]), stringifyQuery(path[i+1]));
                    newOrder += `\n\nReplace these expressions: ${diffElement}`, "with an asterisk";

                // -------------------- No Match --------------------
                } else {
                    newOrder += `\n\nNo Match has been found.`;
                }
                    
            } else {
                newOrder += `\n\nError`;
            }    
            
        }
        // Left over edits without queries & Left over queries without edits
        /*for (let i = combinedCount; i < editCount; ++i) {
            console.log(`(${i})`, "Left over edit step: ", `${stringifyEdit(steps[i])}`);
            newOrder += `\n\n>>> ${stringifyEdit(steps[i])}.`;
        }
        for (let i = combinedCount; i < queryCount; ++i) {
            console.log(`(${i})`, "Left over query step: ", `${stringifyQuery(path[i])}`);
            newOrder += `\n\n${stringifyQuery(path[i])};`;
        }*/

    }

    return newOrder;
}

exports.stringifyDistance = stringifyDistance;
exports.stringifyDistance_new = stringifyDistance_new;
//# sourceMappingURL=parser.js.map