var lastSort;
var lastScroll;

function retrieveSocket(socket, data, currentIndex) {
  if (socket == null) {
    return currentIndex;
  }

  let i = 0;
  while (i < data.length) {
    let l = data[i];
    let s = socket;

    if (
      s.localAddress == l.localAddress &&
      s.localPort == l.localPort &&
      s.peerAddress == l.peerAddress &&
      s.peerPort == l.peerPort
    ) {
      currentIndex = i;
      break;
    }
    i++;
  }

  return currentIndex;
}

function sortBy(column, data) {
  if (lastSort == column) {
    ascending = false;
    lastSort = null;
  } else {
    ascending = true;
    lastSort = column;
  }

  const sort = (key, numeric = false) => {
    if (ascending && numeric) {
      data.sort((a, b) => (parseInt(a[key]) > parseInt(b[key]) ? 1 : -1));
    } else if (!ascending && numeric) {
      data.sort((a, b) => (parseInt(a[key]) < parseInt(b[key]) ? 1 : -1));
    } else if (key == "users" && ascending) {
      data.sort((a, b) => (a[key].text > b[key].text ? 1 : -1));
    } else if (key == "users") {
      data.sort((a, b) => (a[key].text < b[key].text ? 1 : -1));
    } else if (ascending) {
      data.sort((a, b) => (a[key] > b[key] ? 1 : -1));
    } else {
      data.sort((a, b) => (a[key] < b[key] ? 1 : -1));
    }
  };

  switch (column) {
    case 0:
      sort("protocol");
      break;
    case 1:
      sort("state");
      break;
    case 2:
      sort("receiveQueue", true);
      break;
    case 3:
      sort("sendQueue", true);
      break;
    case 4:
      sort("localAddress");
      break;
    case 5:
      sort("localPort", true);
      break;
    case 6:
      sort("peerAddress");
      break;
    case 7:
      sort("peerPort", true);
      break;
    case 8:
      sort("users");
      break;
  }

  return data;
}

function getScroll(row, screenLines) {
  if (lastScroll === undefined) {
    lastScroll = [0, screenLines - 1];
  }

  var newScroll;

  if (row >= lastScroll[0] && row < lastScroll[1]) {
    newScroll = lastScroll;
  } else if (row < lastScroll[0]) {
    diff = lastScroll[0] - row;
    newScroll = [lastScroll[0] - diff, lastScroll[1] - diff];
  } else if (row >= lastScroll[1]) {
    diff = row - lastScroll[1] + 1;
    newScroll = [lastScroll[0] + diff, lastScroll[1] + diff];
  }

  lastScroll = newScroll;
  return newScroll;
}

module.exports = { sortBy, retrieveSocket, getScroll };
