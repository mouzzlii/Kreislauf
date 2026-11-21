# ID Austria / A-Trust – Integrationsgrenze

## Aktueller Stand

- Der Mock-Flow ist serverseitig über `ID_AUSTRIA_MOCK_MODE=true` schaltbar.
- Der Mock setzt `profiles.is_verified=true`, zeigt im Konto aber ausdrücklich an, dass dies **keine echte staatliche Identitätsprüfung** ist.
- Inserate, unmittelbare Tauschabschlüsse und Buchungen werden serverseitig blockiert, solange `is_verified` nicht wahr ist.
- Es werden keine Ausweisbilder oder Ausweisdaten in KREISLAUF gespeichert.

## Live-OIDC

Die Live-Anbindung ist **noch nicht aktiviert**. Für die produktive A-Trust/ID-Austria-Anbindung müssen die von A-Trust für die konkrete Anwendung freigegebenen Werte serverseitig bereitgestellt werden:

- `ID_AUSTRIA_MOCK_MODE=false`
- `ID_AUSTRIA_ISSUER` – offizieller Issuer/Discovery-Endpunkt aus dem A-Trust-Onboarding
- `ID_AUSTRIA_CLIENT_ID`
- `ID_AUSTRIA_CLIENT_SECRET`
- `ID_AUSTRIA_REDIRECT_URI` – exakt registrierte Callback-Adresse

Die Werte gehören ausschließlich in die serverseitige Deployment-Konfiguration, niemals in `VITE_*`, Browser-Code oder das Repository. Der produktive Ablauf muss OIDC Authorization Code Flow mit PKCE, `state`/`nonce`-Prüfung, Signatur-/Issuer-/Audience-Prüfung und einmaliger serverseitiger Zuordnung zur angemeldeten KREISLAUF-Sitzung verwenden. Die konkreten Endpunkte und Claims dürfen erst anhand der offiziellen A-Trust-Unterlagen festgelegt werden; sie werden hier bewusst nicht erfunden.

Solange diese Zugangsdaten und die offizielle OIDC-Konfiguration fehlen, liefert der Server im Live-Modus eine klare Fehlermeldung und **setzt keine Verifikation**.
