import { NextResponse, type NextRequest } from "next/server";

/**
 * Alles is afgeschermd behalve inloggen en de statische PWA-bestanden.
 * De echte sessiecontrole gebeurt server-side in `requireUser()`; dit is de
 * goedkope eerste zeef zodat een uitgelogde bezoeker nooit een pagina ziet.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith("nu.session"));

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // `offline` hoort erbuiten: de service worker moet die pagina kunnen cachen
  // zonder eerst naar /login te worden gestuurd.
  matcher: ["/((?!login|offline|api|_next|manifest.webmanifest|sw.js|icons|favicon.ico).*)"],
};
