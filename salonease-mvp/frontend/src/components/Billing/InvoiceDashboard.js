import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FaCreditCard, FaFileInvoice, FaChartLine } from 'react-icons/fa';
import { billingApi } from '../../utils/api';
import { useSalonContext } from '../../contexts/SalonContext';
import SubscriptionDetails from './SubscriptionDetails';
import InvoiceList from './InvoiceList';
import UsageMetrics from './UsageMetrics';
import CancelSubscriptionModal from './CancelSubscriptionModal';

const InvoiceDashboard = () => {
  const { t } = useTranslation(['billing']);
  const { selectedSalon } = useSalonContext();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (selectedSalon?.id) {
      fetchBillingData();
    }
  }, [selectedSalon]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const subData = await billingApi.getSubscriptionDetails(selectedSalon.id);
      setSubscription(subData.data);
    } catch (error) {
      toast.error(t('billing:errors.fetch_failed'));
      console.error(t('billing:errors.fetch_failed_log'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await billingApi.cancelSubscription(selectedSalon.id);
      toast.success(t('billing:subscription.message.cancel_success'));
      fetchBillingData();
    } catch (error) {
      toast.error(t('billing:subscription.message.cancel_error'));
      console.error(t('billing:errors.cancel_failed_log'), error);
    } finally {
      setShowCancelModal(false);
    }
  };

  if (!selectedSalon) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-400">{t('billing:errors.no_salon_selected')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-950">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-100">
          {t('billing:title.billing')}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800">
          <SubscriptionDetails 
            subscription={subscription}
            onCancelClick={() => setShowCancelModal(true)}
          />
        </div>

        <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800">
          <UsageMetrics           
            subscription={subscription}
          />
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-800">
        <InvoiceList salonId={selectedSalon.id} />
      </div>

      <CancelSubscriptionModal 
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
      />
    </div>
  );
};

export default InvoiceDashboard; 