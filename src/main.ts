#!/usr/bin/env node

import { screen } from "neo-blessed";
import Table from "src/ui/table";
import { getStats } from "src/utils/getStats";
const mainScreen = screen({
  smartCSR: true,
});

(mainScreen as any).title = "neoss";
(mainScreen as any).key(["escape", "q", "C-c"], function (ch: any, key: any) {
    return process.exit(0);
});

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

getStats(mainScreen, table);
