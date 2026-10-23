# Design System — SokoAI (feuille de route de conception)

Source : skill `ui-ux-pro-max` (styles, palettes, typographies, 119 règles UX), adapté au produit
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

## 6. Animation
- Reveal fade-up sur contenu VISIBLE (jamais opacity:0 par défaut), 200-300ms, easing doux.
- La motion porte du sens (hiérarchie spatiale), pas une accumulation de gadgets. `prefers-reduced-motion` respecté quand possible.
- Anti-patterns : une seule durée pour tout, animer width/height, hover uniquement (prévoir états tactiles).

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

## 9. Comment concevoir ce type de site (recette)
1. **Brief** : produit, ville, ambiance, paiement, WhatsApp → cahier des charges (questions de découverte).
2. **3 directions artistiques** DISTINCTES (palette + pairing typographique + gabarit hero + ordre sections) ; la direction choisie par le commerçant doit être explicite.
3. **Fichiers React par convention** : theme.js (tokens) → data/products.js (10+ produits réels) → Navbar/Hero/ProductCard/ProductGrid/Sections/Footer par fichier → App.jsx (routeur hash + `window.__APP__`).
4. **Auto-réparation** : fichiers requis, composants JSX utilisés mais non définis, erreurs Babel → re-loop LLM ( jusqu'à 3 passes).
5. **Checklist qualité** ci-dessus avant Publier sur /store/<slug>.
