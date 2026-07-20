# Architecture

## 基本構成

```
UI
 ↓
common.js
 ↓
storage.js
 ↓
各ページ
 ↓
JSONデータ
```

## 設計方針

- HTML・CSS・JavaScriptのみで構成
- GitHub Pagesで公開可能
- データと表示を分離
- 保守性を重視
- 拡張しやすい構造

## 主な役割

### common.js

共通処理

### storage.js

学習履歴・お気に入り管理

### review.js

復習モード

### progress.js

学習状況表示