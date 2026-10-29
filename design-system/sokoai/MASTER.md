# Design System — SokoAI (feuille de route de conception)

Source : skills `ui-ux-pro-max` + **`apple-design`** (`.agents/skills/apple-design/SKILL.md` — WWDC Fluid Interfaces, Materials & Depth, Optical Typography, 8 Design Foundations), adaptés au produit
SokoAI : générateur de boutiques e-commerce africaines (mobile-first, commande WhatsApp, FCFA).

## 1. Modèle produit
- **Pattern :** Feature-Rich Showcase — 1 message clé par carte, hiérarchie claire, CTA répétés.
- **Sections page d'accueil :** Hero (proposition de valeur) > Catalogue/grille produits > Section signature > Réassurance (livraison, Wave/Orange Money/MTN MoMo, paiement à la livraison) > Preuve sociale > CTA final.
- **CTA :** dans le Hero + après le catalogue + en bas de page. Bouton WhatsApp flottant permanent.

## 2. Apparence / Style
- Site GENRE produit : commerce de détail africain — chaud, soigné, jamais « template Bootstrap ».
- Modes : light par défaut, dark optionnel. Profondeur OK (couches douces), pas de maximalisme aléatoire.
- Icons : svg inline toujours (jamais d'emoji comme icône).

## 3. Palette (tokens sémantiques dans src/theme.js)
Toujours exprimer la palette comme tokens Tailwind dans `window.SOKO_THEME` :
`primary`, `onPrimary`, `secondary`, `accent (CTA, contrastant)`, `background`, `foreground`,
`card`, `cardForeground`, `muted`, `mutedForeground`, `border`, `destructive`, `ring`.
- Contraste texte 4.5:1 minimum (texte sur image : overlay + `--color-foreground` clair/sombre selon fond).
- Le CTA (`accent`) doit contraster fortement avec le reste de la palette.

## 4. Typographies (pairings visés par direction)
| Direction | Titres | Texte | Ambiance |
|---|---|---|---|
| Éditorial & luxe | Playfair Display (ou Cormorant) | Inter (ou Montserrat) | luxe, mode, raffiné |
| Moderne & audacieux | Syne (700/800) | Manrope | exaggerated minimalism, papier + encre + accent unique coquelicot |
| Doux & minimal | Bodoni Moda (titres, italiques) | Jost | minimal PREMIUM, air, filets fins (type Jacquemus/Aesop) |
| Artisan / traditionnel | Amatic SC (display) | Cabin | artisanal, fait main, organique |

Échelle : base 16px minimum, titres 32px+, interligne 1.5. Aucun texte < 12px.

## 5. Règles UX e-commerce africain (priorité haute)
1. **Mobile-first** : styles par défaut = mobile, puis `md:` `lg:` `-xl:`. Breakpoints testés 375/768/1024/1440.
2. **Touch :** zones cliquables ≥ 44×44px, espacement inter-actions ≥ 8px (grille de filtres, boutons produit).
3. **Commande WhatsApp :** `inputmode` correct sur les inputs (numérique pour les quantités), lien `https://wa.me/<numéro>?text=<produit pré-rempli avec nom + prix>`.
4. **Tailles de police :** prix et CTA lisibles (16px+), badges nets.
5. **Tableaux :** jamais de largeur dépassée — cartes sur mobile, `overflow-x-auto` sinon.
6. **Feedback :** hover/active sur tout élément cliquable, transitions 150-300ms, `cursor-pointer`.
7. **Formulaires :** labels visibles, erreur près du champ, texte d'aide.
8. **Navigation :** liens #/accueil #/boutique #/histoire #/contact prévisibles + menu burger mobile facile à viser.

## 6. Standards `apple-design` (Fluidité, Matériaux & Typographie Optique)
Issus de `.agents/skills/apple-design/SKILL.md` :
- **Réponse instantanée au toucher (§1 & §10) :** Feedback dès le `pointer-down` (`active:scale-[0.97] transition-transform duration-100 ease-out`) sur tous les boutons, cartes produit, vignettes et filtres.
- **Matériaux translucides & Profondeur (§12) :**
  - `Navbar` et barres flottantes en verre dépoli (`backdrop-blur-xl backdrop-saturate-[180%] bg-background/80`) avec filet lumineux subtil (`border-b border-white/15` ou `border-black/5`).
  - **Dim to focus :** La modale fiche produit assombrit l'arrière-plan (`bg-black/55 backdrop-blur-sm`) et émerge avec une mise à l'échelle douce. Ne jamais empiler deux surfaces translucides claires.
- **Typographie optique Apple (§15) :**
  - **Tracking lié à la taille :** négatif sur les grands titres display (`tracking-[-0.025em]`), neutre sur le corps (`tracking-normal`), positif sur les surtitres/badges uppercase (`tracking-[0.12em]`).
  - **Leading inversement lié à la taille :** serré sur les titres Hero (`leading-[1.05]`–`leading-[1.12]`), aéré sur le corps (`leading-[1.6]`).
  - **Prix FCFA :** toujours en `tabular-nums` (`font-variant-numeric: tabular-nums`) pour un alignement parfait des montants et du recalcul quantité × prix.
- **Physique & Cohérence spatiale (§3, §4, §7) :**
  - Courbes d'amortissement critique sans rebond parasite (`cubic-bezier(0.22, 1, 0.36, 1)`, 250–350ms), uniquement sur `transform` et `opacity`.
  - `prefers-reduced-motion` respecté.
- **8 Fondations Apple (§16 — Simplicity, Craft, Grouping, Wayfinding) :**
  - Proximité des contrôles : sélecteur de quantité (`-` / `+`) accolé au CTA « Commander sur WhatsApp » avec mise à jour temps réel du prix total en FCFA.
  - Repérage clair (Wayfinding) : lien actif marqué dans la `Navbar`, fermeture de modale prévisible (bouton fermer $\ge 44\text{px}$, clic scrim, touche `Escape`).

## 7. Anti-patterns à éviter
- Emojis en guise d'icônes ; absence d'états de focus clavier ; gris sur gris.
- Défilement horizontal ; largeurs fixes en px ; `user-scalable=no`.
- Pages trop textes ; flat sans profondeur ; une seule couleur sans accent CTA.
- Placeholder-only labels ; erreurs seulement en haut de formulaire.

## 8. Checklist avant publication (chaque projet généré)
- [ ] Aucun emoji en icône (svg inline OK)
- [ ] cursor-pointer sur tous les clickable, hover states 150-300ms
- [ ] Contraste ≥ 4.5:1 ; focus visible pour la navigation clavier
- [ ] Mobile 375px OK (pas de défilement horizontal), 768/1024/1440 OK
- [ ] Boutons ≥ 44px en mobile
- [ ] `window.SOKO_THEME` remplis avec des tokens sémantiques cohérents
- [ ] Prix en FCFA sans centimes ; CTA WhatsApp partout (Hero, produit, footer, CTA flottant)
- [ ] Aucune info manquante laissée vide (horaires, ville, zones) — valeurs inventées cohérentes
- [ ] Aucun lorem/XXX, contenus en français chaleureux (vouvoiement)

## 9. Comment concevoir ce type de site (recette — Moteur bolt.diy + WebContainers)
1. **Brief** : produit, ville, ambiance, paiement, WhatsApp → cahier des charges (questions de découverte).
2. **3 directions artistiques** DISTINCTES (palette + pairing typographique + gabarit hero + ordre sections) ; la direction choisie par le commerçant doit être explicite.
3. **Protocole `bolt.diy` (`<boltArtifact>` / `<boltAction>`)** :
   - Génération structurée en `<boltArtifact id="..." title="..." whatsapp="..." city="...">` contenant des `<boltAction type="file" filePath="...">`.
   - Fichiers React par convention : `src/theme.js` (tokens) → `src/data/products.js` (10+ produits réels) → `Navbar`/`Hero`/`ProductCard`/`ProductGrid`/`Sections`/`Footer` par fichier → `src/App.jsx` (routeur hash).
   - **Édition différentielle (Chat)** : lors d'une modification, seuls les `<boltAction type="file">` des fichiers modifiés sont renvoyés et fusionnés.
4. **Exécution WebContainers (`@webcontainer/api` + Vite HMR)** :
   - Singleton WebContainer démarré avec `coep: "credentialless"` (autorise les images Unsplash) et serveur Vite pré-installé en tâche de fond.
   - Changement de variante (A / B / C) ou modification chat injecté directement dans `webcontainer.fs` avec mise à jour Vite HMR en `< 50ms`.
5. **Auto-réparation & Checklist qualité** ci-dessus avant Publier sur `/store/<slug>`.
