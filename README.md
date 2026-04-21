# transformation_of_functions

Interaktives HTML-Applet zur Veranschaulichung von Funktionstransformationen mit GeoGebra und MathJax.

## Live-Version

Die öffentliche Version ist über GitHub Pages erreichbar:

<https://georg184.github.io/transformation_of_functions/>

## Projektstruktur

- `index.html`: gesamte App mit Layout, Steuerelementen und GeoGebra-Integration

## Lokaler Ablauf

Das Projekt kann lokal in Zed bearbeitet werden. Danach werden sinnvolle Änderungen mit Git nach GitHub übertragen.

```bash
git status
git add .
git commit -m "Kurz beschreiben, was geändert wurde"
git push
```

## Nuetzliche gh-Befehle

Wenn die GitHub CLI angemeldet ist, sind diese Befehle im Alltag praktisch:

```bash
gh auth status
gh repo view georg184/transformation_of_functions --web
gh browse
```

## GitHub Pages

Das Projekt wird aus dem Branch `main` aus dem Repository-Root veröffentlicht. Nach jedem `git push` wird die öffentliche Seite von GitHub Pages aktualisiert.
