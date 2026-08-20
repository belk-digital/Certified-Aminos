import './globals.css';
import { ReactNode } from 'react';
import SmoothScroll from '../components/SmoothScroll';

export const metadata = {
  title: 'Certified Aminos - Retatrutide',
  description: 'Next-generation triple agonist peptide researched for advanced metabolic health and weight management.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
