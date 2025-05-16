import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'SWU Tournament Dashboard',
    template: '%s | SWU Tournament Dashboard',
  },
  description: 'Track tournament results, player statistics, and match outcomes for Star Wars: Unlimited tournaments.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <header className="border-b">
            <div className="container mx-auto py-4 px-4">
              <nav className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link href="/" className="text-xl font-bold">
                    SWU Dashboard
                  </Link>
                </div>
                <div className="flex items-center space-x-6">
                  <Link href="/tournaments" className="hover:text-blue-600">
                    Tournaments
                  </Link>
                  <Link href="/players" className="hover:text-blue-600">
                    Players
                  </Link>
                  <Link href="/leaderboard" className="hover:text-blue-600">
                    Leaderboard
                  </Link>
                  <Link href="/stats" className="hover:text-blue-600">
                    Statistics
                  </Link>
                </div>
              </nav>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="border-t py-6">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()} SWU Tournament Dashboard
                </p>
                <div className="flex space-x-4 mt-4 md:mt-0">
                  <Link href="/" className="text-sm text-muted-foreground hover:text-blue-600">
                    Home
                  </Link>
                  <Link href="/tournaments" className="text-sm text-muted-foreground hover:text-blue-600">
                    Tournaments
                  </Link>
                  <Link href="/players" className="text-sm text-muted-foreground hover:text-blue-600">
                    Players
                  </Link>
                  <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-blue-600">
                    Leaderboard
                  </Link>
                  <Link href="/stats" className="text-sm text-muted-foreground hover:text-blue-600">
                    Statistics
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
} 