import { readdirSync, readFileSync, readlinkSync } from "fs";
import { execSync } from "child_process"

var socketList: any;

function timeout(ms: any) {
  return new Promise((resolve: any) => setTimeout(resolve, ms));
}

export async function getUsedSockets() {
  socketList = {};
  var processes: any = [];
  var files: any = readdirSync("/proc/");
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

  return socketList;
}

async function getProcSockets(proc: any) {
  let fd = "/proc/" + proc + "/fd/";

  try {
    var files = readdirSync(fd);
  } catch (EACCES) {
    return;
  }

  var sockets: any = [];

  files.forEach((file: any) => {
    try {
      var linkString = readlinkSync(fd + file);
    } catch (ENOENT) {
      return;
    }
    if (linkString && linkString.includes("socket")) {
        var match: RegExpMatchArray | null = linkString.match(/socket\:\[([0-9]+)\]/)
      if (match != null) {
      sockets.push(match[1]);}
    }
  });

  sockets.forEach((socket) => {
    if (socket in socketList) {
      socketList[socket].push(proc);
    } else {
      socketList[socket] = [proc];
    }
  });
}

function isNumeric(str: any) {
  return !isNaN(parseInt(str));
}

export async function getUserData(user: any) {

  try {
    var status: any = readFileSync("/proc/" + user + "/status", "utf8");
  } catch (ENOENT) {
    return ["error","error","error"];

  }

  let lines: any = status.split(/\r\n|\r|\n/);
  let name: any  = lines[0].trim().split(/\s+/)[1];
  let uid: any  = lines[9].trim().split(/\s+/)[1];
  let owner: any  = execSync("id -nu " + uid) + "";

  let cmdline: any ;
  try {
    var cmdlineFile: any  = readFileSync("/proc/" + user + "/cmdline", "utf8");
    cmdline = cmdlineFile.split("\0").join(" ");
  } catch (ENOENT) {
    cmdline = "Unable to retrieve cmdline. Process already terminated.";
  }

  return [name, owner.trim(), cmdline];
}
