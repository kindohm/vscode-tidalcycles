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

function showOutputInConsoleChannel() {
    if (!getConfiguration(configSection).has('showOutputInConsoleChannel')) return false;
    return getConfiguration(configSection).get('showOutputInConsoleChannel');
}
exports.showOutputInConsoleChannel = showOutputInConsoleChannel;