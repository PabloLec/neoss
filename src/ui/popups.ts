import { Node, Box } from "neo-blessed";
import { readFile } from "fs";
import { join } from "path";
import { whois } from "../utils/whois";
var screen: any;
var currentBox: any = null;
var strings = {};
const stringsNames = ["ports", "protocols", "queues", "states"];

// Load strings
stringsNames.forEach(function (name) {
  readFile(join("src", "strings", name + ".json"), (err: any, data: any) => {
    if (err) throw err;
    strings[name] = JSON.parse(data);
  });
});

export function setDefaultScreen(defaultScreen: any) {
  screen = defaultScreen;
}

export function focusPopup() {
  if (currentBox != null) {
    currentBox.focus();
  }
}

export function removePopup() {
  if (currentBox == null) {
    return;
  }
  screen.remove(currentBox);
  currentBox = null;
  screen.rewindFocus();
  screen.render();
}

function createPopup(content: string | null, escapable = true) {
  if (content == null) {
    return;
  }
  currentBox = createBox(content);
  if (escapable) {
    currentBox.key(["enter", "escape"], function () {
      removePopup();
    });
  }
  screen.append(currentBox);
  screen.render();
  currentBox.focus();
}

export function handlePopup(column: number, content: string | null) {
  switch (column) {
    case 0:
      createPopup(strings["protocols"][content]);
      break;
    case 1:
      createPopup(strings["states"][content]);
      break;
    case 2:
      createPopup(strings["queues"]["receiveQueue"]);
      break;
    case 3:
      createPopup(strings["queues"]["sendQueue"]);
      break;
    case 4:
      break;
    case 5:
      createPopup(getPortText(content));
      break;
    case 6:
      createPopup("Wait for Whois...", false);
      whois(content).then(function (response: string) {
        removePopup();
        createPopup(response);
      });
      break;
    case 7:
      createPopup(getPortText(content));
      break;
    case 8:
      createPopup(getUsersText(content));
      break;
  }
}

function canShrink(content: string) {
  let maxShrinkSize = Math.floor((Math.floor(screen.lines.length / 2) - 1) / 2);
  let numberOfLines = content.split(/\r\n|\r|\n/).length;
  if (numberOfLines < maxShrinkSize) {
    return true;
  } else {
    return false;
  }
}

function createBox(content: string) {
  let height = "50%";
  let scrollable = true;
  if (canShrink(content)) {
    height = "shrink";
    scrollable = false;
  }

  return Box({
    top: "center",
    left: "center",
    width: "shrink",
    height: height,
    scrollable: scrollable,
    alwaysScroll: true,
    keys: true,
    content: content.trim(),
    tags: true,
    border: {
      type: "line",
    },
    style: {
      fg: "white",
      border: {
        fg: "#f0f0f0",
      },
    },
  });
}

function getPortText(port: string | null) {
  let assignment = strings["ports"][port];
  if (assignment == undefined) {
    return "This port is not assigned";
  }

  let text = "{bold}This port is assigned to:{/bold} " + assignment + "\n";
  text += "Note that regardless of a port assignment, it can be used in any way.";

  return text;
}

function getUsersText(users: any) {
  if (users.text == "/") {
    return null;
  }

  var text: string = "";
  var length: number = Object.keys(users).length - 1;
  for (let i = 0; i < length; i++) {
    if (length > 1) {
      text += "{bold} - - User " + (i + 1) + " - -{/bold}\n";
    }
    text += "{bold}Name:{/bold} " + users[i].name + "\n";
    text += "{bold}PID:{/bold} " + users[i].pid + "\n";
    text += "{bold}Owner:{/bold} " + users[i].owner + "\n";
    text += "{bold}Command:{/bold} " + users[i].cmdline.trim() + "\n";
    if (i < length - 1) {
      text += "\n\n";
    }
  }

  return text;
}

export function loadingPopup() {
  createPopup("Loading{blink}...{/blink}", false);
}
