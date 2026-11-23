# KREISLAUF – Anleitung zur Testdemo

## Demo öffnen

Die aktuelle [Vercel-Vorschau](https://grok-workspace-git-demo-local-auth-off-kreislauf.vercel.app/) kannst du in Chrome auf deinem Android-Handy ansehen. Der aktuelle Preview-Deploy für Commit `a5bf49e3c4edb0cac2d86ebd19fe33801ffcbb72` ist `READY`. Die Routen Startseite, Karte, Inserat-Erstellung, Konto und ein Beispiel-Inserat wurden auf dem stabilen Preview-Alias jeweils mit HTTP 200 abgerufen. Das ist ein erfolgreicher Seiten-/Erreichbarkeitstest, aber kein vollständiger Browser-, Kamera- oder Mehrbenutzer-Ende-zu-Ende-Test. Es gibt in dieser Version keine persönliche Registrierung.

**Wichtig:** Alle Besucher verwenden denselben Demo-Zugang. Namen, Inserate und Testaktionen sind nicht privat. Bitte keine echten persönlichen Daten, Adressen oder vertraulichen Nachrichten eingeben. Die Demo-Datenbank läuft derzeit als temporäre PGLite-Datenbank im Arbeitsspeicher. Daten können nach einem Neustart verschwinden. Da Vercel mehrere Serverinstanzen parallel betreiben kann, sind Testdaten zwischen verschiedenen Instanzen nicht zuverlässig synchron; die Demo ist daher kein belastbarer gemeinsamer Mehrbenutzer-Test.

## Funktionen ausprobieren

1. **Markt ansehen:** Auf der Startseite zwischen „Alle Inserate“, „Biete“, „Suche“ und den Kategorien wechseln. „In der Nähe“ grenzt die Liste auf einen Umkreis ein.
2. **Inserat öffnen:** Ein Inserat antippen. Auf der Detailseite sind weitere Inserate desselben Anbieters erreichbar.
3. **Fotos ansehen:** Bei Inseraten mit mehreren Fotos die kleinen Vorschaubilder unter dem Hauptbild antippen.
4. **Inserat erstellen:** Über „Inserieren“ ein Testangebot anlegen. Bis zu vier komprimierte Fotos sind möglich. Video-Uploads und bereits die Videoauswahl sind derzeit bewusst deaktiviert. Die vorgesehenen Grenzen bleiben 1 × 60 s, 2 × 30 s oder 4 × 20 s (je nach Variante maximal 60, 60 oder 80 Sekunden insgesamt); sie werden erst nach einer unabhängigen Serverprüfung der tatsächlichen Videodauer freigeschaltet.
5. **Demo-Verifikation:** Im Konto kann die ausdrücklich simulierte Test-Verifikation ausgelöst werden. Das ist **keine echte ID-Austria-Prüfung**.
6. **Nachrichten:** Auf einer Inserat-Detailseite im Bereich „Nachrichten zum Inserat“ schreiben. Die Unterhaltung bleibt mit dem Inserat verknüpft. Die Glocke im Kopfbereich zeigt ungelesene Nachrichten und aktualisiert sich ungefähr alle 30 Sekunden.
7. **QR-Code:** Auf einer Inserat-Detailseite den Scanner öffnen. Wenn die Kamera nicht verfügbar ist, kann eine Inserat-Adresse oder Kennung manuell eingegeben werden.

## Derzeit noch eingeschränkt

- Die aktuelle Tauschabwicklung unterstützt Karma-basierte Vorgänge. Direkter Sachtausch und kombinierte Angebote (Sache plus Karma) sind noch nicht fertig implementiert und dürfen nicht als verfügbare Funktion verstanden werden.
- Die Demo verwendet ein gemeinsames Konto. Deshalb lassen sich echte Gespräche zwischen zwei getrennten Personen hier nicht vollständig durchspielen.
- Für Treuhand-Abstimmungen müssen mindestens vier aktive, verifizierte Moderationspersonen vorhanden sein. In der Demo sind keine echten Moderatoren eingerichtet; diese Abläufe sind daher noch nicht als reale Community-Entscheidung testbar.
- Bei hochwertigen Karma-Angeboten löst auch eine Freigabemehrheit **keine** automatische Punktebuchung und keinen Inseratabschluss aus. Beide Parteien müssen die Übergabe und den Empfang bestätigen. Für Streitfälle sind getrennte, protokollierte Moderationsabstimmungen über Auszahlung oder Rückerstattung im Entwicklungszweig implementiert. Diese Abläufe sind aber noch nicht auf einer isolierten echten Supabase-Datenbank und nicht mit realen Moderatoren-/Mitgliedskonten Ende-zu-Ende geprüft. Bitte nicht als realen Schlichtungsprozess verwenden.
- Bei Sharing-Buchungen müssen sowohl die Übergabe als auch die spätere Rückgabe von beiden Buchungsparteien bestätigt werden. Erst nach beiden Übergabebestätigungen wird Karma gebucht; erst nach beiden Rückgabebestätigungen wird das Inserat wieder freigegeben. Weil die Demo nur ein gemeinsames Konto verwendet, lässt sich dieser Ablauf hier nicht mit zwei echten Personen durchspielen. Die automatisierten Datenbanktests simulieren dafür getrennte Konten.
- Die Treuhand- und Buchungsabläufe benötigen noch vollständige Tests mit mehreren echten Konten und einer persistenten Datenbank.
- In der lokalen/In-Memory-Demo werden Fotos als Daten-URLs gespeichert. Für einen echten Betrieb müssen Vercel Blob oder ein anderer sicherer Medien-Storage konfiguriert sowie Upload, Wiedergabe und Löschung Ende-zu-Ende getestet werden.
- Video-Uploads sind aktuell in allen Umgebungen gesperrt. Der Endpunkt antwortet absichtlich mit HTTP 503, bis eine vertrauenswürdige serverseitige Prüfung der Videodatei umgesetzt und getestet ist.
- ID Austria, private Benutzerkonten und dauerhafte Speicherung sind noch nicht produktiv angebunden.

## Sicherheitsgrenze

Diese Vorschau ist ausschließlich zum Ausprobieren gedacht. Sie ist **nicht für einen öffentlichen Echtbetrieb** geeignet. Vor einem Start mit echten Mitgliedern müssen echte Anmeldung, persistente Datenbank, Berechtigungen, Medien-Storage, echte Identitätsprüfung und vollständige Mehrbenutzer-Tests eingerichtet und geprüft werden.
