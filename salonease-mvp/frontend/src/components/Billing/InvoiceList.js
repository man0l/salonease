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

  const getLocale = () => {
    return i18n.language.startsWith('bg') ? bg : enUS;
  };

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
      window.open(invoice.invoice_pdf, '_blank');
    } catch (error) {
      console.error('Failed to open invoice:', error);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-card border border-muted">
      <div className="px-6 py-4 border-b border-muted">
        <h2 className="text-lg font-medium text-foreground">
          {t('billing:invoices.title')}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-muted">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('billing:invoices.date')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('billing:invoices.amount')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('billing:invoices.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('billing:invoices.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-muted">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-muted/50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {formatDate(invoice.created)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                  {formatCurrency(invoice.amount_due / 100)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${invoice.status === 'paid' 
                      ? 'bg-emerald-900 text-emerald-200'
                      : 'bg-amber-900 text-amber-200'
                    }`}
                  >
                    {t(`billing:invoices.status_${invoice.status}`)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => downloadInvoice(invoice)}
                    className="text-primary-400 hover:text-primary-300 transition-colors duration-200"
                    title={t('billing:invoices.download')}
                  >
                    <FaDownload className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-400 mx-auto"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {t('billing:invoices.no_invoices')}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default InvoiceList; 