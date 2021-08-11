var blessed = require("blessed"),
  Node = blessed.Node,
  Box = blessed.Box,
  stripAnsi = require("strip-ansi");

function Matrix(options) {
  var self = this;

  if (!(this instanceof Node)) {
    return new Matrix(options);
  }

  if (Array.isArray(options.columnSpacing)) {
    throw (
      "Error: columnSpacing cannot be an array.\r\n" +
      "Note: From release 2.0.0 use property columnWidth instead of columnSpacing.\r\n" +
      "Please refere to the README or to https://github.com/yaronn/blessed-contrib/issues/39"
    );
  }

  if (!options.columnWidth) {
    throw "Error: A Matrix must get columnWidth as a property. Please refer to the README.";
  }

  options = options || {};
  options.columnSpacing = options.columnSpacing == null ? 10 : options.columnSpacing;
  options.bold = true;
  options.selectedFg = options.selectedFg || "white";
  options.selectedBg = options.selectedBg || "blue";
  options.fg = options.fg || "green";
  options.bg = options.bg || "";
  options.interactive = typeof options.interactive === "undefined" ? true : options.interactive;
  this.options = options;
  Box.call(this, options);
  this.matrix = [];
  this.currentLine = 0;
  this.currentRow = 0;

  this.key(["left"], function (ch, key) {
    this.currentRow = this.currentRow > 0 ? this.currentRow - 1 : this.currentRow;
    this.matrix[this.currentLine].children[this.currentRow].focus();
  });

  this.key(["right"], function (ch, key) {
    this.currentRow =
      this.currentRow < this.matrix[this.currentLine].children.length - 1
        ? this.currentRow + 1
        : this.matrix[this.currentLine].children.length - 1;
    this.matrix[this.currentLine].children[this.currentRow].focus();
  });

  this.key(["up"], function (ch, key) {
    this.currentLine = this.currentLine > 0 ? this.currentLine - 1 : this.currentLine;
    this.matrix[this.currentLine].children[this.currentRow].focus();
  });

  this.key(["down"], function (ch, key) {
    this.currentLine = this.currentLine < this.matrix.length - 1 ? this.currentLine + 1 : this.matrix.length - 1;
    this.matrix[this.currentLine].children[this.currentRow].focus();
  });

  this.on("attach", function () {
    if (self.options.data) {
      self.setData(self.options.data);
    }
  });
}

Matrix.prototype = Object.create(Box.prototype);

Matrix.prototype.render = function () {
  Box.prototype.render.call(this);
};

Matrix.prototype.setData = function (matrix) {
  var self = this;

  let box = Box({
    top: 0,
    left: 0,
    width: "100%",
    height: 1,
    content: "",
    style: {
      fg: self.options.selectedFg || "white",
      border: {
        fg: "#f0f0f0",
      },
      focus: {
        bg: self.options.selectedBg || "blue",
      },
    },
  });
  margin = 0;
  for (const [i, header] of matrix.headers.entries()) {
    let cell = Box({
      top: 0,
      left: margin + "%",
      width: matrix.colWidth[i] + "%",
      height: 1,
      content: header,
      style: {
        fg: self.options.selectedFg || "white",
        border: {
          fg: "#f0f0f0",
        },
        focus: {
          bg: self.options.selectedBg || "blue",
        },
      },
    });
    margin += matrix.colWidth[i];
    box.append(cell);
  }
  this.append(box);

  for (const [i, _] of matrix.data.entries()) {
    let box = Box({
      top: 1 + i,
      left: 0,
      width: "100%",
      height: 1,
      content: "",
      style: {
        fg: self.options.selectedFg || "white",
        border: {
          fg: "#f0f0f0",
        },
        focus: {
          bg: self.options.selectedBg || "blue",
        },
      },
    });
    margin = 0;
    for (const [j, entry] of matrix.data[i].entries()) {
      let cell = Box({
        top: 0,
        left: margin + "%",
        width: matrix.colWidth[j] + "%",
        height: 1,
        content: "" + entry,
        style: {
          fg: self.options.selectedFg || "white",
          border: {
            fg: "#f0f0f0",
          },
          focus: {
            bg: self.options.selectedBg || "blue",
          },
        },
      });
      cell.key(["left", "right", "up", "down"], function (ch, key) {
        self.emit("keypress", ch, key);
        self.emit("key " + key.full, ch, key);
      });

      margin += matrix.colWidth[j];
      box.append(cell);
    }
    this.matrix.push(box);
    this.append(box);
  }
};

Matrix.prototype.type = "matrix";

module.exports = Matrix;
