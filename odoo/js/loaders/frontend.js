// Copyright 2019-2020 Alexandre Díaz <dev@redneboa.es>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

odoo.define("terminal.loaders.Frontend", function (require) {
    "use strict";

    require("web.dom_ready");
    const core = require("web.core");
    const Terminal = require("terminal.Terminal");

    const _t = core._t;

    // Ensure load resources
    require("terminal.functions.Core");
    require("terminal.functions.Common");

    $(() => {
        // A generic try-catch to avoid stop scripts execution.
        try {
            const terminal = new Terminal(null, $("body").data());

            core.bus.on("toggle_terminal", this, () => {
                terminal.doToggle();
            });
            // This is used to communicate to the extension that the widget
            // is initialized successfully.
            window.postMessage(
                {
                    type: "ODOO_TERM_START",
                },
                "*"
            );
        } catch (e) {
            console.error(e);
            console.warn(_t("[OdooTerminal] Can't initialize the terminal!"));
        }
    });
});
