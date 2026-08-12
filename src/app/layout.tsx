import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Certified Aminos - Retatrutide',
  description: 'Next-generation triple agonist peptide researched for advanced metabolic health and weight management.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
