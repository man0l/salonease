import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="text-gray-300 hover:text-primary-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BellIcon className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-800">
          {notifications.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-300">
              No new notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                {notification.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 