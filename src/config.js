var workspace = require('vscode').workspace;
var getConfiguration = workspace.getConfiguration;
var configSection = 'tidalcycles';

exports.bootTidalPath = () => {
    var value = getConfiguration(configSection).get('bootTidalPath');
    return value || undefined;
};

exports.feedbackColor = () => {
    var value = getConfiguration(configSection).get('feedbackColor');
    return value || 'rgba(100,250,100,0.3)';
};

exports.ghciPath = () => {
    var value = getConfiguration(configSection).get('ghciPath');
    return value || 'ghci';
};

exports.randomMessages = () => {
    if (!getConfiguration(configSection).has('randomMessages')) return [];
    return getConfiguration(configSection).get('randomMessages');
};

exports.randomMessageProbability = () => {
    if (!getConfiguration(configSection).has('randomMessageProbability')) return 0;
    return getConfiguration(configSection).get('randomMessageProbability');
};

exports.showEvalCount = () => {
    if (!getConfiguration(configSection).has('showEvalCount')) return false;
    return getConfiguration(configSection).get('showEvalCount');
};

exports.evalCountPrefix = () => {
    if (!getConfiguration(configSection).has('evalCountPrefix')) return 'evals: ';
    return getConfiguration(configSection).get('evalCountPrefix');
}

exports.showGhciOutput = () => {
    if (!getConfiguration(configSection).has('showGhciOutput')) return false;
    return getConfiguration(configSection).get('showGhciOutput');
};

exports.showOutputInConsoleChannel = () => {
    if (!getConfiguration(configSection).has('showOutputInConsoleChannel')) return false;
    return getConfiguration(configSection).get('showOutputInConsoleChannel');
};

exports.useBootFileInCurrentDirectory = () => {
    var value = getConfiguration(configSection).get('useBootFileInCurrentDirectory');
    return value == true;
};
