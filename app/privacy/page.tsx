import { AppHeader } from "@/components/AppHeader";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-muted/35">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <article className="rounded-lg border bg-background p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold">プライバシーポリシー</h1>
          <div className="mt-6 flex flex-col gap-5 text-sm leading-7 text-muted-foreground">
            <p>
              本アプリは、認証、クレジット残高、生成履歴、お気に入り、保存済みセットをサービス提供のために扱います。
            </p>
            <p>
              Supabase未設定のデモモードでは、これらの情報はブラウザ内のlocalStorageに保存され、外部サーバーへ送信されません。
            </p>
            <p>
              Stripe Checkoutを利用する場合、決済処理はStripe上で行われます。本アプリは決済成功イベントをWebhookで受け取り、クレジット加算に必要な最小限の情報を保存します。
            </p>
            <p>
              画像生成APIを接続する場合、入力された生成条件や画像プロンプトが当該APIへ送信される場合があります。利用前にAPI提供元の規約とプライバシーポリシーを確認してください。
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
