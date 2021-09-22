// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const dns = require("dns");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getSockets... Remove this comment to see the full error message
const getSockets = require("src/utils/sockets");
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const users = require("src/utils/users");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'helper'.
const helper = require("src/utils/helper");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'popups'.
const popups = require("src/ui/popups");

// @ts-expect-error ts-migrate(2403) FIXME: Subsequent variable declarations must have the sam... Remove this comment to see the full error message
var usedSocket, screen, table;
var sockets: any = [];

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getStats'.
async function getStats(mainScreen: any, mainTable: any) {
  screen = mainScreen;
  // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'table' because it is a constant.
  table = mainTable;
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'socketsPromise'.
  socketsPromise = getSockets();
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'usedSocketsPromise'.
  usedSocketsPromise = users.getUsedSockets();
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'usersPromises'.
  usersPromises = [];
  popups.loadingPopup(screen);

  // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
  await Promise.all([socketsPromise, usedSocketsPromise]).then(function ([socketsResult, usedSocketsResult]) {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'usedSockets'.
    usedSockets = usedSocketsResult;

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'i'.
    i = 0;

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'socket'.
    for (socket in socketsResult) {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'i'.
      sockets[i] = socketsResult[socket];
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'socket'.
      if (socket in usedSockets) {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'usersPromises'.
        usersPromises.push(parseUsersData(socket, i));
      } else {
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'i'.
        sockets[i].users.text = "/";
      }
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'i'.
      i++;
    }
  });

  // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
  await Promise.all(usersPromises);

  (screen as any).append(table);
  table.setData({
    headers: ["Protocol", "State", "Rx", "Tx", "Local Address", "Local Port", "Peer Address", "Peer Port", "Users"],
    data: helper.sortBy(null, sockets),
  });
  table.focus();
  // Retrieve previous selected cell, if any.
  table.selected = [helper.retrieveSocket(table.currentSocket, table.table.data, table.selected[0]), table.selected[1]];
  popups.removePopup();
  (screen as any).render();
  reverseNSLookup();
}

// @ts-expect-error ts-migrate(2705) FIXME: An async function or method in ES5/ES3 requires th... Remove this comment to see the full error message
async function reverseNSLookup() {
  for (let i = 0; i < sockets.length; i++) {
    try {
      dns.reverse(
        sockets[i].peerAddress,
        // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'callback'.
        (callback = (err: any, result: any) => {
          if (!err) {
            if (result.length == 0 || result[0].length == 0) {
              return;
            }
            sockets[i].peerAddress = result[0];
            table.setData(table.table);
            (screen as any).render();
          }
        })
      );
    } catch {
      continue;
    }
  }
}

// @ts-expect-error ts-migrate(2705) FIXME: An async function or method in ES5/ES3 requires th... Remove this comment to see the full error message
async function parseUsersData(socket: any, i: any) {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'usedSockets'.
  for (let j = 0; j < usedSockets[socket].length; j++) {
    sockets[i].users[j] = {};
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'usedSockets'.
    sockets[i].users[j].pid = usedSockets[sockets[i].inode][j];

    [sockets[i].users[j].name, sockets[i].users[j].owner, sockets[i].users[j].cmdline] = await users.getUserData(
      sockets[i].users[j].pid
    );
  }

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'usedSockets'.
  if (usedSockets[sockets[i].inode].length == 1) {
    sockets[i].users.text = sockets[i].users[0].name;
  } else {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'usedSockets'.
    sockets[i].users.text = usedSockets[sockets[i].inode].length + " users";
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = getStats;
