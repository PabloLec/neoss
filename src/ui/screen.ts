#!/usr/bin/env node

import { Screen } from "neo-blessed";
import Table from "src/ui/table";
import { setDefaultScreen } from "src/ui/popups";

var mainScreen: Screen;
var table: Table;

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

export function setData(data: string[]) {
  mainScreen.append(table);
  table.setData({
    headers: ["Protocol", "State", "Rx", "Tx", "Local Address", "Local Port", "Peer Address", "Peer Port", "Users"],
    data: data,
  });
}

export function refreshScreen() {
  table.setData(table.table);
}
