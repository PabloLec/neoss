const getSockets = require("./sockets");
const users = require("./users");
const dns = require("dns");
const helper = require("src/lib/helper");
const popups = require("src/ui/popups");

const pino = require("pino");
const logger = pino(pino.destination("/tmp/node.log"));

var socketsPromise = getSockets();
var usedSocketsPromise = users.getUsedSockets();
var usedSocket, screen, table;
var sockets = [];

async function getStats(mainScreen, mainTable) {
  screen = mainScreen;
  table = mainTable;
  usersPromises = [];
  popups.loadingPopup(screen);

  await Promise.all([socketsPromise, usedSocketsPromise]).then(function ([socketsResult, usedSocketsResult]) {
    usedSockets = usedSocketsResult;

    i = 0;

    for (socket in socketsResult) {
      sockets[i] = socketsResult[socket];
      if (socket in usedSockets) {
        usersPromises.push(parseUsersData(socket, i));
      } else {
        sockets[i].users.text = "/";
      }
      i++;
    }
  });

  await Promise.all(usersPromises);

  screen.append(table);
  table.setData({
    headers: [
      "Protocol",
      "State",
      "Receive Queue",
      "Send Queue",
      "Local Address",
      "Local Port",
      "Peer Address",
      "Peer Port",
      "Users",
    ],
    data: sockets,
  });

  logger.info(table.table);

  table.focus();
  // Retrieve previous selected cell, if any.
  table.selected = [helper.retrieveSocket(table.currentSocket, table.table.data, table.selected[0]), table.selected[1]];
  popups.removePopup();
  screen.render();
}

async function parseUsersData(socket, i) {
  for (let j = 0; j < usedSockets[socket].length; j++) {
    sockets[i].users[j] = {};

    [sockets[i].users[j].name, sockets[i].users[j].pid, sockets[i].users[j].cmdline] = await users.getUserData(
      usedSockets[sockets[i].inode][j]
    );
  }

  if (usedSockets[sockets[i].inode].length == 1) {
    sockets[i].users.text = sockets[i].users[0].name;
  } else {
    sockets[i].users.text = usedSockets[sockets[i].inode].length + " users";
  }
}

module.exports = getStats;
