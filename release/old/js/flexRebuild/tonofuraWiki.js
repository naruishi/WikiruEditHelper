/**
 * Tonofurawiki用のユーティリティ関数
 */

/**
 * 改行で区切られたアイコン画像名のリストを受け取り、flex関数を生成
 * @param {string} input - ページ名兼アイコン画像名(_icon.pngを除いた部分)を改行区切りで列挙したテキスト
 * @param {number} iconLimit - 作成するアイコン数の上限
 * @param {string} comments - 各項目のコメントを改行区切りで列挙したテキスト
 * @returns {string} flex関数ブロック
 */
function createFlexBlock(input , iconLimit, comments) {
	// 改行で分割し、各行の先頭と末尾の空白・タブを除去、さらにwiki内リンクを除去
	const unitNames = input.split(/\r?\n/).map(line => line.trim().replace(/\[|\]/g, ""));
	const comment = comments ? comments.split('\n') : null;	

	// テンプレート適用
	let output = '#flex(flex-start){{\n';
	unitNames.forEach((unitName, index) => {
		const color = getUnitColor(unitName);
		let backGroundColor;
		if (color){
			backGroundColor = "BGCOLOR(#" + color + "):"
		}else {
			backGroundColor = "";
		}
		output += `#-\n|${backGroundColor}[[&ref(img/${unitName}_icon.png,80x80);>${unitName}]]|\n`;

		if (comment){
			if (comment[index]) {
				output += '|' + comment[index] + `|\n`;
			}
		}
	});
	// 30件以上なら後略
	if (iconLimit){
		output += '#-\n|etc|\n';
	}
	output += '}}';

	return output;
}

// グローバル変数として設定したい
const unitNameColumnIndex = 2;

/**
 * 1行のスキル・アビリティデータからユニット名を抽出
 * @param {string} skillAbilityLine
 * @param {number} unitNameColumnIndex
 * @returns {string|null}
 */
function extractUnitName(skillAbilityLine, unitNameColumnIndex = 2) {
    const columns = skillAbilityLine.split("|");
    return columns.length > unitNameColumnIndex ? columns[unitNameColumnIndex] : null;
}



/**
 * とのフラwikiのURL
 */
class wikiUrl {
    constructor(){

        this.homeUrl = "https://tonofura.wikiru.jp/?";
        this.editPage = "cmd=edit&page=";
        this.skillAbilityPage = "スキル効果別一覧";
        this.skillAbilitySsrList = "テーブル/スキル・アビリティ/SSR";
        this.skillAbilitySrList = "テーブル/スキル・アビリティ/SR";
        this.characterList = "キャラクター一覧";
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
    getCharacterList(){
        return this.homeUrl + this.characterList;
    }
}

/** 
 * スキル・アビリティ一覧から正規表現に該当するユニット名を抽出する(extractUnitNames.html用)
 * @param {string} article - スキル・アビリティ一覧のwikiruソース
 * @param {string} regexPattern - 正規表現
 * @returns {string} 改行で区切られた[[ユニット名]]のリスト
*/
 function extractUnitNames(article, regexPattern ) {

	    // 正規表現を作成
	    const regex = new RegExp(regexPattern);

	    // 各行を処理
	    const articleLines = article.split("\n");
	    let results = [];

	    articleLines.forEach(line => {
	        const columns = line.split("|"); // CSV形式を分割

	        if (columns.length >= 3 && regex.test(line)) { // マッチした場合
	            results.push(columns[2]); // 3番目の列を取得
	        }
	    });

	    return results.join("\n");
	}

/** 
 * ユニット名から属性のwikiru用カラーコードを取得
 * @param {string} line - ユニット名
 * @returns {string} wiki用の16進数カラーコード。既に色が設定されていたらundefinedを返す
 * */ 
function getUnitColor(line){
    // すでに `|BGCOLOR` で始まっていないか確認
    if (line.startsWith("|BGCOLOR")) {
        return undefined;
    }
    
    const regex = /(.*?)［(.*?)］/; // `>` と `［の内容を取得
    const match = line.match(regex);
    let result;

    if (match) {
        const characterName = match[1]; // `［ ］` 内の文字を取得
        const unitName = match[2];
        
        switch (characterName) {
            case "テルティア":
                switch (unitName){
                case "理解求む夢":
                    result = "F8C7C7";
                    break;
                case "叡理欲す意象":
                    result = "FEE3C1";
                    break;
                case "愛に揺れる想片":
                    result = "CDEFC0";
                    break;
                }
            break;

            // 火
            case "亜紗花":
            case "アサカ":
            case "旺華":
            case "ヴィー":
            case "空狐":
            case "ロゼット":
            case "莉瀬":
            case "キリエ":
            case "マリナ":
            case "イリア":
            case "アーデル":
            case "孫権":
            case "カスミ":
            case "椿":
            case "リーゼロッテ":
                result = "F8C7C7";
                break;

            // 水 
            case "ブリジット":
            case "イリーナ":
            case "リディア":
            case "シルヴィ":
            case "エーリカ":
            case "ソーカ":
            case "ユイ":
            case "紫陽花":
            case "メチル":
            case "詩乃":
            case "紅葉":
            case "ジャンヌ":
                result = "BFD6F6";
                break;

            // 風
            case "ダナ":
            case "ホリィ":
            case "ミルヴァ":
            case "ベアトリーサ":
            case "クィンシー":
            case "アルマ":
            case "ラズルーカ":
            case "ざくろ":
            case "ゼロ":
            case "ギンバネ":
            case "サクラ":
            case "ユエ":
            case "雛":
            case "沙耶":
                result = "CDEFC0";
                break;

            // 雷
            case "エデルガルド":
            case "リン":
            case "ゼノ":
            case "ミリアム":
            case "パトリシア":
            case "ルイーズ":
            case "サーシャ":
            case "茉莉":
            case "ソファス":
            case "項羽":
            case "久遠":
            case "アリス":
                result = "FEE3C1";
                break;

            // 光
            case "カティア":
            case "ジゼル":
            case "芳乃":
            case "マルタ":
            case "アンナ":
            case "フラウ":
            case "リィン":
            case "クラウソラス":
            case "アイカ":
            case "愛花":
            case "ユリアナ":
            case "ラフィン":
            case "ユーファ":
            case "劉備":
            case "九花":
            case "リゼット":
                result = "FBFAE7";
                break;

            // 闇  
            case "ジャミラ":
            case "タバサ":
            case "ウルスラ":
            case "舞夜":
            case "ノルン":
            case "七羽":
            case "天魔":
            case "マリア":
            case "ジュリア":
            case "ペルフェ":
            case "ジルヴァラ":
            case "ユー":
            case "曹操":
            case "都子":
            case "カグヤ":
            case "ミッドウェー":
                result = "E5C0F4";
                break;

            default:
        }
    }
    return result; // 正規表現に一致しない行はそのまま
}

/**
 * スキル・効果別一覧用のincludexを一括作成する(createIncludexForSkillAbilityList.html用)
 * @param {string} rawInput - 改行で区切られたfilter条件
 * @param {bool} isShadowHeader - 見出しを目次に含めないならtrue
 * @param {string} headerText - 見出し
 * @param {number} indent - 見出しの大きさ(1-3)
 * @param {bool} isCreateSR - SRを含めるか
 * @returns {string} 見出し、region、includex、endregionのブロック
 */
function createIncludex(rawInput, isShadowHeader, headerText, indent, isCreateSR) {

    const indentStar = '*'.repeat(indent);

    // 空行を除く各行を分割
    //const lines = inputText.split('\n');
    const filters = rawInput.split(/\r?\n/).filter(line => line.trim() !== '');


    let template;
    if (isShadowHeader){
        template = `
#shadowheader(${indent},${headerText})`
    }else{
        template = `
${indentStar}${headerText}`
    }

    // テンプレート
    template += `
#region(SSR,close)
#includex(テーブル/スキル・アビリティ/SSR,filter=^#sort|\\|h$|\\|f$|\\|c$|{PLACEHOLDER}|^}},titlestr=off)
#endregion`;

    if (isCreateSR){
        template += `

#region(SR,close)
#includex(テーブル/スキル・アビリティ/SR,filter=^#sort|\\|h$|\\|f$|\\|c$|{PLACEHOLDER}|^}},titlestr=off)
#endregion`;

    }

    // 結果を格納する変数
    let output = '';

    // 各行をテンプレートに置換して結果を生成
    filters.forEach(filter => {
        const replaced = template.replace(/{PLACEHOLDER}/g, filter.trim());
        output += replaced + '\n';
    });

    return output.trim();
}

/**
 * スキル・効果別一覧用のスキル・アビリティ列用のincludexを一括作成する(createIncludexOfSkillAbilityColumn.html用)
 * @param {string} inputText - 改行で区切られたfilter条件
 * @param {string} heading - 見出し
 * @param {bool} isCreateSR - SRを含めるか
 * @param {number} indent - 見出しの大きさ(1-3)
 * @returns {string} 見出し、region、includex、endregionのブロック
 */
function createSkillAbilityIncludex(inputText, heading, isCreateSR, indent) {

    const indentStar = '*'.repeat(indent);

    const ColumnText = ["スキル","アビ1","アビ2","サポアビ","覚醒/トラストアビ"];

    let result = `${indentStar}${heading}(スキル・アビリティ列)`;
    let columnNumber;

    for (let i = 0 ; i <= 4; i++){
        columnNumber = i + 6; //6列目から
        result += `
#shadowheader(2,${heading}(${ColumnText[i]}))
#region(SSR,close)
#includex(テーブル/スキル・アビリティ/SSR,filter=^#sort|\\|h$|\\|f$|\\|c$|^(?:[^|]*\\|){${columnNumber}}[^|]*${inputText}[^|]*(?=\\|)|^}},titlestr=off)
#endregion\n`;
        if (i == 4){
            // SRに覚醒/トラストアビは存在しない
            continue;
        }
        if (isCreateSR){
            result += `
#region(SR,close)
#includex(テーブル/スキル・アビリティ/SR,filter=^#sort|\\|h$|\\|f$|\\|c$|^(?:[^|]*\\|){${columnNumber}}[^|]*${inputText}[^|]*(?=\\|)|^}},titlestr=off)
#endregion\n`;
        }
    }

    return result;
}

/**
 * wikiの編集ソースから冗長な見出し(スキル～アビリティの各列)をshadowheaderに置き換え(convertToShadowHeader.html用)
 * @param {string} article - wikiのソース
 * @returns {string} 変換されたテキスト
 */
function convertToShadowHeader(article) {
    const validKeywords = ["(スキル)", "(アビ1)", "(アビ2)", "(サポアビ)", "(覚醒アビ)", "(覚醒/トラストアビ)"];

    return article.split("\n").flatMap(line => {
        // マッチしたキーワードを取得
        const keyword = validKeywords.find(kw => line.includes(kw));

        if (keyword) {
            const match = line.match(/^(\*+)([^\[]+)/);
            if (match) {
                const stars = match[1]; // *の数
                let textPart = match[2].trim(); // 見出し
                const removedText = textPart.replace(keyword,"");
                if (keyword === "(スキル)") {
                    return [`${stars}${removedText}(スキル・アビリティ各列)`, line.replace(/^(\*+)([^\[]+)\s*\[#([a-zA-Z0-9]+)\]/, `#shadowheader(${stars.length},${textPart})`)];
                } else {
                    return `#shadowheader(${stars.length},${textPart})`;
                }
            }
        }
        return line; // 条件を満たさない行はそのまま
    }).join("\n");
}

