# WordPress掲載ガイド

AI FANTASYの記事・固定ページに `AI FANTASY Generator` を掲載するための素材です。

## iframe埋め込み用の説明

VercelへデプロイしたURLを使い、WordPressのカスタムHTMLブロックに以下を貼り付けます。

```html
<iframe
  src="https://your-domain.vercel.app/generator/npc"
  title="AI FANTASY Generator"
  style="width:100%; min-height:900px; border:1px solid #e5e7eb; border-radius:12px;"
  loading="lazy"
></iframe>
```

スマホでは高さが足りない場合があるため、記事本文ではリンクCTAとの併用がおすすめです。

## WordPressからリンクするCTA文

創作キャラを一瞬で量産したい方は、AI FANTASY Generatorを無料で試してみてください。

## 記事内に貼る紹介文

AI FANTASY Generatorは、TRPG・小説・ゲーム制作に使えるNPCやモンスターをワンクリックで大量生成できる創作支援ツールです。名前、種族、役割、性格、背景、画像プロンプトまでまとめて作成でき、お気に入り保存やJSON / CSV / Markdown出力にも対応しています。まずは無料クレジットで、物語に使えるキャラクター案を素早く作ってみてください。

## メタディスクリプション案

TRPG・小説・ゲーム制作に使えるNPC・モンスターをワンクリックで大量生成。名前、外見、背景、画像プロンプトまで作れるAI FANTASY Generator。

## OGPタイトル案

AI FANTASY Generator | NPC・モンスター量産メーカー

## 掲載導線

- 記事冒頭: 「無料で20体生成してみる」ボタン
- 記事中盤: NPC量産メーカーとモンスター量産メーカーへの個別リンク
- 記事末尾: 課金プランへのリンク

## Vercelデプロイ後の確認項目

- `/generator/npc` がスマホで横スクロールしない
- `/generator/monster` でモック生成が完了する
- `/pricing` のモック購入またはStripe Checkoutが動作する
- `/api/stripe/webhook` にStripe署名検証済みイベントが届く
- WordPressのiframe内でヘッダーと生成画面が見切れない
