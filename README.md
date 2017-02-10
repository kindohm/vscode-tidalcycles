# TidalCycles for VSCode

Support for the TidalCycles in vscode. You can learn more about
TidalCycles at [TidalCycles](https://tidalcycles.org).

## Features

This VSCode extension for TidalCycles utilizes the same basic 
commands and keybindings as the popular Atom package:

- `Shift+Enter` to evalulate a single line
- `Cmd+Enter` to evaluate multiple lines

## Requirements

You will need to have TidalCycles (a Haskell package) installed before
using this extension. If you want to produce sound, you'll also
need to have SuperDirt running. You can find instructions to install
TidalCycles and SuperDirt at [TidalCycles](https://tidalcycles.org).

## Extension Settings

* `tidalcycles.ghci` - path to `ghci.exe`
* `tidalcycles.feedbackColor` - the color to use for the "eval flash", 
    in the format `rgba([red],[green],[blue],[opacity])` (e.g. `rgba(100,200,100,0.25)`).

## Known Issues

- The `Eval and Copy` and `Eval Multi Line and Copy` commands from the
    Atom package are not supported.

