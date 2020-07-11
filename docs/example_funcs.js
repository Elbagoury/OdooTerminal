odoo.define("terminal.MyFuncs", function(require) {
    "use strict";

    const Terminal = require("terminal.Terminal").terminal;

    Terminal.include({
        /**
         * @override
         */
        init: function() {
            this._super.apply(this, arguments);

            this.registerCommand("mycommand", {
                definition: "This is my command",
                function: this._cmdMyFunc,
                detail: "My command explained...",
                syntaxis: "<STRING: ParamA> <INT: ParamB> [STRING: ParamC]",
                args: "si?si",
            });
        },

        /**
         * NOTE: 'async' usage will break inheritance chain!!
         *
         * @param {String} param_a
         * @param {Int} param_b
         * @param {String} param_c
         * @param {Int} param_d
         */
        _cmdMyFunc: async function(
            param_a,
            param_b,
            param_c = "DefaultValue",
            param_d = -1
        ) {
            var self = this;

            self.print("Hello, World!");
            self.eprint("ParamA (String): " + param_a);
            self.eprint("ParamB (Int): " + param_b);
            self.eprint("ParamC (Optional String): " + param_c);
            self.eprint("ParamD (Optional Int): " + param_d);

            if (param_b instanceof Number) {
                this.print("ParamB is a Number!");
            }

            if (param_a !== param_c) {
                this.printError("Invalid! ParamA need be the same as ParamC");
            }

            return true;
        },
    });
});
