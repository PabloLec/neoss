const fs = require("fs");
const exec = require("child_process").execSync;

var socketList;

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getUsedSockets() {
  socketList = {};
  var processes = [];
  files = fs.readdirSync("/proc/");
  files.forEach((file) => {
    if (isNumeric(file)) {
      processes.push(file);
    }
  });

  procPromises = [];

  processes.forEach((proc, i) => {
    procPromises.push(Promise.race([timeout(100), getProcSockets(proc)]));
  });

  await Promise.allSettled(procPromises);

  return socketList;
}

async function getProcSockets(proc) {
  let fd = "/proc/" + proc + "/fd/";

  try {
    files = fs.readdirSync(fd);
  } catch (EACCES) {
    return;
  }

  var sockets = [];

  files.forEach((file) => {
    try {
      linkString = fs.readlinkSync(fd + file);
    } catch (ENOENT) {
      return;
    }
    if (linkString && linkString.includes("socket")) {
      sockets.push(linkString.match(/socket\:\[([0-9]+)\]/)[1]);
    }
  });

  sockets.forEach((socket) => {
    if (socket in socketList) {
      socketList[socket].push(proc);
    } else {
      socketList[socket] = [proc];
    }
  });

  resolve();
}

function isNumeric(str) {
  return !isNaN(parseInt(str));
}

async function getUserData(user) {
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
    cmdlineFile = fs.readFileSync("/proc/" + user + "/cmdline", "utf8");
    cmdline = cmdlineFile.split("\0").join(" ");
  } catch (ENOENT) {
    cmdline = "Unable to retrieve cmdline. Process already terminated.";
  }

  return [name, owner.trim(), cmdline];
}

module.exports = { getUsedSockets, getUserData };
