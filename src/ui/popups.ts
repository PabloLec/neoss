// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'blessed'.
const blessed = require("neo-blessed"),
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Node'.
  Node = blessed.Node,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Box'.
  Box = blessed.Box;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const path = require("path");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'whois'.
const whois = require("src/utils/whois");
// @ts-expect-error ts-migrate(2403) FIXME: Subsequent variable declarations must have the sam... Remove this comment to see the full error message
var screen;
var currentBox: any = null;
var strings = {};
const stringsNames = ["ports", "protocols", "queues", "states"];

// Load strings
stringsNames.forEach(function (name) {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__dirname'.
  fs.readFile(path.join(__dirname, "..", "strings", name + ".json"), (err: any, data: any) => {
    if (err) throw err;
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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
  (screen as any).remove(currentBox);
  currentBox = null;
  (screen as any).rewindFocus();
  (screen as any).render();
}

/**
 * Stores a blessed box in currentBox var and adds keybindings.
 *
 * @param  {string} content - Text content
 * @param  {boolean} escapable=true - Is popup escapable with keys
 */
function createPopup(content: any, escapable = true) {
  if (content == null) {
    return;
  }
  currentBox = createBox(content);
  if (escapable) {
    currentBox.key(["enter", "escape"], function (ch: any, key: any) {
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
      removePopup(screen);
    });
  }
  (screen as any).append(currentBox);
  (screen as any).render();
  currentBox.focus();
}

/**
 * Handles popup creation event according to selected table cell.
 *
 * @param  {blessed.screen} mainScreen - Blessed screen object
 * @param  {int} column - Column number to determine content type
 * @param  {string} content - Table cell content
 */
function handlePopup(mainScreen: any, column: any, content: any) {
  screen = mainScreen;

  switch (column) {
    case 0:
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      createPopup(strings["protocols"][content]);
      break;
    case 1:
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      createPopup(strings["states"][content]);
      break;
    case 2:
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      createPopup(strings["queues"]["receiveQueue"]);
      break;
    case 3:
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      createPopup(strings["queues"]["sendQueue"]);
      break;
    case 4:
      break;
    case 5:
      createPopup(getPortText(content));
      break;
    case 6:
      createPopup("Wait for Whois...", false);
      whois.whois(content).then(function (response: any) {
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
function canShrink(content: any) {
  let maxShrinkSize = Math.floor((Math.floor((screen as any).lines.length / 2) - 1) / 2);
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
function createBox(content: any) {
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
function getPortText(port: any) {
  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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
function getUsersText(users: any) {
  if (users.text == "/") {
    return null;
  }

  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'text'. Did you mean 'Text'?
  text = "";
  length = Object.keys(users).length - 1;
  for (let i = 0; i < length; i++) {
    if (length > 1) {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'text'.
      text += "{bold} - - User " + (i + 1) + " - -{/bold}\n";
    }
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'text'.
    text += "{bold}Name:{/bold} " + users[i].name + "\n";
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'text'.
    text += "{bold}PID:{/bold} " + users[i].pid + "\n";
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'text'. Did you mean 'Text'?
    text += "{bold}Owner:{/bold} " + users[i].owner + "\n";
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'text'. Did you mean 'Text'?
    text += "{bold}Command:{/bold} " + users[i].cmdline.trim() + "\n";
    if (i < length - 1) {
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'text'. Did you mean 'Text'?
      text += "\n\n";
    }
  }

  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'text'. Did you mean 'Text'?
  return text;
}

/**
 * Displays loading popup.
 *
 * @param  {blessed.screen} mainScreen - Main screen object to display popup on
 */
function loadingPopup(mainScreen: any) {
  screen = mainScreen;
  createPopup("Loading{blink}...{/blink}", false);
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = { handlePopup, focusPopup, loadingPopup, removePopup };
