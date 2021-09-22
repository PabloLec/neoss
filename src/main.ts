#!/usr/bin/env node

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'blessed'.
const blessed = require("neo-blessed");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Table'.
const Table = require.main.require("src/ui/table");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getStats'.
const getStats = require("src/utils/getStats");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'screen'.
const screen = blessed.screen({
  smartCSR: true,
});

(screen as any).title = "neoss";
(screen as any).key(["escape", "q", "C-c"], function (ch: any, key: any) {
    // @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    return process.exit(0);
});

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'table'.
const table = Table({
  keys: true,
  interactive: true,
  tags: true,
  top: "0",
  left: "center",
  width: "100%",
  height: "shrink",
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    border: {
      fg: "white",
    },
    focus: {
      bg: "blue",
    },
    header: {
      fg: "black",
      bg: "white",
    },
  },
});

getStats(screen, table);
