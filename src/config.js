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

function showOutputInEditorTab() {
    return getConfiguration(configSection).get('showOutputInEditorTab');
}
exports.showOutputInEditorTab = showOutputInEditorTab;

function showOutputInConsoleChannel() {
    return getConfiguration(configSection).get('showOutputInConsoleChannel');
}
exports.showOutputInConsoleChannel = showOutputInConsoleChannel;