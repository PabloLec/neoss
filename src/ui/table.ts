// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'blessed'.
const blessed = require("neo-blessed"),
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Node'.
  Node = blessed.Node,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Box'.
  Box = blessed.Box;
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getStats'.
const getStats = require("src/utils/getStats");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'helper'.
const helper = require("src/utils/helper");
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'popups'.
const popups = require("src/ui/popups");

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Table'.
function Table(this: any, options: any) {
  var self = this;

  if (!(this instanceof Node)) {
    return new Table(options);
  }

  options = options || {};
  options.shrink = true;
  options.style = options.style || {};
  options.style.border = options.style.border || {};
  options.style.header = options.style.header || {};
  options.style.cell = options.style.cell || {};
  options.align = options.align || "center";
  delete options.height;

  Box.call(this, options);

  (this as any).pad = options.pad != null ? options.pad : 2;

  (this as any).selected = [0, 0];
  (this as any).currentSocket = null;
  (this as any).table = [];
  (this as any).popupVisible = false;
  (this as any).screenIsLocked = false;

  (this as any).setData(options.rows || options.data);

  (this as any).on("focus", function () {
    popups.focusPopup();
});

  (this as any).on("resize", function (this: any) {
    this.setData(self.table);
    self.screen.render();
});

  (this as any).key(["left"], function (this: any, ch: any, key: any) {
    if (this.screenIsLocked)
        return;
    if (this.selected[1] - 1 == -1) {
        return;
    }
    this.selected = [this.selected[0], this.selected[1] - 1];
    this.setData(this.table);
    self.screen.render();
});

  (this as any).key(["right"], function (this: any, ch: any, key: any) {
    if (this.screenIsLocked)
        return;
    // @ts-expect-error ts-migrate(2550) FIXME: Property 'values' does not exist on type 'ObjectCo... Remove this comment to see the full error message
    if (this.selected[1] + 1 == Object.values(this.table.data[this.selected[0]]).length - 1) {
        return;
    }
    this.selected = [this.selected[0], this.selected[1] + 1];
    this.setData(this.table);
    self.screen.render();
});

  (this as any).key(["up"], function (this: any, ch: any, key: any) {
    if (this.screenIsLocked)
        return;
    if (this.selected[0] - 1 == -1) {
        return;
    }
    this.selected = [this.selected[0] - 1, this.selected[1]];
    this.currentSocket = this.table.data[this.selected[0]];
    this.setData(this.table);
    self.screen.render();
});

  (this as any).key(["down"], function (this: any, ch: any, key: any) {
    if (this.screenIsLocked)
        return;
    if (this.selected[0] + 1 == this.table.data.length) {
        return;
    }
    this.selected = [this.selected[0] + 1, this.selected[1]];
    this.currentSocket = this.table.data[this.selected[0]];
    this.setData(this.table);
    self.screen.render();
});

  (this as any).key(["s", "S"], function (this: any, ch: any, key: any) {
    if (this.screenIsLocked)
        return;
    this.table.data = helper.sortBy(this.selected[1], this.table.data);
    this.selected = [helper.retrieveSocket(this.currentSocket, this.table.data, this.selected[0]), this.selected[1]];
    this.setData(this.table);
    self.screen.render();
});

  (this as any).key(["enter"], function (this: any, ch: any, key: any) {
    if (this.screenIsLocked)
        return;
    // @ts-expect-error ts-migrate(2550) FIXME: Property 'values' does not exist on type 'ObjectCo... Remove this comment to see the full error message
    let content = Object.values(this.table.data[this.selected[0]])[this.selected[1]];
    popups.handlePopup(this.screen, this.selected[1], content);
});

  (this as any).key(["r", "R"], function (this: any, ch: any, key: any) {
    if (this.screenIsLocked)
        return;
    getStats(this.screen, this);
});
}

Table.prototype.__proto__ = Box.prototype;

Table.prototype.type = "table";

Table.prototype._calculateMaxes = function () {
  var self = this;
  var maxes: any = [];

  if (this.detached) return;

  this.rows = this.rows || [];

  this.rows.forEach(function (row: any) {
    row.forEach(function (cell: any, i: any) {
      var clen = self.strWidth(cell);
      if (!maxes[i] || maxes[i] < clen) {
        maxes[i] = clen;
      }
    });
  });

  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'total' implicitly has an 'any' type.
  var total = maxes.reduce(function (total, max) {
    return total + max;
  }, 0);
  total += maxes.length + 1;

  if (this.width < total) {
    // delete this.position.width;
    return (this._maxes = null);
  }

  if (this.position.width != null) {
    var missing = this.width - total;
    var w = (missing / maxes.length) | 0;
    var wr = missing % maxes.length;
    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'max' implicitly has an 'any' type.
    maxes = maxes.map(function (max, i) {
      if (i === maxes.length - 1) {
        return max + w + wr;
      }
      return max + w;
    });
  } else {
    // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'max' implicitly has an 'any' type.
    maxes = maxes.map(function (max) {
      return max + self.pad;
    });
  }

  return (this._maxes = maxes);
};

Table.prototype.setRows = Table.prototype.setData = function (table: any) {
  if (typeof table == "undefined") {
    return;
  }
  var self = this,
    text = "",
    align = this.align;

  this.table = table;

  var lines = Math.floor(this.screen.lines.length / 2) - 1;

  if (Array.isArray(table)) {
    this.rows = table || [];
  } else {
    var rows: any = [];
    // @ts-expect-error ts-migrate(2550) FIXME: Property 'values' does not exist on type 'ObjectCo... Remove this comment to see the full error message
    Object.values(table.data).forEach(function (d: any) {
      // @ts-expect-error ts-migrate(2550) FIXME: Property 'values' does not exist on type 'ObjectCo... Remove this comment to see the full error message
      let row = Object.values(d);
      // Remove inode and user cells
      delete row[8];
      delete row[9];
      // Add user text only
      row[8] = d["users"].text;
      rows.push(row);
    });
    this.rows = rows;
  }

  try {
    this.rows[this.selected[0]][this.selected[1]] =
      "{blue-bg}{bold}" + this.rows[this.selected[0]][this.selected[1]] + "{/bold}{/blue-bg}";
  } catch (TypeError) {
    //pass
  }

  let scroll = helper.getScroll(this.selected[0], lines);
  this.rows = this.rows.slice(scroll[0], scroll[1]);

  if (typeof table.headers !== "undefined") {
    this.rows.unshift(table.headers);
  }

  this._calculateMaxes();

  if (!this._maxes) {
    this.setContent("Terminal width too small. Please resize your window.");
    this.screenIsLocked = true;
    popups.removePopup();
    return;
  }
  this.screenIsLocked = false;

  this.rows.forEach(function (row: any, i: any) {
    var isFooter = i === self.rows.length - 1;
    row.forEach(function (cell: any, i: any) {
      var width = self._maxes[i];
      var clen = self.strWidth(cell);

      if (i !== 0) {
        text += " ";
      }

      while (clen < width) {
        if (align === "center") {
          cell = " " + cell + " ";
          clen += 2;
        } else if (align === "left") {
          cell = cell + " ";
          clen += 1;
        } else if (align === "right") {
          cell = " " + cell;
          clen += 1;
        }
      }

      if (clen > width) {
        if (align === "center") {
          cell = cell.substring(1);
          clen--;
        } else if (align === "left") {
          cell = cell.slice(0, -1);
          clen--;
        } else if (align === "right") {
          cell = cell.substring(1);
          clen--;
        }
      }

      text += cell;
    });
    if (!isFooter) {
      text += "\n\n";
    }
  });

  delete this.align;
  this.setContent(text);
  this.align = align;
  this.focus();
};

Table.prototype.render = function () {
  var self = this;

  var coords = this._render();
  if (!coords) return;

  this._calculateMaxes();
  if (!this._maxes) {
    return;
  }

  var lines = this.screen.lines,
    xi = coords.xi,
    yi = coords.yi,
    rx: any,
    ry: any,
    i;

  var dattr = this.sattr(this.style),
    hattr = this.sattr(this.style.header),
    cattr = this.sattr(this.style.cell),
    battr = this.sattr(this.style.border);

  var width = coords.xl - coords.xi - this.iright,
    height = coords.yl - coords.yi - this.ibottom;

  for (var y = this.itop; y < height; y++) {
    if (!lines[yi + y]) break;
    for (var x = this.ileft; x < width; x++) {
      if (!lines[yi + y][xi + x]) break;
      if (lines[yi + y][xi + x][0] !== dattr) continue;
      if (y === this.itop) {
        lines[yi + y][xi + x][0] = hattr;
      } else {
        lines[yi + y][xi + x][0] = cattr;
      }
      lines[yi + y].dirty = true;
    }
  }

  if (!this.border || this.options.noCellBorders) return coords;

  ry = 0;
  for (i = 0; i < self.rows.length + 1; i++) {
    if (!lines[yi + ry]) break;
    rx = 0;
    self._maxes.forEach(function (max: any, i: any) {
      rx += max;
      if (i === 0) {
        if (!lines[yi + ry][xi + 0]) return;
        // left side
        if (ry === 0) {
          // top
          lines[yi + ry][xi + 0][0] = battr;
          // lines[yi + ry][xi + 0][1] = '\u250c'; // '┌'
        } else if (ry / 2 === self.rows.length) {
          // bottom
          lines[yi + ry][xi + 0][0] = battr;
          // lines[yi + ry][xi + 0][1] = '\u2514'; // '└'
        } else {
          // middle
          lines[yi + ry][xi + 0][0] = battr;
          lines[yi + ry][xi + 0][1] = "\u251c"; // '├'
          // XXX If we alter iwidth and ileft for no borders - nothing should be written here
          if (!self.border.left) {
            lines[yi + ry][xi + 0][1] = "\u2500"; // '─'
          }
        }
        lines[yi + ry].dirty = true;
      } else if (i === self._maxes.length - 1) {
        if (!lines[yi + ry][xi + rx + 1]) return;
        // right side
        if (ry === 0) {
          // top
          rx++;
          lines[yi + ry][xi + rx][0] = battr;
          // lines[yi + ry][xi + rx][1] = '\u2510'; // '┐'
        } else if (ry / 2 === self.rows.length) {
          // bottom
          rx++;
          lines[yi + ry][xi + rx][0] = battr;
          // lines[yi + ry][xi + rx][1] = '\u2518'; // '┘'
        } else {
          // middle
          rx++;
          lines[yi + ry][xi + rx][0] = battr;
          lines[yi + ry][xi + rx][1] = "\u2524"; // '┤'
          // XXX If we alter iwidth and iright for no borders - nothing should be written here
          if (!self.border.right) {
            lines[yi + ry][xi + rx][1] = "\u2500"; // '─'
          }
        }
        lines[yi + ry].dirty = true;
        return;
      }
      if (!lines[yi + ry][xi + rx + 1]) return;
      // center
      if (ry === 0) {
        // top
        rx++;
        lines[yi + ry][xi + rx][0] = battr;
        lines[yi + ry][xi + rx][1] = "\u252c"; // '┬'
        // XXX If we alter iheight and itop for no borders - nothing should be written here
        if (!self.border.top) {
          lines[yi + ry][xi + rx][1] = "\u2502"; // '│'
        }
      } else if (ry / 2 === self.rows.length) {
        // bottom
        rx++;
        lines[yi + ry][xi + rx][0] = battr;
        lines[yi + ry][xi + rx][1] = "\u2534"; // '┴'
        // XXX If we alter iheight and ibottom for no borders - nothing should be written here
        if (!self.border.bottom) {
          lines[yi + ry][xi + rx][1] = "\u2502"; // '│'
        }
      } else {
        // middle
        if (self.options.fillCellBorders) {
          var lbg = (ry <= 2 ? hattr : cattr) & 0x1ff;
          rx++;
          lines[yi + ry][xi + rx][0] = (battr & ~0x1ff) | lbg;
        } else {
          rx++;
          lines[yi + ry][xi + rx][0] = battr;
        }
        lines[yi + ry][xi + rx][1] = "\u253c"; // '┼'
        // rx++;
      }
      lines[yi + ry].dirty = true;
    });
    ry += 2;
  }

  // Draw internal borders.
  for (ry = 1; ry < self.rows.length * 2; ry++) {
    if (!lines[yi + ry]) break;
    rx = 0;
    self._maxes.slice(0, -1).forEach(function (max: any) {
      rx += max;
      if (!lines[yi + ry][xi + rx + 1]) return;
      if (ry % 2 !== 0) {
        if (self.options.fillCellBorders) {
          var lbg = (ry <= 2 ? hattr : cattr) & 0x1ff;
          rx++;
          lines[yi + ry][xi + rx][0] = (battr & ~0x1ff) | lbg;
        } else {
          rx++;
          lines[yi + ry][xi + rx][0] = battr;
        }
        lines[yi + ry][xi + rx][1] = "\u2502"; // '│'
        lines[yi + ry].dirty = true;
      } else {
        rx++;
      }
    });
    rx = 1;
    self._maxes.forEach(function (max: any) {
      while (max--) {
        if (ry % 2 === 0) {
          if (!lines[yi + ry]) break;
          if (!lines[yi + ry][xi + rx + 1]) break;
          if (self.options.fillCellBorders) {
            var lbg = (ry <= 2 ? hattr : cattr) & 0x1ff;
            lines[yi + ry][xi + rx][0] = (battr & ~0x1ff) | lbg;
          } else {
            lines[yi + ry][xi + rx][0] = battr;
          }
          lines[yi + ry][xi + rx][1] = "\u2500"; // '─'
          lines[yi + ry].dirty = true;
        }
        rx++;
      }
      rx++;
    });
  }

  return coords;
};

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = Table;
