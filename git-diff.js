"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
exports.__esModule = true;
var lit_element_1 = require("./node-modules/lit-element");
var GitDiff = /** @class */ (function (_super) {
    __extends(GitDiff, _super);
    function GitDiff() {
        var _this = _super.call(this) || this;
        document.addEventListener("git-diff-set-data", _this.onDiffChanged);
        return _this;
    }
    GitDiff.prototype.render = function () {
        return lit_element_1.html(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n\t\t"], ["\n\t\t"])));
    };
    Object.defineProperty(GitDiff, "properties", {
        get: function () {
            return {
                'diff': { type: String }
            };
        },
        enumerable: true,
        configurable: true
    });
    GitDiff.prototype.onDiffChanged = function (event) {
        this.diff = event.detail;
    };
    return GitDiff;
}(lit_element_1.LitElement));
exports.GitDiff = GitDiff;
customElements.define('git-diff', GitDiff);
var templateObject_1;
