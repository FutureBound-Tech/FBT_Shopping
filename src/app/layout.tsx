import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/lib/appwrite';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL('https://fbt-shopping.vercel.app'),
  title: {
    default: 'FBT Shopping — Premium Sarees, Lehengas & Designer Dresses | Nellore',
    template: '%s | FBT Shopping',
  },
  description:
    'Shop premium quality sarees, lehengas, anarkalis, and designer dresses at FBT Shopping. Latest collections with embroidery, silk, and banarasi fabrics. Best prices from Nellore. Free delivery available.',
  keywords: [
    'FBT Shopping',
    'FBT sarees',
    'FBT dresses',
    'FBT shop',
    'FBT Nellore',
    'quality sarees',
    'quality dresses',
    'sarees online',
    'designer sarees',
    'banarasi sarees',
    'silk sarees',
    'lehenga choli',
    'anarkali dress',
    'ethnic wear online',
    'Indian sarees',
    'winkle crush saree',
    'tasar silk lehenga',
    'embroidery sarees',
    'party wear sarees',
    'wedding sarees',
    'affordable sarees',
    'latest saree collection',
    'Nellore saree shop',
    'online saree shopping India',
    'dress online shopping',
    'Indian ethnic wear',
    'buy sarees online',
    'best sarees online',
    'FBT Shopping Nellore',
  ],
  authors: [{ name: 'FBT Shopping' }],
  creator: 'FBT Shopping',
  publisher: 'FBT Shopping',
  category: 'shopping',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://fbt-shopping.vercel.app',
    siteName: 'FBT Shopping',
    title: 'FBT Shopping — Premium Sarees, Lehengas & Designer Dresses',
    description:
      'Shop premium quality sarees, lehengas, and designer dresses. Latest collections with embroidery, silk, and banarasi fabrics. Best prices from Nellore.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'FBT Shopping Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FBT Shopping — Premium Sarees, Lehengas & Designer Dresses',
    description:
      'Shop premium quality sarees, lehengas, and designer dresses. Latest collections at best prices.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://fbt-shopping.vercel.app/#organization',
        name: 'FBT Shopping',
        alternateName: ['FBT Shop', 'FBT Sarees', 'FBT Dresses'],
        url: 'https://fbt-shopping.vercel.app',
        logo: {
          '@type': 'ImageObject',
          url: 'https://fbt-shopping.vercel.app/logo.png',
        },
        description:
          'FBT Shopping is a premium ethnic wear store based in Nellore, offering quality sarees, lehengas, designer dresses, and anarkalis with latest embroidery and silk collections.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Nellore',
          addressRegion: 'Andhra Pradesh',
          addressCountry: 'IN',
        },
        sameAs: [],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://fbt-shopping.vercel.app/#website',
        url: 'https://fbt-shopping.vercel.app',
        name: 'FBT Shopping',
        description:
          'Premium quality sarees, lehengas, and designer dresses online. Shop the latest ethnic wear collection from FBT Shopping Nellore.',
        publisher: { '@id': 'https://fbt-shopping.vercel.app/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://fbt-shopping.vercel.app/?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Store',
        '@id': 'https://fbt-shopping.vercel.app/#store',
        name: 'FBT Shopping',
        image: 'https://fbt-shopping.vercel.app/logo.png',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Nellore',
          addressRegion: 'Andhra Pradesh',
          postalCode: '524001',
          addressCountry: 'IN',
        },
        priceRange: '₹₹',
        currenciesAccepted: 'INR',
        paymentAccepted: 'Cash, UPI, Online Transfer',
        openingHours: 'Mo-Su 09:00-21:00',
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 14.4426,
          longitude: 79.9865,
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}
