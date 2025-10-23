"use strict";
// ============
//  HEIGHT INFO
// ============
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeightInfo = void 0;
/**
 * HeightInfo objects contain information about the height
 * (= the length of the longest downward path to a leaf)
 * of individual expression types within an expression (sub-)tree.
 */
class HeightInfo {
    columnReferenceHeight;
    literalHeight;
    notHeight;
    aggregationHeight;
    binaryExpressionHeight;
    constructor(columnReferenceHeight, literalHeight, notHeight, aggregationHeight, binaryExpressionHeight) {
        this.columnReferenceHeight = columnReferenceHeight;
        this.literalHeight = literalHeight;
        this.notHeight = notHeight;
        this.aggregationHeight = aggregationHeight;
        this.binaryExpressionHeight = binaryExpressionHeight;
    }
    minDiff(info) {
        return Math.min(info.columnReferenceHeight < 0 ? Infinity
            : this.columnReferenceHeight - info.columnReferenceHeight, info.literalHeight < 0 ? Infinity
            : this.literalHeight - info.literalHeight, info.notHeight < 0 ? Infinity
            : this.notHeight - info.notHeight, info.aggregationHeight < 0 ? Infinity
            : this.aggregationHeight - info.aggregationHeight, info.binaryExpressionHeight < 0 ? Infinity
            : this.binaryExpressionHeight - info.binaryExpressionHeight);
    }
    static max(info1, info2) {
        return new HeightInfo(Math.max(info1.columnReferenceHeight, info2.columnReferenceHeight), Math.max(info1.literalHeight, info2.literalHeight), Math.max(info1.notHeight, info2.notHeight), Math.max(info1.aggregationHeight, info2.aggregationHeight), Math.max(info1.binaryExpressionHeight, info2.binaryExpressionHeight));
    }
    static EMPTY = new HeightInfo(-1, -1, -1, -1, -1);
    increase() {
        return new HeightInfo(this.columnReferenceHeight >= 0 ? this.columnReferenceHeight + 1 : -1, this.literalHeight >= 0 ? this.literalHeight + 1 : -1, this.notHeight >= 0 ? this.notHeight + 1 : -1, this.aggregationHeight >= 0 ? this.aggregationHeight + 1 : -1, this.binaryExpressionHeight >= 0 ? this.binaryExpressionHeight + 1 : -1);
    }
}
exports.HeightInfo = HeightInfo;
//# sourceMappingURL=heightInfo.js.map