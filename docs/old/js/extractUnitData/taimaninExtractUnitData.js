/**
 * extractUnitData.jpの対魔忍RPGwiki専用部分
 */


/**
 * ユニットの性能をクラス化
 */
class UnitData {

	constructor() {
		this.name ;
		this.element ;
		this.rarity ;
		this.gacha ;
		this.hp = 0;
		this.sp = 0;
		this.atk = 0;
		this.def = 0;
		this.leaderSkill;
		this.skill1;
		this.skill1Sp = 0;
		this.skill2;
		this.skill2Sp = 0;
		this.secretTechnique;
		this.secretTechniqueSp = 0;
		this.ability1 = "";
		this.ability2 = "";
		this.supportAbility;
		this.awakenOrTrustAbility = "";
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
		// ステータスなど基本情報のテーブルはwikiに既にあるので出力しない
		//let result = `|[[SR/${this.name}]]|${this.rarity}|${this.element}|${this.hp}|${this.sp}|${this.atk}|${this.def}|${this.leaderSkill}|${this.skill1}|${this.skill2}|${this.secretTechnique}|${this.ability1}|${this.ability2}|`;
		let result = `|[[SR/${this.name}]]|${this.leaderSkill}|${this.skill1}|${this.skill1Sp}|${this.skill2}|${this.skill2Sp}|${this.secretTechnique}|${this.secretTechniqueSp}|${this.ability1}|${this.ability2}|`;

		// 余計なものを置換する
		result = removeColor(result);
		result = result.replaceAll(" ", "");
		result = result.replaceAll("％", "%");
		result = result.replaceAll("、&br;", "、");
		result = result.replaceAll("ターン&br;", "ターン");

		return result;
	}
}


/**
 * 抽出方法と抽出処理を定義
 */
const extractionConfig = [
	{
		// ユニット名
		match: "基本情報",
		offset: 2,
		assign: (unit, line) => {
			const cols = line.split("|");
			let unitNameColumn = cols[1]?.trim() || "";
			unitNameColumn = unitNameColumn.replaceAll(/&ruby\([^)]*\)\{/g,"");
			unitNameColumn = unitNameColumn.replaceAll("};","");
			unitNameColumn = unitNameColumn.replaceAll("~","");
			unitNameColumn = unitNameColumn.replaceAll("　","");

			unit.name = unitNameColumn;
		}
	},
	{
		// レアリティ
		match: "基本情報",
		offset: 3,
		assign: (unit, line) => {
			const cols = line.split("|");
			const rarityCulumn = cols[3]?.trim() || "";
			unit.rarity = rarityCulumn;
		}
	},
	{
		// 属性
		match: "基本情報",
		offset: 4,
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
		assign: (unit, line) => {
			const cols = line.split("|");
			unit.hp = cols[3]?.trim() || "";
			unit.sp = cols[4]?.trim() || "";
			unit.atk = cols[5]?.trim() || "";
			unit.def = cols[6]?.trim() || "";
		}
	},
	{
		// リーダースキル
		match: "|~スキル|h",
		offset: 3,
		assign: (unit, line) => {
			const cols = line.split("|");
			let leaderSkill = cols[3].trim() || "";
			//leaderSkill = leaderSkill.replaceAll("&br;","");
			unit.leaderSkill = leaderSkill;
		}
	},
	{
		//スキル1SP
		match: "|~スキル|h",
		offset: 4,
		assign: (unit, line) => {
			const cols = line.split("|");
			unit.skill1Sp = cols[4].trim() || 0;
		}
	},
	{
		//スキル1
		match: "|~スキル|h",
		offset: 5,
		assign: (unit, line) => {
			const cols = line.split("|");
			let skill1 = cols[1].trim() || "";
			unit.skill1 = skill1;
		}
	},
	{
		//スキル2SP
		match: "|~スキル|h",
		offset: 6,
		assign: (unit, line) => {
			const cols = line.split("|");
			unit.skill2Sp = cols[3].trim() || 0;
		}
	},
	{
		//スキル2
		match: "|~スキル|h",
		offset: 7,
		assign: (unit, line) => {
			const cols = line.split("|");
			let skill1 = cols[1].trim() || "";
			unit.skill2 = skill1;
		}
	},
	{
		//奥義SP
		match: "|~スキル|h",
		offset: 8,
		assign: (unit, line) => {
			const cols = line.split("|");
			unit.secretTechniqueSp = cols[4].trim() || 0;
		}
	},

	{
		//奥義
		match: "|~スキル|h",
		offset: 9,
		assign: (unit, line) => {
			const cols = line.split("|");
			let skill1 = cols[1].trim() || "";
			unit.secretTechnique = skill1;
		}
	},
	{
		//アビリティ1
		match: "|~アビリティ|h",
		offset: 4,
		assign: (unit, line) => {
			const cols = line.split("|");
			if (cols.length >= 2){
				let skill1 = cols[2].trim() || "";
				unit.ability1 = skill1;
			}
		}
	},
	{
		//アビリティ2
		match: "|~アビリティ|h",
		offset: 7,
		assign: (unit, line) => {
			const cols = line.split("|");
			if (cols.length >= 2){
				let skill1 = cols[2].trim() || "";
				unit.ability2 = skill1;
			}
		}
	}



];


