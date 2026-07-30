import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Alles is afgeschermd behalve inloggen en de statische PWA-bestanden.
 * De echte sessiecontrole gebeurt server-side in `requireUser()`; dit is de
 * goedkope eerste zeef zodat een uitgelogde bezoeker nooit een pagina ziet.
 *
 * Gebruik altijd `getSessionCookie` en nooit een eigen naamcontrole: op https
 * heet de cookie `__Secure-nu.session_token` en lokaal `nu.session_token`.
 * Zelf op de naam matchen werkt daardoor lokaal wél en online níét — en het
 * gevolg is een eindeloze omleiding terug naar het inlogscherm.
 */
export function proxy(request: NextRequest) {
  const sessionToken = getSessionCookie(request, { cookiePrefix: "nu" });

  if (!sessionToken) {
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
