
import emailjs from '@emailjs/browser';

// EmailJS configuration - these would normally be environment variables
// For demo purposes, you'll need to replace these with your actual EmailJS credentials
const EMAIL_CONFIG = {
  serviceId: 'your_service_id', // Replace with your EmailJS service ID
  templateId: 'your_template_id', // Replace with your EmailJS template ID
  publicKey: 'your_public_key' // Replace with your EmailJS public key
};

export const sendBookingConfirmation = async (bookingData: {
  name: string;
  email: string;
  phone: string;
  services: string[];
  date: string;
  time: string;
  carMake: string;
  carModel: string;
  carYear: string;
  licensePlate: string;
  amount: string;
  bookingId: string;
}) => {
  try {
    const templateParams = {
      to_email: bookingData.email,
      to_name: bookingData.name,
      booking_id: bookingData.bookingId,
      services: bookingData.services.join(', '),
      booking_date: bookingData.date,
      booking_time: bookingData.time,
      car_details: `${bookingData.carYear} ${bookingData.carMake} ${bookingData.carModel}`,
      license_plate: bookingData.licensePlate,
      total_amount: bookingData.amount,
      phone: bookingData.phone,
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      templateParams,
      EMAIL_CONFIG.publicKey
    );

    console.log('Email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};

export const sendInvoiceEmail = async (invoiceData: {
  customerName: string;
  email: string;
  invoiceNumber: string;
  amount: string;
  services: string[];
  date: string;
}) => {
  try {
    const templateParams = {
      to_email: invoiceData.email,
      to_name: invoiceData.customerName,
      invoice_number: invoiceData.invoiceNumber,
      services: invoiceData.services.join(', '),
      invoice_date: invoiceData.date,
      total_amount: invoiceData.amount,
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      'invoice_template_id', // You'll need a separate template for invoices
      templateParams,
      EMAIL_CONFIG.publicKey
    );

    console.log('Invoice email sent successfully:', response);
    return { success: true, response };
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    return { success: false, error };
  }
};
