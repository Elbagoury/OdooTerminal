// Copyright 2018-2020 Alexandre Díaz <dev@redneboa.es>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

odoo.define("terminal.CoreFunctions", function(require) {
    "use strict";

    const Terminal = require("terminal.Terminal").terminal;

    Terminal.include({
        init: function() {
            this._super.apply(this, arguments);

            this.registerCommand("help", {
                definition: "Print this help or command detailed info",
                callback: this._cmdPrintHelp,
                detail:
                    "Show commands and a quick definition.<br/>- " +
                    "<> ~> Required Parameter<br/>- [] ~> Optional Parameter",
                syntaxis: "[STRING: COMMAND]",
                args: "?s",
            });
            this.registerCommand("clear", {
                definition: "Clean terminal section (screen by default)",
                callback: this._cmdClear,
                detail: "Available sections: screen (default), history.",
                syntaxis: "[STRING: SECTION]",
                args: "?s",
            });
            this.registerCommand("print", {
                definition: "Print a message",
                callback: this._cmdPrintText,
                detail: "Eval parameters and print the result.",
                syntaxis: "<STRING: MSG>",
                args: "",
                sanitized: false,
            });
            this.registerCommand("load", {
                definition: "Load external resource",
                callback: this._cmdLoadResource,
                detail: "Load external source (javascript & css)",
                syntaxis: "<STRING: URL>",
                args: "s",
            });
            this.registerCommand("context_term", {
                definition: "Operations over terminal context dictionary",
                callback: this._cmdTerminalContextOperation,
                detail:
                    "Operations over terminal context dictionary. " +
                    "This context only affects to the terminal operations." +
                    "<br>[OPERATION] can be 'read', 'write' or 'set'. " +
                    "By default is 'read'. ",
                syntaxis: '[STRING: OPERATION] "[DICT: VALUES]" ',
                args: "?ss",
            });
            this.registerCommand("alias", {
                definition: "Create aliases",
                callback: this._cmdAlias,
                detail:
                    "Define aliases to run commands easy. " +
                    "<br><b>WARNING:</b> This command uses 'local storage' " +
                    "to persist the data even if you close the browser. " +
                    "This data can be easy accessed by other computer users. " +
                    "Don't use sensible data if you are using a shared " +
                    "computer." +
                    "<br><br>Can use positional parameters ($1,$2,$3,$N...)",
                syntaxis: "[STRING: ALIAS] [STRING: DEFINITION]",
                args: "?s*",
                sanitized: false,
            });
            this.registerCommand("quit", {
                definition: "Close terminal",
                callback: this._cmdQuit,
                detail: "Close the terminal. ",
            });
        },

        _printWelcomeMessage: function() {
            this._super.apply(this, arguments);
            this.print(
                "Type '<i class='o_terminal_click o_terminal_cmd' " +
                    "data-cmd='help'>help</i>' or '<i class='o_terminal_click " +
                    "o_terminal_cmd' data-cmd='help help'>help " +
                    "&lt;command&gt;</i>' to start."
            );
        },

        _printHelpSimple: function(cmd, cmd_def) {
            this.print(
                this._templates.render("HELP_CMD", {
                    cmd: cmd,
                    def: cmd_def.definition,
                })
            );
        },

        _cmdPrintHelp: function(cmd) {
            if (typeof cmd === "undefined") {
                const sorted_cmd_keys = _.keys(this._registeredCmds).sort();
                const sorted_keys_len = sorted_cmd_keys.length;
                for (let x = 0; x < sorted_keys_len; ++x) {
                    const _cmd = sorted_cmd_keys[x];
                    this._printHelpSimple(_cmd, this._registeredCmds[_cmd]);
                }
            } else if (
                Object.prototype.hasOwnProperty.call(this._registeredCmds, cmd)
            ) {
                this._printHelpDetailed(cmd, this._registeredCmds[cmd]);
            } else {
                const [ncmd, cmd_def] = this._searchCommandDefByAlias(cmd);
                if (cmd_def) {
                    this.print(
                        this._templates.render("DEPRECATED_COMMAND", {
                            cmd: ncmd,
                        })
                    );
                    this._printHelpDetailed(ncmd, this._registeredCmds[ncmd]);
                } else {
                    this.printError(`'${cmd}' command doesn't exists`);
                }
            }
            return Promise.resolve();
        },

        _printHelpDetailed: function(cmd, cmd_def) {
            this.print(cmd_def.detail);
            this.print(" ");
            this.eprint(`Syntaxis: ${cmd} ${cmd_def.syntaxis}`);
        },

        _cmdClear: function(section) {
            if (section === "history") {
                this.cleanInputHistory();
            } else {
                this.clean();
            }
            return Promise.resolve();
        },

        _cmdPrintText: function(...text) {
            this.print(this._parameterReader.stringify(text));
            return Promise.resolve();
        },

        _cmdLoadResource: function(url) {
            const inURL = new URL(url);
            const pathname = inURL.pathname.toLowerCase();
            if (pathname.endsWith(".js")) {
                return $.getScript(inURL.href);
            } else if (pathname.endsWith(".css")) {
                $("<link>")
                    .appendTo("head")
                    .attr({
                        type: "text/css",
                        rel: "stylesheet",
                        href: inURL.href,
                    });
            } else {
                this.printError("Invalid file type");
            }
            return Promise.resolve();
        },

        _cmdTerminalContextOperation: function(
            operation = "read",
            values = "false"
        ) {
            if (operation === "read") {
                this.print(this._userContext);
            } else if (operation === "set") {
                this._userContext = JSON.parse(values);
                this.print(this._userContext);
            } else if (operation === "write") {
                Object.assign(this._userContext, JSON.parse(values));
                this.print(this._userContext);
            } else {
                this.printError("Invalid operation");
            }
            return Promise.resolve();
        },

        _cmdAlias: function(name = false, ...defcall) {
            const aliases =
                this._storageLocal.getItem("terminal_aliases") || {};
            if (!name) {
                const alias_names = Object.keys(aliases);
                if (alias_names.length) {
                    this.print(alias_names);
                } else {
                    this.print("No aliases defined.");
                }
            } else if (name in this._registeredCmds) {
                this.printError("Invalid alias name");
            } else {
                if (_.some(defcall)) {
                    aliases[name] = this._parameterReader.stringify(defcall);
                    this.print("Alias created successfully");
                } else {
                    delete aliases[name];
                    this.print("Alias removed successfully");
                }
                this._storageLocal.setItem("terminal_aliases", aliases);
            }
            return Promise.resolve();
        },

        _cmdQuit: function() {
            this.do_hide();
            return Promise.resolve();
        },
    });
});
