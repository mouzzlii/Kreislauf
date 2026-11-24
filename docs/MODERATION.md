# Community-Treuhand und Moderation

## Zuweisung von Moderatorinnen und Moderatoren

Die automatische Auswahl berücksichtigt ausschließlich Profile derselben Region mit `is_verified = true`, `moderator_rank > 0` und `last_active_at` innerhalb der letzten 30 Tage. Die Auswahl erfolgt zufällig; pro Treuhandfall werden höchstens sieben Moderationspersonen zugewiesen. Käufer/Anfragende und Anbieter/Eigentümer werden ausgeschlossen. Mindestens vier gültige Zuweisungen sind erforderlich; die Datenbank erzwingt dieses Quorum beim Anlegen des Falls.

Die Aktivität wird serverseitig anhand der authentifizierten Sitzung aktualisiert: bei sichtbarer App nach dem Laden und danach ungefähr alle 15 Minuten sowie beim Zurückkehren in einen sichtbaren Tab. Datenbank-Updates werden zusätzlich auf höchstens einen Schreibvorgang je fünf Minuten begrenzt. Das ist vom Karma-Demurrage-Zeitstempel getrennt. Inaktive Personen werden nicht ausgewählt, ihr Rang bleibt aber für eine spätere Reaktivierung gespeichert.

Die erste Vergabe eines Moderator-Rangs muss durch eine vertrauenswürdige Administration erfolgen. Beispiel für eine manuelle Vergabe nach interner Prüfung:

```sql
update profiles
set moderator_rank = 1
where user_id = '<GEPRUEFTE_USER_ID>'
  and is_verified = true;
```

`moderator_rank` ist bewusst kein öffentliches Profilfeld. Das Projekt enthält derzeit keine eigenständige Admin-Oberfläche zur Vergabe oder Entziehung dieser Ränge.

## Einsatz

- Sharing-Reservierungen erhalten einen Treuhandfall.
- Inserate mit mindestens 100 Karma als Preis erhalten beim Anfragen einen Treuhandfall; das Inserat wird bis zur Freigabe gehalten.
- Die zugewiesene, weiterhin aktive Moderation kann den Treuhandfall freigeben.
- Ist keine aktive verifizierte Moderation verfügbar, wird ein hochwertiger Tausch nicht gestartet.

Die bestehende Sharing-Übergabe bleibt zusätzlich durch die beteiligten Parteien bestätigungspflichtig.


## Zusätzliche Unabhängigkeitsprüfung (Migration 0028)

Die Datenbank blockiert Stimmen von **allen** Beteiligten, nicht nur von buyer/seller eines hochwertigen Tauschs: sowohl Anfragende (requester_id) als auch Inseratseigentümer (listings.user_id) dürfen bei Standard-Sharing-Treuhand nicht abstimmen. Diese Regel gilt auch dann, wenn versehentlich eine Moderatorenzuordnung existiert. Die Moderationsübersicht und die Escrow-Zusammenfassung prüfen dieselben Parteigrenzen serverseitig.

Die Zuweisung erfolgt bei Fallanlage mit bis zu sieben aktiven, verifizierten Moderationspersonen. Mindestens vier Stimmen sind erforderlich; eine Zwei-Drittel-Mehrheit wird mit Aufrundung berechnet. Eine Admin-Oberfläche zur Rangvergabe und ein dokumentierter Notfall-Neuzuweisungsablauf sind weiterhin offene Produktionsanforderungen.
