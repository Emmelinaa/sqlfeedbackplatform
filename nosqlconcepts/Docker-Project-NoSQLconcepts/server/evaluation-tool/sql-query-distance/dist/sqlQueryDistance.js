"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAndCalculateDistance = exports.calculateDistance = exports.removeUpdateListener = exports.addUpdateListener = exports.cancelCalculateDistance = exports.enableLogging = void 0;
const sql_1 = require("./sql");
const config_1 = require("./config");
const parser_1 = require("./parser");
let logging = false;
/**
 * Enables or disables logging of every generated neighbor node.
 *
 * @param l whether logging should be enabled or disabled
 */
function enableLogging(l) {
    logging = l;
}
exports.enableLogging = enableLogging;
let canceled;
/**
 * Cancels the query distance calculation.
 */
function cancelCalculateDistance() {
    canceled = true;
}
exports.cancelCalculateDistance = cancelCalculateDistance;
const updateListeners = [];
/**
 * Adds a query-distance-update listener.
 *
 * @param l the update listener to add
 */
function addUpdateListener(l) {
    updateListeners.push(l);
}
exports.addUpdateListener = addUpdateListener;
/**
 * Removes a query-distance-update listener.
 *
 * @param l the update listener to remove
 */
function removeUpdateListener(l) {
    const i = updateListeners.indexOf(l);
    if (i >= 0)
        updateListeners.splice(i, 1);
}
exports.removeUpdateListener = removeUpdateListener;
/**
 * Dispatches a query-distance-update.
 *
 * @param distance the current search distance
 * @param maxDistance the maximum search distance
 * @param queryCount the current number of visited queries
 * @param queueLength the number of currently queued nodes
 */
function dispatchUpdate(distance, maxDistance, queryCount, queueLength) {
    let stack = updateListeners.slice();
    for (let i = 0; i < stack.length; ++i)
        stack[i](distance, maxDistance, queryCount, queueLength);
}
class Node {
    query;
    distance;
    previous;
    step;
    nextEdit;
    constructor(query, distance, previous, step, nextEdit = 0) {
        this.query = query;
        this.distance = distance;
        this.previous = previous;
        this.step = step;
        this.nextEdit = nextEdit;
    }
}
;
/**
 * Calculates the distance (and shortest path) between two queries asynchronously.
 * It uses a custom shortest path algorithm based on uniform cost search.
 *
 * @param destination the destination query, required
 * @param start the start query, optional
 * @param schema the database schema, optional
 * @param config the configured set of edits, optional
 * @param maxDistance the maximum search distance, optional
 * @returns a promise for a tuple of the distance, edit-steps, and queries of the shortest path
 * @throws an error if the maximum search was exceeded before reaching the destination
 */
async function calculateDistance(destination, start = null, schema = null, config = null, maxDistance = Infinity) {
    if (!destination)
        throw new Error("A destination is required to calculate the distance to.");
    if (!start)
        start = new sql_1.Query();
    if (!schema)
        schema = sql_1.Schema.deduceSchema(destination);
    destination.validateSemantics(schema);
    const metaInfo = new sql_1.MetaInfo(destination, schema);
    if (!config)
        config = (0, config_1.createDefaultConfig)();
    const sortedConfig = Array.from(config.values()).sort((e1, e2) => e1.cost - e2.cost);
    const editCount = sortedConfig.length;
    const firstEditCost = sortedConfig[0].cost;
    if (!maxDistance && maxDistance !== 0)
        maxDistance = Infinity;
    canceled = false;
    /* Uniform cost search,
     * but neighbors are generated exactly when they are the nearest unvisited node
     */
    //All discovered Nodes of the Graph
    const visited = new Map();
    let queryCount = 1;
    //Queue of nodes to be processed next
    const queue = new Map();
    let currentDistance = 0;
    //fire first update event to show that processing started
    dispatchUpdate(currentDistance, maxDistance, queryCount, 1);
    await new Promise(resolve => setTimeout(resolve, 0));
    //check if start and destination are already equal
    if (destination.equals(start))
        return [0, [], [start]];
    //mark start node as visited and add its first neighbors to the queue
    const startNode = new Node(start, 0, null, null);
    visited.set(start.hash, [startNode]);
    currentDistance = startNode.distance + firstEditCost;
    queue.set(currentDistance, [startNode]);
    let destinationNode = new Node(destination, Infinity, null, null);
    //init update counter and timestamps
    let updateCounter = 0;
    let thisUpdate = Date.now(), previousUpdate = thisUpdate;
    //process queue of visited nodes ordered by smallest distance of their next unvisited neighbors
    queueLoop: while (!canceled) {
        //while(!queue.has(currentDistance)) ++currentDistance;
        const currentQueue = queue.get(currentDistance);
        const node = currentQueue.shift();
        const query = node.query;
        const editNr = node.nextEdit;
        const edit = sortedConfig[editNr];
        if (currentDistance > maxDistance) { //max search distance exceeded
            throw new Error(`Destination could not be reached ` +
                `within the maximum distance of ${maxDistance}.`);
        }
        //for every neighbor generated by the edit
        const neighbors = [];
        edit.perform(query, schema, metaInfo, neighbors);
        neighborLoop: for (let n = 0, nl = neighbors.length; n < nl; ++n) {
            const neighbor = neighbors[n];
            //skip this neighbor if it has already been visited
            const comparableNodes = visited.get(neighbor.hash) || [];
            for (let cn = 0, cnl = comparableNodes.length; cn < cnl; ++cn) {
                const comparableQuery = comparableNodes[cn].query;
                if (neighbor.equals(comparableQuery))
                    continue neighborLoop;
            }
            //end the search if the destination has been reached
            if (destination.equals(neighbor)) {
                //override destination to make alias names etc. consistent
                destinationNode = new Node(neighbor, currentDistance, node, edit);
                break queueLoop;
            }
            //mark this neighbor as visited
            ++queryCount;
            const neighborNode = new Node(neighbor, currentDistance, node, edit);
            if (logging)
                console.log(neighborNode);
            if (!visited.has(neighbor.hash))
                visited.set(neighbor.hash, []);
            visited.get(neighbor.hash).push(neighborNode);
            //and queue it at the proper position
            const nextDistance = currentDistance + firstEditCost;
            if (!queue.has(nextDistance))
                queue.set(nextDistance, []);
            queue.get(nextDistance).push(neighborNode);
        }
        ++node.nextEdit;
        if (node.nextEdit < editCount) {
            //if there are edits left, that have not been performed on the query yet, re-queue node
            const nextDistance = node.distance + sortedConfig[node.nextEdit].cost;
            if (!queue.has(nextDistance))
                queue.set(nextDistance, []);
            queue.get(nextDistance).push(node);
        }
        const currentDistanceChanges = currentQueue.length == 0;
        if (currentDistanceChanges) { //if this was the last node with the current distance
            queue.delete(currentDistance);
            if (queue.size == 0) { //when using all atomic edits, this should not be possible
                throw new Error("Destination query could not be reached" +
                    " regardless of distance. This should not be possible," +
                    " except if some atomic edits are missing from the config.");
            }
            ++currentDistance;
            while (!queue.has(currentDistance))
                ++currentDistance;
        }
        //fire update events (and avoid massive freezing, especially in browser)
        if (currentDistanceChanges ||
            ((++updateCounter > 10000) && ((thisUpdate = Date.now()) - previousUpdate) > 1000)) {
            updateCounter = 0;
            previousUpdate = thisUpdate;
            dispatchUpdate(currentDistance, maxDistance, queryCount, currentDistanceChanges ? queue.get(currentDistance).length : currentQueue.length);
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    if (canceled) {
        throw new Error("The distance calculation was canceled" +
            " before the destination could be reached.");
    }
    if (logging)
        console.log(destinationNode);
    //gather steps and path from destination node back to start node
    let node = destinationNode;
    const steps = [];
    const path = [];
    path.unshift(node.query);
    while (node.previous) {
        steps.unshift(node.step);
        node = node.previous;
        path.unshift(node.query);
    }
    return [destinationNode.distance, steps, path];
}
exports.calculateDistance = calculateDistance;
/**
 * Parses the descriptions of and calculates the distance (and shortest path) between two queries asynchronously.
 * It passes the parsed arguements to [[`calculateDistance`]].
 *
 * @param destination the description of the destination query, required
 * @param start the description of the start query, optional
 * @param schema the description of the database schema, optional
 * @param config the description of the configured set of edits, optional
 * @param maxDistance the maximum search distance, optional
 * @returns a promise for a tuple of the distance, edit-steps, and queries of the shortest path
 * @throws an error if the maximum search was exceeded before reaching the destination
 */
async function parseAndCalculateDistance(destinationDescription, startDescription = null, schemaDescription = null, configDescription = null, maxDistance = Infinity) {
    let destination = (0, parser_1.parseQuery)(destinationDescription);
    let start = startDescription && (0, parser_1.clean)(startDescription) != ""
        ? (0, parser_1.parseQuery)(startDescription)
        : new sql_1.Query();
    let schema = schemaDescription && (0, parser_1.clean)(schemaDescription) != ""
        ? (0, parser_1.parseSchema)(schemaDescription)
        : null;
    let config = configDescription && (0, parser_1.clean)(configDescription) != ""
        ? (0, parser_1.parseConfig)(configDescription)
        : (0, config_1.createDefaultConfig)();
    return calculateDistance(destination, start, schema, config, maxDistance);
}
exports.parseAndCalculateDistance = parseAndCalculateDistance;
//# sourceMappingURL=sqlQueryDistance.js.map