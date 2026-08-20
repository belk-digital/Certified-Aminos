import Hero from '../components/Hero';
import CategoriesSection from '../components/CategoriesSection';
import ResearchCompounds from '../components/ResearchCompounds';
import StatsSection from '../components/StatsSection';
import WhyPeptides from '../components/WhyPeptides';

export default function Home() {
  return (
    <main>
      <Hero />
      <ResearchCompounds />
      <StatsSection />
      <WhyPeptides />
      <CategoriesSection />
    </main>
  );
}
