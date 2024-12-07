import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { bg, enUS } from 'date-fns/locale';
import { FaFileInvoiceDollar, FaDownload } from 'react-icons/fa';
import { billingApi } from '../../utils/api';
import { formatCurrency } from '../../utils/currencyFormatter';

const InvoiceList = ({ salonId }) => {
  const { t, i18n } = useTranslation(['billing']);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the appropriate locale based on current language
  const getLocale = () => {
    return i18n.language.startsWith('bg') ? bg : enUS;
  };

  // Format date with localization
  const formatDate = (timestamp) => {
    return format(new Date(timestamp * 1000), 'PPP', {
      locale: getLocale()
    });
  };

  useEffect(() => {
    let mounted = true;

    const fetchInvoices = async () => {
      if (!salonId) return;
      
      try {
        setLoading(true);
        const response = await billingApi.getInvoices(salonId);
        if (mounted) {
          setInvoices(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchInvoices();

    return () => {
      mounted = false;
    };
  }, [salonId]);

  const downloadInvoice = async (invoice) => {
    try {
      // Open invoice PDF URL in new tab
      window.open(invoice.invoice_pdf, '_blank');
    } catch (error) {
      console.error('Failed to open invoice:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          {t('billing:invoices.title')}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('billing:invoices.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('billing:invoices.amount')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('billing:invoices.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('billing:invoices.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(invoice.created)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(invoice.amount_due / 100)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${invoice.status === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {t(`billing:invoices.status_${invoice.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={() => downloadInvoice(invoice)}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    <FaDownload className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList; 