const { User, Salon, Staff } = require('../config/db');
const { Op } = require('sequelize');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PDFDocument = require('pdfkit');
const SubscriptionService = require('../services/subscriptionService');
const subscriptionService = new SubscriptionService();

exports.getInvoices = async (req, res) => {
  try {
    const { salonId } = req.params;
    
    // Verify salon ownership/access
    const salon = await Salon.findOne({
      where: { 
        id: salonId,
        [Op.or]: [
          { ownerId: req.user.id },
          { '$staff.userId$': req.user.id }
        ]
      },
      include: [{
        model: Staff,
        as: 'staff',
        required: false
      }]
    });

    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user.stripeCustomerId) {
      return res.status(404).json({ message: 'No billing account found' });
    }

    // Fetch invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: 100,
    });

    // Transform invoice data for frontend
    const transformedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      created: invoice.created,
      amount_due: invoice.amount_due,
      status: invoice.status,
      invoice_pdf: invoice.invoice_pdf,
      period_start: invoice.period_start,
      period_end: invoice.period_end
    }));

    res.json(transformedInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ 
      message: 'Error fetching invoices', 
      error: error.message 
    });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const { salonId, invoiceId } = req.params;

    // Verify salon ownership/access
    const salon = await Salon.findOne({
      where: { 
        id: salonId,
        [Op.or]: [
          { ownerId: req.user.id },
          { '$staff.userId$': req.user.id }
        ]
      },
      include: [{
        model: Staff,
        as: 'staff',
        required: false
      }]
    });

    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    // Fetch invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId);
    
    // Stream the PDF file
    const response = await fetch(invoice.invoice_pdf);
    const pdfBuffer = await response.buffer();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ 
      message: 'Error downloading invoice', 
      error: error.message 
    });
  }
};

exports.getSubscriptionDetails = async (req, res) => {
  try {
    const { salonId } = req.params;
    
    // Verify salon ownership/access
    const salon = await Salon.findOne({
      where: { 
        id: salonId,
        [Op.or]: [
          { ownerId: req.user.id },
          { '$staff.userId$': req.user.id }
        ]
      },
      include: [{
        model: Staff,
        as: 'staff',
        required: false
      }]
    });

    if (!salon) {
      return res.status(404).json({ message: 'Salon not found' });
    }

    const subscription = await subscriptionService.getSubscriptionStatus(req.user.id);
    
    if (!subscription) {
      return res.json({
        status: 'inactive',
        message: 'No active subscription found'
      });
    }

    // Transform subscription data for frontend
    const transformedSubscription = {
      id: subscription.id,
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end,
      plan: {
        amount: subscription.items.data[0].price.unit_amount,
        interval: subscription.items.data[0].price.recurring.interval,
        currency: subscription.items.data[0].price.currency
      },      
      paymentMethod: subscription.default_payment_method ? {
        brand: subscription.default_payment_method.card.brand,
        last4: subscription.default_payment_method.card.last4,
        expiryMonth: subscription.default_payment_method.card.exp_month,
        expiryYear: subscription.default_payment_method.card.exp_year
      } : null,
      usage: subscription.usage,
      nextInvoice: subscription.nextInvoice
    };

    res.json(transformedSubscription);
  } catch (error) {
    console.error('Error fetching subscription details:', error);
    res.status(500).json({ 
      message: 'Error fetching subscription details', 
      error: error.message 
    });
  }
}; 