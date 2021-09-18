const blessed = require("neo-blessed"),
  Node = blessed.Node,
  Box = blessed.Box;
const fs = require("fs");
const path = require("path");
const whois = require("src/lib/whois");
var screen;
var currentBox = null;
var strings = {};
const stringsNames = ["ports", "protocols", "queues", "states"];

// Load strings
stringsNames.forEach(function (name) {
  fs.readFile(path.join(__dirname, "..", "strings", name + ".json"), (err, data) => {
    if (err) throw err;
    strings[name] = JSON.parse(data);
  });
});

/**
 * If a popup exists in currentBox var, focus it.
 */
function focusPopup() {
  if (currentBox != null) {
    currentBox.focus();
  }
}

/**
 * Removes popup currently stored in currentBox var and returns focus to main table.
 */
function removePopup() {
  if (currentBox == null) {
    return;
  }
  screen.remove(currentBox);
  currentBox = null;
  screen.rewindFocus();
  screen.render();
}

/**
 * Stores a blessed box in currentBox var and adds keybindings.
 *
 * @param  {string} content - Text content
 * @param  {boolean} escapable=true - Is popup escapable with keys
 */
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

/**
 * Handles popup creation event according to selected table cell.
 *
 * @param  {blessed.screen} mainScreen - Blessed screen object
 * @param  {int} column - Column number to determine content type
 * @param  {string} content - Table cell content
 */
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

/**
 * Determines if the content is longer than half of screen height. If so, the popup can shrink.
 *
 * @param  {string} content - Text content
 * @return {boolean} - Popup can and must shrink
 */
function canShrink(content) {
  let maxShrinkSize = Math.floor((Math.floor(screen.lines.length / 2) - 1) / 2);
  let numberOfLines = content.split(/\r\n|\r|\n/).length;
  if (numberOfLines < maxShrinkSize) {
    return true;
  } else {
    return false;
  }
}

/**
 * Creates a blessed Box object with given content.
 *
 * @param  {string} content - Text content
 * @return {blessed.box} - Created blessed Box object
 */
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

/**
 * Get popup text content for ports.
 *
 * @param  {string} port - Port number
 * @returns {string} - Popup text content
 */
function getPortText(port) {
  let assignment = strings["ports"][port];
  if (assignment == undefined) {
    return "This port is not assigned";
  }

  let text = "{bold}This port is assigned to:{/bold} " + assignment + "\n";
  text += "Note that regardless of a port assignment, it can be used in any way.";

  return text;
}

/**
 * Get popup text content for users.
 *
 * @param  {Object} users - Users object
 * @returns {string} - Popup text content
 */
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

/**
 * Displays loading popup.
 *
 * @param  {blessed.screen} mainScreen - Main screen object to display popup on
 */
function loadingPopup(mainScreen) {
  screen = mainScreen;
  createPopup("Loading{blink}...{/blink}", false);
}

module.exports = { handlePopup, focusPopup, loadingPopup, removePopup };
