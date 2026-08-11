# CLAUDE.md

このファイルは、Claude Code がこのリポジトリで作業する際のコンテキストです。

## プロジェクト概要

「あなたならどう味方する？」— アクティブバイスタンダーシップとマイクロアグレッションについて学ぶ、
シナリオベースの学習Webアプリ。職場や日常で起こりうる場面を提示し、複数の選択肢から対応を選ぶと、
その選択に対するフィードバック（推奨されるアプローチかどうかと、その理由）が表示される。

対象ユーザー：DEI教育・研修担当者、Pride月間などの啓発コンテンツを探している人、
アクティブバイスタンダーシップに関心のある一般ユーザー。

## 技術スタック

- Nuxt 3 (Vue 3, Composition API, `<script setup lang="ts">`)、TypeScript（strict）
- @nuxtjs/i18n（日本語 / 英語、`strategy: 'no_prefix'`、`detectBrowserLanguage: false`。
  ブラウザ言語の自動検出と手動切り替えボタンが競合するため無効化している）
- Nuxt server routes（Nitro）をバックエンドAPIとして使用（`server/api/`）
- **nuxt` は `3.15.4` に固定**している（`^3.13.2` のような緩い範囲だと `@nuxtjs/i18n@8.x` と
  非互換な `unhead@2.x` を含む新しいpatchが入り、言語切り替えが壊れる。むやみに上げないこと）
- DB: Drizzle ORM + `@libsql/client`（libSQL、ローカルではファイルDB `.data/app.db`）。
  `better-sqlite3` はこの開発機のXcode Command Line Tools（clang 11、C++20非対応）でネイティブ
  ビルドに失敗したため不採用。libSQLはプリビルドバイナリで動く。デプロイ先はVercel、DBは
  Turso（リモートlibSQL）を想定しており、`server/utils/db.ts` が `runtimeConfig`
  （`NUXT_TURSO_DATABASE_URL` / `NUXT_TURSO_AUTH_TOKEN`。`.env.example` 参照）の有無で
  ローカルファイルDBとTursoを自動的に切り替える（未設定ならファイルDBにフォールバック）
- **ゲスト向け機能（一覧・回答・`/me`）にアカウント・ログインは無い**。ブラウザに発行する
  匿名Cookie（`guest_id`）だけが唯一の識別子。過去に nuxt-auth-utils でログイン機能を
  実装したことがあるが、「ゲストのまま気軽に触れる」体験を優先してユーザー判断で撤去した。
  再度アカウント機能が必要になった場合も、`votes` は既に `guest_id` 単位で正規化されているので、
  アカウントに束ねる層を後から足すのは比較的容易なはず。
  **`/admin` だけは例外**で、共有パスワード1つによる簡易ログインを持つ
  （詳細は「管理画面」の節を参照）。ゲスト向けの「ログイン機構を足さない」方針とは
  スコープが別であることに注意。
- シナリオ本文は `scenarios` テーブル（Drizzle、`choices` 等は列内に JSON として保持）で管理し、
  `/admin` からCRUDする。DBにはこれと `votes`（誰が・どのシナリオで・どの選択肢を選んだか）
  ・`free_responses`（自由記述回答）が入っている

## ディレクトリ構成

```
pages/               index.vue=一覧（topic/situationで絞り込み）, scenario/[id].vue=詳細,
                      diagnosis.vue=はじめに→5問連続のロールプレイ診断→結果（5D傾向のサマリー）の
                      3ステートを1ページで管理。実際の出題・回答UIは components/ScenarioPlayer.vue
                      に共通化されており、scenario/[id]とdiagnosisはどちらもこれを使う
                      （表示ロジックを1箇所に保つことで両者の挙動を一致させている）, me.vue=個人の回答傾向
                      admin/login.vue=管理者ログイン, admin/index.vue=シナリオ一覧+削除,
                      admin/new.vue・admin/[id].vue=新規作成・編集（どちらも
                      components/admin/ScenarioForm.vue を共有）
components/          ScenarioPlayer（シナリオ1件の出題〜回答〜FBまでを担う中心コンポーネント）,
                      ScenarioCard, ScenarioIllustration, ChoiceOption, FeedbackPanel
components/admin/    ScenarioForm（シナリオ全項目の作成・編集フォーム。「編集」「プレビュー」の
                      表示切り替えを持つ）, ScenarioPreview（未保存の入力内容を、公開側と同じ
                      ScenarioIllustration/FeedbackPanel を再利用して実際の見た目でプレビュー。
                      ja/en切り替え・選択肢クリック・リアクション3パターンの切り替えに対応）,
                      LocalizedField（ja/en ペア入力の共通部品）。admin配下のコンポーネントは
                      Nuxtの自動importに頼らず明示的に import すること（新規追加コンポーネントが
                      dev serverの自動importスキャンに即座に反映されないことがあるため）
middleware/admin.ts  /admin/** ページ用のNuxtルートミドルウェア。/api/admin/me を叩いて
                      401ならログイン画面へリダイレクト（UX目的。実際の認可境界はサーバー側）
server/api/          scenarios.get.ts（一覧）, scenarios/[id].get.ts（詳細）
                      scenarios/[id]/vote.post.ts, scenarios/[id]/respond.post.ts
                      me/stats.get.ts（guest_id単位の回答傾向。誰でもアクセス可）
                      admin/login.post.ts・logout.post.ts・me.get.ts（管理者セッション）
                      admin/scenarios/（シナリオCRUD。index.get/post、[id].get/put/delete）
server/middleware/   admin-guard.ts（/api/admin/** を認可境界として一括保護。ログイン
                      エンドポイント自身だけ除外）
server/utils/        db.ts（Drizzleクライアント）, guest.ts（guest_id Cookieの発行/取得。
                      アプリ内で唯一の「誰が」を決めるロジック）,
                      engagement.ts（投票の記録と集計）, outcomes.ts（choice4の反応パターンの抽選）,
                      scenarios.ts（シナリオのDB読み書き。公開APIと管理APIの両方から使う）,
                      adminAuth.ts（管理者パスワード照合・セッションCookieの署名/検証）,
                      validateScenario.ts（管理APIでのシナリオ入力バリデーション）,
                      scenarioSeed.ts（初回起動時にDBへ入れる初期シナリオ。以後は参照されない）
server/plugins/      db-migrate.ts（起動時に db/migrations を自動適用し、scenarios テーブルが
                      空なら scenarioSeed.ts の内容を投入する）
db/schema.ts         votes・free_responses（guest_id を持つだけ）、scenarios
                      （シナリオ本文。title/summary/choices 等は列にJSONとして保持）
types/scenario.ts    Scenario / ScenarioChoice / ScenarioTopic などの型定義
types/analytics.ts   個人の回答傾向ページ（me.vue）用の集計結果の型
i18n/locales/        UI文言（ja.json / en.json）。シナリオ本文はDBに多言語で内包。
                      /admin 配下は内部ツールのため非対応（日本語決め打ち）
assets/css/main.css  グローバルスタイル（CSS変数ベース、Tailwind等は未導入）。admin系クラスも同居
```

## コーディング規約

- コンポーネントは Composition API + `<script setup lang="ts">` で統一する。
- シナリオの本文・選択肢・フィードバックは `LocalizedText`（`{ ja: string; en: string }`）型で持つ。
  UIの文言（ボタンラベルなど）は i18n の `$t()` を使う。この2つを混同しない。
- 新しいシナリオを追加する場合は `/admin`（`components/admin/ScenarioForm.vue`）から登録する。
  一覧ページ・詳細ページ・APIは自動的に対応する（`topic`/`situation`、各選択肢の
  `strategy`（5D。該当しなければ `'none'`）も忘れず設定する）。既存の `ScenarioTopic`/
  `ScenarioSituation` に無い値を追加する場合は `types/scenario.ts` の型を拡張するだけでなく、
  `ScenarioForm.vue` の選択肢（`topicOptions`/`situationOptions`）にも追加すること
  （フォームの `<select>` がその配列から生成されているため）。
- 選択肢を選んだ後も「不正解」を強く感じさせる表現（✕マークなど）は避ける。
  推奨されない選択には ✓ を付けない・警告色を使わないという設計意図を踏襲する
  （`--color-grow` トーンを使う）。
- API は `GET /api/scenarios`（要約のみ）と `GET /api/scenarios/:id`（詳細）の2つ。
  一覧では `choices`（正解・フィードバックを含む）を返さない設計にしている
  （選ぶ前に答えが見えてしまわないようにするため）。この設計意図は変更時に踏襲すること。
- 投票（vote）の集計・`pages/me.vue` の個人傾向、すべて**ログイン不要**。
  個人の傾向データは `server/api/me/stats.get.ts` で `getOrCreateGuestId(event)` から得た
  Cookie値のみで解決し、URLパラメータ等クライアント指定のIDを信用しないこと
  （本人＝そのブラウザ以外に見せない設計を維持する。ログイン機構を足す誘惑に負けないこと）。
- スキーマを変更したら `npx drizzle-kit generate` でマイグレーションSQLを生成すること
  （`server/plugins/db-migrate.ts` が起動時に自動適用する）。
- `/admin` と `/api/admin/**` は共有パスワード1本のログインで保護されている
  （`NUXT_ADMIN_PASSWORD` 環境変数、`.env.example` 参照。ユーザーテーブルは無く管理者は1人想定）。
  認可の実体は `server/middleware/admin-guard.ts`（全 `/api/admin/**` を一括ガード）で、
  `middleware/admin.ts`（Nuxtルートミドルウェア）は未ログイン時にログイン画面へ飛ばす
  UX目的の補助でしかない。ゲスト向け機能に「ログイン機構を足さない」という方針とは
  独立したスコープなので、混同して `/api/scenarios` 等の公開APIにガードを広げないこと。

## スプレッドシートからのシナリオ取り込み

シナリオ本文は下記の列構成のスプレッドシートでも管理されており、今後も同じフォーマットで
`/admin`（`components/admin/ScenarioForm.vue`）から登録され続ける想定（列名はスプレッドシート側の
呼び方。コード側は `types/scenario.ts` の camelCase フィールド名を使う）。取り込み時のマッピングは
以下の通り：

| スプレッドシート列 | `Scenario`/`ScenarioChoice` フィールド |
| --- | --- |
| トピック | `topic`（例:「性自認・性的指向」→`'lgbtq'`。既存の `ScenarioTopic` に無い値なら型を拡張する） |
| シチュエーション | `situation`（同僚→`coworker`、上司→`manager`、友達→`friend`、家族→`family`、見知らぬ人→`stranger`。型名は `ScenarioSituation`。i18n の名前空間は歴史的経緯で `relationship.*` のまま） |
| タイトル / あらすじ / あなたの立場 | `title` / `summary` / `yourPosition`（`yourPosition` は独立UIではなく `summary` の下に続けて表示される。あらすじ自体は前提のみでも問題発言まで含む文章でもどちらでもよい） |
| セリフ１（問題発言） | `dialogue1Speaker` + `dialogue1`（必須。話者はこのシナリオの「問題発言をした人」） |
| セリフ２（周囲） | `dialogue2Speaker` + `dialogue2`（任意。空欄/`none` なら省略し表示しない） |
| セリフ３（当事者） | `dialogue3Speaker` + `dialogue3`（任意。空欄/`none` なら省略し表示しない） |
| 選択肢1〜4 / フィードバック1〜4 | `choices[].text` / `choices[].feedback`。4択の並び順は `choices[0]` = `'none'`（何もしない）で固定、`choices[1]`〜`choices[3]` はそのシナリオに合う3つを `distract`（話題を変える）/`delegate`（第三者に委ねる）/`document`（記録する）/`delay`（後で個別に）/`direct`（その場で伝える）から自由に選ぶ。**`direct` は特定の位置に固定されておらず、`choices[1]`〜`choices[3]` のどこでも選べるし、1つも無くてもよい**（`ScenarioForm.vue` の「5つのD」セレクトに5つとも並んでいる）。`isRecommended` は「何もしない」だけ `false` |
| 選択肢の相手のリアクション（ディフェンシブ/CONFUSED/REFLECTIVE）+ 解説 | `strategy: 'direct'` を選んだ選択肢は必ず `reactions: Record<ReactionPattern, ChoiceReaction>` を持つ（**3パターンすべて必須、一部だけは不可** — サーバー側 `server/utils/validateScenario.ts` が強制。`direct` 以外の選択肢が `reactions` を持つのも不可）。投票時にこの3つから毎回ランダムで1つ抽選される。各 `ChoiceReaction` は `speakerName`（誰の返答か。通常は `dialogue1Speaker` と同じ人だが、選択肢の内容によっては当事者本人が答える場合もある）/ `reactionText`（スプレッドシートの「リアクション」列）/ `explanation`（「解説」列。選ばれた場合、選択肢自体の `feedback` の代わりにこちらが表示される）。**SILENT（沈黙）パターンは意図的に非採用** — 自由記述の続き入力欄で「相手が何も言わなかった」ことへの反応を書かせるのが難しいため

英語版は毎回、直訳ではなく自然な英会話として一から翻訳する。

## 現在のステータス

MVPスキャフォールドから拡張済み。複数シナリオ（日英・topic/situation付き、5D戦略タグ）、
一覧のtopic/situation絞り込み、選択→フィードバック表示、選択率パーセンテージ表示、
「はじめに」画面つきで5問連続で答えて傾向を見る診断モード（`/diagnosis`）、ゲストCookieだけに
よる個人の回答傾向ページ（`/me`）が動作する。ゲスト向け機能にアカウント・ログインは意図的に無い。
「あるある」リアクション機能は一度実装したが撤去済み（`db/migrations` に追加→ドロップの履歴が
残っている）。

シナリオ管理画面（`/admin`）を実装済み。シナリオ本文は `data/scenarios.ts` からDBの
`scenarios` テーブルへ移行し、`/admin` から作成・編集・削除できる（共有パスワード1本の
簡易ログインで保護。詳細は「コーディング規約」と「ディレクトリ構成」を参照）。
初回起動時（`scenarios` テーブルが空の時だけ）に `server/utils/scenarioSeed.ts` の内容
（旧 `data/scenarios.ts` にあった `partner-gender-assumption` と `interview-wrong-pronouns`
の2件、どちらもlgbtqトピック）が自動投入される。`/diagnosis` の出題数は
`Math.min(5, シナリオ総数)` で動くので、シナリオが5件未満でも壊れない。

## 次にやること

`BACKLOG.md` に優先順位付きのタスクリストがある。Claude Codeで実装を進める際は、
まず `npm install && npm run dev` で起動確認してから着手すること。
