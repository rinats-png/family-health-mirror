# Marktanalyse — Apps für Kindergesundheit

> ## ⚠️ Hinweis zum Scope
>
> Diese Analyse entstand vor der Einengung auf eine strikt dokumentierende
> Anwendung. Die Marktbeobachtungen gelten unverändert; die daraus abgeleiteten
> Funktionsempfehlungen in Abschnitt 3, 4 und 6 gelten nur insoweit, als sie
> nicht gegen die Ausschlussliste in **[`../REGULATORY.md`](../REGULATORY.md)**
> verstoßen. Betroffen sind insbesondere die Empfehlungen zum Vorjahresvergleich,
> zum Fiebermodul und zu Impf-Fälligkeiten.

**Stand:** August 2026 · **Markt:** Deutschland, mit Blick auf den internationalen Wettbewerb
**Methodik:** Web-Recherche zu Angeboten, Funktionsumfang, Preisen und öffentlich geäußerter Nutzerkritik. Die Aussagen zu einzelnen Apps geben den Rechercheergebnis-Stand wieder und sind vor einer Investitionsentscheidung durch eigene Installation und Prüfung zu verifizieren.

---

## 1. Zusammenfassung

Der Markt ist **gut besetzt, aber sauber segmentiert** — und genau an den Segmentgrenzen liegen die Lücken. Es gibt vier getrennte Kategorien, die sich kaum überschneiden:

| Kategorie | Beispiele | Kann gut | Hört auf bei |
|---|---|---|---|
| **Baby-Tracker** | Huckleberry, Nara Baby, Glow Baby, Baby Tracker, „Zeit fürs Baby" | Stillen, Schlaf, Windeln, Wachstum — sehr schnelle Eingabe | ca. 12–18 Monate; Krankheit nur rudimentär |
| **Impfpass-Apps** | ImpfPassDE, ImpfPassCH, Digitaler Impfpass (AT) | Impfdokumentation, Familienprofile, Erinnerungen | Kein Krankheitsverlauf, keine Entwicklung |
| **Krankheits-Spezialisten** | **FeverApp** (Uni Witten/Herdecke) | Fieberepisoden, Symptome, Medikamente — wissenschaftlich fundiert | Nur Fieber; kein Impfen, kein Wachstum, kein Säuglingsalltag |
| **Kassen-Apps** | Meine BARMER, TK, AOK | Vorsorge-Erinnerung, kostenlos, hohe Reichweite | Kassengebunden, kein Alltags-Tracking, austauschbar bei Kassenwechsel |

**Die Kernbeobachtung:** Eine typische deutsche Familie mit zwei Kindern nutzt heute **drei bis vier** dieser Werkzeuge parallel plus Papier. Niemand deckt die Strecke Geburt → Grundschule in einem Produkt ab. Das ist die Marktlücke — und sie ist nicht deshalb offen, weil niemand sie gesehen hätte, sondern weil jedes einzelne Segment für sich schon ein funktionierendes Geschäftsmodell hat und niemand den Anreiz hatte, die Grenzen zu überschreiten.

**Die zweite, kommerziell wichtigere Beobachtung:** Der stärkste, am häufigsten geäußerte Kritikpunkt an den internationalen Marktführern ist nicht fehlende Funktion, sondern **Preis- und Vertrauensfrust** — teure Abos für Kernfunktionen, Umstellung von Kauf auf Abo, Tracking-SDKs in Gesundheits-Apps für Kinder. Das ist die verwundbarste Flanke des Wettbewerbs.

---

## 2. Die Wettbewerber im Einzelnen

### 2.1 Baby-Tracker (internationaler Massenmarkt)

**Huckleberry** — der Referenzwettbewerber. Kostenlos: Ein-Tap-Tracking für Schlaf, Windeln, Fütterung, Abpumpen, Wachstum, Töpfchen, Aktivitäten und Medikamente. Kostenpflichtig: „SweetSpot"-Schlafvorhersage und Meilenstein-Insights. Die Recherche zeigt Abopreise in der Größenordnung von rund 12 $/Monat bzw. 69 $/Jahr für Plus und rund 15 $/Monat bzw. 120 $/Jahr für Premium mit Schlafberatung. Meilenstein-Insights sind auf 0–17 Monate begrenzt.

* **Stärke:** Das Ein-Tap-Tracking ist der Goldstandard. Die Schlafvorhersage ist ein echtes, verteidigtes Alleinstellungsmerkmal.
* **Schwäche:** Krankheits-Tracking ist erkennbar schwächer als bei Glow Baby. Preisniveau deutlich über dem, was im deutschen Markt für Eltern-Apps üblich ist. Datenschutzbewertung in unabhängigen Vergleichen nur mittelmäßig, Kontozwang, Drittanbieter-Analytics.

**Nara Baby** — kostenlos, sauber, beliebt. Setzt den Preisanker im Markt nach unten und macht jedes teure Abo begründungspflichtig.

**Glow Baby** — kann im Gegensatz zu Huckleberry Krankheitssymptome, Fotos im Tagesverlauf und Zahnen erfassen. Kritik: Die nützlichsten Funktionen liegen hinter Abostufen, deren Gegenwert im Vergleich zum kostenlosen Nara Baby schwer zu rechtfertigen ist.

**Baby Connect** — hat ein bestehendes Einmalkauf-Modell auf Abo umgestellt. Altnutzer, die die App einmal gekauft hatten, reagierten entsprechend verärgert. **Das ist die wichtigste Fallstudie für unser Preismodell.**

**Deutschsprachige Vertreter** wie „Zeit fürs Baby" (MWM) decken Krankheitsverläufe, Fieberwerte, Medikamentengaben und Symptome inklusive Grafiken bereits mit ab — hier ist der Wettbewerb näher an unserem Konzept als bei den US-Apps.

**Übergreifende Datenschutzkritik:** In Vergleichen wird explizit thematisiert, dass Gesundheitsdaten von Babys über Partnernetzwerke in Werbe-Targeting einfließen können. Anbieter wie Pebbi positionieren sich genau dagegen — kein Datenverkauf, keine Werbung, kein Kontozwang. **Datenschutz ist im Jahr 2026 bereits ein aktiv beworbenes Verkaufsargument, kein Nischenthema mehr.**

### 2.2 Impfpass-Apps

**ImpfPassDE** — der relevanteste deutsche Wettbewerber im Impfsegment. Verwaltet nicht nur eigene Daten, sondern auch die der Kinder; Datenaustausch zwischen Arztpraxis und App Ende-zu-Ende-verschlüsselt.

* **Stärke:** Die **Praxis-Anbindung** ist ein Graben, den wir kurzfristig nicht überspringen. Wenn die Kinderärztin die Impfdaten direkt in die App schreibt, ist das strukturell besser als jede OCR.
* **Schwäche:** Reines Impfprodukt. Kein Krankheitsverlauf, keine Entwicklung, kein Säuglingsalltag.

**ImpfPassCH** (Schweiz) hat eine Familienfunktion, bei der Kinder und Großeltern als weitere Profile ohne eigenes Smartphone geführt werden — genau das Modell, das wir für Familien brauchen.

### 2.3 FeverApp — der ernsthafteste inhaltliche Wettbewerber

Entwickelt unter Leitung des Kinderarztes Prof. Dr. David Martin an der Universität Witten/Herdecke, gefördert vom BMBF, in Kooperation mit dem Berufsverband der Kinder- und Jugendärzte (BVKJ) und der DGKJ. Die App ist Instrument einer Registerstudie.

* **Funktionsumfang:** eigene Profile je Familienmitglied, Fieberepisoden im Zeitverlauf, Symptome, Maßnahmen und Medikamente, Dokumentation von Fieberkrämpfen, PZN-Scan für Medikamente, grafische Darstellung des Wohlbefindens, Messerinnerungen, Schulungsvideos und ein Erklär-Helfer.
* **Nutzerurteil:** übersichtlich, einfach, hilfreich.
* **Das ist genau unser Kernszenario — und es ist bereits sehr gut gelöst, kostenlos, und mit ärztlicher Autorität im Rücken.**

**Was wir daraus lernen müssen — drei Dinge:**

1. **Unsere Fieber-Funktion muss mindestens FeverApp-Niveau haben.** „Wir können auch Fieber" reicht nicht gegen ein BMBF-gefördertes Fachprodukt.
2. **Der Zugang ist eine Hürde, die wir nicht haben.** FeverApp arbeitet mit vierstelligen Praxiscodes, über die ein Familiencode erzeugt wird; ohne Arzt muss man das Team kontaktieren. Das ist für eine Registerstudie methodisch sinnvoll, aber es ist massive Reibung. **Unser Onboarding ohne Konto, ohne Code, ohne E-Mail ist an dieser Stelle strukturell überlegen.**
3. **Der Studienzweck begrenzt die Breite.** FeverApp will Fieberverläufe verstehen — sie wird deshalb nie Windeln, Perzentilen und Impfkalender integrieren. Die Spezialisierung ist ihre Stärke und zugleich die Grenze, an der unser Produkt anfängt.

### 2.4 Krankenkassen-Apps

BARMER und AOK bieten Vorsorge- und Impfkalender; über „Meine BARMER" gibt es Erinnerungen an anstehende Kinder-Vorsorgeuntersuchungen, die TK einen Erinnerungsservice mit Erklärungen zu Vorsorge und Impfungen. Alles kostenlos für Versicherte, mit enormer Reichweite.

* **Das ist unser gefährlichster Wettbewerber für die Funktion „Erinnerung"** — nicht weil die Apps besser wären, sondern weil sie nichts kosten und beim Versicherten ohnehin installiert sind.
* **Ihre strukturelle Schwäche:** Sie sind kassengebunden. Bei einem Kassenwechsel sind die Daten weg. Sie decken den Alltag zwischen den Terminen nicht ab. Und sie werden nie ein Still-Timer oder Symptomtagebuch sein, weil das nicht ihr Geschäft ist.
* **Konsequenz für uns:** Die reine Terminerinnerung darf **nicht** unser Hauptverkaufsargument sein. Sie ist Tischeinsatz, nicht Differenzierung.

---

## 3. Was wir übernehmen — und was wir besser machen

### 3.1 Übernehmen (bewährte Muster, die man nicht neu erfinden muss)

| Von wem | Was | Warum |
|---|---|---|
| Huckleberry / Nara | **Ein-Tap-Erfassung als zentrales Interaktionsmuster** | Der Marktstandard für Eingabegeschwindigkeit. Alles Langsamere verliert sofort. |
| FeverApp | **Episode als Datenmodell-Einheit**, nicht der Einzeleintrag | Eltern denken in „dieser Infekt", nicht in „Messung um 20:41". |
| FeverApp | **Medikamentenerfassung per PZN-Scan** | Die PZN ist in Deutschland auf jeder Packung — schnellste zuverlässige Erfassung ohne Tippen. |
| ImpfPassCH | **Familienprofile ohne eigenes Gerät für das Kind** | Richtiges Modell für Kinder. Konto gehört den Eltern. |
| Glow Baby | **Foto im Tagesverlauf, Zahnungs-Tracker** | Beides billig zu bauen, beides emotional stark. Der Ausschlag-Fotoverlauf ist beim Arzt Gold wert. |
| Kassen-Apps | **Vorsorge-Erinnerung als Selbstverständlichkeit** | Tischeinsatz. Muss da sein, verkauft aber nichts. |

### 3.2 Besser machen (belegte Schwächen des Wettbewerbs)

| Schwäche im Markt | Beleg | Unsere Antwort |
|---|---|---|
| **Der Bruch nach dem 1. Lebensjahr** | Huckleberry begrenzt Meilenstein-Insights auf 0–17 Monate; Baby-Tracker generell auf Säuglinge ausgelegt | **Ein durchgehendes Datenmodell 0–10 Jahre.** Die Module wechseln, die Historie bleibt. Der Vorjahresvergleich im dritten Kita-Winter ist ein Feature, das kein Baby-Tracker je haben wird — er hat die Daten nicht. |
| **Abo-Frust und Preisniveau** | Baby Connect stellte von Kauf auf Abo um und verärgerte Bestandskunden; Huckleberry-Preise bis 120 $/Jahr; Beschwerden über 30 $/Jahr bei fehlerhafter App | **Deutlich darunter bleiben (39,99 €/Jahr), Lifetime-Option anbieten, das Modell nie nachträglich verschlechtern.** Bestandspreise gelten dauerhaft — schriftlich zusagen. |
| **Kernfunktionen hinter der Paywall** | Glow Baby: nützlichste Funktionen im Abo, Gegenwert fraglich gegenüber kostenlosem Nara Baby | **Die tägliche Erfassung bleibt vollständig kostenlos.** Bezahlt wird für Auswertung, Erinnerung, Export, Sync — nie für das Eintragen. |
| **Datenschutz als Schwachstelle** | Werbe-Targeting über Partnernetzwerke bei Baby-Daten; mittelmäßige Privacy-Ratings, Kontozwang, Drittanbieter-Analytics | **Kein Konto, keine E-Mail, keine Werbe-SDKs, local-first, E2E-Sync, EU-Hosting.** Nicht als Kleingedrucktes, sondern als erster Satz im Store-Text. |
| **Zugangshürden** | FeverApp benötigt Praxiscode oder Kontaktaufnahme zum Team | **Onboarding in unter 60 Sekunden, ohne alles.** App öffnen, Geburtsdatum eingeben, fertig. |
| **Segmentierung erzwingt Mehrfachnutzung** | Vier Kategorien, keine Überschneidung | **Ein Produkt für Krankheit + Impfung + Entwicklung + Säuglingsalltag.** |
| **Kassenbindung** | Kassen-Apps enden beim Kassenwechsel | **Kassenunabhängig, voller Datenexport kostenlos.** Die Daten gehören der Familie. |

### 3.3 Wo wir *nicht* gewinnen können — und was daraus folgt

Ehrlichkeit an dieser Stelle ist wertvoller als Zuversicht:

* **Praxis-Anbindung.** ImpfPassDE hat eine verschlüsselte Datenverbindung zu Arztpraxen. Das ist ein jahrelang aufgebauter Vertriebs- und Integrationsgraben. Wir werden das kurzfristig nicht haben. **Folge:** Impfpass-Scan und manuelle Erfassung müssen exzellent sein, und wir sollten die Praxis-Integration als Fernziel (Phase 3+) und nicht als Startversprechen führen.
* **Medizinische Autorität.** FeverApp hat BVKJ und DGKJ im Rücken. Wir haben das nicht. **Folge:** Wir dürfen keine medizinischen Aussagen treffen (was ohnehin die MDR-Linie des PRD ist) — und wir sollten früh einen kinderärztlichen Beirat gewinnen, allein schon für die Glaubwürdigkeit im Store-Text.
* **Reichweite.** Die Kassen erreichen Millionen Versicherte kostenlos. **Folge:** Wir konkurrieren nicht über Erinnerungen, sondern über Tiefe und Kontinuität.

---

## 4. Die vier Funktionen, die uns wesentlich besser machen

Aus der Analyse ergeben sich vier Differenzierungsmerkmale. Sie sind bewusst so gewählt, dass sie **strukturell schwer zu kopieren** sind — jede beruht auf etwas, das der Wettbewerb nicht hat oder nicht will.

### 4.1 Die durchgehende Historie („Der zweite Winter")

**Was:** Der Vorjahresvergleich — „5 Infekte seit Kita-Start, im Vorjahreszeitraum 2".
**Warum unkopierbar:** Erfordert 24+ Monate durchgehende Daten in *einem* Produkt. Ein Baby-Tracker, dessen Nutzer nach 15 Monaten abspringt, kann das nie zeigen. Das ist ein **Zeitgraben**: Wettbewerber können die Funktion morgen nachbauen, aber nicht die Datenbasis ihrer Nutzer.
**Preis-Konsequenz:** Genau deshalb bleibt die Erfassung kostenlos. Jede Free-Nutzerin, die zwei Jahre lang einträgt, ist eine fast sichere Pro-Konversion im dritten Winter.

### 4.2 Speichern-zuerst-Eingabe

**Was:** Der Tap auf den Chip *ist* der Eintrag. Alles Weitere ist optionale Verfeinerung. Wer das Sheet wegwischt, hat trotzdem einen gültigen Datensatz.
**Warum besser:** Alle Wettbewerber nutzen Ein-Tap-Erfassung für einfache Ereignisse (Windel, Schlaf), aber Formulare für komplexe (Krankheit). Formulare werden nachts um 1 Uhr abgebrochen — und dann fehlt der Datenpunkt komplett. Wir eliminieren die häufigste Ursache für Datenlücken strukturell statt durch Ermahnung.

### 4.3 Der Arzt-Export als Produkt, nicht als Beiwerk

**Was:** Eine Seite, in 15 Sekunden von einer Kinderärztin erfassbar, gegen echte Praxen getestet.
**Warum unkopierbar:** Nicht technisch schwer — aber es erfordert die Bereitschaft, das Layout gegen die Zielgruppe zu testen, die die App nie installieren wird. Kein Wettbewerber optimiert für einen Nicht-Nutzer. Und dieser Export ist gleichzeitig der stärkste Weiterempfehlungskanal: Wenn eine Praxis das Blatt gut findet, empfiehlt sie die App weiter, ohne dass wir Werbung schalten.

### 4.4 Vertrauensarchitektur als Verkaufsargument

**Was:** Kein Konto, keine E-Mail, keine Werbe-SDKs, lokal verschlüsselt, E2E-Sync, EU-Hosting, kostenloser Vollexport.
**Warum jetzt:** Die Recherche zeigt, dass Datenschutz 2026 bereits aktiv als Verkaufsargument beworben wird. Bei Gesundheitsdaten *von Kindern* ist die Sensibilität höher als in jeder anderen Consumer-Kategorie. Die etablierten US-Apps können hier schlecht nachziehen — ihr Geschäftsmodell und ihre Analytics-Infrastruktur sind gewachsen.

---

## 5. Positionierung gegen den Wettbewerb

| Wettbewerber | Ihre Botschaft | Unsere Gegenposition |
|---|---|---|
| Huckleberry / Nara | „Der beste Baby-Tracker" | „Der Tracker, der nicht nach dem ersten Geburtstag aufhört" |
| FeverApp | „Fieber wissenschaftlich verstehen" | „Fieber, Impfungen, Wachstum — an einem Ort, ohne Praxiscode" |
| ImpfPassDE | „Ihr digitaler Impfpass" | „Impfpass plus alles, was zwischen den Terminen passiert" |
| Kassen-Apps | „Ihre Kasse erinnert Sie" | „Bleibt Ihnen erhalten, auch wenn Sie die Kasse wechseln" |

---

## 6. Konsequenzen für das PRD

Aus der Analyse ergeben sich fünf Änderungen bzw. Bestätigungen gegenüber dem PRD v1.0:

1. **Fieber-Modul aufwerten.** Wegen FeverApp ist Fieber kein Nebenfeature, sondern muss Referenzqualität haben: Episoden-Ansicht, Verlaufskurve, Medikamenten-Timer, Fieberkrampf-Dokumentation. → im PRD als Must-Have bestätigt und um die Fieberkrampf-Erfassung ergänzt.
2. **PZN-Scan für Medikamente aufnehmen** (Should-Have). Von FeverApp übernommen, in Deutschland sofort nutzbar, spart Tipparbeit.
3. **Vorjahresvergleich von Should-Have auf Must-Have für v1.1 hochstufen.** Es ist die wichtigste Differenzierung und der Konversionstreiber.
4. **Preisversprechen schriftlich fixieren.** Bestandspreise gelten dauerhaft, keine nachträgliche Verschlechterung des Free-Umfangs — als Reaktion auf den dokumentierten Baby-Connect-Frust.
5. **Praxis-Anbindung als Phase-3-Ziel aufnehmen**, nicht als Startversprechen — ImpfPassDE hat hier einen realen Vorsprung.

---

## Quellen

* [ImpfPassDE App](https://impfpass.de/app/) · [ImpfPassDE im App Store](https://apps.apple.com/de/app/impfpassde/id1472717242) · [ImpfPassCH](https://apps.apple.com/de/app/impfpassch/id1599506176) · [Digitaler Impfpass (AT)](https://play.google.com/store/apps/details?id=at.digitalerimpfpass.app)
* [FeverApp](https://www.feverapp.de/) · [FeverApp im App Store](https://apps.apple.com/de/app/feverapp/id1476835835) · [FeverApp Register, Thieme](https://www.thieme-connect.com/products/ejournals/pdf/10.1055/a-1581-8155.pdf) · [Fit for fever, Uni Witten/Herdecke](https://www.uni-wh.de/en/fit-for-fever)
* [Huckleberry im App Store](https://apps.apple.com/us/app/huckleberry-baby-child/id1169136078) · [Best Baby Tracker Apps 2026, Pebbi](https://pebbi.co/blog/best-baby-tracker-apps-2026) · [Glow Baby vs Huckleberry, Pebbi](https://pebbi.co/blog/glow-baby-vs-huckleberry) · [Baby Tracking App Privacy 2026, Pebbi](https://pebbi.co/blog/baby-tracking-app-privacy-concerns-2026) · [Best Baby Tracking Apps, Consumer Reports](https://www.consumerreports.org/babies-kids/baby-tracking-apps/best-baby-tracking-apps-a6067862820/) · [Common Sense Privacy Evaluation](https://privacy.commonsense.org/evaluation/Baby-tracker)
* [Zeit fürs Baby, MWM](https://mwm.ai/de/apps/time-for-baby-breastfeeding/1186619115) · [Baby Tracker Tagebuch](https://apps.apple.com/de/app/baby-tracker-wachstumsschub/id779656557)
* [Meine BARMER](https://www.barmer.de/unsere-leistungen/leistungen-a-z/meine-barmer) · [Vorsorgeuntersuchungen Kinder, BARMER](https://www.barmer.de/unsere-leistungen/leistungen-a-z/vorsorge/vorsorgeuntersuchungen-fuer-kinder-und-jugendliche-1055492) · [Krankenkassen-Apps für junge Eltern](https://www.krankenkassen.de/gesetzliche-krankenkassen/leistungen-gesetzliche-krankenkassen/apps/eltern/) · [Vorsorge-Erinnerungsservice Übersicht 2026](https://www.gesetzlichekrankenkassen.de/leistungsvergleich/serviceleistungen/198/Vorsorgeerinnerungsservice)
* [U-Untersuchungen, betanet](https://www.betanet.de/u-untersuchungen.html) · [Kinder-Vorsorgeuntersuchungen U1–J2, InfectoPharm](https://www.infectopharm.de/fuer-patienten/patienten-ratgeber/kinder-vorsorge-untersuchungen-u1-j2/) · [Kinderärzte im Netz — Vorsorge](https://www.kinderaerzte-im-netz.de/vorsorge/)
