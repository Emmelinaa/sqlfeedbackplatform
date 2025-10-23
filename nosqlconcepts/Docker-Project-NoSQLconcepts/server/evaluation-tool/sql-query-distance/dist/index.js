"use strict";
// ====================
//  Node Module Export
// ====================
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
// Databse Schema, Meta-Info, and Query AST
__exportStar(require("./sql"), exports);
// Atomic, Horizontal, and Shortcut Edits
__exportStar(require("./config"), exports);
// Custom Shortest Path Algorithm
__exportStar(require("./sqlQueryDistance"), exports);
// Input & Output utilities
__exportStar(require("./parser"), exports);
/* Example Usage:
const SQLQueryDistance = require('./dist/index');

SQLQueryDistance.parseAndCalculateDistance(
    "SELECT * FROM students"
).then((res) => {
    console.log(SQLQueryDistance.stringifyDistance(...res));
});
*/
// ================
//  Browser Export
// ================
// Databse Schema, Meta-Info, and Query AST
const SQL = require("./sql");
// Atomic, Horizontal, and Shortcut Edits
const Config = require("./config");
// Custom Shortest Path Algorithm
const Distance = require("./sqlQueryDistance");
// Input & Output utilities
const Parser = require("./parser");
if (global && global.window) {
    global.window.SQLQueryDistance =
        Object.assign({}, SQL, Config, Distance, Parser);
}
