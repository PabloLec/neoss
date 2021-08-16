var blessed = require("neo-blessed"),
  Node = blessed.Node,
  Box = blessed.Box;

const pino = require("pino");
const logger = pino(pino.destination("/tmp/node.log"));

var currentBox;

function removePopup(screen) {
  if (currentBox != undefined) {
    screen.remove(currentBox);
  }
  screen.render();
}

function createPopup(popup, screen) {
  currentBox = popup;
  currentBox.key(["enter", "escape"], function (ch, key) {
    popups.removePopup(screen);
  });
  screen.append(currentBox);
  screen.render();
}

function spawnProtocolBox(screen) {
  var protocolBox = blessed.box({
    top: "center",
    left: "center",
    width: "50%",
    height: "50%",
    content: "Hello {bold}world{/bold}!",
    tags: true,
    border: {
      type: "line",
    },
    style: {
      fg: "white",
      bg: "magenta",
      border: {
        fg: "#f0f0f0",
      },
      hover: {
        bg: "green",
      },
    },
  });

  createPopup(protocolBox, screen);
}

module.exports = { removePopup, spawnProtocolBox };
