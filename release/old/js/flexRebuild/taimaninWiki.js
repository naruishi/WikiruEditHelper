/**
 * TaimaninRPGwiki用のユーティリティ関数
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
	const unitNames = input.split(/\r?\n/);

	const comment = comments ? comments.split('\n') : null;	

	// テンプレート適用
	let output = '#flex(flex-start){{\n';
	unitNames.forEach((unitName, index) => {
		output += `#-\n|${unitName}|\n`;

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

const unitNameColumnIndex = 1;

/**
 * 1行のスキル・アビリティデータからユニット名を抽出
 * @param {string} skillAbilityLine
 * @param {number} unitNameColumnIndex
 * @returns {string|null}
 */
function extractUnitName(skillAbilityLine, unitNameColumnIndex = 1){
    const columns = skillAbilityLine.split('|');
	let icon = columns[unitNameColumnIndex];
	const iconColor = icon.split(':');
	icon = iconColor[1] ? iconColor[1] : icon;
	let color = columns[3];
	color = color.split(":")[0];
    return columns.length > unitNameColumnIndex ? color + ':' + icon : null;
}

/**
 * とのフラwikiのURL
 */
class wikiUrl {
    constructor(){

        this.homeUrl = "https://taimanin-rpg.wikiru.jp/?";
        this.editPage = "cmd=edit&page=";
        this.skillAbilityPage = "練習用お砂場";
        this.skillAbilitySsrList = "SandBox/キャラ性能テーブル";
        this.skillAbilitySrList = "SandBox/キャラ性能テーブル配布SR";
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
