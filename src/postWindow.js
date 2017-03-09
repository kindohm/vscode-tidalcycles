var vscode = require('vscode');

class PostWindowContentProvider {
    constructor() {
        this.onDidChangeEvent = new vscode.EventEmitter();
        this.content = 'Hi I\'m a TidalCycles post window. ';
        this.maxContentLength = 20000;
    }
    provideTextDocumentContent(uri) {
        return this.content;
    }
    get onDidChange() {
        return this.onDidChangeEvent.event;
    }
    update(uri, message) {
        if (this.content.length > this.maxContentLength) {
            this.content = '';
        }
        this.content += `${message} `;
        this.onDidChangeEvent.fire(uri);
    }
}

exports.PostWindowContentProvider = PostWindowContentProvider;