const dns = require("dns");
const getSockets = require("src/utils/sockets");
const users = require("src/utils/users");
const helper = require("src/utils/helper");
const popups = require("src/ui/popups");

var usedSocket, screen, table;
var sockets = [];

async function getStats(mainScreen, mainTable) {
  screen = mainScreen;
  table = mainTable;
  socketsPromise = getSockets();
  usedSocketsPromise = users.getUsedSockets();
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
    headers: ["Protocol", "State", "Rx", "Tx", "Local Address", "Local Port", "Peer Address", "Peer Port", "Users"],
    data: helper.sortBy(null, sockets),
  });
  table.focus();
  // Retrieve previous selected cell, if any.
  table.selected = [helper.retrieveSocket(table.currentSocket, table.table.data, table.selected[0]), table.selected[1]];
  popups.removePopup();
  screen.render();
  reverseNSLookup();
}

async function reverseNSLookup() {
  for (let i = 0; i < sockets.length; i++) {
    try {
      dns.reverse(
        sockets[i].peerAddress,
        (callback = (err, result) => {
          if (!err) {
            if (result.length == 0 || result[0].length == 0) {
              return;
            }
            sockets[i].peerAddress = result[0];
            table.setData(table.table);
            screen.render();
          }
        })
      );
    } catch {
      continue;
    }
  }
}

async function parseUsersData(socket, i) {
  for (let j = 0; j < usedSockets[socket].length; j++) {
    sockets[i].users[j] = {};
    sockets[i].users[j].pid = usedSockets[sockets[i].inode][j];

    [sockets[i].users[j].name, sockets[i].users[j].owner, sockets[i].users[j].cmdline] = await users.getUserData(
      sockets[i].users[j].pid
    );
  }

  if (usedSockets[sockets[i].inode].length == 1) {
    sockets[i].users.text = sockets[i].users[0].name;
  } else {
    sockets[i].users.text = usedSockets[sockets[i].inode].length + " users";
  }
}

module.exports = getStats;
