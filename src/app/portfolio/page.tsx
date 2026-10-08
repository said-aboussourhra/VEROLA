"use client";

import { useI18n } from "@/lib/i18n";
import { PortfolioSection } from "@/components/home";
import { Reveal, SectionHeading } from "@/components/ui";

export default function PortfolioPage() {
  const { t } = useI18n();
  return (
    <div className="pt-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6 pt-10 pb-4">
        <Reveal>
          <SectionHeading
            kicker={t.portfolio.kicker}
            title={t.portfolio.title}
            sub={t.portfolio.sub}
          />
        </Reveal>
      </div>
      <PortfolioSection />
    </div>
  );
}
