import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      <p className="mb-4">Welcome to [COMPANY_NAME]!</p>
      <p className="mb-4">These terms and conditions outline the rules and regulations for the use of [COMPANY_NAME]'s Website, located at [WEBSITE_URL].</p>
      <p className="mb-4">By accessing this website we assume you accept these terms and conditions. Do not continue to use [WEBSITE_URL] if you do not agree to take all of the terms and conditions stated on this page.</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">Cookies</h2>
      <p className="mb-4">We employ the use of cookies. By accessing [WEBSITE_URL], you agreed to use cookies in agreement with the [COMPANY_NAME]'s Privacy Policy.</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">License</h2>
      <p className="mb-4">Unless otherwise stated, [COMPANY_NAME] and/or its licensors own the intellectual property rights for all material on [WEBSITE_URL]. All intellectual property rights are reserved. You may access this from [WEBSITE_URL] for your own personal use subjected to restrictions set in these terms and conditions.</p>
      
      <h2 className="text-2xl font-semibold mt-6 mb-4">You must not:</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Republish material from [WEBSITE_URL]</li>
        <li>Sell, rent or sub-license material from [WEBSITE_URL]</li>
        <li>Reproduce, duplicate or copy material from [WEBSITE_URL]</li>
        <li>Redistribute content from [WEBSITE_URL]</li>
      </ul>
      
      <p className="mb-4">This Agreement shall begin on the date hereof.</p>
      
      <p className="mb-4">Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. [COMPANY_NAME] does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of [COMPANY_NAME], its agents and/or affiliates. Comments reflect the views and opinions of the person who post their views and opinions.</p>
      
      <p className="mt-6">Last updated: [CURRENT_DATE]</p>
    </div>
  );
};

export default Terms;
