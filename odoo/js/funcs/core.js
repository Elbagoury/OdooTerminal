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
            });
            this.registerCommand("load", {
                definition: "Load external resource",
                callback: this._cmdLoadResource,
                detail: "Load external source (javascript & css)",
                syntaxis: "<STRING: URL>",
                args: "s",
            });
            this.registerCommand("term_context", {
                definition: "Operations over terminal context dictionary",
                callback: this._cmdTerminalContextOperation,
                detail:
                    "Operations over terminal context dictionary. " +
                    "This context only affects to the terminal operations." +
                    "<br>[OPERATION] can be 'read', 'write' or 'set'. " +
                    "By default is 'read'. ",
                syntaxis: '[STRING: OPERATION] "[DICT: VALUES]" ',
                args: "?s?s",
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

        _printHelpSimple: function(cmd, cmdDef) {
            this.print(
                this._templates.render("HELP_CMD", {
                    cmd: cmd,
                    def: cmdDef.definition,
                })
            );
        },

        _cmdPrintHelp: async function(cmd) {
            if (typeof cmd === "undefined") {
                const sortedCmdKeys = _.keys(this._registeredCmds).sort();
                const l = sortedCmdKeys.length;
                for (let x = 0; x < l; ++x) {
                    const _cmd = sortedCmdKeys[x];
                    this._printHelpSimple(_cmd, this._registeredCmds[_cmd]);
                }
            } else if (
                Object.prototype.hasOwnProperty.call(this._registeredCmds, cmd)
            ) {
                this._printHelpDetailed(cmd, this._registeredCmds[cmd]);
            } else {
                const [ncmd, cmdDef] = this._searchCommandDefByAlias(cmd);
                if (cmdDef) {
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
            return true;
        },

        _printHelpDetailed: function(cmd, cmdDef) {
            this.print(cmdDef.detail);
            this.print(" ");
            this.eprint(`Syntaxis: ${cmd} ${cmdDef.syntaxis}`);
        },

        _cmdClear: async function(section) {
            if (section === "history") {
                this.cleanInputHistory();
            } else {
                this.clean();
            }
            return true;
        },

        _cmdPrintText: async function(...text) {
            this.print(text.join(" "));
            return true;
        },

        _cmdLoadResource: async function(url) {
            const inURL = new URL(url);
            const pathname = inURL.pathname.toLowerCase();
            if (pathname.endsWith(".js")) {
                await $.getScript(inURL.href);
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
            return true;
        },

        _cmdTerminalContextOperation: async function(
            operation = "read",
            values = "false"
        ) {
            if (operation === "read") {
                this.print(this._user_context);
            } else if (operation === "set") {
                this._user_context = JSON.parse(values);
                this.print(this._user_context);
            } else if (operation === "write") {
                Object.assign(this._user_context, JSON.parse(values));
                this.print(this._user_context);
            } else {
                this.printError("Invalid operation");
            }
            return true;
        },
    });
});
