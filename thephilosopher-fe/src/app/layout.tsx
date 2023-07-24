import QueryClientProviderRegistration from '@/utils/query-provider'
import './globals.css'
import type { Metadata } from 'next'
import Image from 'next/image'
import { Nanum_Myeongjo } from "next/font/google"
import cn from 'classnames'

const nanum = Nanum_Myeongjo({ weight: "400", subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Philosophos'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn(nanum.className)}>
        <QueryClientProviderRegistration>

          <main className="flex flex-col min-h-screen h-screen items-center justify-between p-5 overflow-hidden">
            <div className="relative flex place-items-center">
              <Image
                className="relative"
                src="/the_philosopher_logo.png"
                alt="The Philosopher"
                width={240}
                height={240}
                priority
              />
            </div>
            {children}
          </main>
        </QueryClientProviderRegistration>
      </body>
    </html>
  )
}
