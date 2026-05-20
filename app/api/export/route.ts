import { exportItems } from "@/lib/exporters";
import { exportSchema } from "@/lib/schemas";
import type { GenerationItem } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = exportSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { message: "エクスポート対象が正しくありません。" },
      { status: 400 }
    );
  }

  const output = exportItems(
    parsed.data.type,
    parsed.data.items as GenerationItem[],
    parsed.data.format
  );

  return new Response(output.content, {
    headers: {
      "Content-Type": output.contentType,
      "Content-Disposition": `attachment; filename="ai-fantasy-${parsed.data.type}.${output.extension}"`
    }
  });
}
