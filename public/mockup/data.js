/* The library. Every link below was checked and resolves.
 * Shared by the shelf and the volume page.
 */

const BOOKS = [
  {
    short: "Research Debt",
    full: "Research Debt",
    source: "Distill",
    theme: "Readings",
    width: 67, height: 232,
    thought: "Same shape as my own problem \u2014 the second pass is where the value is and nobody funds it.",
    unread: false,
    summary:
      "Argues that poorly explained ideas accumulate a real cost, and that distillation is research work rather than a summary of it. Makes the case for treating explanation as a first-class output.",
    points: [
      "Unexplained ideas accumulate debt.",
      "Distillation is work, not a write-up.",
      "Difficulty of entry is a design failure, not a filter.",
    ],
    passage: "Research debt is the accumulated deficit of things a field has not bothered to explain well.",
    link: "https://distill.pub/2017/research-debt/",
  },
  {
    short: "Interactive",
    full: "Communicating with Interactive Articles",
    source: "Distill",
    theme: "Readings",
    width: 56, height: 214,
    thought: "The format is the argument. An explanation you can push on is a different object from one you read.",
    unread: false,
    summary:
      "Surveys interactive articles as a medium, examining what interaction adds to explanation and where it merely decorates it.",
    points: [
      "Interaction can carry explanation, not just decorate it.",
      "Reader agency changes comprehension.",
      "Most interactive articles under-use the form.",
    ],
    passage: "Interactive articles let a reader vary the thing being explained, which is closer to understanding than reading about it.",
    link: "https://distill.pub/2020/communicating-with-interactive-articles/",
  },
  {
    short: "Heuristics",
    full: "10 Usability Heuristics for User Interface Design",
    source: "NN/g",
    theme: "Inspiration",
    width: 73, height: 240,
    thought: "Still the shortest list worth arguing with. Most critiques I give are one of these ten, badly paraphrased.",
    unread: false,
    summary:
      "The ten general principles for interaction design, unchanged since 1994 and still the common vocabulary for interface critique.",
    points: [
      "Visibility of system status comes first.",
      "Recognition over recall.",
      "Error prevention beats good error messages.",
    ],
    passage: "They are called heuristics because they are broad rules of thumb and not specific usability guidelines.",
    link: "https://www.nngroup.com/articles/ten-usability-heuristics/",
  },
  {
    short: "Disclosure",
    full: "Progressive Disclosure",
    source: "NN/g",
    theme: "Inspiration",
    width: 51, height: 196,
    thought: "",
    unread: false,
    summary:
      "Argues for deferring advanced features to a secondary screen so the common case stays simple, and sets out when the split helps and when it hides.",
    points: [
      "Show the common case first.",
      "Defer the rest, do not delete it.",
      "A bad split is worse than no split.",
    ],
    passage: "Progressive disclosure defers advanced features to a secondary screen, making applications easier to learn and less error-prone.",
    link: "https://www.nngroup.com/articles/progressive-disclosure/",
  },
  {
    short: "Magic Ink",
    full: "Magic Ink",
    source: "Bret Victor",
    theme: "Readings",
    width: 74, height: 238,
    thought: "The claim that most software is information software, not tools, reframed what I think I am designing.",
    unread: false,
    summary:
      "Argues that most software is a means of learning something rather than doing something, and that the discipline it needs is information design rather than interaction design.",
    points: [
      "Most software is information software.",
      "Interaction is a last resort, not a goal.",
      "Graphic design is the neglected skill.",
    ],
    passage: "The ubiquity of frustrating, unhelpful software interfaces has motivated decades of research into human-computer interaction.",
    link: "https://worrydream.com/MagicInk/",
  },
  {
    short: "Abstraction",
    full: "Up and Down the Ladder of Abstraction",
    source: "Bret Victor",
    theme: "Readings",
    width: 60, height: 220,
    thought: "Moving up and down the ladder deliberately is a skill. I do it by accident.",
    unread: false,
    summary:
      "A working method for designing systems by moving between the concrete instance and the general rule, with the ladder made visible.",
    points: [
      "Start concrete, then generalise deliberately.",
      "See the whole space, not one run.",
      "Abstraction without a concrete anchor drifts.",
    ],
    passage: "The ladder of abstraction is a technique for thinking explicitly about the levels you are working at.",
    link: "https://worrydream.com/LadderOfAbstraction/",
  },
  {
    short: "Explorables",
    full: "Explorable Explanations",
    source: "Explorables",
    theme: "Inspiration",
    width: 46, height: 188,
    thought: "A whole shelf of the second pass, made by people who were not paid to make it.",
    unread: false,
    summary:
      "A collection of interactive explanations and playable posts, gathered as a hub for the form.",
    points: [
    ],
    passage: "",
    link: "https://explorabl.es/",
  },
  {
    short: "Working Lib",
    full: "A Working Library",
    source: "A Working Library",
    theme: "Blogs",
    width: 54, height: 206,
    thought: "Notes on reading, kept in public. Closest thing I have found to what I am trying to build.",
    unread: false,
    summary:
      "Mandy Brown's long-running notebook on reading, work and attention, kept as a public library of notes rather than a blog of posts.",
    points: [
      "Reading is a practice, not consumption.",
      "Notes in public compound.",
      "The library is the argument.",
    ],
    passage: "",
    link: "https://aworkinglibrary.com/",
  },
  {
    short: "Home-Cooked",
    full: "An App Can Be a Home-Cooked Meal",
    source: "Robin Sloan",
    theme: "Blogs",
    width: 64, height: 228,
    thought: "Software made for six people is allowed to be bad at everything else. Permission I keep needing.",
    unread: false,
    summary:
      "Argues for software written for a handful of known people, where the value is fit rather than scale.",
    points: [
      "Software can be made for six people.",
      "Fit beats generality.",
      "Not everything needs to survive you.",
    ],
    passage: "It's not that I'm opposed to the idea of scale; it's that I think the small scale is underrated.",
    link: "https://www.robinsloan.com/notes/home-cooked-app/",
  },
  {
    short: "Responsive",
    full: "Responsive Web Design",
    source: "A List Apart",
    theme: "Inspiration",
    width: 58, height: 212,
    thought: "",
    unread: false,
    summary:
      "The 2010 article that named responsive design, arguing for fluid grids, flexible images and media queries instead of separate sites.",
    points: [
      "The canvas is unknown; design for the range.",
      "Fluid grids, flexible media, media queries.",
      "One document, many shapes.",
    ],
    passage: "Rather than tailoring disconnected designs to each of an ever-increasing number of web devices, we can treat them as facets of the same experience.",
    link: "https://alistapart.com/article/responsive-web-design/",
  },
  {
    short: "Typography",
    full: "Practical Typography",
    source: "Butterick",
    theme: "Inspiration",
    width: 68, height: 234,
    thought: "The rules are boring and they are also the whole difference. Bookmarked and ignored for two years.",
    unread: false,
    summary:
      "A book-length practical guide to setting type, organised as rules you can apply immediately with the reasoning behind each.",
    points: [
      "Typography is what the reader notices when it fails.",
      "Most rules are about restraint.",
      "Defaults are almost never right.",
    ],
    passage: "Typography is the visual component of the written word.",
    link: "https://practicaltypography.com/",
  },
  {
    short: "Maker Time",
    full: "Maker's Schedule, Manager's Schedule",
    source: "Paul Graham",
    theme: "Blogs",
    width: 52, height: 200,
    thought: "It was never about focus, it was about who owns my calendar.",
    unread: false,
    summary:
      "Distinguishes the maker's day, spent in half-day units, from the manager's day cut into hours, and shows why a single meeting costs a maker far more than an hour.",
    points: [
      "Makers work in half-day units.",
      "One meeting can cost a whole afternoon.",
      "The two schedules cannot both win.",
    ],
    passage: "When you're operating on the maker's schedule, meetings are a disaster.",
    link: "https://www.paulgraham.com/makersschedule.html",
  },
  {
    short: "File Over App",
    full: "File Over App",
    source: "Steph Ango",
    theme: "Blogs",
    width: 49, height: 192,
    thought: "Outlive the tool. The file is the thing you actually own.",
    unread: false,
    summary:
      "Argues that the durability of your work depends on the file format rather than the application, and that tools should be chosen accordingly.",
    points: [
      "Apps are temporary; files are not.",
      "Prefer formats you can read in fifty years.",
      "Own the artefact, rent the tool.",
    ],
    passage: "If you want your writing to still be readable on a computer in 50 years, use a file format that is human-readable.",
    link: "https://stephango.com/file-over-app",
  },
  {
    short: "Gardens",
    full: "A Brief History of Digital Gardens",
    source: "Maggie Appleton",
    theme: "Blogs",
    width: 59, height: 218,
    thought: "A garden instead of a feed. That is the whole reframe I have been circling.",
    unread: false,
    summary:
      "Traces the digital garden as a form \u2014 notes that grow in public and are tended rather than published \u2014 and contrasts it with the reverse-chronological stream.",
    points: [
      "A garden is tended, a feed is flushed.",
      "Notes can be public before they are finished.",
      "Topography beats chronology.",
    ],
    passage: "Gardens are inherently exploratory. They're not about performing a finished thought.",
    link: "https://maggieappleton.com/garden-history",
  },
  {
    short: "Marginalian",
    full: "The Marginalian",
    source: "The Marginalian",
    theme: "Miscellaneous",
    width: 45, height: 184,
    thought: "",
    unread: false,
    summary:
      "Maria Popova's long-running archive of readings and marginalia across literature, science and art.",
    points: [
    ],
    passage: "",
    link: "https://www.themarginalian.org/",
  },
  {
    short: "Usability",
    full: "Classic Usability Is Important for AI",
    source: "Jakob Nielsen",
    theme: "Blogs",
    width: 55, height: 208,
    thought: "The old heuristics did not stop applying because the output got harder to predict.",
    unread: false,
    summary:
      "Argues that established usability principles still govern AI interfaces, and that novelty in the underlying model does not excuse a bad interaction.",
    points: [
      "Old heuristics still apply.",
      "Unpredictable output raises the bar for feedback.",
      "Novelty is not an excuse.",
    ],
    passage: "",
    link: "https://jakobnielsenphd.substack.com/p/classic-usability-ai",
  },
  {
    short: "Disenchant",
    full: "Software Disenchantment",
    source: "Tonsky",
    theme: "Miscellaneous",
    width: 63, height: 226,
    thought: "Uncomfortable and mostly right. Everything is slower than it was and nobody is embarrassed.",
    unread: false,
    summary:
      "A polemic on software bloat, arguing that hardware got orders of magnitude faster while software got slower, and that the profession stopped noticing.",
    points: [
      "Hardware improved; software did not.",
      "Bloat is a choice, repeated.",
      "Nobody is accountable for slowness.",
    ],
    passage: "Everything is being wrapped in dozens of layers of abstraction, and it is slower than it has any right to be.",
    link: "https://tonsky.me/blog/disenchantment/",
  },
  {
    short: "Doodle Fonts",
    full: "Doodle Fonts",
    source: "Doodlefonts",
    theme: "Inspiration",
    width: 61, height: 222,
    thought: "",
    unread: false,
    summary:
      "Draw every character by hand and export the result as a usable font. Projects save and stay editable, with or without an account.",
    points: [
    ],
    passage: "",
    link: "https://doodlefonts.app/",
  },
  {
    short: "Overstim.",
    full: "7 Things I Did to Fix My Unfocused, Overstimulated Brain",
    source: "Medium",
    theme: "Blogs",
    width: 50, height: 194,
    thought: "",
    unread: false,
    summary:
      "",
    points: [
    ],
    passage: "",
    link: "https://medium.com/the-useful-life/7-things-i-did-to-fix-my-unfocused-overstimulated-brain-a257421beadd",
  },
  {
    short: "UI Textures",
    full: "Design insp for UI textures",
    source: "Tooooools",
    theme: "Inspiration",
    width: 70, height: 236,
    thought: "",
    unread: false,
    summary:
      "Animate uploaded images as textured 3D planes in-browser. Orbit in Y-Z space with timeline controls and export support. Free, no sign-up required.",
    points: [
    ],
    passage: "",
    link: "https://www.tooooools.app/animate/slide",
  },
];

/* Related links, found once by search and kept, so the rail is instant. Empty
 * until seeded; a volume with no entry here searches live on open. */
const RELATED = {
  "0": [
    {
      "title": "Article: Research Debt (Distill)",
      "link": "https://medium.com/aifromscratch/article-research-debt-distill-f3a243971099",
      "source": "AI From Scratch",
      "why": "Another reader working through the same essay — useful for seeing which part of it lands for someone else."
    },
    {
      "title": "“Elegant Simplicity” and the Art of Distillation",
      "link": "https://medium.com/@dave-shap/elegant-simplicity-and-the-art-of-distillation-extracting-the-essence-of-complex-ideas-fb3bd528695b",
      "source": "David Shapiro",
      "why": "Treats the second pass as a craft with a method, not just work nobody pays for."
    },
    {
      "title": "Scholarship for Explorable Research",
      "link": "https://medium.com/nextjournal/scholarship-for-explorable-research-571969b3127e",
      "source": "Nextjournal",
      "why": "The funding question in your note, put directly: what it would take to count explanation as scholarship."
    }
  ],
  "1": [
    {
      "title": "Exploring “Explorable Explanations”",
      "link": "https://medium.com/@Max_Goldstein/exploring-explorable-explanations-92f865c8d6ba",
      "source": "Max Goldstein",
      "why": "Catalogues the forms the argument takes — reactive documents, side-by-side interaction, full simulations."
    },
    {
      "title": "An Interactive Article about Interactive Content",
      "link": "https://medium.com/digital-gems/an-interactive-article-about-interactive-content-b2a42e71cbbe",
      "source": "Digital GEMs",
      "why": "Makes its case by being the thing it describes, which is your point exactly."
    },
    {
      "title": "Playable Publishing — A Primer",
      "link": "https://medium.com/@stevemwilcox/playable-publishing-a-primer-99834cd85323",
      "source": "Steve Wilcox",
      "why": "The same claim from publishing rather than design: the format carries the argument."
    },
    {
      "title": "From Data Visualization to Interactive Data Analysis",
      "link": "https://medium.com/@FILWD/from-data-visualization-to-interactive-data-analysis-e24ae3751bf3",
      "source": "Enrico Bertini",
      "why": "What changes when a reader can vary the thing being explained instead of reading about it."
    }
  ],
  "2": [
    {
      "title": "How to give feedback in design critiques",
      "link": "https://medium.com/design-bootcamp/how-to-give-feedback-in-design-critiques-66033f7132e7",
      "source": "Bootcamp",
      "why": "Ties each piece of feedback to a goal or a heuristic — the well-said version of what you paraphrase badly."
    },
    {
      "title": "The Design Critique: Giving and Receiving Feedback",
      "link": "https://medium.com/@talishapayton/the-design-critique-giving-and-receiving-feedback-13c9aea6ec92",
      "source": "Talisha Payton",
      "why": "Both directions of the thing, which the ten heuristics never cover."
    },
    {
      "title": "How to give good design feedback",
      "link": "https://medium.com/agileinsider/how-to-give-good-design-feedback-cfa5b1401c4",
      "source": "Agile Insider",
      "why": "Objective phrasing over “I don't like it” — the vocabulary your critiques are reaching for."
    },
    {
      "title": "Design Critiques: A guide for non-designers",
      "link": "https://medium.com/@earias1/design-critiques-a-guide-for-non-designers-aa61b69e2b9b",
      "source": "Erick Arias",
      "why": "How to hand the shared vocabulary to people who do not have the ten memorised."
    }
  ],
  "3": [
    {
      "title": "Understanding the 4 Key Variants of Progressive Disclosure",
      "link": "https://medium.com/@mahfuzbd86/understanding-the-4-key-variants-of-progressive-disclosure-in-ux-design-7513c5360cb4",
      "source": "Mahfuzur Rahman",
      "why": "Splits into four distinct patterns what the original treats as one."
    },
    {
      "title": "Designing patterns that scale with progressive disclosure",
      "link": "https://medium.com/design-ibm/designing-patterns-that-scale-with-progressive-disclosure-9341d53644ae",
      "source": "IBM Design",
      "why": "The principle at system scale, inside a real design system."
    },
    {
      "title": "Enhancing UX with responsive enabling and progressive disclosure",
      "link": "https://medium.com/design-bootcamp/enhancing-ux-with-responsive-enabling-and-progressive-disclosure-patterns-92c07029a46a",
      "source": "Bootcamp",
      "why": "Pairs it with responsive enabling, which is the pattern it is most often confused with."
    },
    {
      "title": "Progressive Disclosure in Checkout UX",
      "link": "https://medium.com/@divyanshu.abhichandani/progressive-disclosure-in-checkout-ux-balancing-simplicity-and-transparency-15444ecb2aef",
      "source": "Divyanshu Abhichandani",
      "why": "Where hiding complexity costs trust — the case against applying it everywhere."
    }
  ],
  "4": [
    {
      "title": "Have you read Magic Ink by Bret Victor?",
      "link": "https://medium.com/@jens.lukowski/have-you-read-magic-ink-by-bret-victor-it-is-an-amazing-essay-about-software-design-919442284e4",
      "source": "Jens Lukowski",
      "why": "Someone else's account of being reframed by it, useful next to your own."
    },
    {
      "title": "The Utopian UI Architect",
      "link": "https://medium.com/re-form/the-utopian-ui-architect-34dead42a28",
      "source": "re:form",
      "why": "Where the reframe came from and what Victor was actually trying to replace."
    },
    {
      "title": "A Brief Rant on the Future of Interaction Design",
      "link": "https://medium.com/@stoweboyd/bret-victor-a-brief-rant-on-the-future-of-interaction-design-82b8b1ceca1",
      "source": "Stowe Boyd",
      "why": "The companion argument — if most software is information software, what are hands for?"
    },
    {
      "title": "Creators need an immediate connection",
      "link": "https://medium.com/@geert.roumen/creators-need-an-immediate-connection-2e6488c94ca0",
      "source": "Geert Roumen",
      "why": "The principle underneath the reframe, stated as a design requirement."
    }
  ],
  "5": [
    {
      "title": "The Ladder of Abstraction",
      "link": "https://medium.com/@jarango/the-ladder-of-abstraction-c93188a6d84a",
      "source": "Jorge Arango",
      "why": "An information architect on choosing the rung on purpose — the deliberate version of your accident."
    },
    {
      "title": "Up and Down the Ladder of Abstraction",
      "link": "https://medium.com/@tombarrett/up-and-down-the-ladder-of-abstraction-cb73533be751",
      "source": "Tom Barrett",
      "why": "On making the movement explicit enough to teach, which is how you would notice doing it."
    },
    {
      "title": "Shapes and ladders — the art of abstraction and meaning making",
      "link": "https://medium.com/@danramsden/shapes-and-ladders-the-art-of-abstraction-and-meaning-making-36208eec2098",
      "source": "Dan Ramsden",
      "why": "What you gain and lose at each rung when the thing you are making is meaning."
    },
    {
      "title": "Understand two levels of abstraction above and below you",
      "link": "https://medium.com/battlefy/understand-two-levels-of-abstraction-above-and-below-you-da67209321a4",
      "source": "Battlefy",
      "why": "A working rule for how far to move, rather than a description of the ladder."
    }
  ],
  "6": [
    {
      "title": "My new explorable, interactive blog",
      "link": "https://medium.com/@joshuawcomeau/my-new-explorable-interactive-blog-1302383a9b45",
      "source": "Joshua Comeau",
      "why": "One person building the shelf you found, and saying what it cost him to make."
    },
    {
      "title": "There will be the next Quantum Game with Photons",
      "link": "https://medium.com/quantum-photons/there-will-be-the-next-quantum-game-with-photons-276568d63613",
      "source": "Quantum Photons",
      "why": "An explorable made by people funding it themselves — the economics behind your note, from inside."
    },
    {
      "title": "Creators need an immediate connection",
      "link": "https://medium.com/@geert.roumen/creators-need-an-immediate-connection-2e6488c94ca0",
      "source": "Geert Roumen",
      "why": "Why people make these anyway, without being paid to."
    }
  ],
  "7": [
    {
      "title": "Reader's Notebook, Commonplace Book, and Note-Taking Systems",
      "link": "https://medium.com/@markgrabe/readers-notebook-commonplace-book-and-note-taking-systems-2fc2643226f0",
      "source": "Mark Grabe",
      "why": "Separates the three things you are conflating, which is the first design decision you face."
    },
    {
      "title": "Why You Should Consider a Digital Commonplace Book",
      "link": "https://medium.com/read-smart/why-you-should-consider-a-digital-commonplace-book-dd8748215ccb",
      "source": "Readsmart",
      "why": "The closest existing form to what you said you are trying to build."
    },
    {
      "title": "Crafting a Digital Commonplace Book",
      "link": "https://medium.com/@mikepaul/crafting-a-digital-commonplace-book-ebd5c4101570",
      "source": "Mike Paul",
      "why": "Someone building it in public with the reasoning shown, the way A Working Library does."
    },
    {
      "title": "I started keeping a commonplace book — how I keep it organised",
      "link": "https://medium.com/@shalveena/i-started-keeping-a-commonplace-book-this-is-how-i-keep-it-organised-3c59f9538f71",
      "source": "Shalveena Rohde",
      "why": "The practical half: what actually survives contact with daily reading."
    }
  ],
  "8": [
    {
      "title": "Software Gets Personal: An Introduction",
      "link": "https://medium.com/personal-software/software-gets-personal-an-introduction-1175c7f1edbd",
      "source": "Personal Software",
      "why": "Names the category your permission belongs to — specificity over universality, intimacy over scale."
    },
    {
      "title": "Software Gets Personal: The Makers",
      "link": "https://medium.com/personal-software/software-gets-personal-the-makers-0857cd4633af",
      "source": "Personal Software",
      "why": "The people already doing it, which is the reassurance the permission is really for."
    },
    {
      "title": "Personal Software: What It Means to Build for Yourself and Others",
      "link": "https://medium.com/@hitarthchudgar/personal-software-what-it-means-to-build-for-yourself-others-e7fd8f106944",
      "source": "Hitarth Chudgar",
      "why": "Six people is a legitimate audience, argued rather than apologised for."
    },
    {
      "title": "Do things that don't scale, and then don't scale",
      "link": "https://medium.com/@derwiki/do-things-that-dont-scale-and-then-don-t-scale-9fd2cd7e2156",
      "source": "Adam Derewecki",
      "why": "Takes the famous advice one step further, to never scaling at all."
    }
  ],
  "9": [
    {
      "title": "Exploring the Evolution of Web Design: Container Queries in CSS",
      "link": "https://medium.com/cstech/exploring-the-evolution-of-web-design-container-queries-in-css-e980f6396ab3",
      "source": "ÇSTech",
      "why": "Where this article's argument ended up: components that respond to their container, not the window."
    },
    {
      "title": "CSS Container Queries: Revolutionising Responsive Web Design",
      "link": "https://medium.com/front-end-weekly/css-container-queries-revolutionising-responsive-web-design-bd65b4b23b29",
      "source": "Front End Weekly",
      "why": "The direct successor to media queries, and why the original technique hit a wall."
    },
    {
      "title": "The Complete Guide to Responsive Design: Fluid Layout",
      "link": "https://medium.com/@welegent/the-complete-guide-to-responsive-design-fluid-layout-design-from-theory-to-practice-7334927da156",
      "source": "Welegent",
      "why": "Fluid grids twenty years on — the same idea with the current tools."
    },
    {
      "title": "The Evolution of Grid Systems in Responsive and Fluid UI Design",
      "link": "https://medium.com/uxcentury/the-evolution-of-grid-systems-in-responsive-and-fluid-ui-design-30ee7c0ad3bf",
      "source": "UXCentury",
      "why": "The grid half of the original argument, traced forward."
    }
  ],
  "10": [
    {
      "title": "I Have 847 Saved Articles I'll Never Read. And I Keep Saving More.",
      "link": "https://medium.com/new-writers-welcome/i-have-847-saved-articles-ill-never-read-and-i-keep-saving-more-68bab7cd9a6a",
      "source": "New Writers Welcome",
      "why": "Your two years, in someone else's words — and why the saving itself feels like progress."
    },
    {
      "title": "Why Users Save Content but Never Revisit It",
      "link": "https://medium.com/@startwinklerana/why-users-save-content-but-never-revisit-it-and-how-platforms-can-fix-it-47e0de3caf45",
      "source": "Startwinklerana",
      "why": "Everyone built the save button, nobody built the return. That is the gap your note is standing in."
    },
    {
      "title": "Escaping the bookmarks blackhole",
      "link": "https://medium.com/@vishweshnavtake/escaping-bookmarks-blackhole-ux-case-study-0aaf76a38101",
      "source": "Vishwesh Navtake",
      "why": "A designer's case study on the exact problem, worth comparing to what you are building."
    },
    {
      "title": "The rising epidemic of saving and bookmarking unfinished content",
      "link": "https://medium.com/@waltersilas2/the-rising-epidemic-of-saving-and-bookmarking-unfinished-content-7eac3815b540",
      "source": "Walter Silas",
      "why": "Why bookmarking feels like learning when it isn't."
    }
  ],
  "11": [
    {
      "title": "The Chokehold of Calendars",
      "link": "https://medium.com/@monteiro/the-chokehold-of-calendars-f70bb9221b36",
      "source": "Mike Monteiro",
      "why": "Your reframe, sharply: most people schedule the interruptions that stop the work, not the work."
    },
    {
      "title": "The Clash of Schedules: Makers vs. Managers",
      "link": "https://medium.com/@francavilla/the-clash-of-schedules-makers-vs-managers-fc2827b456ad",
      "source": "Daniel Francavilla",
      "why": "Treats it as a conflict over whose time wins, which is the ownership question."
    },
    {
      "title": "Manager Schedule vs Maker Schedule: How to Support the Maker",
      "link": "https://medium.com/@chiefjoyofficer/manager-schedule-vs-maker-schedule-how-to-support-the-maker-ed05b5deda64",
      "source": "Chief Joy Officer",
      "why": "Written for the person holding the pen on your calendar."
    },
    {
      "title": "5 rules to accommodate the Maker's schedule",
      "link": "https://medium.com/@notsvensson/5-rules-to-accommodate-the-makers-f5bd680d19a6",
      "source": "Svensson",
      "why": "Concrete rules, for once you have decided the calendar is the real question."
    }
  ],
  "12": [
    {
      "title": "Why I Use Markdown, and Why You Should Too",
      "link": "https://medium.com/@RyanElston/why-i-use-markdown-and-why-you-should-too-c4a7e38c96d5",
      "source": "Ryan Elston",
      "why": "The format half of outliving the tool — what you write in if the file has to survive."
    },
    {
      "title": "Why You Should Use Markdown in Your Note-Taking App",
      "link": "https://medium.com/@mywellnessframework.com/why-you-should-use-markdown-in-your-note-taking-app-f2e15e51790c",
      "source": "Karl Sharrah",
      "why": "Applies it where you would feel it first: notes locked inside somebody's product."
    },
    {
      "title": "Markdown — what's not to like?",
      "link": "https://medium.com/@getclibu/markdown-whats-not-to-like-7b62d773a128",
      "source": "Clibu",
      "why": "The honest limits of the position, worth reading before committing to it."
    },
    {
      "title": "What is Obsidian?",
      "link": "https://medium.com/@tahirbalarabe2/what-is-obsidian-the-free-and-flexible-app-for-your-private-thoughts-683f53442222",
      "source": "Tahir",
      "why": "The tool built entirely on this principle, by the person who wrote your article."
    }
  ],
  "13": [
    {
      "title": "Digital Gardening: The Return of the Curated Web",
      "link": "https://medium.com/@theo-james/digital-gardening-in-2025-the-return-of-the-curated-web-3ae36f7add77",
      "source": "Theo James",
      "why": "The garden-against-feed reframe as a movement rather than one person's site."
    },
    {
      "title": "What is a Digital Garden?",
      "link": "https://medium.com/@estebanthi/what-is-a-digital-garden-eeae89c7c483",
      "source": "The Obsidianist",
      "why": "The mechanics under the metaphor — bidirectional links, no publish dates, never finished."
    },
    {
      "title": "A Digital Garden Inventory",
      "link": "https://medium.com/@raysims/a-digital-garden-inventory-d6450fe74b4",
      "source": "Raymond D Sims",
      "why": "Fifty of them to look at, if you want to see the reframe actually built."
    },
    {
      "title": "Cultivating Your Digital Garden: Growing Ideas One Step at a Time",
      "link": "https://medium.com/@richard-a-brown/cultivating-your-digital-garden-growing-ideas-one-step-at-a-time-fccb87beaeb2",
      "source": "Rich Brown",
      "why": "How to start one, which is the question the reframe leaves you with."
    }
  ],
  "14": [
    {
      "title": "Why The Marginalian is my most treasured website",
      "link": "https://medium.com/@sreemeenu1522/why-the-marginalian-aka-brain-pickings-is-my-most-treasured-website-7753845df1f6",
      "source": "Jai Shree",
      "why": "What twenty years of one person's reading notes does for someone reading them."
    },
    {
      "title": "My All-Time Top 3 Learnings from Maria Popova",
      "link": "https://medium.com/@slowwco/my-all-time-top-3-learnings-from-maria-popova-of-brain-pickings-782fc5d3c8d6",
      "source": "Sloww",
      "why": "The distillation of the distiller — what survives from six million words."
    },
    {
      "title": "Maria Popova: Daily Routine",
      "link": "https://medium.com/daily-routines-of-successful-people/maria-popova-daily-routine-a6f3d76dbb8c",
      "source": "Daily Routines",
      "why": "The reading practice behind the site, hour by hour."
    },
    {
      "title": "Beautiful Essays from the Prolific Maria Popova",
      "link": "https://medium.com/@ma_murphy_58/beautiful-essays-from-the-prolific-maria-popova-c7bbc7333c1a",
      "source": "Maureen Murphy",
      "why": "A way into the archive if you have never known where to start."
    }
  ],
  "15": [
    {
      "title": "Nielsen's heuristics revisited for conversational AI",
      "link": "https://medium.com/design-bootcamp/nielsens-heuristics-revisited-for-conversational-ai-90e1c613ce05",
      "source": "Bootcamp",
      "why": "Goes through the ten one by one and says which survive unpredictable output — your claim, tested."
    },
    {
      "title": "Rethinking UX heuristics for chatbots",
      "link": "https://medium.com/@WritikaB/rethinking-ux-heuristics-for-chatbots-a-conversational-lens-on-nn-gs-classic-principles-a3c4d5c4c9a6",
      "source": "Writika Bhaskar",
      "why": "Reframes rather than replaces, which is the position you took."
    },
    {
      "title": "Leveraging Nielsen's 10 heuristics for AI user experience",
      "link": "https://medium.com/design-bootcamp/leveraging-nielsens-10-heuristics-for-enhanced-ai-user-experience-a-chatgpt-case-study-f1e560896c35",
      "source": "Bootcamp",
      "why": "Applies all ten to one real product, so you can see where they strain."
    },
    {
      "title": "The new usability heuristics",
      "link": "https://medium.com/design-bootcamp/the-new-usability-heuristics-e4fa22ffc0a4",
      "source": "Bootcamp",
      "why": "The counter-position — that the list does need rewriting after all."
    }
  ],
  "16": [
    {
      "title": "Software Is Getting Worse — And Windows Is the Best Example",
      "link": "https://medium.com/@amuythida/software-is-getting-worse-and-windows-is-the-best-example-f9d1aa55a8a7",
      "source": "Amuy Thida",
      "why": "The uncomfortable half of your note, with one product's history as the evidence."
    },
    {
      "title": "Understanding Software Bloat",
      "link": "https://medium.com/acmbphcblog/understanding-software-bloat-6881f0720ae9",
      "source": "ACM BPHC",
      "why": "Why it happens structurally, which is the “nobody is embarrassed” part."
    },
    {
      "title": "Reducing Software Bloat: Lessons from Linux",
      "link": "https://medium.com/@sourabhchouhan220569/reducing-software-bloat-lessons-from-linux-based-operating-systems-7f509bb66dc6",
      "source": "Sourabh Chouhan",
      "why": "What it looks like when someone does take it seriously."
    },
    {
      "title": "Why Your Android Phone Gets Slower with Time",
      "link": "https://medium.com/decodein/why-your-android-phone-gets-slower-with-time-a3279b7554a2",
      "source": "DeCodeIN",
      "why": "The version of this you feel every day without naming it."
    }
  ],
  "17": [
    {
      "title": "Make a Custom Font From Your Handwriting",
      "link": "https://medium.com/@glenn.sorrentino/make-a-custom-font-from-your-handwriting-e5ab1b36fca9",
      "source": "Glenn Sorrentino",
      "why": "The next step past drawing characters in a browser: a font file you can actually set type in."
    },
    {
      "title": "My 5 key learnings from creating handwriting fonts with Calligraphr",
      "link": "https://medium.com/@juliadiebold/my-5-key-learnings-from-creating-handwriting-fonts-with-calligraphr-e6f0f00f5667",
      "source": "Julia Diebold",
      "why": "What goes wrong, from someone who has done it — worth reading before you draw 60 glyphs."
    },
    {
      "title": "Turn Your Handwriting into a Custom Font in Under an Hour",
      "link": "https://medium.com/@kristy.dahlquist/how-to-turn-your-handwriting-into-a-custom-font-in-under-an-hour-6d0f120b991e",
      "source": "Kristy Dahlquist",
      "why": "The fastest route, if you want a result today rather than a practice."
    },
    {
      "title": "Creating a font from scratch",
      "link": "https://medium.com/typetype/creating-a-font-from-scratch-a-detailed-guide-and-tips-for-choosing-software-5394ecab604d",
      "source": "TypeType",
      "why": "From a type foundry, for when the doodle stops being enough."
    }
  ],
  "18": [
    {
      "title": "The Science of Overstimulation",
      "link": "https://medium.com/@eliashstone/the-science-of-overstimulation-how-constant-input-affects-your-brain-57e443dbbfaa",
      "source": "Elias Stone",
      "why": "The mechanism under the listicle: why reading stops being rewarding at all."
    },
    {
      "title": "Digital Overstimulation: Rebuilding Your Attention Span",
      "link": "https://medium.com/pen-with-paper/digital-overstimulation-rebuilding-your-attention-span-23e3c6d39148",
      "source": "Pen With Paper",
      "why": "Limbic system versus prefrontal cortex — why quick hits win, structurally."
    },
    {
      "title": "Dopamine Nation: How to Reclaim Focus in an Overstimulated World",
      "link": "https://medium.com/illumination/dopamine-nation-how-to-reclaim-focus-in-an-overstimulated-world-415280b2cfc7",
      "source": "Illumination",
      "why": "A clinician's version, rather than seven things that worked for one person."
    },
    {
      "title": "Fixing Focus and Rebuilding Your Attention Span",
      "link": "https://medium.com/@ronanlina/i-fought-back-fixing-and-rebuilding-your-focus-and-attention-span-2bd2fc744e68",
      "source": "Ronan Lina",
      "why": "The long attempt, including what did not work."
    }
  ],
  "19": [
    {
      "title": "Aesthetics in the AI era: visual and web design trends",
      "link": "https://medium.com/design-bootcamp/aesthetics-in-the-ai-era-visual-web-design-trends-for-2026-5a0f75a10e98",
      "source": "Bootcamp",
      "why": "Places grain in a bigger movement — texture as the reaction to AI-perfect surfaces."
    },
    {
      "title": "Tactile Maximalism",
      "link": "https://medium.com/@Rythmuxdesigner/tactile-maximalism-why-2026-s-hottest-design-trend-feels-like-you-can-touch-the-screen-ab9fa8f3b5e3",
      "source": "Rythm UX",
      "why": "Where the texture trend is going once it stops being subtle."
    },
    {
      "title": "Salt & Pepper — The Art of Illustrating Texture",
      "link": "https://medium.com/google-design/salt-pepper-the-art-of-illustrating-texture-c962dc67cc35",
      "source": "Google Design",
      "why": "How to draw grain well, from people who had to systematise it."
    },
    {
      "title": "The Psychological Impact of Texture in Design",
      "link": "https://medium.com/@cookieredding/the-psychological-impact-of-texture-in-design-098693752b3a",
      "source": "Cookie Redding",
      "why": "Why a surface with tooth feels different to touch — the reason to bother."
    }
  ]
};

const THEMES = ["All", "Inspiration", "Readings", "Blogs", "Miscellaneous"];
