"use strict";

function e(lines) {
  return lines
    .split("\n")
    .map((line) => {
      const cells = line.split("|");
      const attack = parseFloat(cells[7]);

      for (let i = 5; i < cells.length; i++) {
        cells[i] = cells[i].replace(/(?<!スキル)威力:(\d+)%/g, (_, percent) => {
          const value = ((attack * parseFloat(percent)) / 100).toFixed(2);
          return `威力:${percent}%(${Math.round(value)})`;
        });
      }
      for (let i = 5; i < cells.length; i++) {
        cells[i] = cells[i].replace(/(?<!スキル)威力(\d+)%/g, (_, percent) => {
          const value = ((attack * parseFloat(percent)) / 100).toFixed(2);
          return `威力:${percent}%(${Math.round(value)})`;
        });
      }
      return cells.join("|");
    })
    .join("\n");
}

var n = document.getElementById("inputText");
if (!n) throw new Error("textarea with ID 'inputA' not found.");
var r = document.getElementById("outputText");
if (!r) throw new Error("textarea with ID 'inputA' not found.");
document.addEventListener("DOMContentLoaded", () => {
  let t = document.getElementById("execute");
  t && t.addEventListener("click", i);
});
function i() {
  r.value = e(n.value);
}
