> **Project Rule (Single Source of Truth)**
>
> このファイル (`docs/architecture.md`) は、本プロジェクト唯一の設計書である。
>
> - プロジェクトの目的
> - アーキテクチャ
> - 開発ルール
> - Decision Log
> - リファクタリング計画
> - 現在の開発状況
>
> は、すべて本ファイルで管理する。
>
> 設計変更を伴う場合は、コードを変更する前に本ファイルを更新する。
>
> 開発を再開するときは、最初に本ファイルを確認し、現在の方針と次の作業を確認する。
# Aroma Structure Quiz Architecture

Version: 1.0
Status: Release Candidate
Last updated: 2026-07-27

---

# 1. Project Goal

本プロジェクトは、香気化合物・化粧品成分・天然物などを学習するための
クイズシステムを構築することを目的とする。

将来的には

- 大学生向け教材
- Campus版（高校生・オープンキャンパス向け）
- その他の教育コンテンツ

を共通のプログラムで運用できるようにする。

基本方針は

> ロジックを共有し、UIとデータだけを差し替える

である。

---

# 2. Development Policy

本プロジェクトでは以下を必ず守る。

## 2.1 小さなコミット

1コミット1目的。

## 2.2 動作確認

動作確認後にコミットする。

## 2.3 リファクタリング優先

仕様変更と同時に行わない。

## 2.4 設計優先

architecture.md を唯一の仕様書とする。

---

# 3. Current Structure

各HTMLページが、その画面を担当するJavaScriptモジュールを読み込む静的サイトである。

- `common.js`: データ取得、テーマ適用、学習結果記録などの共通処理
- `storage.js`: お気に入りと学習記録の永続化、お気に入りUI
- `quiz-engine.js`: 出題順・選択肢生成など、DOMに依存しないクイズロジック
- `detail-modal.js`: 共通詳細モーダル
- `encyclopedia.js`: 図鑑画面
- `learn.js`: 香りから学ぶ画面
- `quiz.js`: 香りクイズ・構造式クイズ
- `review.js`: 復習画面
- `progress.js`: 学習記録画面

Version 1.0では、図鑑・香りから学ぶ・香りクイズ・構造式クイズが
同じ `detail-modal.js` と `detail-modal.css` を利用する。

---

# 4. Future Target Architecture

以下はVersion 1.0の現状ではなく、将来の段階的なリファクタリング目標である。

app.js
├── state.js
├── ui.js
├── quiz-engine.js
├── theme.js
└── common.js

app.js は初期化のみ担当する。

---

# 5. Module Responsibilities

## app.js

初期化・イベント登録のみ。

## quiz-engine.js

問題生成
出題順生成
選択肢生成
正誤判定

DOM操作禁止。

## state.js

唯一の状態管理。

## ui.js

画面描画のみ。

## theme.js

テーマ切替。

## common.js

共通ユーティリティ。

## detail-modal.js

香気成分の詳細表示、開閉、フォーカス復帰、モーダル固有のイベント登録を担当する。

呼び出し元固有の画面更新はコールバックで受け取り、一覧やクイズの状態を保持しない。

---

# 6. Dependency Rules

app.js

↓

state.js

↓

quiz-engine.js

ui.js

↓

state.js

common.js は独立。

detail-modal.js

↓

common.js（テーマ適用）

storage.js（お気に入りUI）

呼び出し元固有の更新処理はコールバックで受け取り、呼び出し元モジュールを import しない。

encyclopedia.js、learn.js、quiz.js は `createDetailModal()` でモーダルを初期化し、表示対象の成分を `open()` に渡す。

モーダルのHTML構造とCSSは各利用ページで共通のものを使用する。モーダルCSSは `detail-modal.css` に分離し、モーダルを利用するページだけが読み込む。

循環参照は禁止。

---

# 7. State Ownership

将来的には状態を `state.js` に集約する。

Version 1.0では各ページモジュールが画面固有の状態を保持し、
お気に入りと学習記録のみ `storage.js` を通して永続化する。

---

# 8. Campus Version

Campus版はVersion 1.1以降の計画であり、Version 1.0には含めない。
詳細は末尾のVersion Roadmapに記録する。

---

# 9. Refactoring Progress

## Completed

✓ Prepare files for app.js refactoring

✓ Add initial quiz engine module

✓ Use quiz engine for queue generation

✓ Add distractor generation to quiz engine

✓ Use quiz engine for distractor generation

✓ Remove distractor generation from common module

✓ Extract encyclopedia detail modal into `detail-modal.js` (Phase 1)

✓ Open the shared detail modal from `learn.js` without page navigation (Phase 2-1)

✓ Open the shared detail modal from the odor quiz without page navigation (Phase 2-2)

✓ Open the shared detail modal from the structure quiz without page navigation (Phase 2-3)

## Next

□ 現在の状態管理と state.js の利用状況を確認

□ quiz.js の状態を state.js へ段階的に移動

□ UI分離

□ Theme分離

□ app.js簡素化

これらはVersion 1.0リリース後に、機能追加とは分けて検討する。

---

# 10. Coding Rules

・1コミット1目的

・動作確認後にコミット

・将来的にDOM操作を ui.js へ集約する

・将来的に状態を state.js へ集約する

・quiz-engine はDOMを触らない

・themeは見た目のみ

---

# 11. Future

・高校生版

・英語版

・天然物版

・試験モード

・教員モード

・LMS連携

---

# 12. Design Philosophy

教材とプログラムを分離する。

ロジックは共通化し、

データとUIのみ差し替える。

---

# 13. Revision History

## v1.0 RC (2026-07-27)

・図鑑、香りから学ぶ、香りクイズ、構造式クイズの詳細モーダルを共通化

・Version 1.0の実装構成と将来目標を明確化

## v1.0 (2026-07-23)

・Architecture作成

・Phase 2開始

---

# 14. Decision Log

この章では、「何を変更したか」ではなく、
**「なぜその設計を採用したか」** を記録する。

Git のコミット履歴では理由まで分からなくなることがあるため、
重要な設計判断は必ずここへ残す。

| Date | Decision | Reason |
|------|----------|--------|
| 2026-07-23 | `quiz-engine.js` をゲームロジック専用モジュールとした | UI とロジックを分離し、Campus版・大学版で共通利用するため |
| 2026-07-23 | `distract()` を `common.js` から `quiz-engine.js` へ移動 | 選択肢生成はゲームロジックであり、汎用ユーティリティではないため |
| 2026-07-23 | `state.js` を唯一の状態管理モジュールとする方針を決定 | 状態を一元管理し、UI・ロジック・テーマを疎結合に保つため |
| 2026-07-23 | `architecture.md` を唯一の設計書とする | 長期間プロジェクトを中断しても、設計思想を再現できるようにするため |
| 2026-07-23 | 設計書の `state.js（空）` という記述を修正 | `state.js` には既存の状態オブジェクトがある一方、現行の `quiz.js` は独自に状態を保持していることをコード確認で把握したため |
| 2026-07-27 | 詳細モーダルを `detail-modal.js` に分離し、呼び出し元の更新処理をコールバックで注入する | モーダルを複数画面から再利用可能にしつつ、各画面の状態とモーダル処理の循環依存を避けるため |
| 2026-07-27 | 学ぶページの「図鑑で見る」から共通詳細モーダルを開き、モーダルCSSを `detail-modal.css` に分離する | ページ遷移による学習状態の消失を防ぎ、モーダルを使わないページへ影響させずに同じ表示を再利用するため |
| 2026-07-27 | 共有 `quiz.js` では香りモードだけが共通詳細モーダルを初期化する | 構造式クイズの既存動作と依存するHTMLを変更せず、香りクイズだけを段階的に移行するため |
| 2026-07-27 | Phase 2-3で共有 `quiz.js` の両モードから同じ詳細モーダル処理を利用する | 香り・構造式クイズで重複実装せず、回答後の詳細表示と状態保持を統一するため |


---

# 15. Development Workflow

本プロジェクトでは、以下の手順を標準的な開発フローとする。

アイデア
↓
設計の検討
↓
architecture.md 更新
↓
コミット単位の決定
↓
実装
↓
ブラウザで動作確認
↓
Git Commit
↓
Decision Log 更新（必要な場合）

## 原則

- 設計変更を伴う場合は、必ず `architecture.md` を先に更新する。
- 1コミット1目的を徹底する。
- 動作確認前にコミットしない。
- リファクタリングと機能追加を同一コミットで行わない。
- 判断に迷った場合は、設計書へ立ち返る。

---

# 16. Project Constitution

本プロジェクトでは、以下を最優先事項とする。

## 1. 保守性

短期的なコード量より、長期的な保守性を優先する。

## 2. 共通化

Campus版・大学版・将来の派生版でロジックを共有する。

## 3. 疎結合

各モジュールは必要最小限の依存関係のみ持つ。

## 4. 可読性

コードは「書く時間」より「読む時間」の方が長いことを前提とする。

## 5. 再現性

誰が作業しても、同じ手順で同じ結果になることを目指す。

## 6. 記録

重要な設計判断はコードだけでなく、Decision Log にも残す。

---

# 17. Session Restart Guide

長期間作業が空いた場合や、新しいチャットで開発を再開する場合は、
必ず以下の順番で状況を確認する。

1. `docs/architecture.md` を読む
2. Decision Log を確認する
3. Refactoring Progress を確認する
4. `git log --oneline --graph -15` を確認する
5. `git status` を確認する
6. 次に実施するコミットを決定する

この手順を踏むことで、途中経過を忘れていても、安全に開発を再開できる。

---

# 18. AI Collaboration Guidelines

AIとの共同開発では、以下のルールを守る。

- AIは `docs/architecture.md` を最優先で参照する。
- 推測だけで設計変更を進めない。
- 設計変更が必要な場合は、まず設計書の更新を提案する。
- 一度に大きな変更を行わない。
- 1コミット1目的を維持する。
- 動作確認が完了してから次の変更へ進む。
- コマンドで実行できる作業は、原則としてコマンド形式で提示する。
- 現在のコードを確認せずに、関数名や依存関係を決めつけない。
- 設計書と実装が食い違った場合は、作業を止めて差異を確認する。


---

# Project History

この章では、プロジェクト全体の方針変更や運用ルールの変更を記録する。

| Date | Change | Reason |
|------|--------|--------|
| 2026-07-23 | `docs/architecture.md` を唯一の設計書 (Single Source of Truth) とする | 設計書が複数存在すると内容が分散し、長期保守が困難になるため |
| 2026-07-23 | 開発開始時に必ず `docs/architecture.md` を確認する運用を採用 | 新しいチャットや長期間の中断後でも、安全に作業を再開できるようにするため |
| 2026-07-23 | 設計変更はコード変更より先に行うことを正式ルールとした | 設計と実装の不一致を防ぐため |

---

# 19. Version Roadmap

Version 1.0 完成後に以下を予定する。現時点では記録のみとし、実装しない。

## Version 1.1

- オープンキャンパスモード
- 入口画面（大学生向け／オープンキャンパス）
- アイドルモード
- 自動スライドショー
- 一定時間で解答・解説を表示
- 「体験クイズを始める」ボタン
- 体験クイズ
- 体験終了後、一定時間でスライドショーへ戻る

## Version 1.2

- 検索
- お気に入り一覧
- 学習統計
