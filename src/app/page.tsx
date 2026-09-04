import { FinalCTA } from "@/components/FinalCTA";
import { FlavorTicker } from "@/components/FlavorTicker";
import { FreshnessStory } from "@/components/FreshnessStory";
import { Hero } from "@/components/Hero";
import { IngredientScene } from "@/components/IngredientScene";
import { IntroProvider } from "@/components/IntroProvider";
import { Loader } from "@/components/Loader";
import { Nav } from "@/components/Nav";
import { NepalStory } from "@/components/NepalStory";
import { PinnedSqueeze } from "@/components/PinnedSqueeze";
import { SiteFooter } from "@/components/SiteFooter";

export default function Page() {
  return (
    <IntroProvider>
      <Loader />
      <Nav />
      <main id="main">
        <Hero />
        <PinnedSqueeze />
        <FreshnessStory />
        <IngredientScene />
        <NepalStory />
        <FlavorTicker />
        <FinalCTA />
      </main>
      <SiteFooter />
    </IntroProvider>
  );
}
