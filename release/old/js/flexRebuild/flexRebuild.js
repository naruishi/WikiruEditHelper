
/**
 * 記事中の特定の行に挿入する内容を管理
 */
class InsertTarget {
	constructor(lineNumber) {
		this.lineNumber = lineNumber;
		this.unitNames = [];
		this.iconLimitExceeded = false;
		this.commentBlock = '';
	}

	addUnit(unitName) {
		this.unitNames.push(unitName);
	}

	appendComment(comment) {
		this.commentBlock += comment;
	}

	toFlexBlock(withComment) {
		return createFlexBlock(
			this.unitNames.join("\n"),
			this.iconLimitExceeded,
			withComment ? this.commentBlock : null
		);
	}
	debugLog() {
		console.log(`▼ InsertTarget (line: ${this.lineNumber})`);
		console.log(`  Units (${this.unitNames.length}):`);
		this.unitNames.forEach((name, i) => {
			console.log(`    [${i + 1}] ${name}`);
		});

		if (this.commentBlock.trim()) {
			console.log(`  Comments:`);
			console.log(this.commentBlock.trim().split('\n').map(c => `    - ${c}`).join('\n'));
		}

		console.log(`  Icon Limit Exceeded: ${this.iconLimitExceeded}`);
	}
}

/**
 * 記事に挿入する内容全てを管理
 */
class InsertTargetManager {
	constructor() {
		this.targets = new Map();
	}

	get(lineNumber) {
		return this.targets.get(lineNumber);
	}

	add(lineNumber, target) {
		this.targets.set(lineNumber, target);
	}

	has(lineNumber) {
		return this.targets.has(lineNumber);
	}

	values() {
		return Array.from(this.targets.values());
	}
}

/**
 * wikiruのスキル効果別一覧の各ページから、スキル・アビリティSSR or SRのユニット名を抽出し、flex関数を挿入
 * @param {string} skillAbilityArticle - スキル効果別一覧のいずれかの記事
 * @param {string} skillAbilityTable - スキル・アビリティ一覧(SSR or SR)のwikiソース
 * @param {string} pageName - includexの対象ページ名
 * @param {number} maxOutput - 作成するアイコンの上限
 * @param {bool} isOutputComment - 各項目にコメントを添付するか
 * @returns {string} - 加工後の記事
 */
function insertSkillAbilityFlexBlock(skillAbilityArticle, skillAbilityTable, pageName, maxOutput, isOutputComment) {
	const articleLines = skillAbilityArticle.split("\n");
	const patternPairs = extractPatternPairs(articleLines, pageName);
	const skillAbilityLines = skillAbilityTable.split("\n");

	const insertTargetManager = getInsertTargets(skillAbilityLines, patternPairs, maxOutput);
	const outputLines = insertFlex(articleLines, patternPairs, insertTargetManager, isOutputComment);

	return outputLines.map(line => line.trim()).join("\n");
}

/**
 * 記事中の正規表現を行番号単位でクラス化
 */
class PatternPair {
	constructor(articleLineNumber) {
		this.articleLineNumber = articleLineNumber;
		this.filter = null;
		this.except = null;
	}
}

/**
 * 正規表現を抽出
 * @param {string[]} sourceLines - 記事の行の配列
 * @param {string} objectPageName - 正規表現でフィルターをかける対象ページ名('テーブル/スキル・アビリティ/SSR'など) 
 * @returns filterとexceptの中身
 */
function extractPatternPairs(sourceLines, objectPageName) {
	const patternMap = new Map();

	sourceLines.forEach((line, i) => {
		const filter = extractFilterRegex(line, objectPageName);	// 戻り値はstring
		const except = extractExceptRegex(line, objectPageName);

		if (filter || except) {
			if (!patternMap.has(i)) {
				// 行番号をキーにして正規表現格納オブジェクトを生成
				patternMap.set(i, new PatternPair(i));
			}
			const pair = patternMap.get(i);
			if (filter) {
				pair.filter = new RegExp(removeSystemLineRegex(filter));
				console.log("pair.filter:" + pair.filter);
			}
			if (except) pair.except = new RegExp(except);
		}
	});

	return [...patternMap.values()];
}

/**
 * wikiの表示に使用する正規表現を除去する
 * @param {string} filter - includex関数のFilterの中身 
 * @returns wikiの表示に使用する正規表現を除去した残りの正規表現
 */
function removeSystemLineRegex(filter){
	// new RegExp(`^#sort|\\|h$|\\|f$|\\|c$|^}}`, "m");
	result = filter.replace("^#sort|\|h$|\|f$|\|c$|","");
	result = result.replace(`^#sort|\\|h$|\\|f$|\\|c$|`,"");
	result = result.replace("|^}}","");
	console.log("removeSystemLineRegex:" + result);
	return result;
}

/**
 * flex関数に使うアイコン画像名のリストを取得
 * @param {string} skillAbilityLines - スキル・アビリティ一覧
 * @param {string} matchPatterns - 記事の行番号, 正規表現の配列
 * @param {string} exceptPatterns - 記事の行番号, 除外条件の配列
 * @param {number} maxOutput - 取得→出力する項目数の上限
 * @returns {InsertTargetManager} - 
 */
function getInsertTargets(skillAbilityLines, patternPairs, maxOutput) {
	const manager = new InsertTargetManager();

	for (const pair of patternPairs) {
		const { articleLineNumber, filter, except } = pair;
		if (!filter) continue;  // フィルターが無いものはスキップ

		const target = new InsertTarget(articleLineNumber);
		let outputCount = 0;

		for (const line of skillAbilityLines) {
			if (isOverOutputLimit(outputCount, maxOutput)) {
				target.iconLimitExceeded = true;
				break;
			}

			const result = processSkillAbilityLine(line, filter, except ? { except } : null);
			if (!result) continue;

			target.addUnit(result.unitName);
			target.appendComment(result.comment);
			outputCount++;
		}
		target.debugLog();
		manager.add(articleLineNumber, target);
	}

	return manager;
}

/**
 * 出力数が上限を超えているか判定
 * @param {number} current
 * @param {number} max
 * @returns {boolean}
 */
function isOverOutputLimit(current, max) {
    return current > max;
}

/**
 * 1行のデータが条件に合致するか判定し、必要ならユニット名とコメントを返す
 * @param {string} skillAbilityLine
 * @param {RegExp} filter
 * @param {object|null} exceptPattern
 * @returns {{unitName: string, comment: string}|null}
 */
function processSkillAbilityLine(skillAbilityLine, filter, exceptPattern) {
    const systemRows = new RegExp(`^#sort|\\|h$|\\|f$|\\|c$|^}}`, "m");
    if (skillAbilityLine.match(systemRows)) return null;
    if (matchedExceptPatterns(exceptPattern, skillAbilityLine)) return null;
    if (!filter.test(skillAbilityLine)) return null;

    const unitName = extractUnitName(skillAbilityLine, unitNameColumnIndex);
    const comment = getComment(skillAbilityLine, filter);
    return { unitName, comment };
}

/**
 * スキル・アビリティの効果量を抽出する
 * @param {string} skillAbilityLine
 * @param {RegExp} filter
 */
function getComment(skillAbilityLine, filter){
	let result = "";
	console.log("getComment()");
	const matchedText = skillAbilityLine.match(filter);
	console.log("matchedText[0]: " + matchedText[0]);

	let columnIndex = getColumnIndexFromRegExp(filter);
	const pureRegExp = new RegExp(getPureRegExp(filter));
	const skillAbilityColumns = skillAbilityLine.split('|');
	let match;

	// マッチング対象の列が指定されている時
	if (columnIndex){
		// skillAbilityLine.split('|')で区切った配列の、上の[0-9]+番目の列を取り出す
		match = skillAbilityColumns[columnIndex].match(pureRegExp);
		console.log("skillAbilityColumns[columnIndex]:" + skillAbilityColumns[columnIndex]);
		console.log("match:" + match);
		if (match){
			console.log("match[0]:" + match[0]);
			// 数字%を抽出
			result = Array.from(match[0].matchAll(/([0-9]+～)?[0-9]+%/g), m => m[0]);
		}
		if (result == ""){
			// 数字のみを抽出
			result = Array.from(match[0].matchAll(/[0-9]+/g), m => m[0]);
		}
	// 全ての列からマッチングする時
	}else {
		// pureRegExpにマッチングする文字列を、skillAbilityColumnsを走査して探す
		match = skillAbilityColumns.map(column => {
			const match = column.match(pureRegExp);
			return match ? match[0] : null;
		}).filter(Boolean);
		console.log("match:" + match);
		if (match){
			console.log("match[0]:" + match[0]);
			// 数字%を抽出
			result = Array.from(match[0].matchAll(/([0-9]+～)?[0-9]+%/g), m => m[0]);
		}
		if (result == ""){
			// 数字のみを抽出
			result = Array.from(match[0].matchAll(/[0-9]+/g), m => m[0]);
		}
	}

	// ユニット単位で追記する
	return result + '\n';
}

/**
 * 与えられた RegExp ソース文字列から、列の指定するための部分を除いた正規表現を返す
 * @param {RegExp} originalRegex - 元の正規表現オブジェクト
 * @returns {string} - 正規表現
 */
function getPureRegExp(originalRegex){
	const originalSource = originalRegex.source;
	result = originalSource.replace(`^(?:[^|]*\\|){`, ''); // \d+\}
	result = result.replace(/^([0-9]+)/, '');
	result = result.replace(`}[^|]*`, '');
	result = result.replace(`[^|]*(?=\\|)`, '');
	console.log("getPureRegExp:" + result);
	return result;
}

/**
 * 与えられた RegExp ソース文字列から、列の指定を取り出す
 * @param {RegExp} originalRegex - 元の正規表現オブジェクト
 * @returns {number} - 列番号
 */
function getColumnIndexFromRegExp(originalRegex) {
	const originalSource = originalRegex.source;
	const columnIndex = getColumnIndex(originalSource);
	console.log("columnIndex:" + columnIndex);
	if (parseInt(columnIndex) > 0){
		return columnIndex;
	}
	return null;
}

/**
 * 正規表現の対象である列番号を取得
 */
function getColumnIndex(originalSource){
	//let cleanedSource = originalSource.replace(/^\^\(\?:\[\^\|]\*\|\)\{/, ''); // \d+\}
	let cleanedSource = originalSource.replace(`^(?:[^|]*\\|){`, ''); // \d+\}
	const columnIndex = cleanedSource.replace(/^([0-9]+).*/, '$1');
	return columnIndex;
}

/**
 * ユニットデータが除外条件にマッチするか
 * @param {string} exceptPattern - 除外条件
 * @param {string} skillAbilityLine - スキル・アビリティ一覧のユニットデータ行
 * @returns マッチしたらtrue
*/
function matchedExceptPatterns(exceptPattern, skillAbilityLine){
	if (exceptPattern){
		console.log("除外：" + exceptPattern.except);

		// unitDataがexceptPatternにマッチする場合はスキップ
		if (exceptPattern.except.test(skillAbilityLine)) {
			return true;
		}
	}
	return false;
}

/**
 * flex関数ブロック挿入の実処理
 * @param {string} sourceLines - 元の記事
 * @param {[]} matchPatterns - ソースの行番号, 正規表現
 * @param {InsertTargetManager} manager 
 * @param {bool} withComment - コメントを出力するか
* @returns {string} 加工後の記事
 */
function insertFlex(sourceLines, patternPairs, manager, withComment) {
	const outputLines = [...sourceLines];

	for (const pair of patternPairs) {
		const { articleLineNumber } = pair;
		const target = manager.get(articleLineNumber);
		if (!target || target.unitNames.length === 0) continue;

		const insertText = "\n" + target.toFlexBlock(withComment);

		let insertIndex = -1;
		// includexをregionで閉じていないと機能しない
		while (articleLineNumber > 0 && !outputLines[articleLineNumber + insertIndex].includes(`#region`)) {
			insertIndex--;
		}

		outputLines[articleLineNumber + insertIndex - 1] += insertText;
	}

	return outputLines;
}

// Jestでのテストのためのexport(ES modulesでは動作しない)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    InsertTarget,
    InsertTargetManager,
    PatternPair,
    insertSkillAbilityFlexBlock,
    extractPatternPairs,
    removeSystemLineRegex,
    getInsertTargets,
    isOverOutputLimit,
    extractUnitName,
    processSkillAbilityLine,
    getComment,
    matchedExceptPatterns,
    insertFlex,
	getColumnIndexFromRegExp,
	getPureRegExp

   };
}