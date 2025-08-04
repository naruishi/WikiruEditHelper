/**
 * extractUnitData.jpのとのフラwiki専用部分
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
		this.atk = 0;
		this.implementationDate;
		this.skill;
		this.ability1;
		this.ability2;
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
		let result = `|${this.getIcon()}|[[${this.name}]]|${this.element}|${this.gacha}&br;${this.implementationDate}|${this.atk}|${this.skill}|${this.ability1}|${this.ability2}|${this.supportAbility}|`;
		// SSRなら、覚醒orトラストアビリティ列を含める
		if (this.rarity.includes("SSR")) {
			result += `${this.awakenOrTrustAbility}|`;
		}
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
		match: "|~名前|~レア|",
		offset: 1,
		transform: (line) => {
			const cols = line.split("|");
			return {
				name: cols[1]?.trim(),
				rarity: cols[2]?.trim(),
				element: cols[3]?.trim().replace(/（/g, "(").replace(/）/g, ")")
			};
		},
		assign: (unit, val) => {
			unit.name = val.name;
			unit.rarity = val.rarity;
			unit.element = val.element;
			unit.gacha = val.rarity?.includes("SSR")
				? "恒常/期間限定/アニバ/アナザー/コラボ"
				: "恒常/イベント（異典）";
		}
	},
	{
		// ATK
		match: "|~|~|~|~HP|",
		offset: 1,
		assign: (unit, line) => {
			const cols = line.split("|");
			unit.atk = cols[3]?.trim() || "";
		}
	},
	{
		match: "|>|>|~入手方法|",
		offset: 1,
		assign: (unit, line) => {
			const cols = line.split("|");
			const date = cols[1]?.match(/(\d{4}\.\d{1,2}\.\d{1,2})/);
			unit.implementationDate = date ? date[1] : "";
		}
	},
	{
		match: "**スキル",
		offset: 3,
		assign: (unit, line) => unit.skill = line.replace(/\|/g, "")
	},
	{
		match: "**アビリティ1",
		offset: 3,
		assign: (unit, line) => unit.ability1 = line.replace(/\|/g, "")
	},
	{
		match: "**アビリティ2",
		offset: 3,
		assign: (unit, line) => unit.ability2 = line.replace(/\|/g, "")
	},
	{
		match: "**サポートアビリティ",
		offset: 3,
		assign: (unit, line) => unit.supportAbility = line.replace(/\|/g, "")
	},
	{
		match: "**トラストアビリティ",
		offset: 3,
		assign: (unit, line) => unit.awakenOrTrustAbility = "［トラスト］&br;" + line.replace(/\|/g, "")
	},
	{
		match: "**覚醒アビリティ",
		offset: 3,
		assign: (unit, line) => {
			// 覚醒アビリティは複数回出現する可能性がある
			if (unit.awakenOrTrustAbility){
				unit.awakenOrTrustAbility += "&br;" + line.replace(/\|/g, "");

			}else{
				unit.awakenOrTrustAbility = line.replace(/\|/g, "");
			}
		}

	}
];

