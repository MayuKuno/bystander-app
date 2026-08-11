# あなたならどう味方する？ (How would you step in?)

アクティブバイスタンダーシップとマイクロアグレッションについて学ぶ、シナリオベースの学習アプリ。
職場や日常で起こりうる場面を読み、複数の対応から選ぶと、その選択への解説（推奨アプローチかどうか、
なぜそう言えるか）と、他の回答者がどの選択肢を選んだかの割合が表示されます。シナリオは対象属性
（topic）と当事者との関係性（relationship）で絞り込めるほか、5問連続で答えて自分の傾向（5 D's の
どれを選びがちか）を見る診断モード（`/diagnosis`）もあります。Pride月間などのDEI啓発コンテンツ
としても使える題材です。

日本語 / 英語のバイリンガル対応。

## 技術スタック

- [Nuxt 3](https://nuxt.com/)（Vue 3 + TypeScript, Composition API）
- [@nuxtjs/i18n](https://i18n.nuxtjs.org/)
- Nuxt server routes（Nitro）をAPIバックエンドとして使用
- [Drizzle ORM](https://orm.drizzle.team/) + [libSQL](https://github.com/tursodatabase/libsql)（ローカルはファイルDB、デプロイ先は[Turso](https://turso.tech/)に切り替え）

詳細な設計判断・ディレクトリ構成は [`CLAUDE.md`](./CLAUDE.md) を参照してください。

## セットアップ

```bash
npm install
npm run dev
```

`http://localhost:3000` で起動します。DBはローカルファイルのlibSQL（`.data/app.db`、gitignore済み）で、
初回起動時にマイグレーションが自動で適用されます。アカウント登録・ログインはなく、ブラウザに発行される
匿名Cookie（`guest_id`）だけで投票・個人の回答傾向（`/me`）が成立します。

デプロイ（Vercel + Turso想定）時に必要な環境変数は [`.env.example`](./.env.example) を参照してください。

## このプロジェクトについて

このリポジトリは、[Claude Code](https://code.claude.com) を使って開発を進める前提のスキャフォールドです。
MVP（シナリオ一覧・詳細・選択・フィードバック表示、複数シナリオ、日英対応）から拡張し、
topic/relationshipによる絞り込み、選択率の可視化、5問連続の診断モード（`/diagnosis`）、
個人の回答傾向ページ（`/me`）、シナリオ管理画面（`/admin`）まで動作します。今後の実装予定は
[`BACKLOG.md`](./BACKLOG.md) にまとめています。

### Claude Code のセットアップ

```bash
npm install -g @anthropic-ai/claude-code
```

Node.js 22 以上が必要です（sudoは使わない）。インストール後、プロジェクトのルートで:

```bash
claude
```

起動すると対話的にコーディングを依頼できます。例:

```
> BACKLOG.mdの「進捗保存」を実装して
> ScenarioCard.vueに回答済みバッジを追加して、CSSも合わせて調整して
> npm run buildが通るか確認して、エラーがあれば直して
```

`CLAUDE.md` にプロジェクトの規約・設計意図をまとめてあるので、Claude Codeはこれを読んだ上で
一貫性のある実装を提案してくれます。

## 参考にした枠組み

フィードバック文言は "5 D's of Bystander Intervention"（Distract / Delegate / Document / Delay / Direct）
の考え方を参考にしています。介入方法は一つではなく、状況や自分の安全に応じて選べるという前提で
シナリオを設計しています。
