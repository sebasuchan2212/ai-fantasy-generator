# AI FANTASY Generator 完全マニュアル

このマニュアルは、`AI FANTASY Generator` を「ローカルで試す」段階から「AI FANTASYに掲載して収益化する」段階まで進めるための手順書です。

対象読者:

- コードに詳しくないが、Webアプリを公開して収益化したい人
- Next.js / Supabase / Stripe / Vercelをこれから使う人
- AI FANTASYの記事・固定ページから生成ツールへ誘導したい人

最初に覚えること:

- デモモード: APIキーなしで動く確認用モード。クレジットはブラウザのlocalStorageに保存されます。
- 本番モード: Supabaseでログイン・履歴・クレジットを管理し、Stripeでクレジット販売します。
- 画像生成: 通常の大量生成はPollinations連携、課金向けの高品質生成はOpenAI画像APIに対応します。APIキーなしでも表示は壊れません。`IMAGE_API_PROVIDER=mock` は開発確認用で、本番では `FORCE_MOCK_IMAGES=true` を入れない限りPollinationsを優先します。`OPENAI_API_KEY` を設定すると「OpenAI高品質画像生成」だけOpenAIへ送ります。

## 1. 完成しているもの

このプロジェクトには以下が実装済みです。

- LPトップ: `/`
- NPC量産メーカー: `/generator/npc`
- モンスター量産メーカー: `/generator/monster`
- ダッシュボード: `/dashboard`
- 課金プラン: `/pricing`
- ログイン / 新規登録: `/auth`
- 利用規約: `/terms`
- プライバシーポリシー: `/privacy`
- 生成API: `/api/generate/npc`, `/api/generate/monster`
- お気に入りAPI: `/api/favorite`
- 生成履歴API: `/api/generations`
- 保存済みセットAPI: `/api/save-set`
- エクスポートAPI: `/api/export`
- Stripe Checkout API: `/api/stripe/checkout`
- Stripe Webhook API: `/api/stripe/webhook`
- Supabase SQL: `supabase/schema.sql`
- WordPress掲載ガイド: `docs/wordpress-guide.md`

## 2. ローカルで使う手順

### 2.1 必要なもの

- Node.js
- npm
- ブラウザ

### 2.2 起動する

プロジェクトフォルダで実行します。

```bash
npm install
npm run dev
```

ブラウザで開きます。

```text
http://localhost:3000
```

または、この環境では次でも動きます。

```text
http://127.0.0.1:3000
```

### 2.3 デモモードで確認する

`.env.local` がなくても動きます。

確認する流れ:

1. `/generator/npc` を開く。
2. 左の設定で生成数、種族、性別、役割、世界観などを選ぶ。
3. `生成する` を押す。
4. 生成結果カードが表示される。
5. 星アイコンでお気に入りにする。
6. チェックボックスで複数選択する。
7. `セット保存` を押す。
8. `選択したNPCをエクスポート` からJSON / CSV / Markdownを試す。
9. `/generator/monster` でも同じ流れを確認する。
10. `/dashboard` で生成履歴、お気に入り、保存済みセットを見る。
11. `/pricing` でモック購入を試す。

デモモードの注意:

- クレジットはブラウザごとに保存されます。
- 別ブラウザやシークレットウィンドウでは別の残高になります。
- ブラウザのデータを削除すると履歴も消えます。

## 3. コードの実装構造

主な構成です。

```text
app/
  api/                  サーバー側API
  generator/npc/         NPC生成画面
  generator/monster/     モンスター生成画面
  pricing/               課金ページ
  dashboard/             履歴・お気に入り・保存済みセット

components/
  GeneratorWorkspace.tsx         生成画面の中心
  SidebarGeneratorSettings.tsx   左側の設定UI
  ResultGrid.tsx                 カード表示
  ResultList.tsx                 リスト表示
  ResultCard.tsx                 生成結果カード
  ExportButton.tsx               JSON / CSV / Markdown出力
  PricingCards.tsx               料金プラン

lib/
  mock-data.ts                   NPC・モンスターのモック生成
  demo-store.ts                  localStorageのデモ保存
  exporters.ts                   エクスポート処理
  schemas.ts                     Zod入力検証
  stripe.ts                      Stripe helper
  supabase/                      Supabase client/server helper
  image-generation/              画像生成Adapter

supabase/
  schema.sql                     テーブル、RLS、RPC
```

重要な設計:

- APIキーはフロントに出しません。
- クレジット減算は本番ではサーバー側で行います。
- Supabase未設定時だけデモモードになります。
- 本番環境でSupabaseが設定されている場合、生成APIは認証ユーザーを要求します。
- Stripe Webhookは署名検証を行います。
- 画像生成に失敗してもファンタジー風のローカル画像へフォールバックします。

## 4. GitHub登録とコード公開

Vercelにデプロイするには、GitHubにコードを置くのが一番簡単です。

### 4.1 GitHubアカウントを作る

1. GitHubにアクセスします。
2. `Sign up` を押します。
3. メールアドレス、パスワード、ユーザー名を登録します。
4. メール認証を完了します。

### 4.2 リポジトリを作る

1. GitHub右上の `+` を押します。
2. `New repository` を選びます。
3. Repository nameを入力します。

おすすめ:

```text
ai-fantasy-generator
```

4. Public / Privateを選びます。最初はPrivateでも構いません。
5. `Create repository` を押します。

### 4.3 このプロジェクトをpushする

まだgit remoteを設定していない場合:

```bash
git add .
git commit -m "Initial AI FANTASY Generator"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/ai-fantasy-generator.git
git push -u origin main
```

`YOUR_NAME` は自分のGitHubユーザー名に置き換えます。

## 5. Supabase登録と設定

Supabaseは、ログイン、クレジット残高、生成履歴、お気に入り、保存済みセットを管理します。

### 5.1 Supabaseアカウントを作る

1. Supabaseにアクセスします。
2. `Start your project` または `Sign in` を押します。
3. GitHubログイン、またはメールアドレスで登録します。
4. Organizationを作成します。

### 5.2 新規プロジェクトを作る

1. Supabase Dashboardで `New project` を押します。
2. Project nameを入力します。

おすすめ:

```text
ai-fantasy-generator
```

3. Database Passwordを作ります。必ず安全な場所に保存してください。
4. Regionは、主なユーザーに近い地域を選びます。日本向けならTokyoやAsia系リージョンがあればそれを選びます。
5. `Create new project` を押します。

### 5.3 SQLを実行する

1. Supabase Dashboardで対象プロジェクトを開きます。
2. 左メニューの `SQL Editor` を開きます。
3. `New query` を押します。
4. このファイルの中身を貼り付けます。

```text
supabase/schema.sql
```

5. `Run` を押します。

作成されるテーブル:

- `profiles`
- `generations`
- `favorites`
- `credit_transactions`
- `saved_sets`

作成されるRPC:

- `consume_credits_for_user`
- `add_credits_for_user`

### 5.4 APIキーを取得する

Supabase Dashboardの `Settings > API Keys` またはプロジェクトのConnect画面からキーを取得します。

このアプリで使う環境変数:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

入れるもの:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: publishable key、またはlegacy anon key
- `SUPABASE_SERVICE_ROLE_KEY`: secret key、またはlegacy service_role key

注意:

- `NEXT_PUBLIC_` が付く値はブラウザに公開されます。
- `SUPABASE_SERVICE_ROLE_KEY` は絶対にフロントに出してはいけません。
- GitHubに `.env.local` をpushしてはいけません。

### 5.5 Authを確認する

1. Supabase Dashboardで `Authentication` を開きます。
2. `Providers` でEmailが有効になっているか確認します。
3. 最初はメール確認をOFFにしてテストしても構いません。
4. 本番ではメール確認ONを推奨します。

## 6. Stripe登録と収益化設定

Stripeはクレジット購入に使います。

このアプリの料金プラン:

- Starter: 100クレジット / 500円
- Creator: 500クレジット / 1,980円
- Pro: 1500クレジット / 4,980円

### 6.1 Stripeアカウントを作る

1. Stripeにアクセスします。
2. `Start now` または `Sign up` から登録します。
3. メール認証を完了します。
4. Dashboardに入ります。

本番決済に必要になりやすい情報:

- 事業形態
- 氏名または法人名
- 住所
- 電話番号
- 銀行口座
- 本人確認情報
- サービス内容

### 6.2 テストキーを取得する

まずはテストモードで設定します。

1. Stripe Dashboardで `Developers` を開きます。
2. `API keys` を開きます。
3. Secret keyをコピーします。
4. `.env.local` に入れます。

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

このアプリではCheckoutをサーバー側で作るため、最低限必要なのは `STRIPE_SECRET_KEY` です。

### 6.3 Webhookを設定する

クレジット販売では、購入完了後にSupabaseの `profiles.credits` を増やす必要があります。その処理をStripe Webhookで行います。

本番Webhook URL:

```text
https://あなたのドメイン/api/stripe/webhook
```

VercelのURL例:

```text
https://ai-fantasy-generator.vercel.app/api/stripe/webhook
```

Stripe Dashboardでの手順:

1. `Developers` を開きます。
2. `Webhooks` を開きます。
3. `Add endpoint` を押します。
4. Endpoint URLに上のWebhook URLを入力します。
5. Eventsで `checkout.session.completed` を選びます。
6. 作成後、Signing secretをコピーします。
7. `.env.local` またはVercel環境変数に入れます。

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 6.4 ローカルでWebhookをテストする

Stripe CLIを使う場合:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

表示される `whsec_...` を `.env.local` の `STRIPE_WEBHOOK_SECRET` に入れます。

テストカード:

```text
4242 4242 4242 4242
```

有効期限は未来の日付、CVCは任意の3桁、郵便番号も任意でテストできます。

### 6.5 本番決済に切り替える

1. Stripeの本番利用申請・本人確認を完了します。
2. 本番APIキーを取得します。
3. Vercelの環境変数を `sk_live_...` と `pk_live_...` に変更します。
4. 本番Webhook endpointを作ります。
5. `STRIPE_WEBHOOK_SECRET` も本番Webhookのものに変更します。
6. 少額で実決済テストをします。

重要:

- テスト用 `sk_test_...` と本番用 `sk_live_...` を混ぜないでください。
- Webhook secretもテストと本番で別です。
- 本番公開前に返金・キャンセル・問い合わせ導線を明記してください。

## 7. 画像生成APIの登録と接続

初期状態でもアプリは動きます。本物の画像生成を使う場合だけ設定します。無料枠から始めやすい構成としてPollinationsを追加済みです。OpenAI画像生成は課金向けの高品質オプションとして接続できます。

### 7.1 Pollinationsを使う

1. Pollinationsの公式ページにアクセスします。
2. APIキー発行ページでキーを作成します。
3. サーバー側で使う場合は `sk_` から始まるSecret Keyを使います。
4. Vercelまたは `.env.local` に以下を設定します。

```env
IMAGE_API_PROVIDER=pollinations
POLLINATIONS_API_KEY=sk_...
POLLINATIONS_PROXY_SECRET=ランダムな長い文字列
POLLINATIONS_IMAGE_MODEL=flux
POLLINATIONS_REFERRER=ai-fantasy-generator
```

このアプリでは `/api/image/pollinations` を経由して画像を表示します。Secret Keyを画像URLに直接入れないため、ブラウザやHTMLにAPIキーが露出しません。

APIキーなしで試したい場合:

```env
IMAGE_API_PROVIDER=pollinations
POLLINATIONS_API_KEY=
```

外部APIを一切使わない場合:

```env
IMAGE_API_PROVIDER=mock
FORCE_MOCK_IMAGES=true
```

画像生成に失敗した場合も、カードは自動でファンタジー風のローカルフォールバック画像へ戻ります。公開サイトで簡易画像だけになる場合は、Vercelの環境変数に `IMAGE_API_PROVIDER=mock` が残っていないか、または `POLLINATIONS_API_KEY` が未設定でレート制限に当たっていないかを確認してください。

### 7.2 OpenAI Platformに登録する

1. OpenAI Platformにアクセスします。
2. アカウントを作成します。
3. 必要に応じてOrganizationを作成します。
4. Billingを設定します。
5. API Keyを作成します。

### 7.3 OpenAIを環境変数に入れる

`.env.local` に入れます。

```env
OPENAI_API_KEY=sk-proj-...
IMAGE_API_PROVIDER=pollinations
OPENAI_STANDARD_IMAGES_ENABLED=false
```

任意で画像モデルを指定できます。

```env
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_SIZE=1024x1024
```

補足:

- OpenAIの画像生成モデルは更新されます。
- 公式ドキュメントでは、GPT Image系モデルで画像生成・編集が可能とされています。
- モデルによってはOrganization Verificationが必要になる場合があります。
- まずはモックで公開し、収益導線ができてから実画像生成をONにすると費用を抑えやすいです。

### 7.4 コスト管理

画像生成はコストが発生します。高品質画像生成はこのアプリでは追加20クレジット、通常生成の1クレジットと合わせて1体21クレジットにしています。OpenAIが請求上限や一時障害で失敗した場合は代替画像へ戻り、追加20クレジットはOpenAI画像が実際に返った分だけ消費します。

おすすめ運用:

- 通常生成: Pollinationsまたは低コスト画像
- 高品質画像生成: OpenAI画像APIを使い、1体21クレジット消費
- OpenAI高品質生成が不安定な場合は生成数を1体にして1体ずつ実行する
- 1日あたりの生成上限を追加する
- ユーザーごとの短時間連打制限を追加する
- OpenAI利用料金を週1で確認する

## 8. Vercel登録とデプロイ

VercelはNext.jsアプリを公開する場所です。

### 8.1 Vercelアカウントを作る

1. Vercelにアクセスします。
2. `Sign up` を押します。
3. GitHubアカウントで登録します。
4. VercelにGitHub連携を許可します。

### 8.2 GitHubリポジトリをImportする

1. Vercel Dashboardで `Add New...` を押します。
2. `Project` を選びます。
3. GitHubリポジトリ `ai-fantasy-generator` を選びます。
4. Framework PresetがNext.jsになっていることを確認します。
5. Environment Variablesを入力します。

最低限:

```env
NEXT_PUBLIC_APP_URL=https://あなたのVercelドメイン
IMAGE_API_PROVIDER=pollinations
POLLINATIONS_PROXY_SECRET=ランダムな長い文字列
```

Supabase接続後:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Stripe接続後:

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

OpenAI接続後:

```env
OPENAI_API_KEY=
IMAGE_API_PROVIDER=pollinations
OPENAI_IMAGE_MODEL=gpt-image-1.5
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_STANDARD_IMAGES_ENABLED=false
```

Pollinations接続後:

```env
IMAGE_API_PROVIDER=pollinations
POLLINATIONS_API_KEY=
POLLINATIONS_PROXY_SECRET=ランダムな長い文字列
POLLINATIONS_IMAGE_MODEL=flux
POLLINATIONS_REFERRER=ai-fantasy-generator
```

6. `Deploy` を押します。

### 8.3 デプロイ後の確認

公開URLで確認します。

```text
https://あなたのVercelドメイン/
https://あなたのVercelドメイン/generator/npc
https://あなたのVercelドメイン/generator/monster
https://あなたのVercelドメイン/pricing
https://あなたのVercelドメイン/auth
```

確認項目:

- トップページが表示される
- NPC生成画面が表示される
- モンスター生成画面が表示される
- 新規登録できる
- 登録後、20クレジットが付く
- 生成するとクレジットが減る
- クレジット不足時に購入導線が出る
- Stripe Checkoutに遷移する
- 決済後、Webhookでクレジットが増える
- ダッシュボードに履歴が出る

## 9. AI FANTASY / WordPress掲載方法

詳しい素材は `docs/wordpress-guide.md` にあります。

### 9.1 リンク掲載

記事内にCTAを置きます。

```text
創作キャラを一瞬で量産したい方は、AI FANTASY Generatorを無料で試してみてください。
```

リンク先:

```text
https://あなたのドメイン/generator/npc
```

または:

```text
https://あなたのドメイン/generator/monster
```

### 9.2 iframe掲載

WordPressのカスタムHTMLブロックに貼ります。

```html
<iframe
  src="https://あなたのドメイン/generator/npc"
  title="AI FANTASY Generator"
  style="width:100%; min-height:900px; border:1px solid #e5e7eb; border-radius:12px;"
  loading="lazy"
></iframe>
```

おすすめはリンク掲載です。iframeはスマホで高さ調整が難しいため、記事本文ではボタンリンクのほうが安定します。

### 9.3 記事導線

記事構成例:

1. 読者の悩み: NPCや敵モンスターを毎回考えるのが大変
2. 解決策: AI FANTASY Generatorなら条件を選ぶだけ
3. 使い方: 生成数、種族、役割、世界観を選ぶ
4. 出力例: Markdownでキャラ設定を貼る
5. CTA: 無料で20体生成
6. 課金導線: 大量生成したい人向けにクレジット購入

## 10. 収益化設計

### 10.1 基本の収益モデル

このアプリはクレジット販売型です。

ユーザー行動:

1. 記事から流入
2. 無料20クレジットで試す
3. NPCまたはモンスターを生成
4. クレジットが足りなくなる
5. Starter / Creator / Proを購入
6. 保存・エクスポートで継続利用

### 10.2 料金プランの考え方

現在のプラン:

| プラン | クレジット | 価格 | 想定ユーザー |
| --- | ---: | ---: | --- |
| Starter | 100 | 500円 | まず試したい人 |
| Creator | 500 | 1,980円 | TRPG・小説制作で継続利用する人 |
| Pro | 1500 | 4,980円 | 大量に素材を作る人 |

おすすめ:

- 一番売りたいのはCreator
- Starterは購入ハードルを下げる役
- Proは単価を上げる役

### 10.3 利益計算

ざっくり式:

```text
利益 = 売上 - Stripe手数料 - 画像生成API費用 - Vercel費用 - Supabase費用 - その他運営費
```

最初は `IMAGE_API_PROVIDER=pollinations` で公開し、レート制限や安定性が必要になったら `POLLINATIONS_API_KEY` を追加するとリスクが低いです。`IMAGE_API_PROVIDER=mock` は開発確認用に限定してください。

### 10.4 最初に狙う記事

AI FANTASY内で相性がよい記事:

- TRPG NPC 作り方
- ファンタジー キャラクター 名前 一覧
- モンスター 設定 作り方
- 小説 キャラクター 設定 テンプレート
- ゲーム制作 敵キャラ アイデア
- ダークファンタジー モンスター
- ランダムNPCジェネレーター

記事の中に自然にCTAを置きます。

CTA例:

```text
この設定をもっと大量に作りたい方は、AI FANTASY GeneratorでNPCをまとめて生成できます。
```

```text
敵モンスター案を一気に増やしたい方は、モンスター量産メーカーを無料で試してみてください。
```

### 10.5 KPI

最低限見る数字:

- 記事PV
- CTAクリック率
- 新規登録数
- 無料生成数
- クレジット不足モーダル表示数
- 購入率
- 平均購入単価
- 画像生成API費用
- 返金数

目安:

```text
記事PV → 生成画面クリック → 無料生成 → 課金
```

この流れのどこで落ちているかを見ます。

## 11. 法務・表示・税務の最低チェック

これは法律相談ではありません。公開前に必要に応じて専門家へ確認してください。

収益化するなら最低限用意したいページ:

- 利用規約
- プライバシーポリシー
- 特定商取引法に基づく表記
- 返金ポリシー
- 問い合わせ先

### 11.1 特定商取引法に基づく表記テンプレート

固定ページとして作る内容例です。

```text
販売事業者:
運営責任者:
所在地:
問い合わせ先:
販売価格:
商品代金以外の必要料金:
支払方法:
支払時期:
商品の提供時期:
返品・キャンセル:
動作環境:
```

個人で住所を出したくない場合でも、通信販売の表示義務をどう満たすかは必ず確認してください。バーチャルオフィス等を使う場合も、連絡不能にならない体制が必要です。

### 11.2 インボイス・税務

個人事業主や法人として継続収益を得る場合、確定申告、消費税、インボイス制度の要否を確認してください。

最初にやること:

- 売上と経費を記録する
- Stripe入金と手数料を記録する
- OpenAI / Vercel / Supabase費用を記録する
- 必要なら税理士に相談する

## 12. 本番公開前チェックリスト

### 12.1 機能

- [ ] `/auth` で新規登録できる
- [ ] 初回登録で20クレジットが付く
- [ ] NPC生成でクレジットが減る
- [ ] モンスター生成でクレジットが減る
- [ ] クレジット不足時に購入モーダルが出る
- [ ] Stripe Checkoutに遷移する
- [ ] Webhook成功でクレジットが増える
- [ ] お気に入り保存が動く
- [ ] 保存済みセットが動く
- [ ] JSON / CSV / Markdown出力が動く

### 12.2 セキュリティ

- [ ] `.env.local` をGitHubにpushしていない
- [ ] `SUPABASE_SERVICE_ROLE_KEY` がVercelのサーバー環境変数だけにある
- [ ] Supabase RLSが有効
- [ ] Stripe Webhook署名検証が動いている
- [ ] 本番でデモ生成が開放されていない
- [ ] OpenAI APIキーがフロントに出ていない

### 12.3 表示

- [ ] 利用規約がある
- [ ] プライバシーポリシーがある
- [ ] 特商法表記がある
- [ ] 問い合わせ先がある
- [ ] 返金条件が明記されている
- [ ] AI生成物であることが必要に応じて説明されている

## 13. よくあるトラブル

### 13.1 Supabase登録後もログインできない

確認:

- `NEXT_PUBLIC_SUPABASE_URL` が正しい
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しい
- Supabase AuthのEmail providerが有効
- Vercelにも同じ環境変数を入れた
- Vercelで再デプロイした

### 13.2 生成すると401になる

本番モードではログインが必要です。

確認:

- `/auth` でログインしている
- Supabaseキーが設定されている
- Authorization tokenが取得できている

### 13.3 クレジットが増えない

確認:

- Stripe Webhook URLが正しい
- `STRIPE_WEBHOOK_SECRET` が正しい
- `checkout.session.completed` を購読している
- Stripe DashboardのWebhookログが200になっている
- Supabaseの `credit_transactions` に行が追加されている

### 13.4 画像が出ない

確認:

- `IMAGE_API_PROVIDER` が `pollinations` / `mock` のどちらかになっている
- Pollinations利用時は `POLLINATIONS_API_KEY` と `POLLINATIONS_PROXY_SECRET` をVercelにも設定した
- OpenAI高品質画像生成を使う場合は `OPENAI_API_KEY` が正しい
- OpenAI Billingが有効
- `OPENAI_IMAGE_MODEL` で指定した画像モデルが利用可能
- Organization Verificationが必要なモデルではないか確認する
- 高品質画像生成で失敗が続く場合は、生成数を1体にして1体ずつ実行する

失敗してもアプリはモック画像へ戻る設計です。画面に壊れた画像アイコンだけが残らないよう、表示側にもフォールバックを入れています。

## 14. 今後の改善ロードマップ

優先度高:

- 特商法表記ページ追加
- 問い合わせフォーム追加
- Stripe購入完了ページ追加
- 生成履歴から再生成
- Supabase Storageへ画像保存
- レート制限
- 管理者ダッシュボード

優先度中:

- Google Analytics / Vercel Web Analytics
- 検索・タグ機能
- お気に入りのフォルダ分け
- プロンプトテンプレート保存
- クーポンコード
- アフィリエイト導線

優先度低:

- サブスクリプションプラン
- チーム共有
- 日本語/英語切替
- WordPressプラグイン化

## 15. 公式参考リンク

- Vercel Getting Started: https://vercel.com/docs/getting-started-with-vercel
- Vercel Environment Variables: https://vercel.com/docs/environment-variables
- Supabase API Keys: https://supabase.com/docs/guides/getting-started/api-keys
- Supabase Securing your API / RLS: https://supabase.com/docs/guides/api/securing-your-api
- Stripe Checkout Sessions: https://docs.stripe.com/api/checkout/sessions
- Stripe Checkout fulfillment / Webhooks: https://docs.stripe.com/checkout/fulfillment
- OpenAI Image Generation: https://developers.openai.com/api/docs/guides/image-generation
- 特定商取引法ガイド 通信販売: https://www.no-trouble.caa.go.jp/what/mailorder/
- 国税庁 インボイス制度: https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice_kojin_01.htm
