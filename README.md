# AI FANTASY Generator

NPC量産メーカー / モンスター量産メーカーとして使える、Next.js App Router製のAI生成Webアプリです。外部APIキーがなくてもデモモードで動作し、Supabase / Stripe / 画像生成APIを後から接続できます。

## 主な機能

- NPC量産メーカー、モンスター量産メーカー
- localStorageによるデモクレジット管理
- 生成結果のカード / リスト表示切替
- お気に入り、保存済みセット、生成履歴
- JSON / CSV / Markdownエクスポート
- Stripe Checkout導線とWebhook実装
- Supabase Auth / Database / Storage接続前提のSQL
- 画像生成Adapter構成（mock / Pollinations / OpenAI）

## ローカル起動手順

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。`.env.local` がなくても、デモモードとして20クレジットから利用できます。

品質確認:

```bash
npm run typecheck
npm run lint
npm run build
```

## 環境変数

`.env.example` を `.env.local` にコピーして、必要な値を設定します。

```bash
cp .env.example .env.local
```

画像生成APIを使わない場合は `IMAGE_API_PROVIDER=mock` にします。ただし本番環境では、簡易画像のまま公開されないよう `FORCE_MOCK_IMAGES=true` を入れない限りPollinationsを優先します。通常の大量生成は `IMAGE_API_PROVIDER=pollinations`、課金向けの高品質生成は `OPENAI_API_KEY` を設定したうえで「OpenAI高品質画像生成」をONにします。APIキーはサーバー側Route Handlerでのみ参照され、フロントには出ません。

Pollinations設定例:

```env
IMAGE_API_PROVIDER=pollinations
POLLINATIONS_API_KEY=sk_...
POLLINATIONS_PROXY_SECRET=ランダムな長い文字列
POLLINATIONS_IMAGE_MODEL=flux
```

`POLLINATIONS_API_KEY` が未設定の場合は公開系エンドポイントを試します。画像読み込みに失敗した場合でもカードは壊れず、最後の保険としてローカル生成のファンタジー風フォールバック画像へ自動で戻ります。

OpenAI高品質生成の設定例:

```env
OPENAI_API_KEY=sk-proj-...
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_STANDARD_IMAGES_ENABLED=false
```

通常生成は1体1クレジット、OpenAI高品質画像生成は1体21クレジットです。無料・低価格の大量生成で採算を崩さないよう、OpenAIは高品質オプション時だけ使う設計にしています。OpenAIが請求上限や一時障害で失敗した場合は代替画像へ戻り、追加20クレジットはOpenAI画像が実際に返った分だけ消費します。画像生成がうまくいかない場合やタイムアウトする場合は、生成数を1体にして1体ずつ実行してください。

## Supabase設定手順

1. Supabaseで新規プロジェクトを作成します。
2. SQL Editorで `supabase/schema.sql` を実行します。
3. Authenticationのメールログインを有効化します。
4. `.env.local` に以下を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`profiles` は初回登録時に20クレジットを付与します。生成APIではサーバー側RPC `consume_credits_for_user` を使って、クレジット不足チェックと減算を行います。

## Stripe設定手順

1. Stripe DashboardでAPIキーを取得します。
2. `.env.local` に `STRIPE_SECRET_KEY` を設定します。
3. Webhook Endpointを作成し、URLを `/api/stripe/webhook` にします。
4. イベント `checkout.session.completed` を購読します。
5. Webhook signing secretを `STRIPE_WEBHOOK_SECRET` に設定します。

購入プラン:

- Starter: 100クレジット / 500円
- Creator: 500クレジット / 1,980円
- Pro: 1500クレジット / 4,980円

Stripe未設定時は、購入ボタンがモック購入としてlocalStorageのクレジットを追加します。

## Vercelデプロイ手順

1. GitHubへリポジトリをpushします。
2. VercelでImport Projectを選びます。
3. Framework PresetはNext.jsを選択します。
4. Environment Variablesに `.env.example` の値を設定します。
5. Deployします。
6. Stripe WebhookのURLを `https://your-domain.vercel.app/api/stripe/webhook` に変更します。

公開環境で高品質画像を使う場合は、VercelのEnvironment Variablesに `IMAGE_API_PROVIDER=pollinations`、`POLLINATIONS_PROXY_SECRET`、`OPENAI_API_KEY` を入れます。PollinationsのSecret Keyを取得したら `POLLINATIONS_API_KEY` も追加してください。

## ディレクトリ構成

```text
app/
  api/                  Route Handler
  api/image/pollinations Pollinations画像プロキシ
  generator/npc/         NPC量産メーカー
  generator/monster/     モンスター量産メーカー
components/
  ui/                    shadcn/ui系プリミティブ
  *.tsx                  画面コンポーネント
lib/
  image-generation/      画像生成Adapter
  supabase/              Supabase client/server helper
  mock-data.ts           モック生成ロジック
  exporters.ts           JSON/CSV/Markdown出力
supabase/schema.sql      テーブル、RLS、RPC
docs/wordpress-guide.md  AI FANTASY掲載ガイド
```

## WordPressへの掲載手順

詳しくは `docs/wordpress-guide.md` を参照してください。基本はVercelデプロイURLへリンクするか、固定ページ内にiframeを埋め込みます。

## 完全マニュアル

登録、実装、本番接続、収益化、WordPress掲載までの詳細手順は `docs/complete-manual.md` を参照してください。

## 今後追加すべき機能

- 生成結果の検索・タグ管理
- Supabase Storageへの生成画像アップロード
- プロンプトテンプレート保存
- チーム共有ワークスペース
- 生成履歴の再編集
- Stripe Customer Portal
- 管理者向け売上・利用状況ダッシュボード
