import type { Pair } from "@/game-engine/types";

/**
 * The 22 biomimetic pairs — source: RÈGLES DU JEU.pdf
 * Each pair links a Vivant element with its human Application,
 * along with a pedagogical explanation shown after a correct association.
 *
 * Image assets (HD, clean, no embedded text) live in
 *   /public/images/cards/{slug}.png
 * mapped from the new asset batch in projet_client2.0/Images/*_hd.png.
 */
export const PAIRS: readonly Pair[] = [
  // ─── NIVEAU 1 — Très faciles ─────────────────────────────────────────────
  {
    id: 1,
    level: 1,
    vivant: { id: "v1", label: "Fruits de bardane", imageSrc: "/images/cards/bardane.png" },
    application: { id: "a1", label: "Velcro", imageSrc: "/images/cards/velcro.png" },
    explanation:
      "En imitant les fruits de bardane qui s'accrochent aux poils d'animaux, un ingénieur suisse a inventé le velcro avec une partie « velours » et une partie « crochets ».",
  },
  {
    id: 2,
    level: 1,
    vivant: { id: "v2", label: "Gekko", imageSrc: "/images/cards/gekko.png" },
    application: { id: "a2", label: "Adhésif Geckskin", imageSrc: "/images/cards/geckskin.png" },
    explanation:
      "Le gekko est un des rares animaux à pouvoir se déplacer au plafond. Des chercheurs s'en sont inspirés pour créer un adhésif assez puissant pour soutenir une télévision.",
  },
  {
    id: 3,
    level: 1,
    vivant: { id: "v3", label: "Peau du requin", imageSrc: "/images/cards/requin.png" },
    application: { id: "a3", label: "Combinaisons de natation", imageSrc: "/images/cards/combinaison.png" },
    explanation:
      "Une société propose des combinaisons de natation ultra-rapides dont la surface est calquée sur la peau des requins, ce qui facilite la glisse et la pénétration dans l'eau.",
  },
  {
    id: 4,
    level: 1,
    vivant: { id: "v4", label: "Martin-pêcheur", imageSrc: "/images/cards/martin-pecheur.png" },
    application: { id: "a4", label: "TGV japonais", imageSrc: "/images/cards/tgv.png" },
    explanation:
      "Pour rendre le TGV japonais plus discret sans perdre de vitesse, l'ingénieur Eiji Nakatsu s'est inspiré du martin-pêcheur : l'avant du train imite désormais la forme fuselée de son bec.",
  },

  // ─── NIVEAU 2 — Faciles ──────────────────────────────────────────────────
  {
    id: 5,
    level: 2,
    vivant: { id: "v5", label: "Trompe du moustique", imageSrc: "/images/cards/moustique.png" },
    application: { id: "a5", label: "Aiguille médicale indolore", imageSrc: "/images/cards/aiguille.png" },
    explanation:
      "Inspirée de la piqûre du moustique — indolore quoique désagréable —, une société japonaise a inventé une nouvelle aiguille conique et plus fine.",
  },
  {
    id: 6,
    level: 2,
    vivant: { id: "v6", label: "Termitière", imageSrc: "/images/cards/termitiere.png" },
    application: { id: "a6", label: "Eastgate Building", imageSrc: "/images/cards/eastgate.png" },
    explanation:
      "Ce centre commercial consomme 90 % d'énergie de moins que la moyenne, grâce à une régulation passive de la température inspirée de la structure des termitières.",
  },
  {
    id: 7,
    level: 2,
    vivant: { id: "v7", label: "Lucioles", imageSrc: "/images/cards/luciole.png" },
    application: { id: "a7", label: "Lampes LED", imageSrc: "/images/cards/led.png" },
    explanation:
      "L'abdomen de la luciole est couvert d'écailles en dents de scie qui l'aident à briller plus fort. Des chercheurs s'en sont inspirés pour augmenter la luminosité des LED.",
  },
  {
    id: 8,
    level: 2,
    vivant: { id: "v8", label: "Nageoires de baleines à bosse", imageSrc: "/images/cards/baleine.png" },
    application: { id: "a8", label: "Éoliennes", imageSrc: "/images/cards/eoliennes.png" },
    explanation:
      "Au Canada, une société commercialise des éoliennes plus efficaces en reproduisant les cannelures des nageoires des baleines à bosse.",
  },

  // ─── NIVEAU 3 — Intermédiaires ───────────────────────────────────────────
  {
    id: 9,
    level: 3,
    vivant: { id: "v9", label: "Nautile", imageSrc: "/images/cards/nautile.png" },
    application: { id: "a9", label: "Turboréacteurs", imageSrc: "/images/cards/turbomoteur.png" },
    explanation:
      "Le nautile se déplace silencieusement grâce à sa coquille en spirale. Cette propulsion par réaction inspire de nombreux engins à moteur.",
  },
  {
    id: 10,
    level: 3,
    vivant: { id: "v10", label: "Papillon Greta oto", imageSrc: "/images/cards/greta-oto.png" },
    application: { id: "a10", label: "Verres anti-reflet", imageSrc: "/images/cards/verres-antireflet.png" },
    explanation:
      "Les ailes du papillon Greta oto sont naturellement transparentes et ne reflètent pas la lumière — une particularité étudiée pour concevoir des verres anti-reflet.",
  },
  {
    id: 11,
    level: 3,
    vivant: { id: "v11", label: "Effet lotus", imageSrc: "/images/cards/lotus.png" },
    application: { id: "a11", label: "Surface hydrophobe", imageSrc: "/images/cards/hydrofuge.png" },
    explanation:
      "Les bosses microscopiques de la feuille de lotus empêchent l'eau d'adhérer à sa surface. Cette super-hydrophobie inspire des matériaux autonettoyants.",
  },
  {
    id: 12,
    level: 3,
    vivant: { id: "v12", label: "Os humain (fémur)", imageSrc: "/images/cards/os-humain.png" },
    application: { id: "a12", label: "Tour Eiffel", imageSrc: "/images/cards/tour-eiffel.png" },
    explanation:
      "Le fémur n'a de matière que là où la résistance est demandée. La Tour Eiffel s'inspire de cette anatomie pour être plus légère que le cylindre d'air qui la contient.",
  },

  // ─── NIVEAU 4 — Difficiles ───────────────────────────────────────────────
  {
    id: 13,
    level: 4,
    vivant: { id: "v13", label: "Moule", imageSrc: "/images/cards/moule.png" },
    application: { id: "a13", label: "Colle forte bio-inspirée", imageSrc: "/images/cards/colle-forte.png" },
    explanation:
      "La capacité des moules à se fixer aux métaux a inspiré aux chercheurs de l'Institut Charles Sadron une colle bio-inspirée pour lier des protéines sur surfaces métalliques.",
  },
  {
    id: 14,
    level: 4,
    vivant: { id: "v14", label: "Coléoptère de Namibie", imageSrc: "/images/cards/coleoptere-namibie.png" },
    application: { id: "a14", label: "Filets capteurs de rosée", imageSrc: "/images/cards/filets-rosee.png" },
    explanation:
      "Le scarabée Stenocara capte le brouillard sur les bosses hydrophiles de son dos. Les gouttes glissent dans des rainures cireuses pour rejoindre sa bouche — un principe transposé aux filets capteurs de rosée.",
  },
  {
    id: 15,
    level: 4,
    vivant: { id: "v15", label: "Corail", imageSrc: "/images/cards/corail.png" },
    application: { id: "a15", label: "Ciment neutre en carbone", imageSrc: "/images/cards/ciment-carbone.png" },
    explanation:
      "Les polypes de corail absorbent CO₂ et minéraux pour sécréter du carbonate de calcium. Ce processus a inspiré la production de ciment neutre en carbone.",
  },
  {
    id: 16,
    level: 4,
    vivant: { id: "v16", label: "Aile de papillon morpho", imageSrc: "/images/cards/morpho.png" },
    application: { id: "a16", label: "Panneaux solaires", imageSrc: "/images/cards/panneaux-solaires.png" },
    explanation:
      "Les écailles de chitine du papillon morpho régulent sa température. Cette propriété intéresse les chercheurs pour des panneaux solaires plus rentables, évitant la surchauffe.",
  },
  {
    id: 17,
    level: 4,
    vivant: { id: "v17", label: "Manchot", imageSrc: "/images/cards/manchot.png" },
    application: { id: "a17", label: "District 11", imageSrc: "/images/cards/district-11.png" },
    explanation:
      "Inspiré du regroupement en « tortue » des manchots qui se réchauffent collectivement, le plan de masse du District 11 permet d'économiser 5 °C de température.",
  },

  // ─── NIVEAU 5 — Très difficiles ──────────────────────────────────────────
  {
    id: 18,
    level: 5,
    vivant: { id: "v18", label: "Corbeille de Vénus", imageSrc: "/images/cards/corbeille-venus.png" },
    application: { id: "a18", label: "30 St Mary Axe", imageSrc: "/images/cards/30-st-mary-axe.png" },
    explanation:
      "L'éponge Euplectella aspergillum possède un squelette de fibres de verre disposées en treillis. Cette morphologie a inspiré la spirale du gratte-ciel londonien 30 St Mary Axe.",
  },
  {
    id: 19,
    level: 5,
    vivant: { id: "v19", label: "Cicatrice", imageSrc: "/images/cards/cicatrice.png" },
    application: { id: "a19", label: "Béton cicatrisant", imageSrc: "/images/cards/beton-cicatrisant.png" },
    explanation:
      "Le béton cicatrisant intègre des bactéries dormantes qui se réveillent au contact de l'eau et produisent du carbonate de calcium, calfeutrant les fissures comme une plaie se referme.",
  },
  {
    id: 20,
    level: 5,
    vivant: { id: "v20", label: "Zèbre", imageSrc: "/images/cards/zebre.png" },
    application: { id: "a20", label: "Camouflage architectural", imageSrc: "/images/cards/camouflage.png" },
    explanation:
      "Les rayures contrastées du zèbre, étudiées pour leur effet de dissimulation, inspirent le camouflage des coques de navires puis l'enveloppe de certains bâtiments.",
  },
  {
    id: 21,
    level: 5,
    vivant: { id: "v21", label: "Champignon", imageSrc: "/images/cards/champignon.png" },
    application: { id: "a21", label: "Maggie's Centre", imageSrc: "/images/cards/maggie-center.png" },
    explanation:
      "Maggie's Centre Leeds emprunte aux champignons sa structure poreuse et ses matériaux respirants (bois d'épicéa, enduit à la chaux) pour réguler naturellement l'humidité.",
  },
  {
    id: 22,
    level: 5,
    vivant: { id: "v22", label: "Orchidée", imageSrc: "/images/cards/orchidee.png" },
    application: { id: "a22", label: "Gardens by the Bay", imageSrc: "/images/cards/gardens-bay.png" },
    explanation:
      "Le plan directeur de Gardens by the Bay (Singapour) s'inspire de la forme de l'orchidée et combine architecture, expositions horticoles et infrastructure environnementale intelligente.",
  },
] as const;

/** All pairs of a given level — preserves declaration order. */
export function getPairsForLevel(level: number): readonly Pair[] {
  return PAIRS.filter((p) => p.level === level);
}

export function getPairById(id: number): Pair | undefined {
  return PAIRS.find((p) => p.id === id);
}
