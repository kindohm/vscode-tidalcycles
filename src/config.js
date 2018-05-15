var workspace = require('vscode').workspace;
var getConfiguration = workspace.getConfiguration;
var configSection = 'tidalcycles';

function ghciPath() {
    var value = getConfiguration(configSection).get('ghciPath');
    return value || 'ghci';
}
exports.ghciPath = ghciPath;

function feedbackColor() {
    var value = getConfiguration(configSection).get('feedbackColor');
    return value || 'rgba(100,250,100,0.3)';
}
exports.feedbackColor = feedbackColor;

function bootTidalPath() {
    var value = getConfiguration(configSection).get('bootTidalPath');
    return value || undefined;
}
exports.bootTidalPath = bootTidalPath;

function useBootFileInCurrentDirectory() {
    var value = getConfiguration(configSection).get('useBootFileInCurrentDirectory');
    return value == true;
}
exports.useBootFileInCurrentDirectory = useBootFileInCurrentDirectory;

function showOutputInConsoleChannel() {
    if (!getConfiguration(configSection).has('showOutputInConsoleChannel')) return false;
    return getConfiguration(configSection).get('showOutputInConsoleChannel');
}
exports.showOutputInConsoleChannel = showOutputInConsoleChannel;

function showEvalCount() {
    if (!getConfiguration(configSection).has('showEvalCount')) return false;
    return getConfiguration(configSection).get('showEvalCount');
}
exports.showEvalCount = showEvalCount;

function showGhciOutput() {
    if (!getConfiguration(configSection).has('showGhciOutput')) return false;
    return getConfiguration(configSection).get('showGhciOutput');
}
exports.showGhciOutput = showGhciOutput;

