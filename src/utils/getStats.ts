import { reverse } from "dns";
import { setData, refreshScreen } from "../ui/screen";
import { getSockets } from "./sockets";
import { getUsedSockets, getUserData } from "./users";
import { sortBy } from "./helper";
import { loadingPopup, removePopup } from "../ui/popups";

let usedSockets: {};

let socketList: any[] = [];

/**
 * Drive async workflow for full socket statistics acquisition.
 */
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
  await reverseNSLookup();
}

/**
 * Create user objects for raw string data.
 *
 * @param socket - Socket to parse user(s) from
 * @param i - Index in socket list
 */
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

/**
 * Query reverse lookups for all stored IPs.
 */
async function reverseNSLookup() {
  for (const element of socketList) {
    reverse(element.peerAddress, (err: Error | void | null, result: string[]) => {
      if (!err) {
        if (result.length == 0 || result[0].length == 0) {
          return;
        }
        element.peerAddress = result[0];
        refreshScreen();
      }
    });
  }
}
