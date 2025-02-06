'use client'

import { Amplify } from 'aws-amplify'
import { Authenticator } from '@aws-amplify/ui-react'
import outputs from "@/amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css'

Amplify.configure(outputs)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Authenticator hideSignUp>
          {({ signOut, user }) => (
            <main>
              {children}
            </main>
            
          )}
        </Authenticator>
      </body>
    </html>
  )
}