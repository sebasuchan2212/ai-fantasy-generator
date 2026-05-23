import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Download, Heart, Sparkles, WandSparkles } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { PricingCards } from "@/components/PricingCards";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  "ワンクリックで大量生成",
  "画像付きキャラクターカード",
  "TRPG・小説・ゲーム制作に対応",
  "お気に入り保存",
  "JSON / CSV / Markdown出力",
  "クレジット制で必要な分だけ利用可能"
];

const FAQ = [
  {
    q: "APIキーがなくても使えますか？",
    a: "はい。初期状態はデモモードで動作し、モック画像と生成済み風データで全機能を確認できます。"
  },
  {
    q: "生成したデータは商用利用できますか？",
    a: "利用規約と接続する画像生成APIの規約に従ってください。アプリ側は創作用素材管理ツールとして設計しています。"
  },
  {
    q: "画像生成がうまくいかない場合はどうすればいいですか？",
    a: "高品質画像生成は外部APIの混雑やタイムアウトの影響を受けることがあります。失敗や簡易画像への切り替わりが続く場合は、生成数を1体にして1体ずつ生成してください。"
  },
  {
    q: "WordPress記事に掲載できますか？",
    a: "Vercelにデプロイしてリンクやiframeで掲載できます。docs/wordpress-guide.mdにCTA文と埋め込み例を用意しています。"
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main>
        <section className="border-b bg-background">
          <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1480px] gap-10 px-4 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] lg:items-center">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-5">
                <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-normal text-foreground md:text-6xl">
                  TRPG・小説・ゲーム制作に使えるキャラクターを一瞬で量産。
                </h1>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                  AI FANTASY Generatorは、NPC・モンスター・設定資料をワンクリックで生成できる創作支援ツールです。名前、外見、性格、背景、画像プロンプトまでまとめて作成できます。
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/generator/npc">
                    無料で20体生成してみる
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/generator/npc">NPCを作る</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/generator/monster">モンスターを作る</Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <span className="flex size-6 items-center justify-center rounded-md bg-accent text-primary">
                      <Check />
                    </span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Image
                src="/generator-concept.png"
                alt="AI FANTASY GeneratorのUIプレビュー"
                width={1400}
                height={900}
                priority
                className="w-full rounded-lg border shadow-soft"
              />
            </div>
          </div>
        </section>

        <section className="bg-muted/35 py-16">
          <div className="mx-auto flex max-w-[1480px] flex-col gap-8 px-4">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-extrabold">制作フローにそのまま入る機能</h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  生成、選別、保存、書き出しまでを一画面で完結。アイデア出しにも、資料作成にも使えます。
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard">ダッシュボードを見る</Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: WandSparkles,
                  title: "条件指定で大量生成",
                  text: "種族・役割・世界観・危険度などを選ぶだけで、最大100体までまとめて生成。"
                },
                {
                  icon: Heart,
                  title: "お気に入りと保存済みセット",
                  text: "使いたい候補を星で残し、章・セッション・エリア単位のセットとして保存。"
                },
                {
                  icon: Download,
                  title: "JSON / CSV / Markdown",
                  text: "ゲームデータ、スプレッドシート、記事本文に貼りやすい形式で出力。"
                }
              ].map((item) => (
                <Card key={item.title}>
                  <CardContent className="flex flex-col gap-4 p-6">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <item.icon />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-4">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold">クレジット購入プラン</h2>
              <p className="mt-3 text-muted-foreground">
                初回は20クレジット無料。必要になった分だけ追加できます。
              </p>
            </div>
            <PricingCards />
          </div>
        </section>

        <section className="border-t bg-muted/35 py-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="text-3xl font-extrabold">FAQ</h2>
            <div className="mt-6 flex flex-col gap-3">
              {FAQ.map((item) => (
                <Card key={item.q}>
                  <CardContent className="p-5">
                    <h3 className="font-bold">{item.q}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.a}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-[1480px] flex-col justify-between gap-4 px-4 text-sm text-muted-foreground md:flex-row">
          <span className="flex items-center gap-2 font-semibold">
            <Sparkles className="text-primary" /> AI FANTASY Generator
          </span>
          <div className="flex gap-4">
            <Link href="/terms">利用規約</Link>
            <Link href="/privacy">プライバシーポリシー</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
