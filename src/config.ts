'use strict';
import * as vscode from 'vscode';

let getConfiguration = vscode.workspace.getConfiguration;
let configSection = 'tidalcycles';

export function bootTidalPath() {
    var value = getConfiguration(configSection).get('bootTidalPath');
    return value || undefined;
}

export function feedbackColor() : string {
    return getConfiguration(configSection).get('feedbackColor', 'rgba(100,250,100,0.3)');
}

export function ghciPath() : string {
    return getConfiguration(configSection).get('ghciPath', 'ghci');
}

export function randomMessages() : string[] {
    return getConfiguration(configSection).get('randomMessages', []);
}

export function randomMessageProbability() {
    return getConfiguration(configSection).get('randomMessageProbability', 0);
}

export function showEvalCount() {
    return getConfiguration(configSection).get('showEvalCount', false);
}

export function evalCountPrefix() {
    return getConfiguration(configSection).get('evalCountPrefix', 'evals: ');
}

export function showGhciOutput() {
    return getConfiguration(configSection).get('showGhciOutput', false);
}

export function showOutputInConsoleChannel() {
    return getConfiguration(configSection).get('showOutputInConsoleChannel', false);
}

export function useBootFileInCurrentDirectory() {
    return getConfiguration(configSection).get('useBootFileInCurrentDirectory') === true;
}
