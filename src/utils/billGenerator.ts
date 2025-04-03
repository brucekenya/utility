
import { format } from "date-fns";

export interface CustomerInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  accountNumber: string;
}

export interface BillInfo {
  type: "water" | "electricity";
  amount: number;
  usageAmount: number;
  billDate: Date;
  dueDate: Date;
  billNumber: string;
  previousBalance: number;
  totalDue: number;
  vat: number;
  taxLevy: number;
  subTotal: number;
  ercLevy?: number;
  repLevy?: number;
  sewageCharges?: number;
  serviceCharge?: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
}

export interface BillData {
  customer: CustomerInfo;
  bill: BillInfo;
  company: CompanyInfo;
}

export const generateBill = (
  customer: CustomerInfo,
  billType: "water" | "electricity",
  usageAmount: number
): BillData => {
  // Calculate the bill amount based on the usage
  const unitPrice = billType === "water" ? 120 : 24; // per gallon or kWh in KES
  const subTotal = usageAmount * unitPrice;
  
  // Add additional charges based on bill type
  let ercLevy = 0;
  let repLevy = 0;
  let sewageCharges = 0;
  let serviceCharge = 0;
  
  if (billType === "electricity") {
    ercLevy = 100; // ERC levy for electricity
    repLevy = 100; // REP levy for electricity
  } else {
    sewageCharges = 100; // Sewage charges for water
    serviceCharge = 100; // Service charge for water
  }
  
  // Calculate additional charges
  const additionalCharges = billType === "electricity" 
    ? ercLevy + repLevy 
    : sewageCharges + serviceCharge;
  
  // Apply VAT (16%) and tax levy (5%)
  const vat = subTotal * 0.16;
  const taxLevy = subTotal * 0.05;
  const amount = subTotal + vat + taxLevy + additionalCharges;
  
  // Generate a random bill number
  const billNumber = `${billType.charAt(0).toUpperCase()}${Math.floor(
    Math.random() * 10000000
  ).toString().padStart(7, "0")}`;
  
  // Set current date and due date (30 days from now)
  const billDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  
  // Generate a random previous balance (could be 0)
  const previousBalance = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * 5000);
  const totalDue = amount + previousBalance;

  // Create the bill information
  const bill: BillInfo = {
    type: billType,
    amount,
    usageAmount,
    billDate,
    dueDate,
    billNumber,
    previousBalance,
    totalDue,
    vat,
    taxLevy,
    subTotal,
    ercLevy: billType === "electricity" ? ercLevy : undefined,
    repLevy: billType === "electricity" ? repLevy : undefined,
    sewageCharges: billType === "water" ? sewageCharges : undefined,
    serviceCharge: billType === "water" ? serviceCharge : undefined,
  };
  
  return {
    customer,
    bill,
    company: {} as CompanyInfo, // This will be populated by the component
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return format(date, "MMM dd, yyyy");
};
