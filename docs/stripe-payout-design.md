# Stripe入金設計

AI FANTASY Generatorの決済は、ユーザーのクレジット購入代金があなたのStripeアカウントに入り、そのStripe残高からあなたの銀行口座へ自動入金される設計です。

## 結論

このアプリはマーケットプレイスではないため、Stripe Connectの分配送金は使いません。

使う構成:

- 決済: Stripe Checkout
- 売上の受け皿: あなた本人またはあなたの事業のStripeアカウント
- 入金先: Stripe Dashboardに登録したあなたの銀行口座
- クレジット付与: Stripe Webhook成功後にSupabaseへ加算

```text
ユーザー
  ↓ クレジット購入
Stripe Checkout
  ↓ 決済成功
AI FANTASY Generator Webhook
  ↓ credits加算
Supabase

Stripe残高
  ↓ Stripeの入金スケジュール
あなたの銀行口座
```

## アプリ側の責務

アプリは以下を担当します。

- `/pricing` からStripe Checkout Sessionを作る
- `checkout.session.completed` を受け取る
- 遅延決済向けに `checkout.session.async_payment_succeeded` も受け取る
- `payment_status === "paid"` の場合だけクレジットを付与する
- `stripe_session_id` で二重付与を防ぐ
- Checkout SessionとPaymentIntentへ `userId`、`planId`、`credits` をメタデータ保存する

アプリは銀行振込を直接実行しません。銀行口座への入金はStripe Dashboard側の入金設定で行います。

## Stripe側の設定

### 1. 本番利用を有効化する

Stripe Dashboardで本番利用申請を完了します。

入力する主な情報:

- 事業者名または個人名
- 住所
- 電話番号
- サービス内容
- 本人確認情報
- 銀行口座

サービス内容は、AI生成・創作支援・デジタルクレジット販売であることが伝わるように記載します。

### 2. 銀行口座を登録する

Stripe Dashboardの入金設定で、売上を受け取る銀行口座を登録します。

確認すること:

- 口座名義がStripeアカウント情報と一致している
- 入金通貨が日本円になっている
- 入金スケジュールが希望どおりになっている
- 本人確認や追加書類の未対応が残っていない

### 3. APIキーをVercelへ入れる

Vercelの対象プロジェクトで、Production環境変数に本番キーを設定します。

```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://ai-fantasy-generator.vercel.app
```

重要:

- `sk_test_...` はテスト用です。本番売上は発生しません。
- `sk_live_...` は本番用です。実際に請求され、Stripe残高に反映されます。
- `STRIPE_WEBHOOK_SECRET` はWebhook endpointごとに別です。

### 4. Webhookを作る

Stripe DashboardでWebhook endpointを作成します。

URL:

```text
https://ai-fantasy-generator.vercel.app/api/stripe/webhook
```

購読イベント:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

署名シークレット:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 運用フロー

### 通常購入

1. ユーザーが `/pricing` でプランを選ぶ
2. Stripe Checkoutへ移動
3. 決済完了
4. WebhookがSupabaseへクレジットを追加
5. 売上はStripe残高に入り、Stripeの入金スケジュールで銀行口座へ入金

### 返金

返金はStripe Dashboardから行います。

現在のアプリは返金時にクレジットを自動減算しません。運用開始直後は、返金対応時にユーザーのクレジット利用状況を確認して手動対応してください。後から `charge.refunded` または `refund.created` Webhookで自動処理を追加できます。

### 売上照合

照合に使う情報:

- Stripe Checkout Session ID
- Stripe PaymentIntent ID
- Supabase `credit_transactions.stripe_session_id`
- Stripe metadata `userId`
- Stripe metadata `planId`
- Stripe metadata `credits`

Stripe DashboardでCheckout Session IDまたはPaymentIntentのmetadataを検索すれば、どのユーザーのどのプラン購入か追跡できます。

## 黒字運用の基本

現在の価格設計:

| プラン | 売価 | クレジット | 通常生成 | OpenAI高品質画像 |
| --- | ---: | ---: | ---: | ---: |
| Starter | 500円 | 100 | 100体分 | 約4体分 |
| Creator | 1,980円 | 500 | 500体分 | 約23体分 |
| Pro | 4,980円 | 1500 | 1500体分 | 約71体分 |

通常生成は低コスト経路、OpenAI高品質画像は1体21クレジットにしています。OpenAI画像API費用が上がった場合は、`OPENAI_HIGH_QUALITY_IMAGE_CREDIT_COST` を上げてください。

## 公開前チェック

- Stripe本番アカウントが有効
- 銀行口座登録済み
- 入金スケジュール確認済み
- `STRIPE_SECRET_KEY` が `sk_live_...`
- `STRIPE_WEBHOOK_SECRET` が本番Webhookの `whsec_...`
- Vercel Productionに環境変数設定済み
- `/pricing` から本番Checkoutへ移動できる
- 少額の本番決済でStripe残高へ反映される
- Webhook成功後にSupabaseのクレジットが増える
- 返金・問い合わせ・利用規約・プライバシーポリシーが公開済み

## 注意

これは実装・運用設計です。税務、特定商取引法、表示義務、返金ポリシーは事業形態や販売方法で変わるため、公開前に専門家または公的情報で確認してください。
