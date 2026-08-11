# バックログ

完了（この内容は元は「すぐやる」だった1〜7の項目 — 詳細な要件・データ対応関係は git 履歴を参照）
- [x] 「体験する」開始前のイントロ画面を追加（`pages/diagnosis.vue` の `intro` ステート）
- [x] 「体験する」と通常のシナリオ選択の表示ロジックを統一（`components/ScenarioPlayer.vue` に共通化）
- [x] 「あなたの立場」をあらすじ内に統合（独立した「あなた」アイコンUIを削除）
- [x] フィードバック・他の回答者の割合をコンパクト化
- [x] シナリオデータ構造を変更（`topic`/`situation`/`title`/`summary`/`yourPosition`/`dialogue1〜3`/`choices[].reactions`。詳細は `types/scenario.ts` と `CLAUDE.md` の「スプレッドシートからのシナリオ取り込み」を参照）
- [x] マイページの表示順・コンパクト化（「よく選ぶ対応スタイル」を上部に）
- [x] カラーパレット・フォントの刷新（Calm Indigo → 写真の配色（blue pine / new grass / reflection / mist）に再刷新）
- [x] トップページをいい感じにする（ヒーロー／アクティブバイスタンダーの説明／ロールプレイの意義と使い方／シナリオを選ぶ、の4セクション構成に刷新。`pages/index.vue`）
- [x] 管理者画面（シナリオの管理画面）。シナリオ本文を `data/scenarios.ts` からDBの `scenarios` テーブルに移行し、`/admin` から作成・編集・削除できるように。共有パスワード1本の簡易ログインで保護（`NUXT_ADMIN_PASSWORD`、詳細は `CLAUDE.md`）。回答の傾向分析は未着手のまま

あとでやる
- [ ] 5問の診断も同じようなFBの見た目に
- [ ] AIフィードバック
- [ ] デプロイ
