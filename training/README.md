# Entraînement de l’IA

L’IA « Normal » utilise des poids (`TRAINED_W` dans `engine.js`) obtenus par une stratégie évolutionnaire :
à chaque génération, 10 variantes du champion jouent 1 000 parties contre lui ; la meilleure est revalidée
sur 3 000 autres parties et devient le nouveau champion si elle gagne au moins 3 % plus souvent.

```
cd training
node train.js 80      # 80 générations, écrit champ.json
node levels.js hard 80
```

Recopiez ensuite le contenu de `champ.json` dans `TRAINED_W` (engine.js).
