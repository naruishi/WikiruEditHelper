
/**
 * キャラクター詳細ページのソースから性能データを抽出して表型式に変換する
 * @param {string} article - wikiの記事
* @param {string} currentOutput - 現在の出力ボックスの内容(これに結果を追記する)
 * @returns {string} |区切りのCSV行テキスト
 */
function extractUnitData(article, currentOutput = "") {
	const articleLines = article.split("\n");
	let unit = new UnitData();
	extractFromArticle(articleLines, extractionConfig, unit);
	const newOutput = unit.toCsvRow();
	// 新たな行として追加
	if (!currentOutput.includes(newOutput)) {
		return currentOutput + newOutput + "\n";
	} else {
		return currentOutput; // 重複していたら追加しない
	}
}

/**
 * 記事からデータを抽出してクラスに格納する
 * @param {string} articleLines - キャラ性能詳細ページ
 * @param {object} config - 情報の抽出と格納の定義(extractionConfig)
 * @param {UnitData} unit - データの格納先
*/
function extractFromArticle(articleLines, config, unit) {
	for (let i = 0; i < articleLines.length; i++) {
		const line = articleLines[i];
		if (line.trim().startsWith("//")) continue;

		for (const item of config) {
			if (line.includes(item.match)) {
				let targetLine = getNthValidLine(articleLines, i, item.offset);
				if (targetLine) {
                    // |>| |~| ||の列を取り除く(|に置換)
                    targetLine = targetLine.replace(/(\|\>)+/g, '|')
                    targetLine = targetLine.replace(/(\|~)+/g, '|');
                    targetLine = targetLine.replace(/(\|\|)+/g, '|');
					const value = item.transform
						? item.transform(targetLine)
						: targetLine;
					item.assign(unit, value);
				}
			}
		}
	}
}

// Jestでのテストのためのexport(ES modulesでは動作しない)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    extractUnitData,
    extractFromArticle
  }
};



