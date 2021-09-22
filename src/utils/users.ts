import { readdirSync, readFileSync, readlinkSync } from "fs";
import { execSync } from "child_process";

var socketMap: {};

function timeout(ms: number) {
  return new Promise((resolve: any) => setTimeout(resolve, ms));
}

export async function getUsedSockets() {
  socketMap = {};
  var processes: string[] = [];
  var files: string[] = readdirSync("/proc/");
  files.forEach((file: any) => {
    if (isNumeric(file)) {
      processes.push(file);
    }
  });

  var procPromises: Promise<any>[] = [];

  processes.forEach((proc, i) => {
    procPromises.push(Promise.race([timeout(100), getProcSockets(proc)]));
  });

  await Promise.allSettled(procPromises);

  return socketMap;
}

async function getProcSockets(proc: string) {
  let fd = "/proc/" + proc + "/fd/";

  try {
    var files = readdirSync(fd);
  } catch (EACCES) {
    return;
  }

  var sockets: string[] = [];

  files.forEach((file: string) => {
    try {
      var linkString = readlinkSync(fd + file);
    } catch (ENOENT) {
      return;
    }
    if (linkString && linkString.includes("socket")) {
      var match: RegExpMatchArray | null = linkString.match(/socket\:\[([0-9]+)\]/);
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

function isNumeric(str: string) {
  return !isNaN(parseInt(str));
}

export async function getUserData(user: string) {
  try {
    var status: string = readFileSync("/proc/" + user + "/status", "utf8");
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
