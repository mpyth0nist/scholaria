"""
Seed script: Populates courses, modules, lessons, and one quiz with questions.

Usage:
    cd /home/maliki/Desktop/scholaria
    uv run python manage.py shell < scripts/seed_courses.py

What it does:
    1. Fills existing Course 1 (Islamic Art) with 2 more modules + lessons
    2. Fills existing Course 2 (World History) with 2 more modules + lessons
    3. Creates a brand-new 3rd course (Introduction to Computer Science) with 3 modules + lessons
    4. Creates a quiz with 5 questions for one module
    5. Ingests all new lessons into the vector DB for RAG
"""

import datetime

from courses.models import Course, Lesson, Module
from quizzes.models import Choice, Question, Quiz
from users.models import CustomUser

teacher, _ = CustomUser.objects.get_or_create(
    username='youssef_kaddioui',
    defaults={
        'email': 'kaddioui123@scholaria.com',
        'first_name': 'Youssef',
        'last_name': 'Kaddioui',
        'role': 'Teacher',
        'password': 'password123'
    }
)

# ═══════════════════════════════════════════════════════════════════════════════
# COURSE 1 — Introduction to Islamic Art & Architecture  (id=1)
# Already has: Module 1 (Arabic Calligraphy Foundations) → Lesson (Naskh Script)
# ═══════════════════════════════════════════════════════════════════════════════

course1, _ = Course.objects.get_or_create(
    course_name='Introduction to Islamic Art & Architecture',
    defaults={
        'subject': 'Art',
        'teacher': teacher,
        'published': True,
        'is_published': True
    }
)

# ── Module 1: fill remaining lessons ──────────────────────────────────────────
mod1_1, _ = Module.objects.get_or_create(
    title='Module 1: Arabic Calligraphy Foundations',
    course=course1,
    defaults={
        'order': 1,
        'is_published': True
    }
)

if not Lesson.objects.filter(module=mod1_1, title__icontains='Thuluth').exists():
    Lesson.objects.create(
        module=mod1_1,
        title="The Art of Thuluth Script",
        content="""# The Art of Thuluth Script

## Overview
Thuluth is one of the most elegant and complex scripts in Islamic calligraphy. Its name means "one-third," referring to the proportion of straight to curved strokes.

## Historical Context
Thuluth emerged during the 7th century and reached its peak during the Ottoman Empire. It was primarily used for:
- Mosque decorations and inscriptions
- Quran chapter headings
- Royal decrees and official documents

## Key Characteristics
1. **Tall vertical strokes** — Letters like Alif (ا) and Lam (ل) are elongated
2. **Sweeping curves** — The baseline curves dramatically, giving a flowing rhythm
3. **Diacritical marks** — Elaborate vowel marks add decorative flourishes
4. **Ligatures** — Letters connect in complex, overlapping patterns

## Anatomy of Thuluth Letters
- **Ascenders**: Rise well above the baseline (e.g., ك, ل, ط)
- **Descenders**: Drop below the baseline with wide loops (e.g., ر, و, ن)
- **Bowls**: Rounded enclosed spaces within letters are generous and open

## Modern Applications
Today, Thuluth is used in:
- Logo design for institutions in the Arab world
- Contemporary art installations
- Book cover design and typography
- Architectural ornamentation in modern mosques

## Practice Exercise
Try writing the Basmala (بسم الله الرحمن الرحيم) in Thuluth style, focusing on:
- Maintaining consistent letter height
- Creating smooth, uninterrupted curves
- Balancing dense and open areas within the composition""",
        is_published=True,
    )
    print("  ✓ Lesson: The Art of Thuluth Script")

if not Lesson.objects.filter(module=mod1_1, title__icontains='Geometry').exists():
    Lesson.objects.create(
        module=mod1_1,
        title="Geometry in Islamic Calligraphy",
        content="""# Geometry in Islamic Calligraphy

## The Mathematical Foundation
Islamic calligraphy is deeply rooted in geometric principles. Calligraphers use a system of dots and circles to maintain precise proportions across all letters.

## The Dot System (Nuqta)
The **rhombic dot** — created by pressing the pen nib at a 45° angle — is the fundamental unit of measurement:
- The width of the Alif (ا) = 1 dot
- The height of the Alif = varies by script (3–12 dots)
- Spacing between words = 1 Alif width

## The Circle Method
A circle drawn with the Alif height as its diameter defines:
- Maximum letter height (ascenders touch the top)
- Maximum letter depth (descenders touch the bottom)
- Proportional width of rounded letters (ص, ض, ط, ظ)

## Golden Ratio in Calligraphy
The golden ratio (φ ≈ 1.618) appears naturally in:
- The proportion between ascending and descending strokes
- The spacing of words in a harmonious composition
- The relationship between text blocks in manuscript layout

## Practical Application
When composing a calligraphic piece:
1. Decide on a script and its dot-to-Alif ratio
2. Draw guidelines based on multiples of the dot unit
3. Sketch the composition lightly in pencil
4. Execute the final piece with ink, maintaining geometric precision
5. Add diacritical marks and decorative elements last

## Key Takeaway
Understanding the geometry behind calligraphy transforms it from mere handwriting into a precise, mathematical art form where beauty emerges from structure.""",
        is_published=True,
    )
    print("  ✓ Lesson: Geometry in Islamic Calligraphy")

# ── Module 2: Islamic Architecture ────────────────────────────────────────────
mod1_2, _ = Module.objects.get_or_create(
    course=course1, title="Module 2: Islamic Architecture",
    defaults={"order": 2, "is_published": True}
)
print(f"  {'✓ Created' if _ else '→ Exists'} Module: {mod1_2.title}")

for title, content in [
    ("The Mosque: Form and Function", """# The Mosque: Form and Function

## Introduction
The mosque (masjid) is the central architectural expression of Islam. Its design has evolved over 14 centuries while maintaining core functional elements.

## Essential Components
1. **Prayer Hall (Musalla)** — The main covered space oriented toward Mecca
2. **Mihrab** — A niche in the qibla wall indicating the direction of prayer
3. **Minbar** — The pulpit from which the imam delivers the Friday sermon
4. **Minaret** — The tower from which the adhan (call to prayer) is made
5. **Courtyard (Sahn)** — An open space for overflow prayers and gathering
6. **Ablution Fountain (Wudu area)** — Where worshippers perform ritual purification

## Architectural Evolution
- **Early period (7th–8th c.)**: Hypostyle plan — rows of columns supporting a flat roof (e.g., Great Mosque of Córdoba)
- **Classical period (9th–13th c.)**: Four-iwan plan — four vaulted halls opening onto a central courtyard (e.g., Isfahan Friday Mosque)
- **Ottoman period (15th–17th c.)**: Central dome plan — a single massive dome inspired by the Hagia Sophia (e.g., Süleymaniye Mosque)
- **Modern period (20th c.–present)**: Experimental forms incorporating steel, glass, and concrete

## The Qibla Orientation
Every mosque is oriented toward the Kaaba in Mecca. This orientation (qibla) determined:
- The placement of the mihrab
- The alignment of prayer rows
- The entire urban layout of historic Islamic cities

## Case Study: The Great Mosque of Córdoba
Built in 784 CE, its forest of 856 columns with double-tiered horseshoe arches remains one of the most iconic spaces in world architecture. The alternating red and white voussoirs create a visual rhythm that echoes the repetitive patterns of Islamic art."""),

    ("Muqarnas: Honeycomb Vaulting", """# Muqarnas: Honeycomb Vaulting

## What Are Muqarnas?
Muqarnas are a form of ornamental vaulting composed of small, niche-like cells arranged in tiers. They create a honeycomb or stalactite effect, typically found in:
- Dome interiors
- Squinches (corners transitioning from square to dome)
- Entrance portals and window hoods
- Cornices and capitals

## Mathematical Structure
Despite their organic appearance, muqarnas are based on strict geometric rules:
- Each cell is derived from a **basic plan unit** (square, rhombus, or irregular polygon)
- Cells are stacked in **concentric tiers** that project incrementally
- The overall composition follows **radial symmetry** (4-fold, 6-fold, or 8-fold)

## Historical Development
1. **Origin (10th c.)**: First appeared in northeastern Iran and North Africa independently
2. **Spread (11th–12th c.)**: Adopted across the Islamic world from Andalusia to Central Asia
3. **Peak complexity (14th–15th c.)**: The Alhambra in Granada contains muqarnas with over 5,000 individual cells
4. **Modern revival**: Computer-aided design allows architects to create parametric muqarnas

## Cultural Significance
Muqarnas embody core Islamic aesthetic principles:
- **Infinity**: The fractal-like nesting suggests the infinite nature of creation
- **Light play**: Cells catch and scatter light, creating a shimmering, immaterial effect
- **Unity in multiplicity**: Thousands of individual cells form one coherent whole

## Study Exercise
Examine photos of the Hall of the Two Sisters in the Alhambra. Count how many tiers of muqarnas are visible and identify the base geometric shapes used in each tier."""),

    ("Geometric Patterns in Islamic Tile Work", """# Geometric Patterns in Islamic Tile Work

## The Language of Pattern
Islamic geometric patterns are among the most sophisticated decorative systems ever developed. They transform simple shapes — circles, squares, triangles — into infinitely repeating designs of breathtaking complexity.

## The Construction Process
1. **Start with a grid** — A regular grid of squares, triangles, or hexagons
2. **Draw circles** at grid intersections
3. **Connect intersection points** to form a star or rosette
4. **Extend lines** to create an interlocking network
5. **Erase construction lines**, keeping only the final pattern
6. **Color or tile** the resulting regions

## Common Pattern Types
- **6-fold patterns**: Based on equilateral triangles and hexagons. Common in Moroccan zellige.
- **8-fold patterns**: Based on squares rotated 45°. Creates the classic octagonal star. Prevalent in Mamluk and Ottoman art.
- **10-fold patterns**: Based on pentagons. Creates quasicrystalline patterns. Found in the Darb-i Imam shrine in Isfahan (1453), predating Western discovery of quasicrystals by 500 years.

## Zellige: The Moroccan Tradition
Zellige (from Arabic زليج, "polished stone") is a mosaic tilework made from individually hand-chiseled geometric tiles:
- Tiles are cut from larger glazed squares using a specialized hammer
- Colors are traditionally limited to white, black, green, yellow, and blue
- Patterns are assembled face-down on a flat surface, then set in plaster
- A single fountain panel may contain over 10,000 individual pieces

## Philosophical Dimensions
- **Tawhid (Unity)**: The single underlying grid represents divine unity
- **Tessellation**: The infinite repeatability mirrors the eternal nature of God
- **Aniconism**: Abstract geometry avoids figurative representation, adhering to Islamic artistic tradition

## Activity
Using compass and straightedge, construct a basic 8-fold rosette pattern starting from a square grid. Identify which polygons emerge (squares, kite shapes, 8-pointed stars)."""),
]:
    if not Lesson.objects.filter(module=mod1_2, title=title).exists():
        Lesson.objects.create(module=mod1_2, title=title, content=content, is_published=True)
        print(f"  ✓ Lesson: {title}")

# ── Module 3: Islamic Art in the Modern World ─────────────────────────────────
mod1_3, _ = Module.objects.get_or_create(
    course=course1, title="Module 3: Islamic Art in the Modern World",
    defaults={"order": 3, "is_published": True}
)
print(f"  {'✓ Created' if _ else '→ Exists'} Module: {mod1_3.title}")

for title, content in [
    ("Contemporary Islamic Artists", """# Contemporary Islamic Artists

## Bridging Tradition and Modernity
Contemporary Islamic art draws on 14 centuries of tradition while engaging with global contemporary art movements. Artists navigate questions of identity, faith, and cultural heritage in a modern context.

## Key Artists

### eL Seed (born 1981, Tunisia/France)
- Known for **calligraffiti** — monumental Arabic calligraphy as street art
- Notable work: "Perception" (2016) — a mural spanning 50 buildings in Cairo's Zaraeeb district
- Approach: Uses classical Arabic poetry and Quranic verses in urban contexts

### Monir Shahroudy Farmanfarmaian (1924–2019, Iran)
- Pioneer of **geometric mirror mosaics** inspired by traditional Iranian architecture
- Combined Muqarnas geometry with Western minimalism
- Works held at the Guggenheim, MoMA, and Tehran Museum of Contemporary Art

### Ahmed Mater (born 1979, Saudi Arabia)
- Explores the intersection of Islamic culture and rapid modernization
- "Magnetism" series: Iron filings arranged around a magnet to form the shape of the Kaaba during Hajj
- Documents the transformation of Mecca through photography and mixed media

### Shirin Neshat (born 1957, Iran)
- Photography and video art exploring gender, identity, and exile in Islamic societies
- "Women of Allah" series: Portraits overlaid with Persian calligraphy
- Won the Golden Lion at the Venice Film Festival (2009)

## Themes in Contemporary Islamic Art
1. **Identity and diaspora** — Navigating dual cultural identities
2. **Sacred and secular** — Reinterpreting religious symbols in contemporary contexts
3. **Urbanization** — Documenting the transformation of Islamic cities
4. **Gender** — Challenging and exploring gender roles within Islamic frameworks
5. **Calligraphy as liberation** — Freeing the written word from the page into space

## Discussion Question
How do contemporary Islamic artists balance respect for tradition with the desire for artistic innovation? Choose one artist and analyze how their work bridges these two worlds."""),

    ("Islamic Art in Museum Collections", """# Islamic Art in Museum Collections

## The Global Reach of Islamic Art
Islamic art spans three continents and 14 centuries. Major museum collections allow us to study objects ranging from 7th-century Quran manuscripts to 19th-century Ottoman textiles.

## Major Collections Worldwide

### The Metropolitan Museum of Art (New York)
- Over 12,000 objects in the Islamic Art galleries
- Highlights: The Damascus Room (1707), Simonetti Carpet, rock crystal ewer from Fatimid Egypt
- Reopened in 2011 with redesigned galleries covering art from Spain to Southeast Asia

### The Museum of Islamic Art (Doha, Qatar)
- Designed by I.M. Pei, opened in 2008
- Covers 1,400 years of Islamic art across three continents
- Highlights: 9th-century Iraqi tiles, Mughal jewelry, Ottoman manuscripts

### The Louvre (Paris)
- Dedicated Islamic Art department opened in 2012
- Housed beneath an undulating glass-and-metal roof by Mario Bellini
- 3,000 objects on display from 18,000 in the collection

### The Aga Khan Museum (Toronto)
- Focused on Islamic artistic heritage and cross-cultural connections
- Combines permanent collection with contemporary art exhibitions

## Curatorial Challenges
1. **Terminology**: "Islamic art" encompasses secular and sacred, Arab and non-Arab
2. **Periodization**: How to organize art spanning the Umayyads to modern nation-states
3. **Decontextualization**: Objects removed from their original architectural settings
4. **Repatriation**: Ongoing debates about cultural property and colonial collecting

## The Digital Turn
Museums are increasingly using:
- **3D scanning** to create virtual models of architectural fragments
- **Interactive displays** that reconstruct original contexts (e.g., a tile panel in its original mosque wall)
- **Online databases** making collections accessible globally

## Research Exercise
Visit the Metropolitan Museum's online collection (metmuseum.org) and find three objects from different centuries and regions. For each, note the material, technique, and original function. What common aesthetic principles connect them?"""),

    ("The Future of Islamic Art and Design", """# The Future of Islamic Art and Design

## From Heritage to Innovation
Islamic art and design are experiencing a renaissance driven by technology, globalization, and a new generation of designers who see tradition as a springboard, not a constraint.

## Computational Islamic Geometry
Modern tools enable exploration that was impossible by hand:
- **Parametric design software** (Grasshopper, Processing) generates infinite geometric variations from a single rule set
- **3D printing** allows physical realization of complex muqarnas and geometric screens
- **Generative algorithms** create patterns that follow traditional rules but produce novel results

## Architecture: The New Wave
Contemporary architects are reimagining Islamic architectural elements:
- **Mashrabiya reimagined**: Jean Nouvel's Louvre Abu Dhabi (2017) uses a layered dome of geometric stars to filter sunlight — a 21st-century mashrabiya
- **Minaret as skyscraper**: The Abraj Al-Bait towers in Mecca integrate traditional minaret forms at an unprecedented scale
- **Sustainable design**: Traditional Islamic architecture's natural cooling strategies (wind towers, courtyards, thick walls) are being studied for modern sustainable buildings

## Typography and Branding
Arabic typography is evolving:
- New digital Arabic typefaces balance readability with calligraphic beauty
- Bilingual (Arabic-Latin) type design is a growing field
- Brands across the Middle East are commissioning custom Arabic typefaces that reflect both heritage and modernity

## Islamic Fashion and Textile Design
- Modest fashion has become a global industry worth over $300 billion
- Designers like Hana Tajima (for Uniqlo) blend Islamic modesty with contemporary aesthetics
- Traditional textile techniques (ikat, suzani embroidery) inspire luxury fashion collections

## The Challenge Ahead
The central question: How does Islamic art maintain its spiritual and philosophical depth while adapting to digital media, mass production, and global audiences?

## Final Reflection
Write a short essay (300 words) proposing how one traditional Islamic art form (calligraphy, geometry, architecture, or textiles) could be reimagined for a 21st-century context. Consider both the opportunities and the risks of such a transformation."""),
]:
    if not Lesson.objects.filter(module=mod1_3, title=title).exists():
        Lesson.objects.create(module=mod1_3, title=title, content=content, is_published=True)
        print(f"  ✓ Lesson: {title}")


# ═══════════════════════════════════════════════════════════════════════════════
# COURSE 2 — World History: Ancient Civilizations  (id=2)
# Already has: Module 1 (The Ancient Mediterranean) → Lesson (Roman Republic)
# ═══════════════════════════════════════════════════════════════════════════════

course2, _ = Course.objects.get_or_create(
    course_name='World History: Ancient Civilizations',
    defaults={
        'subject': 'History',
        'teacher': teacher,
        'published': True,
        'is_published': True
    }
)

# ── Module 1: fill remaining lessons ──────────────────────────────────────────
mod2_1, _ = Module.objects.get_or_create(
    title='Module 1: The Ancient Mediterranean',
    course=course2,
    defaults={
        'order': 1,
        'is_published': True
    }
)

if not Lesson.objects.filter(module=mod2_1, title__icontains='Greek').exists():
    Lesson.objects.create(
        module=mod2_1,
        title="Ancient Greece: Democracy and Philosophy",
        content="""# Ancient Greece: Democracy and Philosophy

## The Birthplace of Western Thought
Ancient Greece (c. 800–146 BCE) produced revolutionary ideas in governance, philosophy, science, and art that continue to shape the modern world.

## The Polis: City-State System
Greece was not a unified nation but a collection of independent city-states (poleis):
- **Athens**: Democracy, philosophy, drama, and the arts
- **Sparta**: Military discipline, oligarchy, and communal living
- **Corinth**: Trade, wealth, and architectural innovation
- **Thebes**: Military power and the Sacred Band

## Athenian Democracy
Athens developed the world's first known democracy (demokratia = "rule by the people"):
- **Ecclesia**: Assembly of all male citizens (age 18+) — voted on laws and policy
- **Boule**: Council of 500 chosen by lottery — set the agenda for the Ecclesia
- **Dikasteria**: People's courts with juries of 200–6,000 citizens
- **Ostracism**: Citizens could vote to exile anyone deemed a threat to democracy for 10 years

### Limitations
- Women, slaves, and non-citizens (metics) were excluded — roughly 80% of the population
- Direct democracy was possible only because of the small citizen body (~30,000 adult males)

## The Greek Philosophers

### Socrates (470–399 BCE)
- Developed the **Socratic Method**: Rigorous questioning to expose contradictions in one's beliefs
- Left no writings — known through Plato's dialogues
- Convicted of "corrupting the youth" and "impiety"; chose death by hemlock over exile

### Plato (428–348 BCE)
- Student of Socrates; founded the **Academy** in Athens
- **Theory of Forms**: True reality consists of abstract, perfect Forms; the physical world is a shadow
- *The Republic*: Envisioned an ideal state ruled by philosopher-kings

### Aristotle (384–322 BCE)
- Student of Plato; tutor of Alexander the Great
- Rejected the Theory of Forms in favor of empirical observation
- Wrote on logic, physics, biology, ethics, politics, and poetics
- Founded the **Lyceum**; his works dominated Western thought for nearly 2,000 years

## The Persian Wars (499–449 BCE)
- **Battle of Marathon (490 BCE)**: 10,000 Athenians defeated a much larger Persian force
- **Battle of Thermopylae (480 BCE)**: 300 Spartans held the pass against Xerxes' army
- **Battle of Salamis (480 BCE)**: Greek naval victory turned the tide of the war
- Result: Greek independence preserved; Athens entered its Golden Age

## Legacy
Greek concepts of democracy, rational inquiry, and individual rights form the foundation of Western civilization. The tension between Athenian democracy and Spartan authoritarianism remains relevant in political discourse today.

## Discussion Question
Socrates argued that "the unexamined life is not worth living." How does this idea connect to the democratic principle that citizens should actively participate in governance?""",
        is_published=True,
    )
    print("  ✓ Lesson: Ancient Greece: Democracy and Philosophy")

if not Lesson.objects.filter(module=mod2_1, title__icontains='Phoenician').exists():
    Lesson.objects.create(
        module=mod2_1,
        title="The Phoenicians: Masters of the Sea",
        content="""# The Phoenicians: Masters of the Sea

## Who Were the Phoenicians?
The Phoenicians (c. 1500–300 BCE) inhabited the coastal strip of modern-day Lebanon, Syria, and northern Israel. They were among the ancient world's greatest traders, sailors, and cultural innovators.

## Major City-States
- **Tyre**: The wealthiest and most powerful Phoenician city, famous for Tyrian purple dye
- **Sidon**: Renowned for glassmaking and metalwork
- **Byblos**: One of the oldest continuously inhabited cities; the Greek word *biblos* (book) derives from it
- **Carthage**: Founded by Tyre (814 BCE), became a Mediterranean superpower rivaling Rome

## The Phoenician Alphabet
Perhaps their most enduring contribution: the Phoenician alphabet (c. 1050 BCE)
- **22 consonant letters** — no vowels (an abjad system)
- Adapted from earlier Proto-Sinaitic/Proto-Canaanite scripts
- Adopted and modified by the Greeks (who added vowels), then passed to the Romans
- **Every alphabet used in Europe, the Middle East, and South Asia today** traces back to the Phoenician system

## Maritime Innovation
- Built the fastest and most seaworthy ships in the ancient world
- Developed the **bireme** (two rows of oars) and possibly the trireme
- Navigated by the stars — the constellation Ursa Minor was called the "Phoenician Star"
- Established trade routes spanning the entire Mediterranean: from Lebanon to Spain, North Africa, and possibly Britain

## Trade and Economy
Phoenician exports included:
1. **Tyrian purple dye** — Extracted from murex sea snails; so expensive it became associated with royalty
2. **Cedar wood** — Prized for shipbuilding and temple construction (used in Solomon's Temple)
3. **Glass** — Pioneered glassblowing techniques
4. **Metalwork** — Bronze and silver objects traded throughout the Mediterranean

## The Carthaginian Legacy
Carthage, Phoenicia's greatest colony, built its own empire:
- Controlled western Mediterranean trade for centuries
- Hannibal Barca crossed the Alps with elephants to invade Italy (218 BCE)
- Destroyed by Rome in the Third Punic War (146 BCE); city razed and salted

## Key Takeaway
The Phoenicians remind us that cultural influence doesn't require military conquest. Through trade, navigation, and the alphabet, they shaped civilizations far beyond their small coastal homeland.

## Research Activity
Compare the Phoenician alphabet with the modern Arabic and Latin alphabets. Can you identify letter shapes that evolved from common Phoenician ancestors?""",
        is_published=True,
    )
    print("  ✓ Lesson: The Phoenicians: Masters of the Sea")

# ── Module 2: Ancient River Valley Civilizations ──────────────────────────────
mod2_2, _ = Module.objects.get_or_create(
    course=course2, title="Module 2: Ancient River Valley Civilizations",
    defaults={"order": 2, "is_published": True}
)
print(f"  {'✓ Created' if _ else '→ Exists'} Module: {mod2_2.title}")

for title, content in [
    ("Ancient Egypt: The Gift of the Nile", """# Ancient Egypt: The Gift of the Nile

## Geography and the Nile
Herodotus called Egypt "the gift of the Nile" — without the river's annual flood depositing fertile silt, civilization could not have flourished in the Sahara.

## Timeline of Ancient Egypt
- **Early Dynastic Period (c. 3100–2686 BCE)**: Unification of Upper and Lower Egypt under Narmer
- **Old Kingdom (c. 2686–2181 BCE)**: Age of the pyramids — Djoser's Step Pyramid, Giza complex
- **Middle Kingdom (c. 2055–1650 BCE)**: Cultural golden age; expansion into Nubia
- **New Kingdom (c. 1550–1069 BCE)**: Egypt's imperial height — Hatshepsut, Akhenaten, Tutankhamun, Ramesses II
- **Late Period and Ptolemaic Era**: Persian and Greek rule, ending with Cleopatra VII (30 BCE)

## The Pharaoh and Ma'at
The pharaoh was both king and god — the living embodiment of Horus and son of Ra:
- Responsible for maintaining **Ma'at** (cosmic order, truth, and justice)
- Owned all land, commanded the army, and served as chief priest
- Built monumental architecture to demonstrate divine power and ensure eternal life

## The Pyramids
- **Great Pyramid of Giza** (c. 2560 BCE): Built for Pharaoh Khufu; 2.3 million stone blocks, each averaging 2.5 tons
- Originally stood 146.5 meters tall — the tallest human-made structure for 3,800 years
- Aligned to the cardinal directions with remarkable precision (error < 0.05°)

## Hieroglyphics and Writing
- Egyptian writing system with ~700 symbols combining logographic and alphabetic elements
- Used for religious texts, royal decrees, and monumental inscriptions
- Deciphered in 1822 by Jean-François Champollion using the Rosetta Stone

## Religion and the Afterlife
- Polytheistic: Ra (sun), Osiris (afterlife), Isis (magic), Anubis (embalming)
- **Mummification**: Elaborate 70-day process to preserve the body for the afterlife
- **Book of the Dead**: Collection of spells to guide the deceased through the underworld
- **Weighing of the Heart**: The heart was weighed against Ma'at's feather; failure meant destruction

## Legacy
Egyptian contributions to mathematics (base-10 system, geometry for land surveying), medicine (surgical papyri), and architecture influenced Greek, Roman, and modern civilizations.

## Study Question
How did the geography of the Nile Valley shape Egyptian political organization, religion, and daily life? Consider what would have been different if Egypt had reliable rainfall instead of depending on annual floods."""),

    ("Mesopotamia: The Cradle of Civilization", """# Mesopotamia: The Cradle of Civilization

## The Land Between Two Rivers
Mesopotamia (Greek: "between rivers") occupied the fertile plain between the Tigris and Euphrates rivers in modern-day Iraq. It witnessed many of humanity's earliest innovations.

## Major Civilizations

### Sumerians (c. 4500–1900 BCE)
- Built the world's first cities: Ur, Uruk, Eridu, Lagash
- Invented **cuneiform** — the earliest known writing system (c. 3400 BCE)
- Developed the sexagesimal (base-60) number system — why we have 60 seconds/minutes and 360°
- Created the first legal codes, schools, and literary works

### Akkadians (c. 2334–2154 BCE)
- Sargon of Akkad created the world's first empire
- Unified Sumer under a single ruler using a standing professional army
- Akkadian language became the lingua franca of the ancient Near East

### Babylonians (c. 1894–539 BCE)
- **Hammurabi's Code** (c. 1754 BCE): 282 laws covering property, family, labor, and commerce — "an eye for an eye"
- Advanced mathematics: Solved quadratic equations, understood the Pythagorean theorem 1,000 years before Pythagoras
- **Hanging Gardens of Babylon**: One of the Seven Wonders of the Ancient World (existence debated)

### Assyrians (c. 2500–609 BCE)
- Built the most feared military machine of the ancient world
- Developed iron weapons, siege warfare, and psychological terror tactics
- **Library of Ashurbanipal** at Nineveh: 30,000+ clay tablets — the first systematically organized library

## Key Innovations
1. **Writing** (cuneiform on clay tablets)
2. **The wheel** (c. 3500 BCE, initially for pottery)
3. **Irrigation canals** (transformed arid land into farmland)
4. **The plow** (increased agricultural productivity)
5. **Astronomy** (identified constellations, predicted eclipses)
6. **The Epic of Gilgamesh** — the world's oldest surviving work of literature

## Religion
- Polytheistic: Anu (sky), Enlil (wind), Enki (water), Inanna/Ishtar (love and war)
- **Ziggurats**: Stepped pyramid temples — the dwelling place of the city's patron god
- Priests held enormous power and managed temple estates

## Decline
Mesopotamia was successively conquered by Persians (539 BCE), Greeks (331 BCE), and eventually absorbed into the Islamic caliphate (7th century CE).

## Comparative Exercise
Compare the Code of Hammurabi with modern legal principles. Which laws seem just by today's standards? Which seem harsh? What does this tell us about Babylonian society?"""),

    ("The Indus Valley Civilization", """# The Indus Valley Civilization

## A Forgotten Civilization
The Indus Valley Civilization (c. 3300–1300 BCE), also called the Harappan Civilization, was one of the world's three earliest urban civilizations, alongside Egypt and Mesopotamia. Yet it was unknown to modern scholars until the 1920s.

## Geography
- Centered on the Indus River basin in modern Pakistan and northwest India
- Covered an area larger than ancient Egypt and Mesopotamia combined (~1.3 million km²)
- Over 1,400 sites identified, from coastal Gujarat to the Afghan border

## Major Cities

### Mohenjo-daro ("Mound of the Dead")
- Population: estimated 30,000–40,000
- Remarkable urban planning: Grid-pattern streets, standardized brick sizes
- The **Great Bath**: A large waterproof pool — possibly for ritual purification
- Advanced drainage system with covered sewers running beneath the streets

### Harappa
- One of the first sites excavated (1921)
- Large granaries suggesting centralized food storage
- Evidence of craft specialization: bead-making, pottery, metalwork

## Distinctive Features
1. **Urban planning**: Cities built on a standardized grid — an achievement not seen again until the Romans
2. **Sanitation**: Nearly every house had a private toilet and bath connected to a citywide drainage system
3. **Standardized weights and measures**: Cube-shaped stone weights in precise ratios — evidence of regulated trade
4. **No evidence of a palace or temple**: Unlike Egypt and Mesopotamia, there are no monumental buildings dedicated to a ruler or deity
5. **No evidence of warfare**: No defensive walls, no weapons caches, no depictions of battles

## The Undeciphered Script
- Over 4,000 inscribed objects found (seals, tablets, pottery)
- The script contains ~400 symbols — likely a mix of logographic and syllabic elements
- **Still undeciphered** — one of the great unsolved puzzles of archaeology
- Without reading their texts, we cannot know their language, religion, or political organization

## Trade Networks
- Traded with Mesopotamia (Indus seals found at Ur)
- Exported: carnelian beads, cotton textiles, timber, ivory
- Imported: tin, copper, gold, silver

## Decline (c. 1900–1300 BCE)
Multiple theories:
- **Climate change**: Shifts in monsoon patterns dried up the Ghaggar-Hakra River
- **Tectonic activity**: Earthquakes may have diverted rivers
- **Gradual abandonment**: Cities were slowly depopulated, not violently destroyed
- The population likely migrated eastward into the Ganges plain

## Reflection
The Indus Valley Civilization challenges our assumptions about ancient societies. How do we explain a complex, urban civilization with no apparent monarchy, military, or monumental religious architecture? What does their emphasis on sanitation and standardization tell us about their values?"""),
]:
    if not Lesson.objects.filter(module=mod2_2, title=title).exists():
        Lesson.objects.create(module=mod2_2, title=title, content=content, is_published=True)
        print(f"  ✓ Lesson: {title}")

# ── Module 3: Ancient East Asia ───────────────────────────────────────────────
mod2_3, _ = Module.objects.get_or_create(
    course=course2, title="Module 3: Ancient East Asia",
    defaults={"order": 3, "is_published": True}
)
print(f"  {'✓ Created' if _ else '→ Exists'} Module: {mod2_3.title}")

for title, content in [
    ("Ancient China: Dynasties and Philosophy", """# Ancient China: Dynasties and Philosophy

## Overview
Chinese civilization is one of the oldest continuous civilizations in the world, with a written history stretching back over 3,500 years.

## Key Dynasties

### Shang Dynasty (c. 1600–1046 BCE)
- First historically verified Chinese dynasty
- Developed **oracle bone script** — earliest Chinese writing (used for divination)
- Advanced bronze casting technology — ritual vessels of extraordinary complexity
- Hierarchical society: king, nobles, artisans, peasants, slaves

### Zhou Dynasty (c. 1046–256 BCE)
- Longest-lasting dynasty in Chinese history
- Introduced the **Mandate of Heaven**: A ruler's authority comes from divine approval, which can be withdrawn if the ruler is unjust
- **Feudal system**: Land granted to lords in exchange for loyalty and military service
- Later Zhou period saw the rise of China's greatest philosophers

### Qin Dynasty (221–206 BCE)
- **Qin Shi Huang** unified China and became the first Emperor
- Standardized weights, measures, currency, and writing across the empire
- Built the first version of the **Great Wall** and a national road network
- The **Terracotta Army**: 8,000 life-size clay soldiers buried to protect the emperor in the afterlife
- Ruthlessly authoritarian: burned books and buried scholars alive

### Han Dynasty (206 BCE–220 CE)
- Golden age of Chinese civilization
- Opened the **Silk Road** connecting China to Rome
- Invented **paper** (c. 105 CE), the compass, and the seismograph
- Confucianism became the state ideology and the basis for the civil service exam

## Chinese Philosophy

### Confucius (551–479 BCE)
- **Core idea**: Social harmony through proper relationships and moral cultivation
- Five relationships: ruler-subject, parent-child, husband-wife, elder-younger, friend-friend
- Emphasized **ren** (benevolence), **li** (ritual propriety), and **xiao** (filial piety)
- The *Analects* record his teachings

### Laozi and Daoism
- **Core idea**: Live in harmony with the **Dao** (the Way) — the natural order of the universe
- *Dao De Jing*: "The Dao that can be spoken is not the true Dao"
- Values: Simplicity, spontaneity, non-action (wu wei), humility
- Complementary to Confucianism: Confucius organized society; Daoism freed the individual

### Legalism (Han Fei, Li Si)
- **Core idea**: Humans are inherently selfish; only strict laws and harsh punishments maintain order
- The philosophy that built the Qin Empire — and was blamed for its rapid collapse
- Influence persists: Chinese political thought retains a strong legalist strand

## Discussion
Compare the Mandate of Heaven with the European concept of the "divine right of kings." How do they differ in their implications for revolution and political change?"""),

    ("Japan: From Jomon to the First Emperors", """# Japan: From Jomon to the First Emperors

## The Japanese Archipelago
Japan's geography — four main islands in a volcanic arc — profoundly shaped its civilization: isolation bred cultural uniqueness, while proximity to the continent allowed selective adoption of Chinese and Korean innovations.

## Jomon Period (c. 14,000–300 BCE)
- One of the world's earliest pottery traditions (possibly the earliest)
- **Jomon** means "cord-marked" — pottery decorated by pressing twisted cords into wet clay
- Hunter-gatherer-fishers who built semi-permanent settlements
- Created distinctive clay figurines (dogū) — possibly used in fertility rituals or healing
- Remarkably long-lived culture: ~13,000 years, making it one of the most stable societies in human history

## Yayoi Period (c. 300 BCE–300 CE)
- **Wet-rice agriculture** introduced from the Korean Peninsula transformed Japanese society
- Iron and bronze tools replaced stone
- Social stratification emerged: chiefs, warriors, farmers
- Population grew rapidly as agriculture supported denser settlements
- Chinese texts (*Wei Zhi*, 3rd century CE) describe Japan ("Wa") as a land of ~100 small kingdoms

### Queen Himiko
- Described in Chinese records as the shamaness-queen of **Yamatai**
- Ruled through spiritual authority rather than military power
- Sent ambassadors to the Chinese Wei court (239 CE)
- Her exact location remains one of Japanese archaeology's greatest debates (Kyushu vs. Kinai)

## Kofun Period (c. 300–538 CE)
- Named after **kofun** — massive keyhole-shaped burial mounds
- The largest, **Daisen Kofun** (attributed to Emperor Nintoku), is 486 meters long — larger in footprint than the Great Pyramid of Giza
- Emergence of the **Yamato clan**, which claimed descent from the sun goddess Amaterasu
- The Yamato leaders became the ancestors of the Japanese Imperial family — the world's oldest hereditary monarchy

## The Arrival of Writing and Buddhism
- Chinese writing system adopted (5th–6th century CE)
- **Buddhism** arrived from Korea (538 or 552 CE)
- Prince Shōtoku (574–622 CE) promoted Buddhism and Chinese-style governance
- Issued the **Seventeen-Article Constitution** — a moral guide for officials blending Confucian, Buddhist, and Shinto principles

## Key Themes
1. **Selective borrowing**: Japan adopted Chinese writing, Buddhism, and governance structures but adapted them to local contexts
2. **Continuity**: The Imperial line has remained unbroken (at least symbolically) for over 1,500 years
3. **Nature and spirituality**: Shinto reverence for nature (kami) permeates Japanese culture from ancient times to the present

## Research Task
Compare the Jomon-to-Yayoi transition in Japan with the transition from hunter-gatherer to agricultural societies in Mesopotamia. What similarities and differences do you observe?"""),

    ("The Silk Road: Connecting East and West", """# The Silk Road: Connecting East and West

## What Was the Silk Road?
The Silk Road was not a single road but a vast network of overland and maritime trade routes connecting China to the Mediterranean world. It flourished from the 2nd century BCE to the 15th century CE.

## Origins
- **Zhang Qian** (c. 164–113 BCE): A Han dynasty envoy sent west by Emperor Wu to seek allies against the Xiongnu (nomadic raiders)
- His 13-year journey opened diplomatic and commercial relations with Central Asian kingdoms
- The Han court realized the West had a huge appetite for Chinese silk — trade exploded

## The Routes
### Overland Routes
1. **Northern Route**: Chang'an → Dunhuang → Taklamakan Desert (north edge) → Kashgar → Samarkand → Persia → Mediterranean
2. **Southern Route**: Chang'an → Dunhuang → Taklamakan Desert (south edge) → Khotan → Bactria → Persia
3. **Steppe Route**: North of the Tian Shan mountains through Kazakh grasslands

### Maritime Route
- From Chinese ports (Guangzhou, Quanzhou) through the South China Sea, Strait of Malacca, Indian Ocean, Persian Gulf/Red Sea
- Became increasingly important after the 7th century as overland routes faced political instability

## What Was Traded?
| Direction | Goods |
|-----------|-------|
| East → West | Silk, porcelain, tea, paper, gunpowder, lacquerware, spices |
| West → East | Gold, silver, glass, wool, horses, grapevines, precious stones |

## More Than Trade: The Exchange of Ideas
The Silk Road's most significant cargo was invisible — ideas:
- **Buddhism**: Spread from India to Central Asia, China, Korea, and Japan
- **Islam**: Spread along trade routes to Central Asia, western China, and Southeast Asia
- **Technology**: Papermaking (China → Arab world → Europe), gunpowder, printing
- **Art**: Gandharan Buddhist art blended Greek and Indian styles; Tang dynasty pottery shows Persian and Central Asian influences
- **Science**: Indian numerals and the concept of zero traveled west, transforming mathematics

## Key Cities Along the Route
- **Samarkand** (Uzbekistan): Crossroads of civilizations; center of paper production after Chinese craftsmen were captured (751 CE)
- **Dunhuang** (China): Oasis city; the Mogao Caves contain 1,000 years of Buddhist art in 492 painted caves
- **Bukhara** (Uzbekistan): Center of Islamic scholarship; home of the great physician Ibn Sina (Avicenna)
- **Constantinople/Istanbul**: Western terminus; gateway between Europe and Asia

## The Silk Road's End
- The fall of the Mongol Empire (14th century) fragmented the overland routes
- The Ottoman Empire's control of eastern Mediterranean trade raised costs
- European maritime exploration (15th century) created sea routes that bypassed the Silk Road entirely

## Discussion
The Silk Road shows that cultural exchange is rarely one-directional. Choose one technology or idea that traveled along the Silk Road and trace how it was transformed by each civilization that adopted it."""),
]:
    if not Lesson.objects.filter(module=mod2_3, title=title).exists():
        Lesson.objects.create(module=mod2_3, title=title, content=content, is_published=True)
        print(f"  ✓ Lesson: {title}")


# ═══════════════════════════════════════════════════════════════════════════════
# COURSE 3 — Introduction to Computer Science  (NEW)
# ═══════════════════════════════════════════════════════════════════════════════

course3, created = Course.objects.get_or_create(
    course_name="Introduction to Computer Science",
    defaults={
        "subject": "Computer Science",
        "description": "A foundational course covering programming fundamentals, data structures, algorithms, and core CS concepts.",
        "teacher": teacher,
        "published": True,
        "is_published": True,
    }
)
print(f"\n{'✓ Created' if created else '→ Exists'} Course: {course3.course_name}")

# ── Module 1: Programming Fundamentals ────────────────────────────────────────
mod3_1, _ = Module.objects.get_or_create(
    course=course3, title="Module 1: Programming Fundamentals",
    defaults={"order": 1, "is_published": True}
)
print(f"  {'✓ Created' if _ else '→ Exists'} Module: {mod3_1.title}")

for title, content in [
    ("What is Programming?", """# What is Programming?

## Definition
Programming is the process of creating a set of instructions that tell a computer how to perform a task. These instructions are written in a **programming language** — a formal language with precise syntax and semantics.

## Why Learn to Program?
1. **Problem-solving**: Programming teaches you to break complex problems into manageable steps
2. **Automation**: Computers can execute repetitive tasks millions of times faster than humans
3. **Career opportunities**: Software engineering, data science, AI, cybersecurity, and more
4. **Creativity**: Programming is a creative act — you're building something from nothing

## How a Computer Executes Code
1. **Source code** — Human-readable instructions (e.g., Python, Java, C++)
2. **Compiler/Interpreter** — Translates source code into machine code
3. **Machine code** — Binary instructions (0s and 1s) the CPU can execute
4. **Output** — The result: a calculation, a webpage, a game, a robot movement

## Compiled vs. Interpreted Languages
| Feature | Compiled (C, C++, Rust) | Interpreted (Python, JavaScript) |
|---------|------------------------|----------------------------------|
| Translation | All at once before running | Line by line during execution |
| Speed | Faster execution | Slower execution |
| Error detection | Errors caught before running | Errors caught during running |
| Portability | Must recompile for each OS | Runs anywhere with interpreter |

## Your First Python Program
```python
# This is a comment — Python ignores it
print("Hello, World!")    # Output: Hello, World!

# Variables
name = "Scholaria"
year = 2025

# String formatting
print(f"Welcome to {name}! Est. {year}")
```

## Key Concepts
- **Syntax**: The rules for writing valid code (like grammar in a language)
- **Semantics**: The meaning of the code (what it actually does)
- **Bug**: An error in your code — named after a literal moth found in a Harvard computer (1947)
- **Debugging**: The process of finding and fixing bugs

## Exercise
Write a Python program that:
1. Stores your name in a variable
2. Stores your age in a variable
3. Prints: "My name is [name] and I am [age] years old."
4. Calculates and prints the year you were born"""),

    ("Variables, Data Types, and Operators", """# Variables, Data Types, and Operators

## Variables
A variable is a named container for storing data. Think of it as a labeled box.

```python
# Variable assignment
age = 21              # Integer
height = 1.75         # Float
name = "Maliki"       # String
is_student = True     # Boolean

# Variables can be reassigned
age = 22              # Now age is 22
```

### Naming Rules
- Must start with a letter or underscore: `my_var`, `_count`
- Can contain letters, numbers, underscores: `student_2`, `total_score`
- Case-sensitive: `Name` ≠ `name` ≠ `NAME`
- Cannot use reserved words: `if`, `for`, `while`, `class`, etc.

## Data Types

### Primitive Types
| Type | Example | Description |
|------|---------|-------------|
| `int` | `42`, `-7`, `0` | Whole numbers |
| `float` | `3.14`, `-0.5` | Decimal numbers |
| `str` | `"hello"`, `'world'` | Text (strings) |
| `bool` | `True`, `False` | Boolean (logical) values |

### Type Checking and Conversion
```python
x = 42
print(type(x))        # <class 'int'>

# Type conversion (casting)
y = float(x)           # 42.0
z = str(x)             # "42"
w = int("100")         # 100
```

## Operators

### Arithmetic Operators
```python
a, b = 17, 5

print(a + b)    # 22   Addition
print(a - b)    # 12   Subtraction
print(a * b)    # 85   Multiplication
print(a / b)    # 3.4  Division (always returns float)
print(a // b)   # 3    Floor division (integer result)
print(a % b)    # 2    Modulo (remainder)
print(a ** b)   # 1419857  Exponentiation
```

### Comparison Operators
```python
print(5 == 5)    # True   Equal to
print(5 != 3)    # True   Not equal to
print(5 > 3)     # True   Greater than
print(5 < 3)     # False  Less than
print(5 >= 5)    # True   Greater than or equal
print(5 <= 3)    # False  Less than or equal
```

### Logical Operators
```python
print(True and False)   # False
print(True or False)    # True
print(not True)         # False

# Practical example
age = 20
has_id = True
can_enter = age >= 18 and has_id  # True
```

## String Operations
```python
greeting = "Hello"
name = "World"

# Concatenation
message = greeting + ", " + name + "!"   # "Hello, World!"

# Repetition
line = "-" * 30   # "------------------------------"

# Length
print(len(message))   # 13

# Indexing and Slicing
print(message[0])      # 'H'
print(message[-1])     # '!'
print(message[0:5])    # 'Hello'
```

## Practice Problems
1. Calculate the area of a circle with radius 7 (area = π × r²). Use `3.14159` for π.
2. Given a temperature in Celsius, convert it to Fahrenheit: F = (C × 9/5) + 32
3. Write a program that swaps the values of two variables without using a third variable."""),

    ("Control Flow: Conditionals and Loops", """# Control Flow: Conditionals and Loops

## What is Control Flow?
By default, Python executes code line by line, top to bottom. **Control flow** statements let you change this order — skipping lines, repeating blocks, or choosing between alternatives.

## Conditionals (if/elif/else)

### Basic Structure
```python
temperature = 35

if temperature > 30:
    print("It's hot outside! 🌞")
elif temperature > 20:
    print("Nice weather! 😊")
elif temperature > 10:
    print("A bit chilly. 🧥")
else:
    print("It's cold! 🥶")
```

### Key Rules
- **Indentation matters**: Python uses 4 spaces to define code blocks (no curly braces)
- `elif` is short for "else if" — you can have as many as you need
- `else` is optional and catches everything not matched above
- Conditions are evaluated top-to-bottom; the first `True` wins

### Nested Conditionals
```python
age = 20
has_ticket = True

if age >= 18:
    if has_ticket:
        print("Welcome to the show!")
    else:
        print("You need a ticket.")
else:
    print("You must be 18 or older.")
```

## Loops

### The `for` Loop
Repeats a block of code for each item in a sequence:

```python
# Iterating over a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(f"I like {fruit}")

# Using range()
for i in range(5):          # 0, 1, 2, 3, 4
    print(f"Count: {i}")

for i in range(2, 10, 3):   # 2, 5, 8
    print(i)
```

### The `while` Loop
Repeats as long as a condition is `True`:

```python
count = 0
while count < 5:
    print(f"Count is {count}")
    count += 1   # Don't forget this or you get an infinite loop!

# User input loop
password = ""
while password != "secret123":
    password = input("Enter password: ")
print("Access granted!")
```

### Loop Control
```python
# break — exit the loop immediately
for num in range(100):
    if num == 5:
        break
    print(num)   # Prints 0, 1, 2, 3, 4

# continue — skip to the next iteration
for num in range(10):
    if num % 2 == 0:
        continue
    print(num)   # Prints 1, 3, 5, 7, 9
```

## Common Patterns

### Accumulator Pattern
```python
# Sum all numbers from 1 to 100
total = 0
for i in range(1, 101):
    total += i
print(f"Sum = {total}")   # 5050
```

### Search Pattern
```python
# Find the first even number in a list
numbers = [7, 3, 9, 4, 11, 2]
for num in numbers:
    if num % 2 == 0:
        print(f"Found even number: {num}")
        break
```

### Counting Pattern
```python
# Count vowels in a string
text = "Hello World"
vowel_count = 0
for char in text.lower():
    if char in "aeiou":
        vowel_count += 1
print(f"Vowels: {vowel_count}")   # 3
```

## Practice Exercises
1. Write a program that prints all numbers from 1 to 50 that are divisible by both 3 and 5.
2. Write a guessing game: the program picks a random number between 1-100, and the user guesses until correct, receiving "too high" or "too low" hints.
3. Write a program that prints the first 20 terms of the Fibonacci sequence (0, 1, 1, 2, 3, 5, 8, ...)."""),
]:
    if not Lesson.objects.filter(module=mod3_1, title=title).exists():
        Lesson.objects.create(module=mod3_1, title=title, content=content, is_published=True)
        print(f"  ✓ Lesson: {title}")

# ── Module 2: Data Structures ─────────────────────────────────────────────────
mod3_2, _ = Module.objects.get_or_create(
    course=course3, title="Module 2: Data Structures",
    defaults={"order": 2, "is_published": True}
)
print(f"  {'✓ Created' if _ else '→ Exists'} Module: {mod3_2.title}")

for title, content in [
    ("Lists and Tuples", """# Lists and Tuples

## Lists
A **list** is an ordered, mutable collection of items. Lists can hold any data type and can mix types.

```python
# Creating lists
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]
empty = []

# Accessing elements (0-indexed)
print(fruits[0])     # "apple"
print(fruits[-1])    # "cherry" (last element)
print(fruits[1:3])   # ["banana", "cherry"] (slicing)
```

### Common List Operations
```python
fruits = ["apple", "banana"]

# Adding elements
fruits.append("cherry")         # ["apple", "banana", "cherry"]
fruits.insert(1, "blueberry")   # ["apple", "blueberry", "banana", "cherry"]
fruits.extend(["date", "fig"])  # Adds multiple items

# Removing elements
fruits.remove("banana")         # Removes first occurrence
popped = fruits.pop()           # Removes and returns last item
del fruits[0]                   # Removes by index

# Other operations
fruits.sort()                   # Sorts in place
fruits.reverse()                # Reverses in place
print(len(fruits))              # Length
print("apple" in fruits)        # Membership test → True/False
```

### List Comprehensions
A concise way to create lists:
```python
# Traditional approach
squares = []
for x in range(10):
    squares.append(x ** 2)

# List comprehension (same result, one line)
squares = [x ** 2 for x in range(10)]

# With a condition
evens = [x for x in range(20) if x % 2 == 0]

# String processing
words = ["hello", "world", "python"]
upper_words = [w.upper() for w in words]
# ["HELLO", "WORLD", "PYTHON"]
```

## Tuples
A **tuple** is an ordered, **immutable** collection. Once created, it cannot be changed.

```python
# Creating tuples
coordinates = (10, 20)
rgb = (255, 128, 0)
single = (42,)      # Note the comma — without it, it's just an int in parentheses

# Accessing elements (same as lists)
print(coordinates[0])   # 10

# Tuple unpacking
x, y = coordinates      # x=10, y=20
name, age, city = ("Maliki", 21, "Casablanca")
```

### When to Use Tuples vs Lists
| Feature | List | Tuple |
|---------|------|-------|
| Mutable? | ✅ Yes | ❌ No |
| Use case | Collections that change | Fixed data (coordinates, RGB colors) |
| Performance | Slightly slower | Slightly faster |
| As dict key? | ❌ No | ✅ Yes |

## Practice
1. Write a function that takes a list of numbers and returns a new list with duplicates removed (preserving order).
2. Create a list of 10 random numbers, then use list comprehension to create a new list containing only the numbers greater than the average.
3. Given a list of tuples `[(name, score), ...]`, sort them by score in descending order."""),

    ("Dictionaries and Sets", """# Dictionaries and Sets

## Dictionaries
A **dictionary** stores data as **key-value pairs**. Keys must be unique and immutable; values can be anything.

```python
# Creating dictionaries
student = {
    "name": "Youssef",
    "age": 25,
    "courses": ["History", "Art"],
    "is_active": True
}

# Accessing values
print(student["name"])              # "Youssef"
print(student.get("email", "N/A")) # "N/A" (default if key missing)

# Adding/updating
student["email"] = "youssef@scholaria.com"
student["age"] = 26

# Removing
del student["is_active"]
email = student.pop("email")   # Removes and returns value
```

### Iterating Over Dictionaries
```python
student = {"name": "Youssef", "age": 25, "grade": "A"}

# Keys
for key in student:
    print(key)

# Values
for value in student.values():
    print(value)

# Key-value pairs
for key, value in student.items():
    print(f"{key}: {value}")
```

### Dictionary Comprehensions
```python
# Square numbers dictionary
squares = {x: x**2 for x in range(1, 6)}
# {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

# Word frequency counter
text = "the cat sat on the mat the cat"
word_count = {}
for word in text.split():
    word_count[word] = word_count.get(word, 0) + 1
# {"the": 3, "cat": 2, "sat": 1, "on": 1, "mat": 1}
```

### Nested Dictionaries
```python
school = {
    "course_1": {
        "name": "History",
        "students": 30,
        "teacher": "Prof. Kaddioui"
    },
    "course_2": {
        "name": "Computer Science",
        "students": 45,
        "teacher": "Prof. Smith"
    }
}

print(school["course_1"]["teacher"])   # "Prof. Kaddioui"
```

## Sets
A **set** is an unordered collection of **unique** elements. Duplicates are automatically removed.

```python
# Creating sets
colors = {"red", "green", "blue"}
numbers = set([1, 2, 2, 3, 3, 3])   # {1, 2, 3}

# Adding/removing
colors.add("yellow")
colors.discard("red")     # No error if missing
colors.remove("green")    # Raises error if missing
```

### Set Operations
```python
a = {1, 2, 3, 4, 5}
b = {4, 5, 6, 7, 8}

print(a | b)     # Union:        {1, 2, 3, 4, 5, 6, 7, 8}
print(a & b)     # Intersection: {4, 5}
print(a - b)     # Difference:   {1, 2, 3}
print(a ^ b)     # Symmetric:    {1, 2, 3, 6, 7, 8}
```

### Practical Use: Removing Duplicates
```python
names = ["Alice", "Bob", "Alice", "Charlie", "Bob"]
unique_names = list(set(names))   # ["Alice", "Bob", "Charlie"]
```

## Practice
1. Write a program that counts the frequency of each character in a string using a dictionary.
2. Given two lists, use sets to find elements that appear in both lists.
3. Create a simple phonebook using a dictionary: add contacts, look up numbers, and delete contacts."""),

    ("Functions and Modular Code", """# Functions and Modular Code

## What Are Functions?
A function is a reusable block of code that performs a specific task. Functions help you:
- **Avoid repetition** (DRY — Don't Repeat Yourself)
- **Organize code** into logical, manageable pieces
- **Test and debug** individual components independently

## Defining Functions
```python
# Basic function
def greet():
    print("Hello, World!")

greet()   # Call the function

# Function with parameters
def greet_user(name):
    print(f"Hello, {name}!")

greet_user("Youssef")   # "Hello, Youssef!"

# Function with return value
def add(a, b):
    return a + b

result = add(3, 5)   # result = 8
```

## Parameters and Arguments

### Default Parameters
```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Youssef"))              # "Hello, Youssef!"
print(greet("Youssef", "Salam"))     # "Salam, Youssef!"
```

### Keyword Arguments
```python
def create_profile(name, age, city):
    return f"{name}, {age}, from {city}"

# Positional
create_profile("Youssef", 25, "Rabat")

# Keyword (order doesn't matter)
create_profile(city="Rabat", name="Youssef", age=25)
```

### *args and **kwargs
```python
# *args — variable number of positional arguments
def sum_all(*numbers):
    return sum(numbers)

print(sum_all(1, 2, 3, 4, 5))   # 15

# **kwargs — variable number of keyword arguments
def print_info(**info):
    for key, value in info.items():
        print(f"{key}: {value}")

print_info(name="Youssef", role="Teacher", subject="History")
```

## Scope
```python
x = 10   # Global scope

def my_function():
    y = 5   # Local scope — only exists inside this function
    print(x)   # Can read global variables
    print(y)

my_function()
# print(y)   # ❌ Error! y doesn't exist outside the function
```

## Lambda Functions
Small anonymous functions for simple operations:
```python
# Regular function
def square(x):
    return x ** 2

# Lambda equivalent
square = lambda x: x ** 2

# Common use: sorting
students = [("Alice", 85), ("Bob", 92), ("Charlie", 78)]
students.sort(key=lambda s: s[1], reverse=True)
# [("Bob", 92), ("Alice", 85), ("Charlie", 78)]
```

## Docstrings
```python
def calculate_bmi(weight_kg, height_m):
    \"\"\"
    Calculate Body Mass Index (BMI).

    Args:
        weight_kg (float): Weight in kilograms
        height_m (float): Height in meters

    Returns:
        float: The calculated BMI value
    \"\"\"
    return weight_kg / (height_m ** 2)
```

## Practice
1. Write a function `is_palindrome(text)` that returns `True` if the text reads the same forwards and backwards.
2. Write a function `fibonacci(n)` that returns a list of the first `n` Fibonacci numbers.
3. Write a function `caesar_cipher(text, shift)` that encrypts text by shifting each letter by `shift` positions in the alphabet."""),
]:
    if not Lesson.objects.filter(module=mod3_2, title=title).exists():
        Lesson.objects.create(module=mod3_2, title=title, content=content, is_published=True)
        print(f"  ✓ Lesson: {title}")

# ── Module 3: Algorithms and Problem Solving ──────────────────────────────────
mod3_3, _ = Module.objects.get_or_create(
    course=course3, title="Module 3: Algorithms and Problem Solving",
    defaults={"order": 3, "is_published": True}
)
print(f"  {'✓ Created' if _ else '→ Exists'} Module: {mod3_3.title}")

for title, content in [
    ("Introduction to Algorithms", """# Introduction to Algorithms

## What is an Algorithm?
An algorithm is a finite, step-by-step procedure for solving a problem or performing a computation. The word comes from the name of the 9th-century Persian mathematician **al-Khwarizmi**.

## Properties of a Good Algorithm
1. **Input**: Zero or more inputs
2. **Output**: At least one output
3. **Definiteness**: Each step is precisely defined
4. **Finiteness**: Terminates after a finite number of steps
5. **Effectiveness**: Each step is basic enough to be carried out

## Algorithm Example: Finding the Maximum
```
Algorithm: Find Maximum in a List
Input: A list of numbers L
Output: The largest number in L

1. Set max_value = L[0]
2. For each number n in L (starting from index 1):
   a. If n > max_value:
      Set max_value = n
3. Return max_value
```

```python
def find_max(numbers):
    max_value = numbers[0]
    for n in numbers[1:]:
        if n > max_value:
            max_value = n
    return max_value
```

## Big O Notation
Big O describes how an algorithm's performance scales with input size:

| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Accessing an array element by index |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Searching an unsorted list |
| O(n log n) | Linearithmic | Merge sort, quicksort |
| O(n²) | Quadratic | Bubble sort, nested loops |
| O(2ⁿ) | Exponential | Brute-force subset generation |

### How to Determine Big O
- **Drop constants**: O(3n) → O(n)
- **Drop lower terms**: O(n² + n) → O(n²)
- **Focus on the worst case**: What happens with very large inputs?

## Searching Algorithms

### Linear Search — O(n)
```python
def linear_search(arr, target):
    for i, item in enumerate(arr):
        if item == target:
            return i
    return -1
```

### Binary Search — O(log n)
Requires a **sorted** array:
```python
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
```

Binary search is dramatically faster: searching 1,000,000 items takes at most 20 comparisons vs. 1,000,000 for linear search.

## Practice
1. What is the Big O of a function that prints all pairs from a list? (Hint: nested loops)
2. Implement binary search recursively.
3. Compare the actual number of steps for linear vs. binary search on a sorted list of 1,000 elements."""),

    ("Sorting Algorithms", """# Sorting Algorithms

## Why Sorting Matters
Sorting is one of the most fundamental operations in computer science. Many algorithms (like binary search) require sorted data. Understanding sorting teaches algorithm design, complexity analysis, and trade-offs.

## Bubble Sort — O(n²)
Repeatedly swaps adjacent elements if they're in the wrong order.

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break   # Already sorted
    return arr
```

**Pros**: Simple to understand and implement
**Cons**: Very slow for large datasets

## Selection Sort — O(n²)
Finds the minimum element and places it at the beginning, then repeats for the remaining elements.

```python
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
```

## Merge Sort — O(n log n)
Divides the array in half, recursively sorts each half, then merges them.

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

**Key insight**: Merge sort uses a **divide-and-conquer** strategy — breaking a problem into smaller subproblems, solving them independently, and combining results.

## Comparison Table

| Algorithm | Best Case | Average | Worst Case | Space | Stable? |
|-----------|-----------|---------|------------|-------|---------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |

**Stable** = equal elements maintain their original relative order.

## Visualization
Imagine sorting a hand of playing cards:
- **Bubble Sort**: Compare adjacent cards, swap if needed, repeat
- **Selection Sort**: Find the lowest card, place it first, find the next lowest, and so on
- **Merge Sort**: Split the hand in half, sort each half, then interleave them back together

## Practice
1. Trace through bubble sort step-by-step on the list `[64, 34, 25, 12, 22, 11, 90]`.
2. Implement quicksort (another divide-and-conquer algorithm that partitions around a pivot).
3. Experimentally compare the running time of bubble sort vs. merge sort on lists of size 100, 1000, and 10000."""),

    ("Recursion: Functions That Call Themselves", """# Recursion: Functions That Call Themselves

## What is Recursion?
Recursion is a technique where a function calls itself to solve a problem by breaking it into smaller, identical subproblems.

Every recursive function needs:
1. **Base case**: The condition that stops the recursion
2. **Recursive case**: The function calls itself with a "smaller" input

## Classic Example: Factorial
The factorial of n (written n!) is: n! = n × (n-1) × (n-2) × ... × 1

```python
def factorial(n):
    # Base case
    if n == 0 or n == 1:
        return 1
    # Recursive case
    return n * factorial(n - 1)

print(factorial(5))   # 120
```

### How It Works (Call Stack)
```
factorial(5)
  → 5 * factorial(4)
    → 4 * factorial(3)
      → 3 * factorial(2)
        → 2 * factorial(1)
          → 1              ← base case reached
        ← 2 * 1 = 2
      ← 3 * 2 = 6
    ← 4 * 6 = 24
  ← 5 * 24 = 120
```

## Fibonacci Sequence
Each number is the sum of the two preceding ones: 0, 1, 1, 2, 3, 5, 8, 13, 21, ...

```python
# Simple recursive (inefficient — O(2^n))
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

# With memoization (efficient — O(n))
def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]
```

## Recursion vs. Iteration
Any recursive solution can be rewritten iteratively, and vice versa.

```python
# Recursive sum
def sum_recursive(lst):
    if not lst:
        return 0
    return lst[0] + sum_recursive(lst[1:])

# Iterative sum
def sum_iterative(lst):
    total = 0
    for item in lst:
        total += item
    return total
```

### When to Use Recursion
| Use Recursion When... | Use Iteration When... |
|----------------------|----------------------|
| Problem has natural recursive structure (trees, fractals) | Simple counting or accumulation |
| Code clarity matters more than performance | Performance is critical |
| Divide-and-conquer fits naturally | Deep recursion would cause stack overflow |

## Common Recursive Problems

### Power Function
```python
def power(base, exp):
    if exp == 0:
        return 1
    return base * power(base, exp - 1)
```

### Reverse a String
```python
def reverse(s):
    if len(s) <= 1:
        return s
    return reverse(s[1:]) + s[0]

print(reverse("hello"))   # "olleh"
```

### Tower of Hanoi
```python
def hanoi(n, source, target, auxiliary):
    if n == 1:
        print(f"Move disk 1 from {source} to {target}")
        return
    hanoi(n - 1, source, auxiliary, target)
    print(f"Move disk {n} from {source} to {target}")
    hanoi(n - 1, auxiliary, target, source)

hanoi(3, 'A', 'C', 'B')
```

## Common Pitfalls
1. **Missing base case** → Infinite recursion → Stack overflow
2. **Base case never reached** → Same problem
3. **Redundant computation** → Exponential time (fix with memoization)

## Practice
1. Write a recursive function to calculate the sum of digits of a number (e.g., 1234 → 10).
2. Write a recursive function to check if a string is a palindrome.
3. Write a recursive function to find all permutations of a string."""),
]:
    if not Lesson.objects.filter(module=mod3_3, title=title).exists():
        Lesson.objects.create(module=mod3_3, title=title, content=content, is_published=True)
        print(f"  ✓ Lesson: {title}")


# ═══════════════════════════════════════════════════════════════════════════════
# QUIZ — for Module 1 of Computer Science (Programming Fundamentals)
# ═══════════════════════════════════════════════════════════════════════════════

print("\n=== Creating Quiz ===")

quiz, quiz_created = Quiz.objects.get_or_create(
    name="Programming Fundamentals Quiz",
    course=course3,
    defaults={
        "description": "Test your understanding of variables, data types, operators, and control flow in Python.",
        "teacher": teacher,
        "due_date": datetime.date(2026, 12, 31),
    }
)

if quiz_created:
    print(f"✓ Created Quiz: {quiz.name}")

    questions_data = [
        {
            "text": "What is the output of the following Python code?\n\nx = 17\ny = 5\nprint(x // y)",
            "choices": [
                ("3.4", False),
                ("3", True),
                ("4", False),
                ("2", False),
            ]
        },
        {
            "text": "Which of the following is an immutable data type in Python?",
            "choices": [
                ("list", False),
                ("dictionary", False),
                ("tuple", True),
                ("set", False),
            ]
        },
        {
            "text": "What will this code print?\n\nfor i in range(3):\n    if i == 1:\n        continue\n    print(i)",
            "choices": [
                ("0 1 2", False),
                ("0 2", True),
                ("1 2", False),
                ("0", False),
            ]
        },
        {
            "text": "What is the correct way to define a function in Python that takes two parameters and returns their sum?",
            "choices": [
                ("function add(a, b): return a + b", False),
                ("def add(a, b): return a + b", True),
                ("define add(a, b) { return a + b }", False),
                ("func add(a, b) => a + b", False),
            ]
        },
        {
            "text": "What does the 'break' statement do inside a loop?",
            "choices": [
                ("Skips the current iteration and moves to the next one", False),
                ("Pauses the loop for one second", False),
                ("Exits the loop immediately", True),
                ("Restarts the loop from the beginning", False),
            ]
        },
    ]

    for qdata in questions_data:
        question = Question.objects.create(quiz=quiz, question_text=qdata["text"])
        for choice_text, is_correct in qdata["choices"]:
            Choice.objects.create(question=question, choice=choice_text, is_correct=is_correct)
        print(f"  ✓ Question: {qdata['text'][:50]}...")
else:
    print(f"→ Quiz already exists: {quiz.name}")


# ═══════════════════════════════════════════════════════════════════════════════
# INGEST ALL NEW LESSONS INTO VECTOR DB FOR RAG
# ═══════════════════════════════════════════════════════════════════════════════

print("\n=== Ingesting lessons into Vector DB ===")
from rag.ingest import ingest_searchable_object
from rag.models import DocumentChunk

for lesson in Lesson.objects.all():
    chunk_count = DocumentChunk.objects.filter(
        content_type_name='lesson', object_id=lesson.id
    ).count()
    if chunk_count == 0:
        try:
            ingest_searchable_object(lesson)
            print(f"  ✓ Ingested: {lesson.title}")
        except Exception as e:
            print(f"  ✗ Failed to ingest {lesson.title}: {e}")
    else:
        print(f"  → Already ingested ({chunk_count} chunks): {lesson.title}")

print("\n✅ Seed complete!")
