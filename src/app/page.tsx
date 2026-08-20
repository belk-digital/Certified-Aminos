import Hero from '../components/Hero';
import CategoriesSection from '../components/CategoriesSection';
import ResearchCompounds from '../components/ResearchCompounds';
import StatsSection from '../components/StatsSection';
import WhyPeptides from '../components/WhyPeptides';
import ResearchGradePeptides from '../components/ResearchGradePeptides';

export default function Home() {
  return (
    <main>
      <Hero />
      <ResearchCompounds />
      <StatsSection />
      <WhyPeptides />
      {/* <ResearchGradePeptides /> */}
      <CategoriesSection />
    </main>
  );
}
