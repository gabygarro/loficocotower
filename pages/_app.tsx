import '@/styles/globals.css'
import "@/styles/gradient-animation-day.css"
import "@/styles/gradient-animation-night.css"
import '@/styles/App.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
