import './globals.css';

export const metadata = {
  title: 'Company Role Search',
  description: 'NZ company role search and Zoho CRM import widget',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
