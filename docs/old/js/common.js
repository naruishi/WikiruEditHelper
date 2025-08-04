
/**
 * @typedef {Object} DropCondition
 * @property {string} keyword - ファイルに含まれる判別用のキーワード
 * @property {HTMLInputElement} textbox - 対応するテキストボックス要素
 */

/**
 * ドラッグ＆ドロップされたテキストファイルを、テキストボックスに振り分ける
 * @param {string} dropAreaId - ドロップエリアのID
 * @param {DropCondition[]} dropConditions - 検索する文字列と、振り分けられるテキストボックス
 */
function setupDropArea(dropAreaId, dropConditions) {
    const dropArea = document.getElementById(dropAreaId);
    const allowedFileTypes = ["text/plain", "text/csv"];

    dropArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropArea.style.backgroundColor = "#eee";
    });

    dropArea.addEventListener("dragleave", () => {
        dropArea.style.backgroundColor = "";
    });

    dropArea.addEventListener("drop", (event) => {
        event.preventDefault();
        dropArea.style.backgroundColor = "";

        const files = event.dataTransfer.files;

        Array.from(files).forEach(file => {
            if (allowedFileTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const text = e.target.result;
                    const lines = text.split(/\r?\n/);
					for (let i = 1; i < lines.length; i++) {
						for (const condition of dropConditions) {
							if (lines[i].includes(condition.keyword)) {
							condition.textbox.value = text;
							return;
							}
						}
					}
                };
                reader.readAsText(file);
            }
        });
    });
}
