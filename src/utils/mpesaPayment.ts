
interface MpesaPaymentProps {
  phoneNumber: string;
  amount: number;
  description: string;
}

/**
 * Initiates an M-Pesa payment request
 * This is a simulated function since we don't have actual M-Pesa API integration
 * In a real implementation, this would call the M-Pesa API
 */
export const initiateMpesaPayment = async ({ 
  phoneNumber, 
  amount, 
  description 
}: MpesaPaymentProps): Promise<{ success: boolean; message: string; }> => {
  // Validate phone number format
  if (!isValidPhoneNumber(phoneNumber)) {
    throw new Error("Invalid phone number format. Please use format 254XXXXXXXXX");
  }
  
  // In a real implementation, this would call the M-Pesa API
  // For now, we'll simulate a successful API call with a delay
  
  console.log(`Initiating payment: ${amount} KES to phone ${phoneNumber} for ${description}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate a random access code and simulate sending it via SMS
  // In a real implementation, this would use an SMS API
  const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  console.log(`Payment processed successfully. Access code ${accessCode} sent via SMS to ${phoneNumber}`);
  
  return {
    success: true,
    message: "We are validating your payment. An access code will be sent to your phone via SMS shortly."
  };
};

/**
 * Validates a Kenyan phone number format
 * Valid formats: 254XXXXXXXXX (12 digits total, starting with 254)
 */
const isValidPhoneNumber = (phoneNumber: string): boolean => {
  // Basic validation - adjust based on specific requirements
  const kenyanPhoneRegex = /^254[7|1][0-9]{8}$/;
  return kenyanPhoneRegex.test(phoneNumber);
};
