
/**
 * #region～#endregionまでを削除
 * @param {string} source - wikiのソース
 * @returns {string} 変換されたソース
 */
function removeRegionBlock(source) {
    return source.replace(/#region[\s\S]*?#endregion/g, '');
}

/**
 * #flex(flex-start){{ ～ }} までを削除
 * @param {string} source - wikiのソース
 * @returns {string} 変換されたソース
 */
function removeFlexBlock(source) {
    return source.replace(/#flex\(flex-start\)\{\{[\s\S]*?\}\}/g, '');
}


/**
 * wikiのincludex関数行から、filter=の内容を抽出
 * @param {string} articleLine - 記事中の一行
 * @param {string} objectPageName - 正規表現でフィルターをかける対象ページ名('テーブル/スキル・アビリティ/SSR'など) 
 * @returns {string} filter=の内容
 */
function extractFilterRegex(articleLine, objectPageName) {
	const pattern = /filter=([^,]+)/;
	return extractRegex(articleLine, objectPageName, pattern);
}

/**
 * wikiのincludex関数行から、except=の内容を抽出
 * @param {string} articleLine - wikiソース中の一行のテキスト
 * @param {string} objectPageName - includex関数の対象であるページ名
 * @returns {string} except=の内容
 */
function extractExceptRegex(articleLine, objectPageName) {
	const pattern = /except=([^,]+)/;
	return extractRegex(articleLine, objectPageName, pattern);
}

/**
 * extractFilterRegex/extractExceptRegexの処理実内容
 * @param {string} articleLine - wikiソース中の一行のテキスト
 * @param {string} objectPageName - includex関数の対象であるページ名
 * @param {RegExp} pattern - 正規表現
 * @returns {string} filter=/except=の内容
*/
function extractRegex(articleLine, objectPageName, pattern) {
    const isRegexLine = articleLine.includes(`#includex(${objectPageName}`); // `filter=` の部分を抽出
    if (!isRegexLine) return null;

	// 除外パターンは正規表現で置換
	const match = articleLine.match(pattern);
	let result = match ? match[1] : null;
	if (result){
		//日本語一文字を{3}と表すのはwikiruの仕様であり、JavaScriptでは{1}なので修正する
		result = result.replace(/\.\{3\}/g, ".{1}");
		// ]{3}
		result = result.replace(/\]\{3\}/g, "]{1}");
	}

	console.log(pattern + " : " + result);
	return result;
}

/**
 * contentsに相当する目次リンクを手動で作成する。
 * @param {string} articleLines - wikiのソース
 * @param {string} pageName - wikiのページ名
 * @param {number} indent - 抽出する見出しの深さ(1-3)
 * @returns {string} 
 */
 function createContentsLink(articleLines, pageName, indent) {

	const starsIndex = 1;
	const headerIndex = 2;
	const idIndex = 3;

	const indexText = articleLines.split("\n")
		.filter(line => /^\*{1,3}.*\[#\w+\]/.test(line)) // フィルタリング
		.map(line => {
			// wikiruの見出し型式をマッチング
			const match = line.match(/^(\*{1,3})(.*)\[#(\w+)\]/);
			if (!match) return line;

			const hyphens = match[starsIndex].replace(/\*/g, "-");
			const headerText = match[headerIndex].trim();
			const id = match[idIndex];

			// 設定より深いインデントは捨てる
			if (indent == 1){
				if (hyphens == '---' || hyphens == '--'){
					return '';
				}
			}else if (indent == 2){
				if (hyphens == '---' ){
					return '';
				}
			}
			return `${hyphens}[[${headerText}>${pageName}#${id}]]`;
		})
		.join("\n");

	// 空行を削除
	const lines = indexText.split("\n"); // 改行で分割
	const filteredLines = lines.filter(line => line.trim() !== ""); // 空行を除去
	const result = filteredLines.join("\n"); // 再び結合

	return result;
}

/**
 * |で区切られたテキストに文字列を挿入
 * @param {string} inputText - |で区切られたテキスト(複数行可)
 * @param {number} columnIndex - 追記する列の番号
 * @param {string} insertWord - 追記する文字列
 * @returns {string} 変換されたテキスト
 */
function appendTextToColumn(inputText, columnIndex, insertWord) {
    const lines = inputText.split("\n"); // 各行を分割
    
    const modifiedLines = lines.map(line => {
        const parts = line.split("|");
        if (parts.length > columnIndex + 1) {
            parts[columnIndex] = parts[columnIndex] + `${insertWord}`;
        }
        return parts.join("|");
    });

    return modifiedLines.join("\n");
}

/**
 * |で区切られたテーブルに文字列を挿入
 * @param {string} table - |で区切られたcsv
 * @param {number} searchColumnIndex - 検索する列の番号
 * @param {string} searchWords - 検索する文字列(改行区切り)
 * @param {number} appendColumnIndex - 追記する列の番号
 * @param {string} appendWord - 追記する文字列
 * @returns {string} 変換されたcsv
 */
function appendTextToTable(table, searchColumnIndex, searchWords, appendColumnIndex, appendWord) {

	const rows = table.split("\n");
	const result = rows.map(row => {
		const columns = row.split("|");
		if (columns.length > appendColumnIndex + 1){
			const searchColumn = columns[searchColumnIndex];
			if (searchWords.some(searchWord => searchColumn.includes(searchWord))) {
					columns[appendColumnIndex] = columns[appendColumnIndex] + appendWord;
			}
		}				
		return columns.join("|");
	});

	return result.join("\n");
}

/**
 * 指定した行からn行先の内容を返す(|>と|~は取り除く)
 * @param {string} lines - 改行区切りのテキスト
 * @param {number} lineNumber - 指定行番号
 * @param {number} offset - n行先
 * @returns {string} 戻り値
 */
function getNthValidLine(lines, lineNumber, offset) {
	let validLinesCount = 0;
	for (let i = lineNumber + 1; i < lines.length; i++) {
		// コメント行をスキップ
		if (lines[i].trim().startsWith("//")) {
			continue;
		}
		// 空行をスキップ
		if (lines[i].trim() == '') {
			continue;
		}
		validLinesCount++;
		if (validLinesCount === offset) {
			// |>と|~は取り除く
			return lines[i];//.replace(/(\|~|\|>)/g, "");
		}
	}
	return null; // n行先が見つからない場合
}

/**
 * wikiソースからcolorタグを削除
 * @param {string} article - wikiソース
 * @returns {string} colorタグが除去されたソース
 */
function removeColor(article){
	return article.replace(/&color\([^)]*\)\{([^}]*)\};/g, "$1");
}

// Jestでのテストのためのexport(ES modulesでは動作しない)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
	createContentsLink,
	removeRegionBlock,
	removeFlexBlock,
	createFlexBlock,
	extractFilterRegex,
	extractExceptRegex,
	createContentsLink,
	appendTextToColumn,
	appendTextToTable,
	getNthValidLine,
	removeColor
   };
}