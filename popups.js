var blessed = require("neo-blessed"),
  Node = blessed.Node,
  Box = blessed.Box;

const pino = require("pino");
const logger = pino(pino.destination("/tmp/node.log"));
const fs = require("fs");
const whois = require("./whois");

var strings = {};
var stringsNames = ["ports", "protocols", "queues", "states"];
var screen;

stringsNames.forEach(function (name) {
  fs.readFile("strings/" + name + ".json", (err, data) => {
    if (err) throw err;
    strings[name] = JSON.parse(data);
  });
});

var currentBox = null;

function focusPopup() {
  if (currentBox != null) {
    currentBox.focus();
  }
}

function removePopup() {
  if (currentBox != null) {
    screen.remove(currentBox);
    currentBox = null;
    screen.rewindFocus();
    screen.render();
  }
}

function createPopup(content, escapable = true) {
  if (content == null) {
    return;
  }
  currentBox = createBox(content);
  if (escapable) {
    currentBox.key(["enter", "escape"], function (ch, key) {
      removePopup(screen);
    });
  }
  screen.append(currentBox);
  screen.render();
  currentBox.focus();
}

function handlePopup(mainScreen, column, content) {
  screen = mainScreen;

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
      whois.whois(content).then(function (response) {
        removePopup(screen);
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

function canShrink(content) {
  let maxShrinkSize = Math.floor((Math.floor(screen.lines.length / 2) - 1) / 2);
  let numberOfLines = content.split(/\r\n|\r|\n/).length;
  if (numberOfLines < maxShrinkSize) {
    return true;
  } else {
    return false;
  }
}

function createBox(content) {
  let height = "50%";
  let scrollable = true;
  if (canShrink(content)) {
    height = "shrink";
    scrollable = false;
  }

  return blessed.box({
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

function getPortText(port) {
  let assignment = strings["ports"][port];
  if (assignment == undefined) {
    return "This port is not assigned";
  }

  let text = "{bold}This port is assigned to:{/bold} " + assignment + "\n";
  text += "Note that regardless of a port assignment, it can be used in any way.";

  return text;
}

function getUsersText(users) {
  if (users.text == "/") {
    return null;
  }

  text = "";
  length = Object.keys(users).length - 1;
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

function loadingPopup(mainScreen) {
  screen = mainScreen;
  createPopup("Loading{blink}...{/blink}", false);
}

module.exports = { handlePopup, focusPopup, loadingPopup, removePopup };
