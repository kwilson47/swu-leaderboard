import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container flex h-[calc(100vh-10rem)] flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <h2 className="mt-2 text-xl">Page Not Found</h2>
      <p className="mt-4 text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/" 
        className="mt-8 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Go Back Home
      </Link>
    </div>
  )
} 