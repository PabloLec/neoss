import { reverse } from "dns";
import { setData, refreshScreen } from "src/ui/screen";
import { getSockets } from "src/utils/sockets";
import { getUsedSockets, getUserData } from "src/utils/users";
import { sortBy } from "src/utils/helper";
import { loadingPopup, removePopup } from "src/ui/popups";

var usedSockets: {};

var socketList: any[] = [];

export async function getStats() {
  let socketListPromise: Promise<{}> = getSockets();
  let usedSocketsPromise: Promise<{}> = getUsedSockets();
  let usersPromises: Promise<void>[] = [];
  loadingPopup();

  await Promise.all([socketListPromise, usedSocketsPromise]).then(function ([socketListResult, usedSocketsResult]) {
    usedSockets = usedSocketsResult;

    let i: number = 0;

    for (let socket in socketListResult) {
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

  setData(sortBy(null, socketList));
  removePopup();
  reverseNSLookup();
}

async function reverseNSLookup() {
  for (let i = 0; i < socketList.length; i++) {
    try {
      reverse(socketList[i].peerAddress, (err: Error | void | null, result: string[]) => {
        if (!err) {
          if (result.length == 0 || result[0].length == 0) {
            return;
          }
          socketList[i].peerAddress = result[0];
          refreshScreen();
        }
      });
    } catch {
      continue;
    }
  }
}

async function parseUsersData(socket: string, i: number) {
  for (let j = 0; j < usedSockets[socket].length; j++) {
    socketList[i].users[j] = {};
    socketList[i].users[j].pid = usedSockets[socketList[i].inode][j];

    let userData: string[] = await getUserData(socketList[i].users[j].pid);

    socketList[i].users[j].name = userData[0];
    socketList[i].users[j].owner = userData[1];
    socketList[i].users[j].cmdline = userData[2];
  }

  if (usedSockets[socketList[i].inode].length == 1) {
    socketList[i].users.text = socketList[i].users[0].name;
  } else {
    socketList[i].users.text = usedSockets[socketList[i].inode].length + " users";
  }
}
