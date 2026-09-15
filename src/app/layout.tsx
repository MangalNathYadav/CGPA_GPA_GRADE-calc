import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Grade & GPA Calculator',
  description:
    'A premium Grade, GPA, and CGPA calculator with support for absolute and relative grading methods, standard deviation, and class statistics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
