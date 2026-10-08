import { Landing } from "@/components/landing";

const faqJson = [
  {
    q: "Which file formats do you accept?",
    a: "PDF, PNG, JPG, AI and SVG up to 50MB. Our preflight engine checks DPI (≥300), 3mm bleed, color space and fonts before anything reaches the press.",
  },
  {
    q: "How fast is 24h express, really?",
    a: "Files accepted before 14:00 are pressed the same day, cut and packed by 22:00, and out for delivery next morning in Casablanca and Rabat.",
  },
  {
    q: "Do you deliver outside Casablanca?",
    a: "Yes — 12 cities daily, and the rest of Morocco within 48–72h.",
  },
  {
    q: "What are the payment options?",
    a: "Card (CMI), bank transfer, or cash on delivery — everywhere in Morocco.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "VÉLORA",
      url: "https://velora.ma",
      logo: "https://velora.ma/logo.png",
      description:
        "Premium digital printing studio in Morocco with an online print-on-demand platform.",
      email: "hello@velora.ma",
      telephone: "+212661000000",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Derb Ghallef 21",
        addressLocality: "Casablanca",
        addressCountry: "MA",
      },
      sameAs: ["https://instagram.com/velora.ma", "https://linkedin.com/company/velora"],
    },
    {
      "@type": "LocalBusiness",
      name: "VÉLORA Print Studio",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqJson.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <Landing />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
