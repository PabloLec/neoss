const fs = require("fs");

var socketList = {};

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getUsers() {
  var processes = [];
  files = fs.readdirSync("/proc/");
  files.forEach((file) => {
    if (isNumeric(file)) {
      processes.push(file);
    }
  });

  procPromises = [];

  processes.forEach((proc, i) => {
    procPromises.push(Promise.race([timeout(500), getProcSockets(proc)]));
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

module.exports = getUsers;
