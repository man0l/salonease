import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BeforeAfterSlider from '../BeforeAfterSlider';

const Homepage = () => {
  const { t } = useTranslation(['pages', 'common']);
  const [openFAQ, setOpenFAQ] = useState(0);

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
                {t('pages:homepage.hero.title.part1')}<br/>
                {t('pages:homepage.hero.title.part2')}<br/>
                <span className="bg-gradient-text bg-clip-text text-transparent">
                  {t('pages:homepage.hero.title.part3')}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t('pages:homepage.hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/register" 
                  className="inline-flex flex-col items-center justify-center bg-gradient-accent hover:opacity-90 text-white px-8 py-3 rounded-full text-lg font-semibold transition duration-300 shadow-glow-primary">
                  <span className="font-bold">{t('pages:homepage.hero.cta.primary')}</span>
                  <span className="text-sm font-normal opacity-90">{t('pages:homepage.hero.cta.trial_note')}</span>
                </Link>                
              </div>

              {/* 24/7 Support Info */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">                         
                {t('pages:homepage.hero.features')}
              </div>

            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-100/50 to-primary-200/50 rounded-full blur-3xl"></div>
              <div className="absolute -left-16 top-1/2 w-32 h-full transform -translate-y-1/2">
                
              </div>

              <div className="relative">
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 z-20">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-600">{t('pages:homepage.revenue_card.title')}</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{t('pages:homepage.revenue_card.amount')}</p>
                  <p className="text-sm text-green-600 mt-1">{t('pages:homepage.revenue_card.trend')}</p>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-3 z-10 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full overflow-hidden">
                    <img src="https://placehold.co/100x100" alt="Client avatar" className="w-full h-full object-cover"/>
                  </div>
                  <div>
                    <p className="font-semibold">Maria Ivanova</p>
                    <p className="text-sm text-gray-500">Client since 2023</p>
                  </div>
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center ml-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>

                <div className="rounded-full overflow-hidden aspect-square bg-gradient-primary p-1 max-w-[500px] mx-auto">
                  <img
                    src="/images/hero-section-hair.jpg"
                    alt="Salon professional at work"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 w-full">
          <svg viewBox="0 0 1440 100" className="w-full h-24">
            <path 
              d="M0,0 Q720,100 1440,0 L1440,100 L0,100 Z" 
              className="fill-[#fae8ff] opacity-50"
              stroke="none"
            />
          </svg>
        </div>
      </div>

      {/* Problem Section */}
      <div className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              {t('pages:homepage.client_showcase.running_salon_title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('pages:homepage.client_showcase.running_salon_description')}
            </p>
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                {t('pages:homepage.transformation.title')}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600 inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{t('pages:homepage.features.save_time.title')}</h3>
                    <p className="text-gray-600">{t('pages:homepage.features.save_time.description')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600 inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{t('pages:homepage.features.grow_business.title')}</h3>
                    <p className="text-gray-600">{t('pages:homepage.features.grow_business.description')}</p>
                  </div>
                </div>
                {/* Add other solution items */}
              </div>
            </div>
            <div className="relative">
              <div className="relative">
                <BeforeAfterSlider />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('pages:homepage.transformation.smart_booking.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{t('pages:homepage.transformation.smart_booking.title')}</h3>
              <p className="text-gray-600">{t('pages:homepage.transformation.smart_booking.description')}</p>
            </div>

            {/* Second Feature Card */}
            <div className="text-center">
              <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{t('pages:homepage.transformation.client_management.title')}</h3>
              <p className="text-gray-600">{t('pages:homepage.transformation.client_management.description')}</p>
            </div>

            {/* Third Feature Card */}
            <div className="text-center">
              <div className="bg-primary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">{t('pages:homepage.transformation.business_analytics.title')}</h3>
              <p className="text-gray-600">{t('pages:homepage.transformation.business_analytics.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Before/After Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('pages:homepage.comparison.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('pages:homepage.comparison.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Before Column */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-red-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-8 h-8 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('pages:homepage.comparison.before.title')}
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-red-500 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <span className="font-semibold text-gray-900">{t('pages:homepage.comparison.before.items.booking.title')}</span>
                    <p className="text-gray-600">{t('pages:homepage.comparison.before.items.booking.description')}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-red-500 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <span className="font-semibold text-gray-900">{t('pages:homepage.comparison.before.items.client_info.title')}</span>
                    <p className="text-gray-600">{t('pages:homepage.comparison.before.items.client_info.description')}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-red-500 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <div>
                    <span className="font-semibold text-gray-900">{t('pages:homepage.comparison.before.items.revenue.title')}</span>
                    <p className="text-gray-600">{t('pages:homepage.comparison.before.items.revenue.description')}</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* After Column */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-green-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-8 h-8 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {t('pages:homepage.comparison.after.title')}
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <span className="font-semibold text-gray-900">{t('pages:homepage.comparison.after.items.booking.title')}</span>
                    <p className="text-gray-600">{t('pages:homepage.comparison.after.items.booking.description')}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <span className="font-semibold text-gray-900">{t('pages:homepage.comparison.after.items.client_info.title')}</span>
                    <p className="text-gray-600">{t('pages:homepage.comparison.after.items.client_info.description')}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <span className="font-semibold text-gray-900">{t('pages:homepage.comparison.after.items.follow_up.title')}</span>
                    <p className="text-gray-600">{t('pages:homepage.comparison.after.items.follow_up.description')}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Steps to Success Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('pages:homepage.success_path.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('pages:homepage.success_path.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative p-8 bg-white rounded-2xl shadow-lg border border-primary-100">
              <div className="absolute -top-5 left-8 bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4 mb-4">
                {t('pages:homepage.success_path.steps.step1.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('pages:homepage.success_path.steps.step1.description')}
              </p>
              <p className="text-primary-600 font-semibold">
                {t('pages:homepage.success_path.steps.step1.cta')}
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 bg-white rounded-2xl shadow-lg border border-primary-100">
              <div className="absolute -top-5 left-8 bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4 mb-4">
                {t('pages:homepage.success_path.steps.step2.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('pages:homepage.success_path.steps.step2.description')}
              </p>
              <p className="text-primary-600 font-semibold">
                {t('pages:homepage.success_path.steps.step2.cta')}
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 bg-white rounded-2xl shadow-lg border border-primary-100">
              <div className="absolute -top-5 left-8 bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mt-4 mb-4">
                {t('pages:homepage.success_path.steps.step3.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('pages:homepage.success_path.steps.step3.description')}
              </p>
              <p className="text-primary-600 font-semibold">
                {t('pages:homepage.success_path.steps.step3.cta')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
            {t('pages:homepage.testimonials.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <img 
                src="/images/testimonials.webp" 
                alt="Client testimonial" 
                className="w-full h-auto rounded-lg"
              />
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <img 
                src="/images/testimonials2.webp" 
                alt="Client testimonial" 
                className="w-full h-auto rounded-lg"
              />
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <img 
                src="/images/testimonials3.webp" 
                alt="Client testimonial" 
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('pages:homepage.faq.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('pages:homepage.faq.subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {Object.entries(t('pages:homepage.faq.questions', { returnObjects: true })).map(([key, question]) => (
              <div key={key} className="bg-white rounded-2xl shadow-lg border border-gray-100">
                <button 
                  className="w-full text-left px-8 py-6 focus:outline-none"
                  onClick={() => setOpenFAQ(openFAQ === key ? null : key)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {question.question}
                    </h3>
                    <svg 
                      className={`w-6 h-6 text-gray-500 transform transition-transform duration-200 ${openFAQ === key ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {openFAQ === key && (
                    <div className="mt-4 text-gray-600">
                      {question.answer && <p className="mb-4">{question.answer}</p>}
                      
                      {/* Render business list for salon types */}
                      {key === 'salon_types' && question.businesses && (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {question.businesses.map((business, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-5 h-5 text-primary-600 mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{business}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Render pricing information */}
                      {key === 'pricing' && question.salon_pricing && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">{question.salon_pricing.title}</h4>
                            <ul className="space-y-2">
                              {question.salon_pricing.tiers.map((tier, index) => (
                                <li key={index} className="flex items-start">
                                  <svg className="w-5 h-5 text-primary-600 mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>{tier}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">{question.booking_pricing.title}</h4>
                            <ul className="space-y-2">
                              {question.booking_pricing.tiers.map((tier, index) => (
                                <li key={index} className="flex items-start">
                                  <svg className="w-5 h-5 text-primary-600 mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>{tier}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Render feature list for features */}
                      {key === 'features' && question.key_features && (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {question.key_features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <svg className="w-5 h-5 text-primary-600 mr-2 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Irresistible Offer Section */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Offer Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-primary-700 text-white rounded-full text-sm font-semibold mb-4">
              {t('pages:homepage.offer.limited_time')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('pages:homepage.offer.start_transformation')}
            </h2>
            <p className="text-xl text-gray-200 mb-4">
              {t('pages:homepage.offer.trial_info')}
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-200">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span>{t('pages:homepage.offer.money_back')}</span>
            </div>
          </div>

          {/* Offer Box */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
            <div className="space-y-8">
              {/* Core Features */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('pages:homepage.offer.features_title')}
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span className="font-semibold text-gray-900">{t('pages:homepage.offer.core_features.all_features.title')}</span>
                      <p className="text-gray-600">{t('pages:homepage.offer.core_features.all_features.description')}</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-3 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <span className="font-semibold text-gray-900">{t('pages:homepage.offer.core_features.onboarding.title')}</span>
                      <p className="text-gray-600">{t('pages:homepage.offer.core_features.onboarding.description')}</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Bonus Features */}
              <div className="bg-primary-50 rounded-xl p-6">
                <h4 className="text-xl font-bold text-primary-900 mb-4">
                  {t('pages:homepage.bonuses.title')}
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-primary-600 mr-2">👥</span>
                    <span className="text-gray-700">{t('pages:homepage.bonuses.items.guide')}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary-600 mr-2">👥</span>
                    <span className="text-gray-700">{t('pages:homepage.bonuses.items.community')}</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary-600 mr-2">🎯</span>
                    <span className="text-gray-700">{t('pages:homepage.bonuses.items.strategy')}</span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{t('pages:homepage.guarantee.title')}</h4>
                <p className="text-gray-600">{t('pages:homepage.guarantee.description')}</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link to="/register" className="inline-block bg-white text-primary-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-yellow-100 transition duration-300 transform hover:scale-105">
              {t('pages:homepage.final_cta.button')}
              <span className="block text-sm font-normal">{t('pages:homepage.final_cta.trial_note')}</span>
            </Link>
            <p className="text-gray-200 mt-4">
              {t('pages:homepage.final_cta.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Social Proof Bar */}
      <div className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center text-center">
            <div>
              <h4 className="text-3xl font-bold text-primary-600">
                {t('pages:homepage.social_proof.active_salons.number')}
              </h4>
              <p className="text-gray-600">
                {t('pages:homepage.social_proof.active_salons.label')}
              </p>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-primary-600">
                {t('pages:homepage.social_proof.satisfaction.number')}
              </h4>
              <p className="text-gray-600">
                {t('pages:homepage.social_proof.satisfaction.label')}
              </p>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-primary-600">
                {t('pages:homepage.social_proof.time_saved.number')}
              </h4>
              <p className="text-gray-600">
                {t('pages:homepage.social_proof.time_saved.label')}
              </p>
            </div>
            <div>
              <h4 className="text-3xl font-bold text-primary-600">
                {t('pages:homepage.social_proof.revenue.number')}
              </h4>
              <p className="text-gray-600">
                {t('pages:homepage.social_proof.revenue.label')}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Homepage;