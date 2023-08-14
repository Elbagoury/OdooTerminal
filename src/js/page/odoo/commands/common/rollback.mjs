// Copyright  Alexandre Díaz <dev@redneboa.es>
// License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

import {ARG} from "@trash/constants";
import Recordset from "@terminal/core/recordset";

async function cmdRollback(kwargs) {
  if (!Recordset.isValid(kwargs.recordset)) {
    throw new Error(`Invalid recordset`);
  }

  kwargs.recordset.rollback();
  this.screen.print(`Recordset changes undone`);
}

export default {
  definition: "Revert recordset changes",
  callback: cmdRollback,
  detail: "Undo recordset changes",
  args: [[ARG.Any, ["r", "recordset"], true, "The Recordset"]],
  example: "-r $recordset",
};
