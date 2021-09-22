import { reverse } from "dns";
import { getSockets } from "src/utils/sockets";
import { getUsedSockets, getUserData } from "src/utils/users";
import { sortBy, retrieveSocket } from "src/utils/helper";
import { loadingPopup, removePopup } from "src/ui/popups";

var usedSockets: any;
var screen: any;
var table: any;
var socketList: any = [];


export async function getStats(mainScreen: any, mainTable: any) {
  screen = mainScreen;
  table = mainTable;
  var socketListPromise: any = getSockets();
  var usedSocketsPromise: any = getUsedSockets();
  var usersPromises: any = [];
  loadingPopup(screen);

  await Promise.all([socketListPromise, usedSocketsPromise]).then(function ([socketListResult, usedSocketsResult]) {
    usedSockets = usedSocketsResult;

    var i: number = 0;

    for (var socket in socketListResult) {
      socketList[i] = socketListResult[socket];
      if (socket in usedSockets) {
        usersPromises.push(parseUsersData(socket, i));
      } else {
        socketList[i].users.text = "/";
      }
      i++;
    }
  });

  await Promise.all(usersPromises);

  (screen as any).append(table);
  table.setData({
    headers: ["Protocol", "State", "Rx", "Tx", "Local Address", "Local Port", "Peer Address", "Peer Port", "Users"],
    data: sortBy(null, socketList),
  });
  table.focus();
  // Retrieve previous selected cell, if any.
  table.selected = [retrieveSocket(table.currentSocket, table.table.data, table.selected[0]), table.selected[1]];
  removePopup();
  (screen as any).render();
  reverseNSLookup();
}

async function reverseNSLookup() {
  for (let i = 0; i < socketList.length; i++) {
    try {
      reverse(
        socketList[i].peerAddress,
        ( (err: any, result: any) => {
          if (!err) {
            if (result.length == 0 || result[0].length == 0) {
              return;
            }
            socketList[i].peerAddress = result[0];
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

async function parseUsersData(socket: any, i: any) {
  for (let j = 0; j < usedSockets[socket].length; j++) {
    socketList[i].users[j] = {};
    socketList[i].users[j].pid = usedSockets[socketList[i].inode][j];

    let userData: any = await getUserData(
      socketList[i].users[j].pid
    );

    socketList[i].users[j].name = userData[0]
    socketList[i].users[j].owner = userData[1]
    socketList[i].users[j].cmdline = userData[2]
  }

  if (usedSockets[socketList[i].inode].length == 1) {
    socketList[i].users.text = socketList[i].users[0].name;
  } else {
    socketList[i].users.text = usedSockets[socketList[i].inode].length + " users";
  }
}
