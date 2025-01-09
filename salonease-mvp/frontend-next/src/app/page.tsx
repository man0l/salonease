import Link from 'next/link'
import Image from 'next/image'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'

export default function Homepage() {
  return (
    <div className="min-h-screen bg-gradient-light">      
      {/* Hero Section */}
      <div className="relative pt-16 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left relative z-10">
              <div className="absolute -bottom-16 right-0 w-64 h-24">
                <svg viewBox="0 0 400 100" className="w-full h-full">
                  <path 
                    d="M0,50 Q100,100 200,50 T400,50" 
                    className="fill-[#f5d0fe] opacity-30"
                    stroke="none"
                  />
                </svg>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Transform Your Salon<br/>
                Management with<br/>
                <span className="bg-gradient-text bg-clip-text text-transparent">
                  SalonEase
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Streamline your salon operations with our all-in-one management solution
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/register" 
                  className="inline-flex flex-col items-center justify-center bg-gradient-accent hover:opacity-90 text-white px-8 py-3 rounded-full text-lg font-semibold transition duration-300 shadow-glow-primary">
                  <span className="font-bold">Start Free Trial</span>
                  <span className="text-sm font-normal opacity-90">No credit card required</span>
                </Link>                
              </div>

              {/* 24/7 Support Info */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">                         
                24/7 Support • Easy Setup • Secure Platform
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-100/50 to-primary-200/50 rounded-full blur-3xl"></div>
              <div className="absolute -left-16 top-1/2 w-32 h-full transform -translate-y-1/2"></div>

              <div className="relative">
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-20">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">$12,500</p>
                  <p className="text-sm text-green-600 mt-1">↑ 12% from last month</p>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-3 z-10 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full overflow-hidden relative">
                    <Image
                      src="https://placehold.co/100x100"
                      alt="Client Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">
                      Client since 2023
                    </p>
                  </div>
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center ml-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>

                <div className="rounded-full overflow-hidden aspect-square bg-gradient-primary p-1 max-w-[500px] mx-auto relative">
                  <Image
                    src="/images/hero-section-hair.jpg"
                    alt="Salon professional at work"
                    fill
                    className="object-cover rounded-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
