# Open Campus 香りクイズ：34成分コンテンツ実装指示

## 目的

`open-campus-compounds.json` に収録した34成分を、Open Campusモードの香りクイズへ実装してください。コンテンツと `foundIn` のデータ構造・表示対応だけを変更し、既存のUIデザインやクイズの挙動は維持してください。

## マスターデータ

- ファイル: `open-campus-compounds.json`
- バージョン: `1.2`
- 成分数: 34
- 文章: 元のChatGPTチャットで作成・確定した展示向け文章
- 29番: 重複していた酢酸ベンジルを `β-イオノン` に置換済み
- 31〜34番: ヘリオトロピン（ピペロナール）、γ-デカラクトン、δ-デカラクトン、酢酸ヘキシル

各成分の形式は次のとおりです。

```ts
type FoundInItem = {
  label: string;
  type: "natural" | "product";
};

type OpenCampusCompound = {
  slug: string;
  name: string;
  englishName: string;
  smell: string;
  foundIn: FoundInItem[];
  comment: string;
};
```

## 実装内容

1. 現在の `outreachCompounds` またはOpen Campus用データを、JSONの34成分へ更新する。
2. `foundIn` が `string[]` の場合は `FoundInItem[]` に変更する。
3. 表示部分をオブジェクト形式に対応させる。
4. `foundIn` は `natural`、`product` の順に表示する。
5. 見出しは追加せず、既存レイアウトを維持する。
6. `natural` は緑系、`product` は青系の既存デザインに合うバッジで表示する。
7. JSON内の `smell`、`foundIn`、`comment` は書き換えず、そのまま使用する。

## 変更しないもの

- クイズロジック
- 出題順
- シャッフル
- SVG
- アニメーション
- プレイリスト
- Safari対応
- Visitorモード
- Open Campusモードの既存挙動
- その他のUIデザイン

## 実装後の確認

プロジェクトで利用できるスクリプトを確認し、少なくとも次を実行してください。

```bash
npm test
npm run lint
npm run build
```

あわせて次を確認してください。

- 34成分すべてが読み込まれる
- `slug` が重複していない
- 各成分に必須6項目がある
- 各 `foundIn` に `natural` 2件、`product` 2件がある
- `foundIn.type` に `natural` と `product` 以外がない
- ベンジルアセテートが1件だけである
- 29番がβ-イオノンである
- Visitorモードに回帰がない

## コミットメッセージ

```text
Implement 34-compound outreach content
```
