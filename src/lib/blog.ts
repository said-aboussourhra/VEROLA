import type { Localized } from "./pricing";

export interface BlogPost {
  slug: string;
  cat: Localized;
  date: string;
  min: number;
  title: Localized;
  excerpt: Localized;
  body: Localized[];
  art: string; // css class for the cover plate
  glyph: string;
}

export const POSTS: BlogPost[] = [
  {
    slug: "soft-touch-vs-gloss",
    cat: { en: "Paper science", fr: "Science du papier", ar: "علم الورق" },
    date: "2025-11-04",
    min: 4,
    title: {
      en: "The handshake test: why soft-touch beats gloss",
      fr: "Le test de la poignée de main : pourquoi le velours l'emporte sur le brillant",
      ar: "اختبار المصافحة: لماذا يفوز المخملي على اللامع",
    },
    excerpt: {
      en: "Gloss wins a photo. Soft-touch wins the hand that holds it. A short defense of the quiet finish.",
      fr: "Le brillant gagne la photo. Le velours gagne la main qui tient. Une défense du fini discret.",
      ar: "اللامع يفوز بالصورة، والمخملي يفوز باليد التي تحمل. دفاع قصير عن التشطيب الهادئ.",
    },
    art: "bg-gradient-to-br from-violet/30 via-ink-2 to-cyan/20",
    glyph: "S",
    body: [
      {
        en: "Photograph a gloss card and a soft-touch card side by side and the gloss wins, every time. But photography is not what your business card does. Your business card lives in a pocket, gets pulled out, and is held by a stranger for four seconds.",
        fr: "Photographiez une carte brillante et une carte velours côte à côte : la brillante gagne à chaque fois. Mais la photo n'est pas le métier de votre carte de visite. Votre carte vit dans une poche, sort, et est tenue par un inconnu quatre secondes.",
        ar: "صوّر بطاقة لامعة ومخمليّة جنباً إلى جنب وتربح اللامعة دائماً. لكن التصوير ليس وظيفة بطاقتك. بطاقتك تعيش في الجيب، وتخرج، ويحملها غريب لثوانٍ أربع.",
      },
      {
        en: "Those four seconds are a handshake with a texture. Matte and soft-touch surfaces slow the fingers down; a velvet laminate gives the thumb something to read before the name does. That is a memory, not a reflection.",
        fr: "Ces quatre secondes sont une poignée de main texturée. Les surfaces mates ralentissent les doigts ; un pelliculage velours donne au pouce quelque chose à lire avant le nom. C'est un souvenir, pas un reflet.",
        ar: "هذه الثوانی مصافحة ذات ملمس. الأسطح المطفية تبطئ الأصابع؛ التغليف المخملي يعطي الإبهام ما يقرأه قبل الاسم. هذه ذكرى، لا انعكاس.",
      },
      {
        en: "Our rule in the studio: gloss for things that travel fast — flyers, menus, posters people scan. Soft-touch for things that stay in a hand — cards, invitations, the one box a customer keeps on a shelf.",
        fr: "Notre règle au studio : le brillant pour ce qui va vite — flyers, menus, affiches qu'on scanne. Le velours pour ce qui reste dans la main — cartes, invitations, la boîte qu'un client garde sur son étagère.",
        ar: "قاعدتنا في الاستوديو: اللمعان لما يتحرك بسرعة — الفلايرات والقوائم والأفيش. والمخمل لما يبقى في اليد — البطاقات والدعوات والعلبة التي يحتفظ بها العميل على رفّه.",
      },
      {
        en: "If your card says who you are, let it feel like it.",
        fr: "Si votre carte dit qui vous êtes, laissez-la se sentir de la même manière.",
        ar: "إذا كانت بطاقتك تقول من أنت، فاجعلها تُحسّ بنفس الطريقة.",
      },
    ],
  },
  {
    slug: "three-millimeters",
    cat: { en: "Craft", fr: "Savoir-faire", ar: "حرفة" },
    date: "2025-12-02",
    min: 3,
    title: {
      en: "Three millimeters of love",
      fr: "Trois millimètres d'amour",
      ar: "ثلاث مليمترات من الحب",
    },
    excerpt: {
      en: "Bleed is the most unglamorous line in a design file and the most expensive one to get wrong.",
      fr: "Le fond perdu est la ligne la moins glorieuse d'un fichier et la plus chère à rater.",
      ar: "الهامش هو الأقل بهاءً في ملف التصميم والأغلى خطأً عندما يُخطئ.",
    },
    art: "bg-gradient-to-br from-cyan/25 via-ink-2 to-magenta/20",
    glyph: "3",
    body: [
      {
        en: "Every sheet comes off the press with the die walking a little. One millimeter left, two right. A full-bleed color that stops exactly at the trim line becomes a full-bleed color with a white hair on the edge. The white hair is not a defect. It is the entire problem.",
        fr: "Chaque feuille sort de la presse avec le couteau qui se balade un peu. Un millimètre à gauche, deux à droite. Une couleur à pleine page qui s'arrête pile sur le trait de coupe devient une couleur à pleine page avec un cheveu blanc sur le bord. Ce cheveu blanc n'est pas un défaut. C'est tout le problème.",
        ar: "كل ورقة تخرج من المكبس والمكافئ يمشي قليلاً: مليمتر يساراً واثنان يميناً. لون كامل يتوقف بالضبط عند خط القص يصبح لوناً كاملاً به شعر أبيض على الحافة. الشعر الأبيض ليس عيباً — هو المشكلة كلها.",
      },
      {
        en: "So we extend the color three millimeters past the trim, on all four sides. Three is the number our Zünd needs to be certain. Extend, and the die can be wrong in every direction at once and the print is still perfect.",
        fr: "Alors on pousse la couleur trois millimètres au-delà du trait, sur les quatre côtés. Trois, c'est le chiffre dont notre Zünd a besoin pour être certain. On pousse, et le couteau peut avoir tort dans toutes les directions à la fois, et le tirage reste parfait.",
        ar: "لذلك نمدّد اللون ثلاث مليمترات خارج الخط في الجهات الأربع. ثلاث هي العدد الذي تحتاجه زوند لتكون متأكدة. امدد، وسيخطئ المكافئ في كل الجهات دفعة واحدة والطباعة تبقى مثالية.",
      },
      {
        en: "Our preflight flags every file without bleed in under a second. Then it is one click to auto-extend, and the white hair disappears before it is born.",
        fr: "Notre preflight signale chaque fichier sans fond perdu en moins d'une seconde. Un clic pour l'extension automatique, et le cheveu blanc disparaît avant d'être né.",
        ar: "فحصنا يسأل عن كل ملف بلا هامش في أقل من ثانية. ثم نقرة واحدة للإطالة التلقائية، فيختفي الشعر الأبيض قبل أن يولد.",
      },
    ],
  },
  {
    slug: "soy-inks-solar-roof",
    cat: { en: "Planet", fr: "Planète", ar: "كوكب" },
    date: "2026-01-18",
    min: 5,
    title: {
      en: "Printing lighter: soy, FSC and a roof full of panels",
      fr: "Imprimer plus léger : soja, FSC et un toit de panneaux",
      ar: "طباعة أخف: الصويا وFSC وسقف مليء باللوحات",
    },
    excerpt: {
      en: "What a print studio owes the planet, in four measurable numbers.",
      fr: "Ce qu'une imprimerie doit à la planète, en quatre chiffres mesurables.",
      ar: "ما يدين به استوديو طباعة إلى الكوكب، بأربعة أرقام قابلة للقياس.",
    },
    art: "bg-gradient-to-br from-gold/25 via-ink-2 to-violet/25",
    glyph: "%",
    body: [
      {
        en: "The easy version of sustainable printing is a green banner on the website. We tried to do the harder version: make the inputs measurable. Four numbers hang in our finishing room, and they change when the work changes.",
        fr: "La version facile de l'imprimerie durable, c'est une bannière verte sur le site. Nous avons essayé la version difficile : rendre les entrées mesurables. Quatre chiffres pendent dans notre salle de finition, et ils changent quand le travail change.",
        ar: "النسخة السهلة من الطباعة المستدامة لوحة خضراء في الموقع. جربنا النسخة الأصعب: أن نجعل المدخلات قابلة للقياس. أربعة أرقام معلقة في غرفة التشطيب، وتتغير عندما يتغير العمل.",
      },
      {
        en: "100% FSC paper: every stock in our configurator is certified or recycled, and the certificate number is on each datasheet. 100% soy inks: they dry with less VOC and pull off the drum the same day the job ends. 60% solar: the roof pays for a third of the press hours in summer. 0 to landfill: misprints become the coffee-shop's napkin stock, never the bin.",
        fr: "100 % FSC : chaque papier du configurateur est certifié ou recyclé, et le numéro de certificat est sur chaque fiche technique. 100 % soja : elles sèchent avec moins de COV et se retirent du tambour le jour même. 60 % solaire : le toit paie un tiers des heures de presse en été. 0 benne : les erreurs deviennent les mouchoirs du café d'à côté, jamais la poubelle.",
        ar: "100% ورق FSC: كل الأنواع في منصتنا معتمدة أو معاد تدويرها، ورقم الشهادة على كل ورقة مواصفات. 100% حبر صويا: يجفّ بمركبات أقل وينتقل من الأسطوانة في نفس اليوم. 60% شمسي: السقف يدفع ثلث ساعات المكبس صيفاً. صفر للقمامة: الأخطاء تصبح مناديل المقهى المجاور، لا سلة النفايات.",
      },
      {
        en: "The planet is a long-term customer. We print for it accordingly — 1200 dpi, first time right, no re-press.",
        fr: "La planète est une cliente de long terme. Nous imprimons pour elle en conséquence — 1200 dpi, du premier coup, jamais de re-tirage.",
        ar: "الكوكب عميل طويل الأمد. نطبع له على هذا الأساس — 1200 نقطة، من أول مرة، بلا إعادة طباعة.",
      },
    ],
  },
];
