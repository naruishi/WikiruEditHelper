"use strict";

// src/domain/wikiruToolkit.ts
function getNthValidLine(lines, lineNumber, offset) {
  let validLinesCount = 0;
  for (let i = lineNumber + 1; i < lines.length; i++) {
    if (lines[i].trim().startsWith("//")) {
      continue;
    }
    if (lines[i].trim() == "") {
      continue;
    }
    validLinesCount++;
    if (validLinesCount === offset) {
      return lines[i];
    }
  }
  return "";
}
function removeColor(article) {
  return article.replace(/&color\([^)]*\)\{([^}]*)\};/g, "$1");
}

// src/domain/extractUnitData/extractUnitData.ts
function extractUnitData(article, currentOutput = "", unitData, extractionConfig) {
  const articleLines = article.split("\n");
  let unit = unitData;
  extractFromArticle(articleLines, extractionConfig, unit);
  const newOutput = unit.toCsvRow();
  if (!currentOutput.includes(newOutput)) {
    return currentOutput + newOutput + "\n";
  } else {
    return currentOutput;
  }
}
function extractFromArticle(articleLines, config, unit) {
  for (let i = 0; i < articleLines.length; i++) {
    const line = articleLines[i];
    if (line.trim().startsWith("//")) continue;
    for (const item of config) {
      if (line.includes(item.match)) {
        let targetLine = getNthValidLine(articleLines, i, item.offset);
        if (targetLine) {
          targetLine = targetLine.replace(/(\|\>)+/g, "|");
          targetLine = targetLine.replace(/(\|~)+/g, "|");
          targetLine = targetLine.replace(/(\|\|)+/g, "|");
          const value = item.transform ? item.transform(targetLine) : targetLine;
          item.assign(unit, value);
        }
      }
    }
  }
}

// src/domain/extractUnitData/unitData/TaimaninUnitData.ts
var TaimaninUnitData = class {
  constructor() {
    this.name = "";
    this.element = "";
    this.rarity = "";
    this.gacha = "";
    this.hp = 0;
    this.sp = 0;
    this.atk = 0;
    this.def = 0;
    this.spd = 0;
    this.leaderSkill = "";
    this.skill1 = "";
    this.skill1Sp = 0;
    this.skill2 = "";
    this.skill2Sp = 0;
    this.secretTechnique = "";
    this.secretTechniqueSp = 0;
    this.ability1 = "";
    this.ability2 = "";
  }
  /**
   * @returns {string} アイコン画像列のテキスト
   */
  getIcon() {
    return `&ref(img/${this.name}_icon.png,80x80);`;
  }
  /**
   * @returns {string} |区切りのCSVテーブル行として出力
   */
  toCsvRow() {
    let result = `|[[SR/${this.name}]]|${this.leaderSkill}|${this.skill1}|${this.skill1Sp}|${this.skill2}|${this.skill2Sp}|${this.secretTechnique}|${this.secretTechniqueSp}|${this.ability1}|${this.ability2}|`;
    result = removeColor(result);
    result = result.replaceAll(" ", "");
    result = result.replaceAll("\uFF05", "%");
    result = result.replaceAll("\u3001&br;", "\u3001");
    result = result.replaceAll("\u30BF\u30FC\u30F3&br;", "\u30BF\u30FC\u30F3");
    return result;
  }
};
var TaimaninExtractionConfig = [
  {
    // ユニット名
    match: "\u57FA\u672C\u60C5\u5831",
    offset: 2,
    transform: (line) => {
      return line;
    },
    assign: (unit, line) => {
      const cols = line.split("|");
      let unitNameColumn = cols[1]?.trim() || "";
      unitNameColumn = unitNameColumn.replaceAll(/&ruby\([^)]*\)\{/g, "");
      unitNameColumn = unitNameColumn.replaceAll("};", "");
      unitNameColumn = unitNameColumn.replaceAll("~", "");
      unitNameColumn = unitNameColumn.replaceAll("\u3000", "");
      unit.name = unitNameColumn;
    }
  },
  {
    // レアリティ
    match: "\u57FA\u672C\u60C5\u5831",
    offset: 3,
    transform: (line) => {
      return line;
    },
    assign: (unit, line) => {
      const cols = line.split("|");
      const rarityCulumn = cols[3]?.trim() || "";
      unit.rarity = rarityCulumn;
    }
  },
  {
    // 属性
    match: "\u57FA\u672C\u60C5\u5831",
    offset: 4,
    transform: (line) => {
      return line;
    },
    assign: (unit, line) => {
      const cols = line.split("|");
      const elementColumn = cols[2]?.trim() || "";
      unit.element = elementColumn;
    }
  },
  {
    // HP|SP|ATK|DEF
    match: "~Lv|~HP",
    offset: 4,
    transform: (line) => {
      return line;
    },
    assign: (unit, line) => {
      const cols = line.split("|");
      unit.hp = parseInt(cols[3]?.trim(), 10) || 0;
      unit.sp = parseInt(cols[4]?.trim(), 10) || 0;
      unit.atk = parseInt(cols[5]?.trim(), 10) || 0;
      unit.def = parseInt(cols[6]?.trim(), 10) || 0;
    }
  },
  {
    // リーダースキル
    match: "|~\u30B9\u30AD\u30EB|h",
    offset: 3,
    transform: (line) => {
      return line;
    },
    assign: (unit, line) => {
      const cols = line.split("|");
      let leaderSkill = cols[3].trim() || "";
      unit.leaderSkill = leaderSkill;
    }
  },
  {
    //スキル1SP
    match: "|~\u30B9\u30AD\u30EB|h",
    offset: 4,
    transform: (line) => {
      return line;
    },
    assign: (unit, line) => {
      const cols = line.split("|");
      unit.skill1Sp = parseInt(cols[4]?.trim(), 10) || 0;
    }
  },
  {
    //スキル1
    match: "|~\u30B9\u30AD\u30EB|h",
    offset: 5,
    transform: (line) => {
      return line;
    },
    assign: (unit, line) => {
      const cols = line.split("|");
      let skill1 = cols[1].trim() || "";
      unit.skill1 = skill1;
    }
  },
  {
    //スキル2SP
    match: "|~\u30B9\u30AD\u30EB|h",
    offset: 6,
    transform: (line) => {
      return line;
    },
    assign: (unit, line) => {
      const cols = line.split("|");
      unit.skill2Sp = parseInt(cols[3]?.trim(), 10) || 0;
    }
  },
  {
    //スキル2
    match: "|~\u30B9\u30AD\u30EB|h",
    offset: 7,
    transform: (line) => {
      return line;
    },
    assign: (unit, line) => {
      const cols = line.split("|");
      let skill1 = cols[1].trim() || "";
      unit.skill2 = skill1;
    }
  },
  {
    //奥義SP
    match: "|~\u30B9\u30AD\u30EB|h",
    offset: 8,
    transform: (line) => {
      return line;
    },
    assign: (unit, line) => {
      const cols = line.split("|");
      unit.secretTechniqueSp = parseInt(cols[4]?.trim(), 10) || 0;
    }
  },
  {
    //奥義
    match: "|~\u30B9\u30AD\u30EB|h",
    offset: 9,
    transform: (line) => {
      return line;
    },
    assign: (unit, line) => {
      const cols = line.split("|");
      let skill1 = cols[1].trim() || "";
      unit.secretTechnique = skill1;
    }
  },
  {
    //アビリティ1
    match: "|~\u30A2\u30D3\u30EA\u30C6\u30A3|h",
    offset: 4,
    transform: (line) => {
      return line;
    },
    assign: (unit, line) => {
      const cols = line.split("|");
      if (cols.length >= 2) {
        let skill1 = cols[2].trim() || "";
        unit.ability1 = skill1;
      }
    }
  },
  {
    //アビリティ2
    match: "|~\u30A2\u30D3\u30EA\u30C6\u30A3|h",
    offset: 7,
    transform: (line) => {
      return line;
    },
    assign: (unit, line) => {
      const cols = line.split("|");
      if (cols.length >= 2) {
        let skill1 = cols[2].trim() || "";
        unit.ability2 = skill1;
      }
    }
  }
];

// src/domain/wikiUrl/TaimaninWikiUrl.ts
var TaimaninWikiUrl = class {
  constructor() {
    this.homeUrl = "https://taimanin-rpg.wikiru.jp/?";
    this.editPage = "cmd=edit&page=";
    this.skillAbilityPage = "\u7DF4\u7FD2\u7528\u304A\u7802\u5834";
    this.skillAbilitySsrList = "SandBox/\u30AD\u30E3\u30E9\u6027\u80FD\u30C6\u30FC\u30D6\u30EB";
    this.skillAbilitySrList = "SandBox/\u30AD\u30E3\u30E9\u6027\u80FD\u30C6\u30FC\u30D6\u30EB\u914D\u5E03SR";
    this.characterList = "\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u4E00\u89A7";
  }
  /**
   * https://tonofura.wikiru.jp/?スキル効果別一覧
   */
  getSkillAbilityPage() {
    return this.homeUrl + this.skillAbilityPage;
  }
  /**
   * https://tonofura.wikiru.jp/?cmd=edit&page=テーブル/スキル・アビリティ/SSR
   */
  getSkillAbilitySsrList() {
    return this.homeUrl + this.editPage + this.skillAbilitySsrList;
  }
  /**
   * https://tonofura.wikiru.jp/?cmd=edit&page=テーブル/スキル・アビリティ/SR
   */
  getSkillAbilitySrList() {
    return this.homeUrl + this.editPage + this.skillAbilitySrList;
  }
  /**
   * https://tonofura.wikiru.jp/?キャラクター一覧
   */
  getCharacterList() {
    return this.homeUrl + this.characterList;
  }
};

// src/pages/taimanin/skillAbilityTable/extractUnitData.ts
var dropArea = document.getElementById("dropArea");
if (!(dropArea instanceof HTMLElement)) {
  throw new Error(`Drop area with ID 'dropArea' not found.`);
}
var inputField = document.getElementById("inputField");
if (!inputField) {
  throw new Error(`textarea with ID 'inputField' not found.`);
}
var outputField = document.getElementById("outputField");
if (!outputField) {
  throw new Error(`textarea with ID 'outputField' not found.`);
}
var iClearButton = document.getElementById("iClearButton");
if (!(iClearButton instanceof HTMLElement)) {
  throw new Error(`Drop area with ID 'iClearButton' not found.`);
}
var oClearButton = document.getElementById("oClearButton");
if (!(oClearButton instanceof HTMLElement)) {
  throw new Error(`Drop area with ID 'oClearButton' not found.`);
}
dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.style.backgroundColor = "#f0f0f0";
});
dropArea.addEventListener("dragleave", () => {
  dropArea.style.backgroundColor = "";
});
dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  dropArea.style.backgroundColor = "";
  if (!(event instanceof DragEvent) || !event.dataTransfer) {
    throw new Error("Unexpected event or missing dataTransfer");
  }
  const files = event.dataTransfer.files;
  if (files.length > 0 && files[0].type === "text/plain") {
    const reader = new FileReader();
    reader.onload = function(e) {
      const target = e.target;
      if (!target) {
        throw new Error("e.target\u304C\u306A\u3044\u3088");
      }
      const result = target.result;
      if (typeof result !== "string") {
        throw new Error("\u8AAD\u307F\u8FBC\u3093\u3060\u7D50\u679C\u304C\u6587\u5B57\u5217\u3058\u3083\u306A\u3044\u3088");
      }
      inputField.value = result;
      const currentOutput = outputField.value;
      outputField.value = extractUnitData(inputField.value, currentOutput, new TaimaninUnitData(), TaimaninExtractionConfig);
    };
    reader.readAsText(files[0], "UTF-8");
  } else {
    alert("\u30D7\u30EC\u30FC\u30F3\u30C6\u30AD\u30B9\u30C8 (.txt) \u30D5\u30A1\u30A4\u30EB\u3092\u30C9\u30ED\u30C3\u30D7\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
  }
});
var url = new TaimaninWikiUrl();
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("openPage1");
  if (button) {
    button.addEventListener("click", openPage1);
  }
});
function openPage1() {
  window.open(url.getCharacterList(), "_blank");
}
var timer;
inputField.addEventListener("input", function() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const currentOutput = outputField.value;
    outputField.value = extractUnitData(this.value, currentOutput, new TaimaninUnitData(), TaimaninExtractionConfig);
  }, 200);
});
iClearButton.addEventListener("click", function() {
  inputField.value = "";
});
oClearButton.addEventListener("click", function() {
  outputField.value = "";
});
//# sourceMappingURL=extractUnitData.js.map