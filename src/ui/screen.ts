#!/usr/bin/env node

import { Screen } from "neo-blessed";
import Table from "../ui/table";
import { setDefaultScreen } from "../ui/popups";

var mainScreen: Screen;
var table: Table;

/**
 * Create main application blessed screen and table objects.
 */
export function initialize() {
  mainScreen = Screen({
    smartCSR: true,
  });

  mainScreen.title = "neoss";
  mainScreen.key(["escape", "q", "C-c"], function () {
    return process.exit(0);
  });

  setDefaultScreen(mainScreen);

  table = Table({
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
}

/**
 * Set new data as table content.
 */
export function setData(data: string[]) {
  mainScreen.append(table);
  table.setData({
    headers: ["Protocol", "State", "Rx", "Tx", "Local Address", "Local Port", "Peer Address", "Peer Port", "Users"],
    data: data,
  });
}

/**
 * Refresh screen with data currently stored in table for async results.
 */
export function refreshScreen() {
  table.setData(table.table);
}
