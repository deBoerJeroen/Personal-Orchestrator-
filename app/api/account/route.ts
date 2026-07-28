import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { logger } from "@/lib/logger";
import { getSession } from "@/lib/session";

/**
 * Onherroepelijk verwijderen. Alle domeintabellen hangen met
 * `onDelete: cascade` aan de gebruiker, dus dit is echt weg — geen tombstones,
 * geen soft delete.
 *
 * Vereist een expliciete bevestiging in de body, zodat een verdwaalde request
 * nooit per ongeluk alles wist.
 */
export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== "VERWIJDER MIJN ACCOUNT") {
    return NextResponse.json(
      { error: 'Bevestiging ontbreekt. Stuur {"confirm":"VERWIJDER MIJN ACCOUNT"}.' },
      { status: 400 },
    );
  }

  await db.delete(user).where(eq(user.id, session.user.id));
  logger.info("account.deleted", { userId: session.user.id });

  return NextResponse.json({ ok: true });
}
