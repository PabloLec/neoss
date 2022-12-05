import { readdirSync, readFileSync, readlinkSync } from "fs";
import { execSync } from "child_process";

let socketMap: {};

/**
 * Fetch in-use sockets and query their users statistics.
 *
 * @returns Map of used sockets and their users
 */
export async function getUsedSockets(): Promise<{}> {
  socketMap = {};
  let processes: string[] = [];
  let files: string[] = readdirSync("/proc/");
  files.forEach((file: any) => {
    if (isNumeric(file)) {
      processes.push(file);
    }
  });

  let procPromises: Promise<any>[] = [];

  processes.forEach((proc, i) => {
    procPromises.push(Promise.race([timeout(100), getProcSockets(proc)]));
  });

  await Promise.allSettled(procPromises);

  return socketMap;
}

/**
 * Get users statistics for a given socket.
 *
 * @param proc - Socket inode
 */
async function getProcSockets(proc: string) {
  let fd = "/proc/" + proc + "/fd/";

  let files: string[];

  try {
    files = readdirSync(fd);
  } catch (EACCES) {
    return;
  }

  let sockets: string[] = [];

  files.forEach((file: string) => {
    let linkString: string;
    try {
      linkString = readlinkSync(fd + file);
    } catch (ENOENT) {
      return;
    }
    if (linkString && linkString.includes("socket")) {
      let match: RegExpMatchArray | null = linkString.match(/socket:\[(\d+)]/);
      if (match != null) {
        sockets.push(match[1]);
      }
    }
  });

  sockets.forEach((socket) => {
    if (socket in socketMap) {
      socketMap[socket].push(proc);
    } else {
      socketMap[socket] = [proc];
    }
  });
}

/**
 * Get detailed information about given user.
 *
 * @param user - User PID
 * @returns - Username, owner and init command line
 */
export async function getUserData(user: string): Promise<string[]> {
  let status: string;
  try {
    status = readFileSync("/proc/" + user + "/status", "utf8");
  } catch (ENOENT) {
    return ["error", "error", "error"];
  }

  let lines = status.split(/\r\n|\r|\n/);
  let name = lines[0].trim().split(/\s+/)[1];
  let uid = lines[9].trim().split(/\s+/)[1];
  let owner = execSync("id -nu " + uid) + "";

  let cmdline: string;
  try {
    let cmdlineFile: string = readFileSync("/proc/" + user + "/cmdline", "utf8");
    cmdline = cmdlineFile.split("\0").join(" ");
  } catch (ENOENT) {
    cmdline = "Unable to retrieve cmdline. Process already terminated.";
  }

  return [name, owner.trim(), cmdline];
}

/**
 * Check if file descriptor name is numeric to determine if it is related to a process.
 *
 * @param str - File name
 * @returns - Is numeric
 */
function isNumeric(str: string): boolean {
  return !isNaN(parseInt(str));
}

/**
 * Timeout function to limit fs wait time.
 *
 * @param ms - Time to wait in ms
 * @returns - void
 */
function timeout(ms: number): Promise<void> {
  return new Promise((resolve: any) => setTimeout(resolve, ms));
}
