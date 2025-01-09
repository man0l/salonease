import React from 'react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-background">
      <div className="absolute inset-0">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary-100/20 to-transparent" />
      </div>
      <div className="relative">
        {children}
      </div>
    </div>
  )
} 