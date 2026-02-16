'use client';
import './globals.css'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          {children}
           <Toaster 
            position="top-right"
            richColors
            expand={false}
            duration={3000}
          />
        </Provider>
      </body>
    </html>
  )
}
