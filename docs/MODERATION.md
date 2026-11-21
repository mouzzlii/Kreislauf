# Community-Treuhand und Moderation

## Zuweisung von Moderatorinnen und Moderatoren

Die automatische Auswahl berücksichtigt ausschließlich Profile derselben Region mit `is_verified = true`, `moderator_rank > 0` und `last_active_at` innerhalb der letzten 30 Tage. Die Auswahl erfolgt zufällig. Die Aktivität wird beim authentifizierten Profil-Aufruf aktualisiert; inaktive Personen werden nicht ausgewählt, ihr Rang bleibt aber für eine spätere Reaktivierung gespeichert.

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
