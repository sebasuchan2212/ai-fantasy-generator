import { AppHeader } from "@/components/AppHeader";
import { PricingCards } from "@/components/PricingCards";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-muted/35">
      <AppHeader />
      <main className="mx-auto flex max-w-[1180px] flex-col gap-8 px-4 py-12">
        <div className="rounded-lg border bg-background p-8 text-center shadow-sm">
          <h1 className="text-4xl font-extrabold">クレジット購入プラン</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            NPC 1体生成は1クレジット。高品質画像生成は追加2クレジット。Stripe未設定の開発環境ではモック購入としてlocalStorageへ追加されます。
          </p>
        </div>
        <PricingCards />
      </main>
    </div>
  );
}
