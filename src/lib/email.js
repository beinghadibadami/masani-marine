import emailjs from '@emailjs/browser';

/**
 * EMAILJS SETUP INSTRUCTIONS:
 * 1. Go to https://www.emailjs.com/ and create a free account.
 * 2. Add an Email Service (e.g., Gmail) and note the Service ID.
 * 3. Create an Email Template. You can use variables like {{order_id}}, {{customer_name}}, {{status}}, {{tracking_number}}. Note the Template ID.
 * 4. Get your Public Key from the Account -> API Keys section.
 * 5. Update the constants below with your actual IDs.
 * 6. (Optional) In a real app, these should ideally be in a .env file (e.g., VITE_EMAILJS_SERVICE_ID).
 */

const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID_HERE';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID_HERE';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_HERE';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export const sendOrderEmail = async (order, type = 'placed') => {
  try {
    // Determine subject and status message based on type
    let statusMsg = '';
    if (type === 'placed') {
      statusMsg = 'Your order has been placed and is currently pending.';
    } else if (type === 'shipped') {
      statusMsg = `Your order has been shipped! Tracking Number: ${order.tracking_number || 'N/A'}`;
    } else if (type === 'delivered') {
      statusMsg = 'Your order has been delivered.';
    }

    const templateParams = {
      to_email: order.user_email || order.shipping_address?.email || 'customer@example.com', // You might need to capture email during checkout or fetch from user profile
      customer_name: order.shipping_address?.name || 'Customer',
      order_id: order.id,
      status_message: statusMsg,
      total_amount: order.total ? `$${order.total.toLocaleString()}` : 'N/A',
      tracking_number: order.tracking_number || 'N/A'
    };

    // Only send if the keys are configured
    if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID_HERE') {
      console.warn('EmailJS is not configured. Skipping email send. Params would be:', templateParams);
      return false;
    }

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    
    console.log('Email sent successfully', response.status, response.text);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};
