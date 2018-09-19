'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
let getConfiguration = vscode.workspace.getConfiguration;
let configSection = 'tidalcycles';
function bootTidalPath() {
    var value = getConfiguration(configSection).get('bootTidalPath');
    return value || undefined;
}
exports.bootTidalPath = bootTidalPath;
;
function feedbackColor() {
    return getConfiguration(configSection).get('feedbackColor', 'rgba(100,250,100,0.3)');
}
exports.feedbackColor = feedbackColor;
;
function ghciPath() {
    return getConfiguration(configSection).get('ghciPath', 'ghci');
}
exports.ghciPath = ghciPath;
;
function randomMessages() {
    if (!getConfiguration(configSection).has('randomMessages'))
        return [];
    return getConfiguration(configSection).get('randomMessages');
}
exports.randomMessages = randomMessages;
;
function randomMessageProbability() {
    if (!getConfiguration(configSection).has('randomMessageProbability'))
        return 0;
    return getConfiguration(configSection).get('randomMessageProbability');
}
exports.randomMessageProbability = randomMessageProbability;
;
function showEvalCount() {
    if (!getConfiguration(configSection).has('showEvalCount'))
        return false;
    return getConfiguration(configSection).get('showEvalCount');
}
exports.showEvalCount = showEvalCount;
;
function evalCountPrefix() {
    if (!getConfiguration(configSection).has('evalCountPrefix'))
        return 'evals: ';
    return getConfiguration(configSection).get('evalCountPrefix');
}
exports.evalCountPrefix = evalCountPrefix;
function showGhciOutput() {
    if (!getConfiguration(configSection).has('showGhciOutput'))
        return false;
    return getConfiguration(configSection).get('showGhciOutput');
}
exports.showGhciOutput = showGhciOutput;
;
function showOutputInConsoleChannel() {
    if (!getConfiguration(configSection).has('showOutputInConsoleChannel'))
        return false;
    return getConfiguration(configSection).get('showOutputInConsoleChannel');
}
exports.showOutputInConsoleChannel = showOutputInConsoleChannel;
;
function useBootFileInCurrentDirectory() {
    var value = getConfiguration(configSection).get('useBootFileInCurrentDirectory');
    return value == true;
}
exports.useBootFileInCurrentDirectory = useBootFileInCurrentDirectory;
;
//# sourceMappingURL=config.js.map