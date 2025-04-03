
import { useState } from "react";
import { BillData, formatCurrency, formatDate } from "@/utils/billGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Lock, CreditCard } from "lucide-react";
import { generatePDF } from "@/utils/pdfGenerator";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAccessCodes } from "@/hooks/useAccessCodes";
import { Link } from "react-router-dom";
import BillUsageDetails from "./BillUsageDetails";
import BillSummary from "./BillSummary";
import { initiateMpesaPayment } from "@/utils/mpesaPayment";

interface BillPreviewProps {
  billData: BillData;
}

const BillPreview = ({ billData }: BillPreviewProps) => {
  const { customer, bill: initialBill, company } = billData;
  const [bill, setBill] = useState(initialBill);
  const [accessCode, setAccessCode] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { validateAccessCode } = useAccessCodes();
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isAccessCodeValid, setIsAccessCodeValid] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const handleAmountChange = (newAmount: number) => {
    setBill(prevBill => {
      const newTotalDue = newAmount + prevBill.previousBalance;
      return {
        ...prevBill,
        amount: newAmount,
        totalDue: newTotalDue
      };
    });
  };
  
  const handleAccessCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setAccessCode(code);
    setIsAccessCodeValid(validateAccessCode(code));
  };
  
  const handleDownload = () => {
    try {
      if (!isAccessCodeValid) {
        toast.error("Invalid access code. Please enter a valid code to download the bill.");
        return;
      }

      // Generate the PDF with updated bill data
      const updatedBillData = {
        ...billData,
        bill
      };
      const pdfDataUri = generatePDF(updatedBillData);
      
      // Create an invisible link to trigger the download
      const link = document.createElement("a");
      link.href = pdfDataUri;
      link.download = `${bill.type}-bill-${bill.billNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Bill downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const handleMpesaPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Format phone number if needed (remove leading 0 and add country code)
      const formattedPhone = phoneNumber.startsWith("0") 
        ? `254${phoneNumber.substring(1)}` 
        : phoneNumber;
      
      const response = await initiateMpesaPayment({
        phoneNumber: formattedPhone,
        amount: 200,
        description: "Access Code for Bill Download"
      });
      
      if (response.success) {
        setPaymentSuccess(true);
        toast.success(response.message);
      } else {
        toast.error("Payment processing failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6 bill-preview">
        <div className="bill-header flex flex-col md:flex-row justify-between items-start mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <img src={company.logo} alt={company.name} className="h-16 mr-4" />
            <div>
              <h1 className="text-xl font-bold">{company.name}</h1>
              <p className="text-sm">{company.address}</p>
              <p className="text-sm">{company.phone}</p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase">
              {bill.type} Bill
            </h2>
            <p className="text-sm">Bill #: {bill.billNumber}</p>
            <p className="text-sm">Date: {formatDate(bill.billDate)}</p>
            <p className="text-sm">Due Date: {formatDate(bill.dueDate)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-semibold mb-2">Bill To:</h3>
            <p>{customer.name}</p>
            <p>{customer.address}</p>
            <p>{customer.city}, {customer.state} {customer.zip}</p>
            <p className="mt-2">Account #: {customer.accountNumber}</p>
          </div>
          
          <BillSummary
            previousBalance={bill.previousBalance}
            currentCharges={bill.amount}
            totalDue={bill.totalDue}
          />
        </div>

        <BillUsageDetails billInfo={bill} onAmountChange={handleAmountChange} />

        <div className="bill-footer grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-8">
          <div>
            <h3 className="font-semibold mb-2">Payment Instructions</h3>
            <p className="text-sm">Please make payment to:</p>
            <p className="text-sm">{company.name}</p>
            <p className="text-sm">{company.address}</p>
            
            <p className="text-sm mt-4">
              For questions about your bill call: {company.phone}
            </p>
            <p className="text-sm">
              Or visit: {company.website}
            </p>
          </div>
          
          <div className="text-center md:text-right">
            <div className="inline-block border-2 border-dashed border-gray-300 p-4 rounded-md mb-4">
              <h4 className="font-semibold">Amount Due</h4>
              <p className="text-2xl font-bold text-black">{formatCurrency(bill.totalDue)}</p>
              <p>Due By: {formatDate(bill.dueDate)}</p>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  placeholder="Enter access code"
                  value={accessCode}
                  onChange={handleAccessCodeChange}
                  className={`md:w-3/5 ${!isAccessCodeValid && accessCode ? 'border-red-500' : ''}`}
                />
                <Button
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                  variant="outline"
                  disabled={!isAccessCodeValid}
                >
                  <Download size={18} />
                  Download PDF
                </Button>
              </div>
              {!isAccessCodeValid && accessCode && (
                <p className="text-red-500 text-xs text-left">Invalid access code</p>
              )}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="text-left mb-3">
                  <h4 className="font-medium text-sm">No access code?</h4>
                  <p className="text-xs text-gray-500 mb-2">Pay Ksh 200 via M-Pesa to receive an access code via SMS</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-2">
                  <Input
                    placeholder="Enter M-Pesa phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="md:w-3/5"
                  />
                  <Button
                    onClick={handleMpesaPayment}
                    className="flex items-center gap-2"
                    variant="default"
                    disabled={isProcessingPayment}
                  >
                    <CreditCard size={18} />
                    {isProcessingPayment ? "Processing..." : "Pay with M-Pesa"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-left">Pay to: 0791563594</p>
                
                {paymentSuccess && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 rounded-md">
                    <p className="text-sm text-yellow-600">Payment is being validated. An access code will be sent to your phone via SMS shortly.</p>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500 flex flex-col gap-2">
                <p className="flex items-center">
                  <Lock size={12} className="inline mr-1" />
                  You need a valid access code to download this bill
                </p>
                <a 
                  href="https://wa.me/message/7OFQWAKUOZROD1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-green-600 hover:text-green-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"></path>
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"></path>
                    <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z"></path>
                    <path d="M9 14a5 5 0 0 0 6 0"></path>
                  </svg>
                  Request access code via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-xs text-gray-500 mt-8">
          <p>This is a computer generated bill and does not require a signature.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillPreview;
