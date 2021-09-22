// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const exec = require("child_process").execSync;

var socketList: any;

function timeout(ms: any) {
  // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
  return new Promise((resolve: any) => setTimeout(resolve, ms));
}

async function getUsedSockets() {
  socketList = {};
  var processes: any = [];
  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'files'. Did you mean 'File'?
  files = fs.readdirSync("/proc/");
  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'files'. Did you mean 'File'?
  files.forEach((file: any) => {
    if (isNumeric(file)) {
      processes.push(file);
    }
  });

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'procPromises'.
  procPromises = [];

  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'proc' implicitly has an 'any' type.
  processes.forEach((proc, i) => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'procPromises'.
    procPromises.push(Promise.race([timeout(100), getProcSockets(proc)]));
  });

  // @ts-expect-error ts-migrate(2585) FIXME: 'Promise' only refers to a type, but is being used... Remove this comment to see the full error message
  await Promise.allSettled(procPromises);

  return socketList;
}

// @ts-expect-error ts-migrate(2705) FIXME: An async function or method in ES5/ES3 requires th... Remove this comment to see the full error message
async function getProcSockets(proc: any) {
  let fd = "/proc/" + proc + "/fd/";

  try {
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'files'. Did you mean 'File'?
    files = fs.readdirSync(fd);
  } catch (EACCES) {
    return;
  }

  var sockets: any = [];

  // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'files'. Did you mean 'File'?
  files.forEach((file: any) => {
    try {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'linkString'.
      linkString = fs.readlinkSync(fd + file);
    } catch (ENOENT) {
      return;
    }
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'linkString'.
    if (linkString && linkString.includes("socket")) {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'linkString'.
      sockets.push(linkString.match(/socket\:\[([0-9]+)\]/)[1]);
    }
  });

  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'socket' implicitly has an 'any' type.
  sockets.forEach((socket) => {
    if (socket in socketList) {
      socketList[socket].push(proc);
    } else {
      socketList[socket] = [proc];
    }
  });

  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'resolve'.
  resolve();
}

function isNumeric(str: any) {
  return !isNaN(parseInt(str));
}

async function getUserData(user: any) {
  try {
    status = fs.readFileSync("/proc/" + user + "/status", "utf8");
  } catch (ENOENT) {
    return;
  }

  let lines = status.split(/\r\n|\r|\n/);
  let name = lines[0].trim().split(/\s+/)[1];
  let uid = lines[9].trim().split(/\s+/)[1];
  let owner = exec("id -nu " + uid) + "";

  let cmdline;
  try {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'cmdlineFile'.
    cmdlineFile = fs.readFileSync("/proc/" + user + "/cmdline", "utf8");
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'cmdlineFile'.
    cmdline = cmdlineFile.split("\0").join(" ");
  } catch (ENOENT) {
    cmdline = "Unable to retrieve cmdline. Process already terminated.";
  }

  return [name, owner.trim(), cmdline];
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = { getUsedSockets, getUserData };
