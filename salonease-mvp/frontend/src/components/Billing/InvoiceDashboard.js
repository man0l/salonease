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
      console.log('Subscription Data:', subData.data);
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
    return <div className="text-center py-8">{t('billing:errors.no_salon_selected')}</div>;
  }

  if (loading) {
    return <div className="animate-pulse">{t('billing:loading')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {t('billing:title.billing')}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SubscriptionDetails 
          subscription={subscription}
          onCancelClick={() => setShowCancelModal(true)}
        />

        <UsageMetrics           
          subscription={subscription}
        />
      </div>

      <div className="mt-8">
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