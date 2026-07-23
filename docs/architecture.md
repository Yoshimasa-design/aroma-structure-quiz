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
Status: Designing Phase 2
Last updated: 2026-07-23

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

app.js
├── common.js
├── quiz.js
├── stats.js
├── learning.js
├── quiz-engine.js
├── state.js（既存の状態オブジェクトあり。ただし現行の quiz.js では未使用）
├── ui.js（空）
└── theme.js（空）

---

# 4. Target Architecture

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

循環参照は禁止。

---

# 7. State Ownership

状態は state.js のみ保持する。

---

# 8. Campus Version

変更するもの

・テーマ

・データ

・一部UI

変更しないもの

・quiz-engine

・state

・学習アルゴリズム

---

# 9. Refactoring Progress

## Completed

✓ Prepare files for app.js refactoring

✓ Add initial quiz engine module

✓ Use quiz engine for queue generation

✓ Add distractor generation to quiz engine

✓ Use quiz engine for distractor generation

✓ Remove distractor generation from common module

## Next

□ 現在の状態管理と state.js の利用状況を確認

□ quiz.js の状態を state.js へ段階的に移動

□ UI分離

□ Theme分離

□ app.js簡素化

□ Campus版対応

---

# 10. Coding Rules

・1コミット1目的

・動作確認後にコミット

・DOM操作は ui.js のみ

・状態は state.js のみ

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

## v1.0 (2026-07-23)

・Architecture作成

・Phase2開始

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


---

| 2026-07-23 | 設計書の `state.js（空）` という記述を修正 | `state.js` には既存の状態オブジェクトがある一方、現行の `quiz.js` は独自に状態を保持していることをコード確認で把握したため |

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

