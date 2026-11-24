# Minikin City — version en ligne

Version numérique non officielle de **Minikin City** (Cranio Creations), jouable dans le navigateur :

- en solo contre l’ordinateur (2 à 5 joueurs) ;
- en ligne entre amis, les places libres étant jouées par l’ordinateur ;
- avec ou sans les extensions **Festivals** et **Wild Friends**.

## Jouer

Ouvrez la page GitHub Pages du dépôt. Pour jouer en ligne, un joueur crée une salle et envoie le code (ou le lien) aux autres, qui la rejoignent avant le lancement.

L’hôte fait tourner la partie dans son navigateur : s’il ferme son onglet, la partie s’arrête. Un invité qui recharge sa page retrouve sa place. Si un invité ne répond plus, l’hôte peut le faire remplacer par l’ordinateur.

## Configuration

- `config.js` contient la configuration Firebase (Realtime Database + authentification anonyme).
- `database.rules.json` contient les règles de sécurité à coller dans la console Firebase (*Realtime Database → Règles*).
- Pour tester sans Firebase, ouvrez `index.html?local` dans deux onglets d’un même navigateur (servis par un petit serveur web local).

## Fichiers

- `data.js` : les cartes (jeu de base, Wild Friends, Festivals) ;
- `engine.js` : le moteur de règles et l’IA ;
- `net.js` : le transport réseau (Firebase ou local) ;
- `ui.js` et `index.html` : l’interface ;
- `img/` : les visuels des cartes.
