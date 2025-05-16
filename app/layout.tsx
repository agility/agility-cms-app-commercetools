import classNames from 'classnames'
import './globals.css'
import "@agility/plenum-ui/lib/tailwind.css"
import { Mulish } from 'next/font/google'

const mulish = Mulish({ subsets: ["latin"] })

export const metadata = {
  title: 'Agility CMS commercetools App',
  description: 'Connect your commercetools store to Agility CMS',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='h-full bg-white'>
      <body className={classNames(mulish.className, "bg-white h-full text-black")} >{children}</body>
    </html>
  )
}
