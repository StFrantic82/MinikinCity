s=open('rules_fr.py').read()
R=[
("'Printemps', ('#e6","'Primavera', ('#e6"),("'Été', ('#fbf1","'Estate', ('#fbf1"),("'Automne', ('#fbd9","'Autunno', ('#fbd9"),("'Hiver', ('#d6eb","'Inverno', ('#d6eb"),
("'L’offre compte <b>nombre de joueurs + 3</b> cartes. Comme d’habitude, les cartes restantes vont sous la pioche.'","'L’offerta ha <b>numero di giocatori + 3</b> carte. Come al solito, le carte rimaste vanno in fondo al mazzo.'"),
("'Se fait à votre tour de prendre une carte, dans l’ordre inverse du classement. La carte que vous rendez peut être prise par les joueurs suivants.'","'Si fa al tuo turno di prendere una carta, in ordine inverso di classifica. La carta che restituisci può essere presa dai giocatori successivi.'"),
("'Tous les joueurs piochent en même temps. Votre main compte 1 carte de plus jusqu’à la fin de la partie, ce qui compte pour le classement final.'","'Tutti i giocatori pescano insieme. La tua mano ha 1 carta in più fino alla fine della partita, il che conta per la classifica finale.'"),
("'Décidez-le à votre tour de jouer. Une carte jouée depuis l’offre n’est plus disponible pour les autres. Jouer une carte de sa main reste possible.'","'Decidilo al tuo turno di gioco. Una carta giocata dall’offerta non è più disponibile per gli altri. Giocare una carta dalla mano resta possibile.'"),
("'Tous les joueurs choisissent et posent leur carte en même temps. <b>Les égalités et les effets instantanés</b> se résolvent toujours dans l’ordre du tour.'","'Tutti i giocatori scelgono e giocano la carta insieme. <b>Parità ed effetti istantanei</b> si risolvono sempre nell’ordine di turno.'"),
("'Le 1er joueur de la manche ne reçoit jamais le bonus. La carte Ville 21 n’a pas de couleur : elle ne correspond jamais.'","'Il 1° giocatore del round non riceve mai il bonus. La carta Città 21 non ha colore: non corrisponde mai.'"),
("'Tous les joueurs donnent en même temps. Choisissez votre carte avant de regarder celle que vous recevez.'","'Tutti i giocatori passano insieme. Scegli la tua carta prima di guardare quella che ricevi.'"),
("'Ordre : cartes <b>paires</b> de la meilleure couleur, autres cartes paires, cartes <b>impaires</b> de la meilleure couleur, autres cartes impaires.'","'Ordine: carte <b>pari</b> del colore migliore, altre carte pari, carte <b>dispari</b> del colore migliore, altre carte dispari.'"),
("'Se résout juste après avoir joué votre carte. La carte Ville 21 ne compte pas.'","'Si risolve subito dopo aver giocato la tua carta. La carta Città 21 non conta.'"),
("'Le +5 ne compte que pour le classement, jamais pour les effets des cartes.'","'Il +5 conta solo per la classifica, mai per gli effetti delle carte.'"),
("'Cartes de la meilleure couleur <b>de la plus faible à la plus forte</b>, puis les autres cartes de la plus faible à la plus forte. Les nouvelles cartes se prennent toujours du bas du classement vers le haut.'","'Carte del colore migliore <b>dalla più bassa alla più alta</b>, poi le altre carte dalla più bassa alla più alta. Le nuove carte si prendono sempre dal fondo della classifica verso l’alto.'"),
("'Le miroir d’Even Steven Hopscotch : les cartes <b>impaires</b> passent avant les paires.'","'Lo specchio di Even Steven Hopscotch: le carte <b>dispari</b> vengono prima delle pari.'"),
("'D’abord les autres cartes (de la plus forte à la plus faible), puis les cartes de la meilleure couleur (de la plus forte à la plus faible).'","'Prima le altre carte (dalla più alta alla più bassa), poi le carte del colore migliore (dalla più alta alla più bassa).'"),
("'Cette couleur remplace celle de la carte Récompense. Si le 1er joueur joue la carte Ville 21, il n’y a pas de meilleure couleur cette manche.'","'Questo colore sostituisce quello della carta Ricompensa. Se il 1° giocatore gioca la carta Città 21, in questo round non c’è colore migliore.'"),
("'Sautez l’étape 1 (créer l’offre) et l’étape 3 (prendre une nouvelle carte).'","'Salta la fase 1 (creare l’offerta) e la fase 3 (prendere una nuova carta).'"),
("'Tous les joueurs jouent en même temps. Résolvez les effets instantanés et placez les Minikins comme d’habitude. Cette carte ne compte plus pour le classement final.'","'Tutti i giocatori giocano insieme. Risolvi gli effetti istantanei e piazza i Minikin come al solito. Quella carta non conta più per la classifica finale.'"),
("'Les joueurs à 0 sont à égalité en dernière position ; départagez-les comme d’habitude, dans l’ordre où les mains sont révélées.'","'I giocatori a 0 sono a pari merito all’ultimo posto; spareggiali come al solito, nell’ordine in cui le mani vengono rivelate.'"),
("TITLES = {'spring': 'Fêtes du printemps', 'summer': 'Fêtes de l’été', 'autumn': 'Fêtes de l’automne', 'winter': 'Fêtes de l’hiver'}","TITLES = {'spring': 'Feste di primavera', 'summer': 'Feste d’estate', 'autumn': 'Feste d’autunno', 'winter': 'Feste d’inverno'}"),
(">Extension</p>",">Espansione</p>"),
("""Le printemps fait le ménage,<br>l’été danse sur la plage,<br>
    l’automne conte ses histoires,<br>l’hiver glisse jusqu’au soir.""","""In primavera si fa pulizia,<br>d’estate si balla in allegria,<br>
    l’autunno racconta le sue storie,<br>l’inverno scivola tra mille glorie."""),
("banner('Une année à Minikin City')","banner('Un anno a Minikin City')"),
("""<p class="lead">Dans leurs salons en tasses de thé, sur leurs chaises en dés à coudre, les Minikins ne ratent jamais
    une occasion de faire la fête. Un bouton perdu devient un chapeau de fête, un kazoo un orchestre, et un coussin de
    canapé une expédition.</p>""","""<p class="lead">Nei loro salotti a forma di tazza e sulle sedie di ditali, i Minikin non perdono mai l’occasione
    di fare festa. Un bottone perso diventa un cappellino, un kazoo un’orchestra e il cuscino del divano una spedizione.</p>"""),
("""<p>Avec cette extension, <b>chaque manche de Minikin City apporte une Fête</b> qui modifie une règle du jeu, pour
    cette manche seulement. Une année Minikin dure <b>8 mois</b>, deux par saison : printemps, été, automne et hiver.
    Puis tout le monde se retrouve pour fêter le <b>Nouvel An</b> lors du classement final.</p>""","""<p>Con questa espansione, <b>ogni round di Minikin City porta una Festa</b> che modifica una regola del gioco, solo per
    quel round. Un anno Minikin dura <b>8 mesi</b>, due per stagione: primavera, estate, autunno e inverno.
    Poi tutti si ritrovano per festeggiare il <b>Capodanno</b> durante la classifica finale.</p>"""),
("banner('Matériel')","banner('Materiale')"),
("""<p><b>18 cartes Fête</b> : 4 par saison et 2 pour le Nouvel An. La saison est indiquée au dos de la carte
    et par l’icône en haut à gauche de sa face.</p>""","""<p><b>18 carte Festa</b>: 4 per stagione e 2 per il Capodanno. La stagione è indicata sul retro della carta
    e dall’icona in alto a sinistra sul fronte.</p>"""),
("""<span style="width:17.5mm">Printemps</span><span style="width:17.5mm">Été</span><span style="width:17.5mm">Automne</span>
      <span style="width:17.5mm">Hiver</span><span style="width:17.5mm">Nouvel An</span>""","""<span style="width:17.5mm">Primavera</span><span style="width:17.5mm">Estate</span><span style="width:17.5mm">Autunno</span>
      <span style="width:17.5mm">Inverno</span><span style="width:17.5mm">Capodanno</span>"""),
("#86c0e6)\">Nouvel An</span>'","#86c0e6)\">Capodanno</span>'"),
("banner('Mise en place')","banner('Preparazione')"),
("<p>Installez Minikin City comme d’habitude, puis :</p>","<p>Prepara Minikin City come al solito, poi:</p>"),
("Triez les cartes Fête selon leur dos et <b>mélangez chaque saison séparément</b>.","Dividi le carte Festa in base al retro e <b>mescola ogni stagione separatamente</b>."),
("Placez <b>2 cartes Printemps</b> face cachée au-dessus des cartes Récompense des manches 1 et 2.","Metti <b>2 carte Primavera</b> coperte sopra le carte Ricompensa dei round 1 e 2."),
("Placez <b>2 cartes Été</b> face cachée au-dessus des manches 3 et 4.","Metti <b>2 carte Estate</b> coperte sopra i round 3 e 4."),
("Placez <b>2 cartes Automne</b> face cachée au-dessus des manches 5 et 6.","Metti <b>2 carte Autunno</b> coperte sopra i round 5 e 6."),
("Placez <b>2 cartes Hiver</b> face cachée au-dessus des manches 7 et 8.","Metti <b>2 carte Inverno</b> coperte sopra i round 7 e 8."),
("Placez <b>1 carte Nouvel An</b> face cachée au-dessus de la tuile de fin de partie.","Metti <b>1 carta Capodanno</b> coperta sopra la tessera di fine partita."),
("Remettez les cartes Fête inutilisées dans la boîte sans les regarder.","Rimetti nella scatola le carte Festa inutilizzate senza guardarle."),
("La 9<sup>e</sup> carte Récompense reste sous la tuile de fin de partie, comme dans le jeu de base. Chaque partie utilise 9 des 18 cartes Fête : aucune année à Minikin City ne ressemble à une autre.","La 9ª carta Ricompensa resta sotto la tessera di fine partita, come nel gioco base. Ogni partita usa 9 delle 18 carte Festa: nessun anno a Minikin City è uguale a un altro."),
("banner('Déroulement')","banner('Svolgimento')"),
("""<p>Au début de chaque manche, <b>avant de créer l’offre</b>, révélez la carte Fête placée au-dessus de la carte
    Récompense de cette manche et lisez-la à voix haute. Jouez ensuite la manche normalement, en appliquant la Fête.</p>""","""<p>All’inizio di ogni round, <b>prima di creare l’offerta</b>, rivela la carta Festa sopra la carta Ricompensa
    del round e leggila ad alta voce. Poi gioca il round normalmente, applicando la Festa.</p>"""),
("Une Fête <b>ne dure que le temps de sa manche</b>. Laissez-la face visible pour que chacun voie le mois en cours.","Una Festa <b>dura solo il suo round</b>. Lasciala scoperta perché tutti vedano il mese in corso."),
("Une Fête ne change que ce qu’elle indique. Si elle contredit les règles de base, <b>la Fête l’emporte</b>.","Una Festa cambia solo ciò che indica. Se contraddice le regole base, <b>vince la Festa</b>."),
("<b>Icônes de coin :</b> une Fête avec l’icône","<b>Icone d’angolo:</b> una Festa con l’icona"),
("se fait par tous les joueurs en même temps. Une Fête avec l’icône","viene eseguita da tutti i giocatori insieme. Una Festa con l’icona"),
("s’applique en fin de manche, quand les joueurs prennent une nouvelle carte.","si applica a fine round, quando i giocatori prendono una nuova carta."),
("<b>Nouvel An :</b> révélez la carte Nouvel An après la manche 8, avant le classement de la tuile de fin de partie, et appliquez-la à ce classement.","<b>Capodanno:</b> rivela la carta Capodanno dopo il round 8, prima della classifica della tessera di fine partita, e applicala a quella classifica."),
("<h3>Anatomie d’une carte Fête</h3>","<h3>Anatomia di una carta Festa</h3>"),
("<li><b>Saison</b>, aussi indiquée au dos.</li>","<li><b>Stagione</b>, indicata anche sul retro.</li>"),
("<li><b>Nom</b> de la Fête.</li>","<li><b>Nome</b> della Festa.</li>"),
("<li><b>Phrase d’accroche</b>, juste pour le plaisir.</li>","<li><b>Motto</b>, solo per divertimento.</li>"),
("<li><b>Icône de coin</b> : tous les joueurs le font en même temps.</li>","<li><b>Icona d’angolo</b>: tutti i giocatori lo fanno insieme.</li>"),
("<li><b>Effet</b> en icônes, avec les symboles de Minikin City.</li>","<li><b>Effetto</b> in icone, con i simboli di Minikin City.</li>"),
("<li><b>Effet</b> en toutes lettres.</li>","<li><b>Effetto</b> per esteso.</li>"),
("""<div class="note"><b>À retenir :</b> une carte tricolore est une carte de votre main, un dos de carte représente la
    pioche ou l’offre, une flèche vers le haut signifie <i>prendre</i> et une flèche vers le bas <i>jouer</i>.</div>""","""<div class="note"><b>Da ricordare:</b> una carta tricolore è una carta della tua mano, un dorso di carta è il mazzo
    o l’offerta, una freccia in su significa <i>prendere</i> e una freccia in giù <i>giocare</i>.</div>"""),
("banner('Nouvel An', '#f6b9cf', '#b9d8f2')","banner('Capodanno', '#f6b9cf', '#b9d8f2')"),
("banner('Avec Wild Friends', '#f7ef98', '#cdeadb', 13)","banner('Con Wild Friends', '#f7ef98', '#cdeadb', 13)"),
("<p>Les Fêtes se combinent avec l’extension Wild Friends. La <b>carte Récompense grise</b> n’a pas de meilleure couleur :</p>","<p>Le Feste si combinano con l’espansione Wild Friends. La <b>carta Ricompensa grigia</b> non ha colore migliore:</p>"),
("Slowpoke Cup, Even Steven Hopscotch, Odd Sock Day, Buzz-Buzz Rally et Little Lights Night s’appliquent au classement par valeur seule.","Slowpoke Cup, Even Steven Hopscotch, Odd Sock Day, Buzz-Buzz Rally e Little Lights Night si applicano alla classifica per solo valore."),
("Follow-the-Leader Sledging : la couleur du 1er joueur devient la meilleure couleur, même sur la carte grise.","Follow-the-Leader Sledging: il colore del 1° giocatore diventa il colore migliore, anche sulla carta grigia."),
("Topsy-Turvy Ball n’a aucun effet sur la carte grise.","Topsy-Turvy Ball non ha effetto sulla carta grigia."),
("Less-Is-More Resolution avec la carte grise sous la tuile de fin de partie : le plus petit total de toute la main gagne.","Less-Is-More Resolution con la carta grigia sotto la tessera di fine partita: vince il totale più basso dell’intera mano."),
("Les cartes Wild Friends à effet instantané comptent pour Buzz-Buzz Rally.","Le carte Wild Friends con effetto istantaneo contano per Buzz-Buzz Rally."),
("Auteurs : Matthieu Verdier, Simone Luciani · Illustrations : Kerri Aitken · Cranio Creations","Autori: Matthieu Verdier, Simone Luciani · Illustrazioni: Kerri Aitken · Cranio Creations"),
("rules_fr.html","rules_it.html"),
]
for a,b in R:
    assert a in s, a[:70]; s=s.replace(a,b)
open('rules_it.py','w').write(s)
