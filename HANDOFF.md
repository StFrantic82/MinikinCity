# Minikin City — fichier de reprise (pour une nouvelle conversation)

Auteur du jeu : Matthieu (Cranio Creations). Échanges en **français**.
Pour reprendre : « Clone StFrantic82/minikincity et lis HANDOFF.md ».

## Ce qui existe
- **Extension n°2 « Festivals »** : 16 cartes Fête (une par manche, 8 manches = 8 mois, 2 par saison) + carte Nouvel An (9e manche / fin de partie), recto-verso. Cartes carrées de 6×6 cm, en anglais, couleurs des saisons : vert (printemps), jaune (été), orange (automne), bleu (hiver), arc-en-ciel (Nouvel An).
  - PDF prêts à imprimer : `print/Minikin_City_Festivals_6x6_front.pdf` / `_back.pdf` (18 pages chacun).
  - Règles PDF FR/EN/IT : `rules/Minikin_City_Festivals_*.pdf`. Doc Claude des règles (EN) : https://claude.ai/artifact/TRam59SgusKxA7UaBtDvpq
  - Générateurs : `tools/generators/` (gen_en.py = cartes, rules*.py = règles). Ils ont besoin des assets d'origine (non versionnés) et de `fonts/yumelo.ttf`.
- **Appli web jouable** (JS sans framework) :
  - GitHub Pages : https://stfrantic82.github.io/minikincity/
  - Artifact Claude, à garder identique : https://claude.ai/artifact/YZWRYEF7e4pgLux96kLsF2 (slug ff953b51-a66b-4162-8433-770d3baafc7d, dernière version 1795594336-e127)
  - Modes : solo contre l'IA (facile / normal / difficile = Monte-Carlo), multijoueur en ligne (Firebase, projet « Minikin City », auth anonyme, règles dans database.rules.json), extensions Wild Friends (n°1) et Festivals (n°2), FR/EN/IT, tutoriel, statistiques (simulations IA jusqu'à 3000 parties + parties humaines), bulle d'annonce de fête à chaque manche, fenêtre de la tuile de fin montrant la couleur de la 9e carte.

## Fichiers
- data.js : cartes (symboles B=livre, H=cœur, S=sourire, G=sac, W=joker)
- engine.js : classe Game, règles, IA (DEFAULT_W, TRAINED_W, makeHardAI, aiFor)
- ui.js : interface, i18n, mode en ligne hôte/client, stats, tutoriel
- net.js : Firebase, ou ?local pour tester en local
- i18n.js : textes ; sim-worker.js : simulations
- training/ : entraînement de l'IA (train.js, champ.json)
- tools/sim.js : test rapide sous Node (400 parties)

## Publier une modif
1. Modifier, puis passer `?v=N` à N+1 dans index.html, ui.js et sim-worker.js (actuellement v=20).
2. `node tools/sim.js` → doit afficher 0 erreur.
3. Commit + push (déploiement sur Pages).
4. Republier les fichiers modifiés sur l'artifact Claude (publish_files, mode patch, avec le slug ci-dessus). Pour l'artifact, config.js est `tools/config.artifact.js` (MK_FIREBASE = null, donc pas de jeu en ligne) : ne pas écraser config.js de l'artifact avec celui de GitHub.

## Dernier état / à faire
- Corrigé : la carte bleue 5 a 4 symboles (B,H,S,G). Avant, elle était saisie comme un joker. Les autres cartes ont été vérifiées.
- **À faire (proposé)** : réentraîner l'IA (ses poids datent d'avant la correction de la bleue 5) et effacer les anciennes stats.
- En attente de Matthieu : règles officielles FR/IT du jeu de base et règles finales de Wild Friends (le PDF actuel est le prototype « Pets »).
