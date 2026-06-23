export type ItemCategory = '帽子' | '上着' | 'パンツ' | '靴下' | '靴' | 'アクセサリー' | 'ペット' | '乗り物' | 'クーポン' | 'NFT';
export type ItemRarity = 'コモン' | 'レア' | 'スーパーレア' | 'ハイパーレア' | 'エピック' | 'ウルトラ' | 'レジェンド';

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: ItemRarity;
  emoji: string;
  description: string;
  source: string;
}

export const WEARABLE_CATEGORIES: ItemCategory[] = ['帽子', '上着', 'パンツ', '靴下', '靴', 'アクセサリー', 'ペット', '乗り物'];

export const LOCAL_ITEMS: Item[] = [
  { id: 'imabari_towel',    name: '今治タオルマフラー',     category: 'アクセサリー', rarity: 'レア',       emoji: '🧣', description: '今治の職人が織った最高級タオル', source: '愛媛県・今治エリア' },
  { id: 'nishijin_kimono',  name: '西陣織の着物',          category: '上着',        rarity: 'エピック',   emoji: '👘', description: '京都西陣の伝統工芸品',         source: '京都府・西陣エリア' },
  { id: 'kurashiki_denim',  name: '倉敷デニムジャケット',   category: '上着',        rarity: 'レア',       emoji: '🧥', description: '備中の藍染めデニム',           source: '岡山県・倉敷エリア' },
  { id: 'kyoto_kasa',       name: '舞妓の傘',              category: 'アクセサリー', rarity: 'ハイパーレア', emoji: '☂️', description: '京都祇園限定の和傘',           source: '京都府・祇園エリア' },
  { id: 'osaka_happi',      name: '大阪祭りハッピ',         category: '上着',        rarity: 'コモン',     emoji: '🎽', description: '大阪の祭りで着る法被',         source: '大阪府・天神橋エリア' },
  { id: 'asakusa_headband', name: '浅草鉢巻き',            category: '帽子',        rarity: 'コモン',     emoji: '🎌', description: '浅草の祭り限定アイテム',       source: '東京都・浅草エリア' },
  { id: 'nikko_armor',      name: '日光武将の兜',           category: '帽子',        rarity: 'スーパーレア', emoji: '⛩️', description: '日光東照宮の武将コスチューム', source: '栃木県・日光エリア' },
  { id: 'okinawa_sango',    name: '沖縄サンゴのネックレス', category: 'アクセサリー', rarity: 'レア',       emoji: '🪸', description: '沖縄の海で採れたサンゴ',       source: '沖縄県・那覇エリア' },
  { id: 'hokkaido_fur',     name: '北海道ファーコート',     category: '上着',        rarity: 'ウルトラ',   emoji: '🧤', description: '北海道の冬限定コート',         source: '北海道・札幌エリア' },
];

export const COLLAB_ITEMS: Item[] = [
  { id: 'nike_shoes',    name: 'NIKEエアマックス',         category: '靴',   rarity: 'レジェンド',  emoji: '👟', description: 'NIKE購入者限定デジタルシューズ', source: 'NIKE直営店' },
  { id: 'adidas_shoes',  name: 'ADIDASスタンスミス',       category: '靴',   rarity: 'レジェンド',  emoji: '👟', description: 'ADIDAS購入者限定',             source: 'ADIDAS直営店' },
  { id: 'starbucks_hat', name: 'スタバ限定グリーンハット', category: '帽子', rarity: 'ハイパーレア', emoji: '🎩', description: 'スターバックス来店記念',         source: 'スターバックス各店' },
  { id: 'uniqlo_fleece', name: 'ユニクロフリース',          category: '上着', rarity: 'コモン',      emoji: '🧥', description: 'ユニクロ来店記念アイテム',       source: 'ユニクロ各店' },
  { id: 'nintendo_hat',  name: 'マリオキャップ',            category: '帽子', rarity: 'ウルトラ',    emoji: '🍄', description: '任天堂コラボ限定',             source: '任天堂直営店' },
];

export const DEFAULT_ITEMS: Item[] = [
  { id: 'default_hat',  name: '冒険者の帽子',  category: '帽子', rarity: 'コモン', emoji: '🎩', description: '旅の始まりに贈られた帽子', source: '初期装備' },
  { id: 'default_coat', name: '冒険者のコート', category: '上着', rarity: 'コモン', emoji: '🧥', description: '旅に出るための基本装備',   source: '初期装備' },
];

export const RARITY_COLORS: Record<ItemRarity, string> = {
  'コモン':      '#8892a4',
  'レア':        '#4ea0ff',
  'スーパーレア': '#00c8ff',
  'ハイパーレア': '#00ff99',
  'エピック':    '#a855f7',
  'ウルトラ':    '#ff6b00',
  'レジェンド':  '#e8b84b',
};

export const RARITY_ORDER: Record<ItemRarity, number> = {
  'コモン':      1,
  'レア':        2,
  'スーパーレア': 3,
  'ハイパーレア': 4,
  'エピック':    5,
  'ウルトラ':    6,
  'レジェンド':  7,
};