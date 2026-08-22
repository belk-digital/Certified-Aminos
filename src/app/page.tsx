import Hero from '../components/Hero';
import CategoriesSection from '../components/CategoriesSection';
import ResearchCompounds from '../components/ResearchCompounds';
import StatsSection from '../components/StatsSection';
import WhyPeptides from '../components/WhyPeptides';
import ResearchGradePeptides from '../components/ResearchGradePeptides';

import FAQSection from '../components/FAQSection';
import MilitaryDiscount from '../components/MilitaryDiscount';
import BlogSection from '../components/BlogSection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <ResearchCompounds />
      <WhyPeptides />
      <StatsSection />
      <CategoriesSection />
      <ResearchGradePeptides />
      <BlogSection />
      <MilitaryDiscount />
      <FAQSection />
      <Footer />
    </main>
  );
}
