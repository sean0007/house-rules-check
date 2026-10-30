// House Rules Check engine: flags house rules / requests that are likely to break Airbnb's
// house rules policy for reservations booked on or after 2026-11-20, with Japan 民泊/旅館業 notes.
// Pure functions, no network. Educational, not legal advice, not affiliated with Airbnb.

export const RULES_AS_OF = "2026-10-28";
export const POLICY_START = "2026-11-20";
export const EDITOR_CHANGE = "2026-10-20";

export const DISCLAIMER =
  "Educational pattern check, not legal advice and not affiliated with or endorsed by Airbnb. Findings are likely outcomes from keyword rules based on Airbnb's public help article and announcement (as of 2026-10-28), not Airbnb's decision; Airbnb's own listing editor and support decide. Japan notes summarise the 住宅宿泊事業法, 旅館業法 rules and the MLIT guideline; confirm with your local health centre (保健所) or a professional.";

export const SOURCES = [
  "https://www.airbnb.com/help/article/4168",
  "https://www.airbnb.com/resources/hosting-homes/a/important-changes-to-house-rules-21",
  "https://www.airbnb.jp/help/article/4168",
  "https://laws.e-gov.go.jp/law/429AC0000000065",
  "https://laws.e-gov.go.jp/law/323M40000100028",
  "https://www.mlit.go.jp/kankocho/minpaku/content/001622384.pdf",
  "https://www.mlit.go.jp/kankocho/content/001253672.pdf",
] as const;

export const FINDINGS = ["likely_flagged", "review", "move_to_section", "legal_exception", "use_standard_rule", "likely_ok", "no_match"] as const;
export type Finding = (typeof FINDINGS)[number];
const SEVERITY: Record<Finding, number> = { likely_flagged: 6, review: 5, move_to_section: 4, legal_exception: 3, use_standard_rule: 2, likely_ok: 1, no_match: 0 };

export const FINDING_LABEL: Record<Finding, string> = {
  likely_flagged: "Likely not allowed",
  review: "Check this one",
  move_to_section: "Move to another section",
  legal_exception: "Allowed if required by law",
  use_standard_rule: "Use a standard rule",
  likely_ok: "Likely fine",
  no_match: "No pattern matched",
};

export const JURISDICTIONS = ["JP", "other"] as const;
export type Jurisdiction = (typeof JURISDICTIONS)[number];
export const LODGING = ["minpaku", "ryokan", "unknown"] as const;
export type Lodging = (typeof LODGING)[number];
export const CHANNELS = ["listing", "message", "sign", "in_person"] as const;
export type Channel = (typeof CHANNELS)[number];

export type Category =
  | "cleaner_chore" | "trash_offsite" | "vague_cleaning" | "fine_penalty" | "local_fine_notice" | "mandatory_fee" | "optional_addon"
  | "amenity_restriction" | "separate_contract" | "personal_info" | "japan_guest_register" | "off_platform" | "after_booking"
  | "standard_rule" | "checkin_times" | "allowed_checkout" | "local_exception" | "safety_info" | "shoes_off";

type Rule = {
  id: string;
  category: Category;
  finding: Finding;
  re: RegExp[];
  reason: string;
  reasonJa: string;
  rewrite?: string;
  section?: string;
};

const R = (s: string) => new RegExp(s, "i");
const TRASH = "(?:trash|garbage|rubbish|recycling|recyclables|waste|bins?)";
const TRASH_JA = "(?:ゴミ|ごみ|塵|生ゴミ|生ごみ|資源ゴミ|資源ごみ|ペットボトル|空き缶)";
const AMEN = "(?:ac|a/c|air ?con\\w*|heater|heating|hot tub|jacuzzi|pool|kitchen|stove|oven|washer|washing machine|dryer|wi-?fi|fireplace|grill|bbq|barbecue|sauna|bath ?tub|bath|tv|parking)";
const AMEN_JA = "(?:エアコン|冷房|暖房|ヒーター|キッチン|台所|コンロ|洗濯機|乾燥機|お風呂|浴槽|風呂|ジャグジー|サウナ|wi-?fi|bbq|バーベキュー|テレビ|駐車場)";
const TEMP = "(?:ac|a/c|air ?con\\w*|thermostat|heat|heater|heating|temperature|temp)";
const TEMP_CMP = "below|under|above|over|lower than|higher than|colder than|warmer than|less than|more than";

const RULES: Rule[] = [
  // ---- not allowed: cleaner tasks ----
  {
    id: "dishes", category: "cleaner_chore", finding: "likely_flagged",
    re: [
      R("\\b(wash|clean|do|rinse|dry|hand[- ]wash)(ing)?\\s+(all\\s+|the\\s+|your\\s+|any\\s+|up\\s+)?(dirty\\s+|used\\s+)?(dishes|plates|cups|glasses|pots|pans|cutlery|utensils|cookware)\\b"),
      R("\\bput\\s+(the\\s+|all\\s+)?(clean\\s+)?(dishes|plates|cups|glasses|utensils|cookware)\\s+(away|back)|\\bput\\s+away\\s+(the\\s+|all\\s+)?(dishes|plates|cups|glasses|utensils)"),
      R("\\b(load|run|start|empty|unload)\\s+(the\\s+)?dishwasher"),
      /(皿|食器|お皿|コップ|鍋|調理器具)(類)?(を|は|も)?.{0,8}(洗|片付け|片づけ|しまっ|しまい|戻し|元の場所)/,
      /食洗機.{0,8}(回|かけ|入れ|スタート)/,
    ],
    reason: "Washing or putting away dishes, or running the dishwasher, is a cleaner's task. Airbnb names it as not allowed.",
    reasonJa: "食器洗い・片付け・食洗機の操作は清掃スタッフの作業にあたり、Airbnbが明示的に認めない例です。",
    rewrite: "Please leave used dishes in the sink. / 使った食器はシンクに置いてください。",
  },
  {
    id: "beds_laundry", category: "cleaner_chore", finding: "likely_flagged",
    re: [
      R("\\bstrip(ping)?\\s+(the\\s+|all\\s+)?(beds?|sheets|linens?|bedding)\\b|\\b(remove|take off|take)\\s+(the\\s+|all\\s+)?(bed\\s*sheets|sheets|linens?|bedding|duvet covers?|pillow ?cases)(\\s+off)?\\b"),
      R("\\b(start|run|do|put on|begin)\\s+(a\\s+|the\\s+)?(load of\\s+)?(laundry|washing machine|wash cycle)\\b|\\bwash\\s+(the\\s+|all\\s+)?(towels|sheets|linens?|bedding)"),
      R("\\bmake\\s+(the\\s+|all\\s+)?beds?\\b"),
      /(シーツ|布団カバー|ベッドカバー|枕カバー|リネン)(類)?(を|は)?.{0,6}(外|はが|剥が|取り|洗)/,
      /(タオル|シーツ|リネン)(類)?を?洗濯|洗濯機を(回|まわ)して|洗濯(を)?してから/,
      /ベッドメイク/,
    ],
    reason: "Stripping beds, starting laundry or making beds is turnover work. Airbnb names stripping the bed as not allowed.",
    reasonJa: "シーツ外し・洗濯・ベッドメイクはターンオーバー作業で、Airbnbは「シーツを外す」を認めない例に挙げています。",
    rewrite: "Please gather used towels in the bathroom. / 使用済みのタオルは浴室にまとめてください。",
  },
  {
    id: "cleaning", category: "cleaner_chore", finding: "likely_flagged",
    re: [
      R("\\b(vacuum|vacuuming|mop|mopping|sweep|sweeping|hoover|scrub)\\b"),
      R("\\bclean\\s+(the\\s+|out\\s+the\\s+|up\\s+the\\s+)?(bathrooms?|toilets?|kitchen|floors?|oven|stove|fridge|refrigerator|grill|bbq|barbecue|showers?|bath ?tubs?|tub|house|apartment|unit|rooms?|hot tub|microwave)"),
      R("\\bwipe\\s+(down\\s+)?(the\\s+|all\\s+)?(counters?|surfaces|tables?|kitchen|stove|bathroom)"),
      /掃除機(を|で)?.{0,4}(かけ|掛け)|(拭き掃除|床を拭|モップ|雑巾)/,
      /(トイレ|浴室|お風呂|キッチン|台所|部屋|床|コンロ|冷蔵庫)(の)?(を)?(掃除|清掃)/,
    ],
    reason: "Vacuuming, mopping or cleaning rooms and appliances is a cleaner's job and takes significant effort.",
    reasonJa: "掃除機がけ・拭き掃除・部屋や設備の清掃は清掃スタッフの作業で、手間のかかる作業にあたります。",
    rewrite: "Delete it, or keep a light request: Please put food waste in the kitchen bin. / 削除するか、「生ごみはキッチンのごみ箱へ」など軽いお願いにしてください。",
  },
  {
    id: "trash_offsite", category: "trash_offsite", finding: "likely_flagged",
    re: [
      R(`\\b(take|bring|carry|put|move|drag|wheel)\\s+(the\\s+|all\\s+|your\\s+|any\\s+)?${TRASH}(\\s+bags?|\\s+cans?)?\\s+(out(side)?\\b|off[- ]?site|to\\s+the\\s+(curb|kerb|street|road|dumpster|outside|collection|garbage station|trash station|bins? outside|outdoor bins?|recycling centre|recycling center))`),
      R(`\\b${TRASH}(\\s+bags?)?\\s+(out\\s+)?(to|at|in)\\s+the\\s+(curb|kerb|dumpster|collection point|garbage station|street)`),
      R(`\\b(take|carry|bring)\\s+(your\\s+|the\\s+|all\\s+)?${TRASH}\\s+(home|with you|away)`),
      new RegExp(`${TRASH_JA}(を|は|も)?.{0,12}(集積所|ステーション|置き場|収集所|収集場所|回収場所|外のごみ箱|外のゴミ箱)`),
      new RegExp(`${TRASH_JA}(を|は|も)?.{0,8}(持ち帰|お持ち帰|持って帰)`),
      new RegExp(`${TRASH_JA}(を|は|も)?.{0,6}(外に出|屋外に|敷地外|出してください|出して下さい|捨てに行)`),
    ],
    reason: "Taking trash off-site (to the street, a collection point or home) is named by Airbnb as not allowed. In Japan, minpaku trash is business waste the operator must dispose of (MLIT guideline), so guests shouldn't put it out at a household collection point anyway.",
    reasonJa: "ごみを敷地外（集積所・路上・持ち帰り）へ出す依頼は、Airbnbが認めない例に挙げています。日本の民泊のごみは事業系廃棄物として事業者が処理する必要があり（観光庁ガイドライン）、家庭ごみの集積所に出させること自体が問題になり得ます。",
    rewrite: "Please sort trash into the labelled bins in the kitchen. / ごみは分別して、キッチンの指定のごみ箱に入れてください。",
  },
  {
    id: "vague_cleaning", category: "vague_cleaning", finding: "review",
    re: [
      R("\\b(leave|return)\\s+(the\\s+)?(\\w+\\s+)?(as|how|the way)\\s+you\\s+found\\s+it|\\b(clean|tidy)\\s+up\\b|\\btidy\\b|\\bkeep\\s+(the\\s+)?(house|home|place|unit|apartment|room)s?\\s+(clean|tidy)|\\b(reasonably|broom)[- ]clean"),
      /(元の状態|原状|元通り|もと通り)(に)?.{0,6}(戻|復)|(きれいに|綺麗に|キレイに)(使|ご利用|して)|片付け(て|を)/,
    ],
    reason: "A general 'tidy up' or 'leave it as you found it' may pass, but if it means real cleaning it counts as a cleaner's task. Spell out light requests instead.",
    reasonJa: "「元の状態に戻して」「きれいに使って」程度は通る可能性がありますが、実質的な清掃を求める意味なら認められません。軽いお願いを具体的に書きましょう。",
    rewrite: "Please leave used dishes in the sink and used towels in the bathroom. / 食器はシンクに、タオルは浴室にまとめてください。",
  },
  // ---- money ----
  {
    id: "fine", category: "fine_penalty", finding: "likely_flagged",
    re: [
      R("\\bfine[sd]?\\b\\s*(of\\s*)?([$¥€£]|usd|jpy|\\d)|([$¥€£]|usd|jpy|yen|円)\\s*[\\d,.]*\\s*(k\\s*)?(fine|penalty)|\\d[\\d,.]*\\s*(usd|jpy|yen|円|dollars?|euros?)?\\s*(fine|penalty)\\b"),
      R("\\b(will|may|shall|can|could)\\s+(impose\\s+)?(a\\s+|its\\s+own\\s+)?fines?\\b|\\bfines?\\s+(for|of|up\\s+to|apply|applies|will)\\b|\\b(will|may|shall|can)\\s+(be\\s+)?(fined|penali[sz]ed|charged|billed|invoiced)\\b|\\b(we|i)\\s+(will|may)\\s+(charge|bill|fine|invoice)\\b|\\bpenalt(y|ies)\\b|\\bsubject to (a )?(fee|charge|fine)"),
      R("\\bdeposit\\b.{0,25}\\b(deducted|withheld|forfeited|kept|retained)\\b|\\b(deduct(ed)?|withh(o|e)ld|forfeit(ed)?)\\b.{0,25}\\bdeposit\\b|\\b(lose|keep|retain)\\s+(your\\s+|the\\s+)?(security\\s+)?deposit"),
      R("\\b(late|early)\\s+check[- ]?(out|in)\\s+(fee|charge)|\\b(smoking|cleaning|lost key|key replacement|damage)\\s+(fee|charge)\\b.{0,20}(if|will|applies)|\\bfee\\b.{0,15}\\bif\\b.{0,30}(lose|late|smok|break|damag|left|leave|exceed)"),
      /罰金|違約金|ペナルティ|反則金|弁償|賠償/,
      /(請求|ご請求)(させて|いたします|致します|します|することがあります)|(円|¥|￥)[^。]{0,12}(請求|頂きます|いただきます|申し受け)|(追加料金|清掃費|清掃料)[^。]{0,10}(請求|頂|いただ|申し受け)/,
    ],
    reason: "Hosts can't impose fines or penalties on guests (this includes charges for breaking a rule). Damage is handled through AirCover / the Resolution Center.",
    reasonJa: "ゲストへの罰金・ペナルティ（ルール違反時の請求を含む）は認められません。破損はAirCover／解決センターで対応します。",
    rewrite: "State the rule without a penalty, e.g. 'No smoking anywhere on the property.' Report damage through Airbnb. / 罰則を書かずにルールだけを書き、破損はAirbnb経由で申請してください。",
  },
  {
    id: "fee", category: "mandatory_fee", finding: "move_to_section", section: "Pricing (nightly price, cleaning fee or other fees)",
    re: [
      R("\\b(extra|additional|cleaning|service|resort|amenity|utility|utilities|electricity|electric|heating|towel|linen|parking|pet|guest|key)\\s+(fee|charge|cost|surcharge)s?\\b"),
      R("\\bpay\\s+(extra|additional|in cash|cash|on arrival|at check[- ]?in|at the property|on site|directly)|\\bcash\\s+(only|payment)\\b|\\b(per|/)\\s?(night|person|guest|stay|pet|hour)\\b.{0,10}([$¥€£]|usd|jpy|yen|円)|([$¥€£]|usd|jpy|yen|円)\\s*[\\d,.]+\\s*(per|/)\\s?(night|person|guest|stay|pet|hour)"),
      /(追加|別途|清掃|リネン|光熱|電気|駐車|ペット|人数)(料金|費|代)|現地(払い|精算|で(の)?(お)?支払)|現金(払い|でのお支払|のみ)|(1泊|一泊|1名|お一人|1人)(あたり|につき).{0,8}円/,
    ],
    reason: "Mandatory fees for anything advertised must be in the price shown at booking. Only optional add-ons (e.g. breakfast) can be described in requests.",
    reasonJa: "掲載している設備・サービスの必須料金は、予約時に表示される料金に含める必要があります。リクエストに書けるのは朝食などの任意オプションの料金だけです。",
    rewrite: "Put the fee in Pricing, or make it a clearly optional add-on: 'Breakfast is available for ¥1,500 per person on request.'",
  },
  {
    id: "optional", category: "optional_addon", finding: "likely_ok",
    re: [
      R("\\b(optional|on request|upon request|available for|can be arranged|if you('d)? like|if you wish|add[- ]on|for an extra)\\b"),
      /オプション|ご希望(の方|に応じ|があれば)|希望者|有料で(ご)?(提供|用意)|ご要望に応じ/,
    ],
    reason: "Optional, clearly priced add-ons (breakfast, early check-in, tours) may be described in requests.",
    reasonJa: "朝食・アーリーチェックインなど任意のオプションとその料金は、リクエストに書くことができます。",
  },
  {
    id: "local_fine", category: "local_fine_notice", finding: "move_to_section", section: "Local rules (notice of HOA / building / local-government fines)",
    re: [
      R("\\b(hoa|homeowners?'? association|building (management|security|rules)|condo (board|association)|strata|body corporate|city|municipal\\w*|county|council|local (government|law|laws|ordinance|authorities|regulations?)|police|ordinance)\\b"),
      /管理組合|管理会社|管理規約|マンション規約|自治体|条例|市役所|区役所|町内会|自治会|警察/,
    ],
    reason: "If a building, HOA or local government may fine for something (noise, trash), give notice in the Local rules section instead of charging guests yourself.",
    reasonJa: "管理組合・自治体などが罰金を科す可能性がある場合は、ホストが請求するのではなく、「地域のルール」欄で通知してください。",
    rewrite: "Building rules prohibit noise after 10 pm; the building may impose its own fines. (in Local rules)",
  },
  // ---- amenities ----
  {
    id: "amenity", category: "amenity_restriction", finding: "likely_flagged",
    re: [
      R(`\\b(do not|don't|dont|please do not|please don't|not allowed to|never|no)\\s+(use|using|turn on|switch on|open)\\s+(of\\s+)?(the\\s+)?${AMEN}\\b`),
      R(`\\b${AMEN}\\s+(is|are|may|can)?\\s*(only|not)\\s+(be\\s+)?(available|allowed|permitted|to be used|for use|used)\\b`),
      R(`\\b${AMEN}\\b.{0,20}\\b(only|not)\\s+(between|after|before|from|until|during)\\b|\\b(no|not)\\s+${AMEN}\\s+(after|before|between|during)`),
      R("\\b(limit|restrict|ration)\\w*\\s+(the\\s+)?(use\\s+of\\s+)?(the\\s+)?(ac|a/c|air ?con\\w*|heat\\w*|hot water|electricity|water|showers?|internet|wi-?fi)\\b|\\b(ac|a/c|thermostat|heating|air ?con\\w*)\\b.{0,20}\\b(no (lower|higher|colder|warmer) than|at least|min(imum)?|max(imum)?|between)\\b.{0,8}\\d"),
      // Temperature limits phrased as "don't set the AC below 24" / "keep the thermostat above 68" / "AC must not be set under 23".
      R(`\\b(set|put|turn|keep|lower|raise|adjust|run)\\w*\\s+(the\\s+)?${TEMP}\\b.{0,25}\\b(${TEMP_CMP})\\s*\\d`),
      R(`\\b${TEMP}\\b\\s+(must|should|may|can|is|are)\\s*(not|n't)?\\s+(be\\s+)?(set|kept|turned|run|go|stay)\\w*\\s+(${TEMP_CMP})\\s*\\d`),
      R("\\bshowers?\\b.{0,20}\\b(limited|max(imum)?|no longer than|under)\\b|\\b\\d+[- ]?min(ute)?s?\\s+showers?"),
      new RegExp(`${AMEN_JA}(は|の)?(ご)?(使用|利用)?(は)?(禁止|不可|できません|ご遠慮|しないで|お控え)`, "i"),
      new RegExp(`${AMEN_JA}.{0,10}(設定|温度).{0,10}(\\d+度|以上|以下)|${AMEN_JA}.{0,6}(\\d+時|時間).{0,8}(まで|以降|のみ|限定)`, "i"),
      // 「エアコンは26度以下に設定しないで」「冷房は25度より下げないで」「暖房は22度以上にしないで」
      new RegExp(`${AMEN_JA}.{0,12}\\d+\\s*(度|℃|°).{0,4}(以下|以上|未満|より|を(超え|下回|上回))`, "i"),
      /シャワー.{0,8}(\d+分|時間).{0,6}(以内|まで)/,
    ],
    reason: "Restricting a feature that's advertised as part of the listing (AC, heating, kitchen, hot tub, Wi-Fi…) isn't allowed. Asking guests to switch things off when they leave is fine.",
    reasonJa: "掲載している設備（エアコン・暖房・キッチン・ジャグジー・Wi-Fiなど）の利用制限は認められません。外出時に電源を切るお願いは問題ありません。",
    rewrite: "Please turn off the AC and lights when you leave. / 外出時はエアコンと照明を消してください。 (If a feature truly isn't available, remove it from the amenities list.)",
  },
  // ---- contracts / personal info / off-platform ----
  {
    id: "contract", category: "separate_contract", finding: "likely_flagged",
    re: [
      R("\\b(sign|signed|signing|e-?sign|complete|accept)\\s+(a\\s+|an\\s+|the\\s+|our\\s+)?(separate\\s+)?(rental\\s+|lease\\s+|guest\\s+|house\\s+|liability\\s+)?(agreement|contract|waiver|release|terms)\\b|\\b(rental|lease|guest)\\s+agreement\\b|\\bliability\\s+waiver\\b|\\bhold\\s+harmless\\b"),
      /契約書|同意書|誓約書|念書|(署名|サイン)(を|して|して下さい|してください|が必要)/,
    ],
    reason: "Hosts may not ask guests to sign separate contracts or waivers, except where required by law and in other limited circumstances.",
    reasonJa: "別途の契約書・同意書への署名を求めることは、法令で必要な場合などの限られた例外を除き認められません。",
    rewrite: "Delete it. If a law requires a document, say which law in Requests before booking.",
  },
  {
    id: "id_info", category: "personal_info", finding: "likely_flagged",
    re: [
      R("\\b(passports?|government[- ]issued\\s+id|photo\\s+id|id\\s+(card|photo|copy|scan|document)s?|(copy|photo|picture|scan|image)s?\\s+of\\s+(your\\s+|the\\s+|each\\s+|all\\s+)?(guests?'?\\s+)?(id|ids|passports?|driver'?s\\s+licen[cs]es?)|driver'?s\\s+licen[cs]e|national\\s+id|residence\\s+card|selfie|face\\s+(check|verification|scan|photo)|identity\\s+verification|verify\\s+(your\\s+)?identity)\\b"),
      R("\\b(full\\s+|legal\\s+)?names?\\s+(and\\s+\\w+\\s+)?of\\s+(all|every|each)\\s+(guests?|members?|people)|\\b(home\\s+)?address(es)?\\b|\\bdate\\s+of\\s+birth\\b|\\bnationalit(y|ies)\\b|\\boccupation\\b|\\bphone\\s+numbers?\\b|\\bemail\\s+address|\\bguest\\s+(register|registry|list|registration)\\b"),
      /パスポート|旅券|身分証|本人確認|運転免許証|マイナンバー|在留カード|顔写真|自撮り|宿泊者名簿|名簿|(氏名|住所|国籍|職業|連絡先|電話番号|メールアドレス|生年月日)(を|の)?(ご)?(記入|記載|登録|提出|入力|教え|お知らせ)/,
    ],
    reason: "Hosts may not solicit personal information such as a government ID, except where required by law and in other limited circumstances.",
    reasonJa: "身分証などの個人情報の収集は、法令で必要な場合などの限られた例外を除き認められません。",
    rewrite: "Delete it unless a law requires it. If it does, name the law in Requests before booking and ask only for what it requires.",
  },
  {
    id: "off_platform", category: "off_platform", finding: "likely_flagged",
    re: [
      R("\\b(download|install|use)\\s+(our|the|an?|this)\\s+(\\w+\\s+)?(app|application)\\b|\\b(register|sign\\s+up|check[- ]?in|fill\\s+(in|out)|complete|submit)\\b.{0,30}\\b(on|at|via|through|using|in)\\s+(our|the|an?|this)\\s+(\\w+\\s+)?(website|site|link|portal|form|app|url)\\b"),
      R("\\b(online|pre[- ]?arrival|pre)[- ]?check[- ]?in\\b|\\bwhats\\s?app\\b|\\bwechat\\b|\\btelegram\\b|\\bline\\s+(app|id|account|official)\\b|\\bgoogle\\s+forms?\\b|\\btypeform\\b|\\b(outside|off)\\s+(of\\s+)?(airbnb|the\\s+platform)\\b|\\b(text|call|email|message|contact)\\s+(me|us)\\s+(directly|outside|on\\s+whatsapp|at\\s+\\+?\\d)"),
      /アプリ(を|で|から|の)|外部サイト|(ウェブ|web|WEB)サイト(で|から|に)|(フォーム|リンク|URL)(から|で|に|へ)|オンラインチェックイン|事前チェックイン|LINE|WhatsApp|事前登録|(登録|入力)(を)?(して|お願い)/,
    ],
    reason: "Requiring guests to register or check in off-platform (apps, websites, forms, WhatsApp) isn't allowed, except where required by law.",
    reasonJa: "Airbnb外のアプリ・サイト・フォームでの登録やチェックインの強制は、法令で必要な場合を除き認められません。",
    rewrite: "Use Airbnb messaging, or name the law that requires the check-in in Requests before booking.",
  },
  {
    id: "after_booking", category: "after_booking", finding: "likely_flagged",
    re: [
      R("\\b(additional|more|further|full|other|detailed|complete|remaining)\\s+(house\\s+)?(rules|policies|requirements)\\s+(will\\s+be|are|can\\s+be|may\\s+be)\\s+(sent|provided|posted|shared|given|found|listed|displayed|explained)"),
      R("\\b(see|read|follow|obey|respect)\\s+(the\\s+|all\\s+)?(house\\s+manual|guidebook|binder|welcome\\s+book|rules\\s+(posted|in\\s+the)|signs?|posted\\s+(rules|signs|notices)|instructions\\s+(in|inside|posted))"),
      R("\\b(rules|instructions|notices)\\s+(posted|displayed|hung|on\\s+display)\\s+(in|inside|on|at|around)\\b|\\b(we|i)\\s+(will|may)\\s+(send|message|text|email)\\s+(you\\s+)?(the\\s+|our\\s+|more\\s+|additional\\s+)?(house\\s+)?(rules|policies)|\\b(rules|policies)\\s+(may|can|are\\s+subject\\s+to)\\s+(change|be\\s+(changed|updated|added))"),
      /(詳細|その他|追加|残り)(の)?(ハウス)?(ルール|規則|注意事項).{0,12}(送|お送り|お知らせ|掲示|ご案内|メッセージ)|(室内|館内|部屋|現地)(の|に)?(掲示|張り紙|貼り紙|案内|ルール)(を|に)?.{0,8}(従|ご確認|守|ご覧)|(ハウスマニュアル|ガイドブック|館内案内)(を|に)?.{0,8}(従|ご確認|守|ご覧)|ルール(は|を)?(変更|追加)(する|される)(こと|場合)/,
    ],
    reason: "Every rule must be in the listing's House rules and requests section before booking. New rules can't be added later by message, signs in the home or in person. Info such as appliance instructions or safety notices can stay in the home.",
    reasonJa: "ルールは予約前にリスティングの「ハウスルールとリクエスト」に書いたものだけが有効です。予約後のメッセージ・室内の貼り紙・口頭で新しいルールは追加できません（家電の使い方や安全情報の案内は可）。",
    rewrite: "Copy every rule into House rules and requests now; keep the manual for how-to info only.",
  },
  // ---- standard rules ----
  {
    id: "std_guests", category: "standard_rule", finding: "use_standard_rule", section: "Standard rule: maximum overnight guests",
    re: [
      R("\\b(max(imum)?|no\\s+more\\s+than|up\\s+to|at\\s+most|limit\\s+of)\\s+\\d+\\s+(overnight\\s+)?(guests|people|persons|adults)\\b|\\bmax(imum)?\\s+(number\\s+of\\s+)?(guests|occupancy)\\b|\\b(unregistered|extra|additional)\\s+(guests|visitors|people)\\b|\\bno\\s+(visitors|outside\\s+guests|day\\s+guests)\\b|\\bvisitors\\s+(are\\s+)?not\\s+allowed"),
      /定員|宿泊人数|最大\s*\d+\s*(名|人)|\d+\s*(名|人)まで|予約者以外|来客|訪問者|(登録|予約)(外|していない)(の)?(方|人|ゲスト)/,
    ],
    reason: "Maximum overnight guests is one of the 7 standard rules; set it in the standard field.",
    reasonJa: "最大宿泊人数は7つの標準ルールの1つです。標準ルール欄で設定してください。",
  },
  {
    id: "std_quiet", category: "standard_rule", finding: "use_standard_rule", section: "Standard rule: quiet hours",
    re: [
      R("\\bquiet\\s+(hours|time)\\b|\\bno\\s+(loud\\s+)?(noise|music)\\b|\\bkeep\\s+(the\\s+)?(noise|volume|voices?)\\s+(down|low)\\b|\\b(be|keep)\\s+quiet\\b|\\bnoise\\b"),
      /騒音|静か|大声|大きな声|音量|騒が|夜\s*\d+\s*時(以降|から)|深夜/,
    ],
    reason: "Quiet hours is a standard rule. In Japan, 住宅宿泊事業法 art. 9 also requires explaining noise rules (in a foreign language for foreign guests), so keep the explanation as information.",
    reasonJa: "騒音禁止の時間帯は標準ルールです。日本では住宅宿泊事業法第9条で騒音防止の説明（外国人には外国語）も義務なので、説明は案内として残しましょう。",
  },
  {
    id: "std_events", category: "standard_rule", finding: "use_standard_rule", section: "Standard rule: events",
    re: [R("\\b(no\\s+)?(parties|party|events?|gatherings?|celebrations?|weddings?)\\b"), /パーティ|パーティー|イベント|宴会|飲み会|集まり/],
    reason: "Events is a standard rule; Airbnb also has its own party ban.",
    reasonJa: "イベントは標準ルールです（Airbnb自体もパーティーを禁止しています）。",
  },
  {
    id: "std_pets", category: "standard_rule", finding: "use_standard_rule", section: "Standard rule: pets",
    re: [R("\\b(no\\s+)?pets?\\b|\\b(dogs?|cats?)\\s+(are\\s+)?(not\\s+)?(allowed|welcome|permitted)\\b|\\bservice\\s+animals?\\b"), /ペット|犬|猫|動物の(同伴|持ち込み)/],
    reason: "Pets is a standard rule. Assistance animals are covered by Airbnb's accessibility policy.",
    reasonJa: "ペットは標準ルールです（補助犬はAirbnbのアクセシビリティ方針の対象）。",
  },
  {
    id: "std_smoking", category: "standard_rule", finding: "use_standard_rule", section: "Standard rule: smoking",
    re: [R("\\b(no\\s+)?smok(e|ing)\\b|\\bnon[- ]smoking\\b|\\bvap(e|ing)\\b|\\bcigarettes?\\b|\\be-?cigarettes?\\b"), /喫煙|禁煙|タバコ|たばこ|煙草|電子タバコ|加熱式/],
    reason: "Smoking is a standard rule (a fine for smoking is not allowed).",
    reasonJa: "喫煙は標準ルールです（喫煙時の罰金は不可）。",
  },
  {
    id: "std_photo", category: "standard_rule", finding: "use_standard_rule", section: "Standard rule: commercial photography",
    re: [R("\\b(commercial\\s+)?(photo|video)\\s*(shoots?|graphy|filming)\\b|\\bphotoshoots?\\b|\\bfilming\\b|\\bcommercial\\s+(use|photography|filming)"), /撮影/],
    reason: "Commercial photography is a standard rule.",
    reasonJa: "商業目的の写真撮影は標準ルールです。",
  },
  {
    id: "std_lock", category: "standard_rule", finding: "use_standard_rule", section: "Standard rule: lock up at checkout",
    re: [R("\\block\\s+(the\\s+|all\\s+)?(doors?|up|windows?|gate)\\b|\\block\\s+up\\b"), /施錠|(鍵|カギ|かぎ)を?(かけ|掛け|閉め)/],
    reason: "Locking up at checkout is a standard rule.",
    reasonJa: "チェックアウト時の施錠は標準ルールです。",
  },
  {
    id: "checkin", category: "checkin_times", finding: "move_to_section", section: "Check-in / checkout times",
    re: [R("\\bcheck[- ]?(in|out)\\s+(time\\s+)?(is\\s+)?(by|at|before|after|from|until|no\\s+later)\\b|\\b\\d{1,2}(:\\d{2})?\\s*(am|pm)\\s+check[- ]?(in|out)|\\bself[- ]check[- ]?in\\b"), /(チェックイン|チェックアウト)(は|時間|時刻)?.{0,6}(\d{1,2}|時)/],
    reason: "Set check-in and checkout times in their own fields, not in requests.",
    reasonJa: "チェックイン・チェックアウト時刻は専用の欄で設定してください。",
  },
  // ---- allowed requests ----
  {
    id: "ok_checkout", category: "allowed_checkout", finding: "likely_ok",
    re: [
      R("\\b(dishes|plates|cups|glasses)\\b.{0,25}\\b(in|into)\\s+(the\\s+)?sink\\b|\\b(gather|collect|leave|put|place|pile)\\s+(the\\s+|all\\s+)?used\\s+(towels|linens?)"),
      R(`\\b(sort|separate)\\b.{0,30}\\b${TRASH}|\\b(throw|put|place|dispose\\s+of)\\s+(the\\s+|your\\s+|all\\s+)?${TRASH}.{0,25}\\b(in|into)\\s+(the\\s+)?(indoor\\s+|kitchen\\s+|labell?ed\\s+|designated\\s+)?(bins?|trash\\s+cans?|garbage\\s+cans?|containers?)`),
      R("\\bturn\\s+off\\s+(the\\s+|all\\s+)?(lights|ac|a/c|air ?con\\w*|heater|heating|tv|appliances|fans?|stove|electricity)|\\b(close|shut)\\s+(the\\s+|all\\s+)?windows\\b|\\b(return|leave)\\s+(the\\s+)?keys?\\b"),
      /(食器|皿|お皿|コップ)(類)?(は|を)?.{0,10}(シンク|流し)/,
      /(使用済み|使った|使用した)?の?タオル(類)?(は|を)?.{0,10}(まとめ|集め|置い|入れ)/,
      new RegExp(`分別|${TRASH_JA}(は|を)?.{0,12}(指定|所定|室内|キッチン)(の)?(ごみ箱|ゴミ箱|袋|場所|容器)`),
      /(電気|照明|エアコン|冷房|暖房|テレビ)(など|等)?(は|を)?.{0,6}(消|切|オフ|止め)|(鍵|カギ|キー)(を|は)?.{0,8}(返却|戻し|ポスト|キーボックス)|窓を(閉め|しめ)/,
    ],
    reason: "Light checkout requests are allowed: dishes in the sink, used towels gathered, trash sorted into indoor bins, things switched off.",
    reasonJa: "軽いチェックアウトのお願い（食器はシンクへ・タオルをまとめる・屋内のごみ箱へ分別・電源オフ）は認められます。",
  },
  {
    id: "shoes", category: "shoes_off", finding: "likely_ok",
    re: [R("\\b(take|leave)\\s+(your\\s+)?shoes\\s+off\\b|\\b(remove|take\\s+off)\\s+(your\\s+)?shoes\\b|\\bno\\s+shoes\\b|\\bshoes\\s+off\\b|\\bslippers\\b"), /靴を脱|土足|スリッパ/],
    reason: "A reasonable request that takes no real effort (common in Japan).",
    reasonJa: "手間のかからない合理的なお願いです（日本では一般的）。",
  },
  {
    id: "local_exception", category: "local_exception", finding: "likely_ok",
    re: [
      R("\\bbears?\\b|\\banimal[- ]proof\\b|\\bwildlife\\b|\\braccoons?\\b|\\bcrows?\\b|\\bdrought\\b|\\bwater\\s+(restrictions?|shortage|is\\s+scarce|rationing)\\b|\\bseptic\\b|\\bwell\\s+water\\b"),
      /クマ|熊|カラス|イノシシ|獣害|節水|渇水|給水制限|浄化槽|井戸水/,
    ],
    reason: "Airbnb may allow requests tied to real local conditions (its own examples: animal-proof trash bins in bear country, shorter showers under drought restrictions). Say why in the request. Airbnb's editor may still flag it; add context.",
    reasonJa: "実際の地域事情に基づくお願い（Airbnbの例：クマ対策のごみ箱、渇水時の節水）は例外として認められる場合があります。理由も書き添えてください。",
  },
  {
    id: "safety", category: "safety_info", finding: "likely_ok",
    re: [
      R("\\b(at\\s+your\\s+own\\s+risk|supervise|no\\s+diving|lifeguard|fire\\s+extinguisher|emergency|evacuat\\w+|first\\s+aid|carbon\\s+monoxide|smoke\\s+(alarm|detector)|steep\\s+stairs|slippery|earthquakes?|tsunami|typhoons?|gas\\s+valve)\\b"),
      /消火器|避難|非常口|緊急|地震|津波|台風|元栓|火の元|火災|安全|119|110/,
    ],
    reason: "Safety information is allowed. In Japan, 住宅宿泊事業法 art. 9 requires explaining fire prevention (gas valve, extinguisher, evacuation route) to guests.",
    reasonJa: "安全情報は問題ありません。日本では住宅宿泊事業法第9条で火災防止（ガスの元栓・消火器・避難経路）の説明が義務です。",
  },
];

/** Register items by law (for the Japan legal exception). */
export const JAPAN_REGISTER = {
  minpaku: {
    law: "住宅宿泊事業法 art. 8 + MLIT guideline (最終改正 2024-12-24)",
    items: ["name (氏名) of every guest", "address (住所)", "occupation (職業)", "dates of stay (宿泊日)", "foreign guests without a Japan address: nationality (国籍) and passport number (旅券番号), see the passport and keep a copy (旅券の写し) with the register"],
    notes: "Identity must be confirmed before the stay, face-to-face or by ICT (e.g. a tablet or video call at the property). Contact details are recommended, not required. Keep the register 3 years.",
  },
  ryokan: {
    law: "旅館業法 art. 6 + 施行規則 art. 4-2",
    items: ["name (氏名)", "address (住所)", "contact details (連絡先)", "foreign guests without a Japan address: nationality (国籍) and passport number (旅券番号)", "other items the prefecture requires"],
    notes: "MHLW guidance also asks hotels and ryokan to see and copy the passport of foreign guests without a Japan address. Keep the register 3 years.",
  },
};

export class RuleInputError extends Error {}

export type CheckInput = {
  text?: string | null;
  rules?: string[] | null;
  jurisdiction?: Jurisdiction;
  lodging?: Lodging;
  channel?: Channel;
  bookingDate?: string | null;
  today?: string | null;
};

export type Item = {
  index: number;
  text: string;
  finding: Finding;
  label: string;
  categories: Category[];
  reasons: string[];
  reasonsJa: string[];
  rewrite: string | null;
  moveTo: string | null;
  japanNote: string | null;
  matched: string[];
};

const D = /^\d{4}-\d{2}-\d{2}$/;
function todayJst(): string {
  return new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
}
function days(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400_000);
}
function validDate(v: string | null | undefined, name: string): string | null {
  if (!v) return null;
  if (!D.test(v) || Number.isNaN(Date.parse(`${v}T00:00:00Z`))) throw new RuleInputError(`Invalid ${name} "${v}". Use YYYY-MM-DD.`);
  return v;
}

const MAX_CHARS = 8000;
const MAX_ITEMS = 80;

/** Split pasted rules into items: lines, bullets and sentences (EN 。/. and JA). */
export function splitRules(text: string): string[] {
  const out: string[] = [];
  for (const rawLine of text.replace(/\r/g, "").split(/\n+/)) {
    const line = rawLine.replace(/^\s*([-*•・●◯○■□▪▶✓✔✗✘❌⭕]|\d{1,2}[.)．、]|[（(]\d{1,2}[)）]|[a-z][.)])\s*/i, "").trim();
    if (!line) continue;
    const parts = line.split(/(?<=[。！？!?])\s*|(?<=[a-z0-9)"'”’]\.)\s+(?=[A-Z0-9"“(])|\s*;\s*|；/);
    for (const p of parts) {
      const t = p.trim();
      if (t.replace(/[\s.。]/g, "").length >= 2) out.push(t);
    }
  }
  return out;
}

const REGISTER_RE = /passport|旅券|パスポート|guest\s+(register|registry|list|registration)|宿泊者名簿|名簿|nationalit|国籍|occupation|職業|\bname|氏名|address|住所|本人確認|identity|id\s+(check|verification)|face|顔|contact|連絡先/i;
const NEVER_LEGAL_RE = /マイナンバー|my\s?number|social\s+security|ssn|credit\s+card|クレジットカード|bank|口座|selfie|自撮り|date\s+of\s+birth|生年月日|deposit|デポジット|保証金/i;

function classify(text: string, ctx: Required<Pick<CheckInput, "jurisdiction" | "lodging" | "channel">>, index: number): Item {
  const hits = RULES.filter((r) => r.re.some((re) => re.test(text)));
  const ids = new Set(hits.map((h) => h.id));
  let effective = hits.map((h) => ({ ...h }));

  // Optional add-on turns a fee into an allowed request; a local-authority mention turns a fine into a Local rules notice.
  if (ids.has("optional") && ids.has("fee") && !ids.has("fine")) effective = effective.filter((h) => h.id !== "fee");
  if (!ids.has("fee") && !ids.has("fine")) effective = effective.filter((h) => h.id !== "optional");
  if (ids.has("fine") && ids.has("local_fine") && !/\b(we|i)\s+(will|may)\b|私|当方|ホスト/i.test(text)) effective = effective.filter((h) => h.id !== "fine");
  if (!ids.has("fine")) effective = effective.filter((h) => h.id !== "local_fine");
  // Specific light requests beat the generic "tidy up" match; "dishes in the sink" beats "dishes".
  if (ids.has("ok_checkout")) effective = effective.filter((h) => h.id !== "vague_cleaning");
  if (ids.has("ok_checkout") && /sink|シンク|流し/i.test(text) && !/\b(wash|rinse|dry|put away|dishwasher)\b|洗|食洗機|しまっ/i.test(text)) effective = effective.filter((h) => h.id !== "dishes");
  if (ids.has("ok_checkout") && /分別|sort|separate/i.test(text) && !ids.has("trash_offsite")) effective = effective.filter((h) => h.id !== "cleaning");
  // Turning AC off when leaving is not an amenity restriction.
  if (ids.has("ok_checkout") && /turn\s+off|消|切|オフ/i.test(text) && !/(do not|don't|dont|never|no)\s+(use|turn on)|禁止|不可|できません|ご遠慮|\d+\s*(度|°)|\b(below|under|above|lower than|higher than)\s*\d/i.test(text)) effective = effective.filter((h) => h.id !== "amenity");
  // Local conditions (drought, bears) soften shower/trash restrictions to a review.
  if (ids.has("local_exception")) {
    effective = effective.map((h) => (h.id === "amenity" || h.id === "trash_offsite" ? { ...h, finding: "review" as Finding, reason: `${h.reason} A local reason is given, so Airbnb may allow it as an exception; explain it.` } : h));
  }
  // Safety words like "earthquake" shouldn't mask a real issue; standard-rule words inside a fine stay a fine (max severity handles it).

  let japanNote: string | null = null;
  if (ctx.jurisdiction === "JP") {
    effective = effective.map((h) => {
      if ((h.id === "id_info" || h.id === "off_platform" || h.id === "contract") && REGISTER_RE.test(text) && !NEVER_LEGAL_RE.test(text)) {
        const reg = ctx.lodging === "ryokan" ? JAPAN_REGISTER.ryokan : JAPAN_REGISTER.minpaku;
        const both = ctx.lodging === "unknown";
        japanNote = `Japan: hosts must keep a guest register (${both ? "住宅宿泊事業法 art. 8 for minpaku, 旅館業法 art. 6 for hotels/ryokan/簡易宿所" : reg.law}): ${both ? "name, address, occupation (minpaku) or contact details (旅館業), dates; for foreign guests without a Japan address, nationality and passport number, and a passport copy" : reg.items.join("; ")}. Airbnb allows collecting what the law requires if it is disclosed in Requests before booking and limited to the legal items.`;
        if (h.id === "id_info") return { ...h, category: "japan_guest_register" as Category, finding: "legal_exception" as Finding, reason: "Collecting the legally required guest register (and a passport copy for foreign guests without a Japan address) fits Airbnb's 'required by law' exception, if disclosed in Requests before booking and limited to what the law requires.", reasonJa: "法令で必要な宿泊者名簿（日本に住所のない外国人は旅券の写しも）の収集は、予約前にリクエストで開示し法令の範囲に限れば、Airbnbの「法令で必要な場合」の例外にあたります。", rewrite: "Japanese law (住宅宿泊事業法 art. 8 / 旅館業法 art. 6) requires a guest register: name, address and occupation/contact of every guest; for foreign guests without a Japan address, nationality, passport number and a passport copy, checked at check-in." };
        if (h.id === "off_platform") return { ...h, finding: "review" as Finding, reason: "Off-platform check-in is not allowed except where required by law. Collecting the legal guest register online may fit the exception, but disclose it in Requests before booking, limit it to the legal items and don't make the app or site a condition beyond that.", reasonJa: "Airbnb外でのチェックイン強制は原則不可ですが、法令上の宿泊者名簿の収集なら例外になり得ます。予約前にリクエストで開示し、法令の項目に限ってください。" };
        return h;
      }
      return h;
    });
    if (effective.some((h) => h.id === "trash_offsite")) japanNote = "Japan: under the MLIT minpaku guideline, trash from a minpaku is business waste (事業系廃棄物) the operator must dispose of; guests should be told to sort it and leave it in the designated place inside the home (which Airbnb allows). Don't send guests to the household collection point.";
    else if (!japanNote && effective.some((h) => h.id === "std_quiet" || h.id === "ok_checkout" || h.id === "safety") && /noise|騒|静|音|trash|garbage|ゴミ|ごみ|分別|fire|火|gas|ガス|消火|避難/i.test(text))
      japanNote = "Japan: 住宅宿泊事業法 art. 9 requires explaining noise, trash and fire-prevention points to guests (in a foreign language for foreign guests). Explanations that repeat what's in the listing are fine; keep the rule itself in the listing.";
  } else if (effective.some((h) => h.id === "id_info") && !NEVER_LEGAL_RE.test(text)) {
    japanNote = "If a local law requires guest ID or a register where your listing is, Airbnb allows it; name the law in Requests before booking.";
  }

  // Rules communicated outside the listing after booking can't add new rules.
  if (ctx.channel !== "listing" && !effective.some((h) => h.finding === "likely_ok" && h.id === "safety")) {
    effective.push({ ...RULES.find((r) => r.id === "after_booking")!, reason: `Sent by ${ctx.channel.replace("_", " ")}: rules communicated after booking can't add anything that isn't already in the listing's House rules and requests.` });
  }

  const worst = effective.reduce<Finding>((w, h) => (SEVERITY[h.finding] > SEVERITY[w] ? h.finding : w), "no_match");
  const lead = effective.filter((h) => h.finding === worst);
  const firstWithRewrite = lead.find((h) => h.rewrite) ?? effective.find((h) => h.rewrite && SEVERITY[h.finding] >= SEVERITY.move_to_section);
  const firstSection = effective.find((h) => h.section && SEVERITY[h.finding] >= SEVERITY[worst] - 0)?.section ?? effective.find((h) => h.section)?.section ?? null;
  const order = [...effective].sort((a, b) => SEVERITY[b.finding] - SEVERITY[a.finding]);
  return {
    index,
    text,
    finding: worst,
    label: FINDING_LABEL[worst],
    categories: [...new Set(order.map((h) => h.category))],
    reasons: worst === "no_match" ? ["No known pattern matched. Check it yourself against the policy: is it reasonable, disclosed before booking, and not a cleaner task, fee, fine, contract, ID request or amenity restriction?"] : [...new Set(order.map((h) => h.reason))],
    reasonsJa: worst === "no_match" ? ["該当するパターンがありません。合理的か、予約前に開示しているか、清掃作業・料金・罰金・契約・身分証・設備制限にあたらないかを確認してください。"] : [...new Set(order.map((h) => h.reasonJa))],
    rewrite: SEVERITY[worst] >= SEVERITY.legal_exception ? firstWithRewrite?.rewrite ?? null : null,
    moveTo: worst === "move_to_section" || worst === "use_standard_rule" ? firstSection : null,
    japanNote,
    matched: order.map((h) => h.id),
  };
}

export function checkHouseRules(input: CheckInput) {
  const jurisdiction = input.jurisdiction ?? "JP";
  const lodging = input.lodging ?? "unknown";
  const channel = input.channel ?? "listing";
  if (!(JURISDICTIONS as readonly string[]).includes(jurisdiction)) throw new RuleInputError(`Invalid jurisdiction "${jurisdiction}". Allowed: ${JURISDICTIONS.join(", ")}`);
  if (!(LODGING as readonly string[]).includes(lodging)) throw new RuleInputError(`Invalid lodging "${lodging}". Allowed: ${LODGING.join(", ")}`);
  if (!(CHANNELS as readonly string[]).includes(channel)) throw new RuleInputError(`Invalid channel "${channel}". Allowed: ${CHANNELS.join(", ")}`);
  const today = validDate(input.today, "today") ?? todayJst();
  const bookingDate = validDate(input.bookingDate, "bookingDate");

  let lines: string[];
  if (input.rules && input.rules.length) {
    lines = input.rules.flatMap((r) => splitRules(String(r)));
  } else {
    const text = (input.text ?? "").trim();
    if (!text) throw new RuleInputError("Missing text: paste your house rules or requests (English or Japanese), one per line, e.g. text=Please wash the dishes before checkout. No smoking.");
    if (text.length > MAX_CHARS) throw new RuleInputError(`Text too long (${text.length} chars). Max ${MAX_CHARS}.`);
    lines = splitRules(text);
  }
  if (!lines.length) throw new RuleInputError("No rules found in the text. Put each rule on its own line.");
  if (lines.length > MAX_ITEMS) throw new RuleInputError(`Too many rules (${lines.length}). Max ${MAX_ITEMS} per check.`);

  const items = lines.map((t, i) => classify(t.slice(0, 600), { jurisdiction, lodging, channel }, i + 1));
  const counts = Object.fromEntries(FINDINGS.map((f) => [f, items.filter((i) => i.finding === f).length])) as Record<Finding, number>;

  const refDate = bookingDate ?? today;
  const policyApplies = refDate >= POLICY_START;
  const daysUntilPolicy = Math.max(0, days(today, POLICY_START));
  const verdict = counts.likely_flagged > 0 ? "fix_needed" : counts.review > 0 || counts.no_match > 0 ? "review_needed" : counts.move_to_section > 0 || counts.use_standard_rule > 0 ? "tidy_up" : "looks_ok";
  const VERDICT_LABEL = { fix_needed: "Fix before Nov 20", review_needed: "Mostly fine, check a few", tidy_up: "Move rules to the right fields", looks_ok: "Looks OK" } as const;
  const standardRules = [...new Set(items.filter((i) => i.finding === "use_standard_rule" && i.moveTo).map((i) => i.moveTo!.replace("Standard rule: ", "")))];

  const headline =
    verdict === "fix_needed"
      ? `${counts.likely_flagged} of ${items.length} rules are likely not allowed under Airbnb's new house rules policy`
      : verdict === "review_needed"
        ? `No clear violations, but ${counts.review + counts.no_match} of ${items.length} rules need a closer look`
        : verdict === "tidy_up"
          ? `No violations found; ${counts.move_to_section + counts.use_standard_rule} rules belong in standard fields or other sections`
          : `All ${items.length} rules look like allowed requests`;

  const summary = [
    policyApplies
      ? bookingDate
        ? `A reservation booked on ${bookingDate} is covered by the new policy (bookings on or after ${POLICY_START}).`
        : `The new policy applies to reservations booked on or after ${POLICY_START}.`
      : bookingDate
        ? `A reservation booked on ${bookingDate} (before ${POLICY_START}) is under the previous rules, but the listing editor changed on ${EDITOR_CHANGE}, so fix the listing now.`
        : `The policy applies to reservations booked on or after ${POLICY_START} (${daysUntilPolicy} days from ${today}); Airbnb's listing editor already changed on ${EDITOR_CHANGE}.`,
    counts.legal_exception ? `${counts.legal_exception} item(s) can stay only because a law requires them: disclose them in Requests before booking.` : "",
    standardRules.length ? `Set these as standard rules: ${standardRules.join(", ")}.` : "",
  ].filter(Boolean).join(" ");

  const japanChecklist =
    jurisdiction === "JP"
      ? [
          "Guest register (宿泊者名簿): disclose in Requests before booking that Japanese law requires name, address and occupation/contact, plus nationality, passport number and a passport copy for foreign guests without a Japan address; ask for nothing more.",
          "住宅宿泊事業法 art. 9 explanations (noise, trash sorting, fire prevention, in a foreign language for foreign guests) can stay in the home as information, but every rule must also be in the listing.",
          "Trash: ask guests to sort into the designated indoor bins (allowed); minpaku trash is business waste you dispose of, never the household collection point.",
          "Remove room signs or check-in messages that add rules not in the listing.",
        ]
      : [];

  return {
    verdict,
    verdictLabel: VERDICT_LABEL[verdict],
    headline,
    summary,
    policy: { appliesToBookingsFrom: POLICY_START, editorChanged: EDITOR_CHANGE, bookingDate, appliesToThisBooking: policyApplies, daysUntilPolicy, today },
    counts: { total: items.length, ...counts },
    items,
    standardRulesToSet: standardRules,
    japanChecklist,
    jurisdiction,
    lodging,
    channel,
    rulesAsOf: RULES_AS_OF,
    sources: SOURCES,
  };
}

export type CheckResult = ReturnType<typeof checkHouseRules>;

export const RULES_SUMMARY = {
  name: "House Rules Check",
  rulesAsOf: RULES_AS_OF,
  policy: {
    appliesToReservationsBookedOnOrAfter: POLICY_START,
    listingEditorChanged: EDITOR_CHANGE,
    standardRules: ["Maximum overnight guests", "Quiet hours", "Events", "Pets", "Smoking", "Commercial photography", "Lock up at checkout"],
    mustBe: [
      "Disclosed in the House rules and requests section of the listing before booking (no new rules later by message, signs or in person)",
      "Consistent with the rest of the listing",
      "Compliant with Airbnb policies: no separate contracts or personal info such as government ID, except where required by law and other limited circumstances",
      "Reasonable",
    ],
    generallyNotAllowed: [
      "Tasks a cleaner would do or that take significant effort: stripping beds, taking trash off-site, washing and putting away dishes",
      "Restricting a feature advertised as part of the listing; fees for advertised features must be in the price at booking",
      "Fines or other penalties (damage: AirCover; HOA/local fines: notice in the Local rules section)",
    ],
    allowedExamples: ["Leave dishes in the sink", "Gather used towels", "Sort trash into designated indoor bins", "Turn off lights/AC when leaving", "Optional add-ons with prices (breakfast)", "Safety information", "Local exceptions such as animal-proof bins or drought shower limits"],
  },
  japan: {
    guestRegister: JAPAN_REGISTER,
    explanationDuty: "住宅宿泊事業法 art. 9: explain noise, trash and fire-prevention points; in a foreign language for foreign guests.",
    trash: "MLIT guideline: minpaku trash is business waste the operator must dispose of; guests leave sorted trash at the designated place in the home.",
  },
  findings: FINDING_LABEL,
  patternCount: RULES.length,
  sources: SOURCES,
  disclaimer: DISCLAIMER,
};
