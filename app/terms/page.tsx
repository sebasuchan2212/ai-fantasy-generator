import { AppHeader } from "@/components/AppHeader";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-muted/35">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <article className="rounded-lg border bg-background p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold">利用規約</h1>
          <div className="mt-6 flex flex-col gap-5 text-sm leading-7 text-muted-foreground">
            <p>
              AI FANTASY Generatorは創作支援を目的としたWebアプリです。生成結果の利用にあたっては、接続する画像生成API、決済サービス、掲載先プラットフォームの規約を遵守してください。
            </p>
            <p>
              ユーザーは、第三者の権利を侵害する入力、違法または有害な目的での利用、サービス運用を妨害する行為を行わないものとします。
            </p>
            <p>
              デモモードのデータはブラウザのlocalStorageに保存されます。端末やブラウザの設定により削除される場合があります。
            </p>
            <p>
              本番運用ではSupabase Auth、Supabase Database、Stripe Checkoutを接続し、サーバー側でクレジット管理を行ってください。
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
