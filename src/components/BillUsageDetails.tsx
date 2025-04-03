
import { BillInfo } from "@/utils/billGenerator";
import { formatCurrency } from "@/utils/billGenerator";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BillUsageDetailsProps {
  billInfo: BillInfo;
  onAmountChange: (newAmount: number) => void;
}

const BillUsageDetails = ({ billInfo, onAmountChange }: BillUsageDetailsProps) => {
  const [previousReading, setPreviousReading] = useState<number>(
    billInfo.type === "water" ? 1200 : 5000
  );
  const [currentReading, setCurrentReading] = useState<number>(
    previousReading + billInfo.usageAmount
  );
  
  const handleCurrentReadingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newReading = parseInt(e.target.value) || 0;
    setCurrentReading(newReading);
    
    // Calculate new usage amount
    const newUsage = Math.max(0, newReading - previousReading);
    
    // Calculate new amount based on usage
    const unitPrice = billInfo.type === "water" ? 120 : 24;
    const newSubTotal = newUsage * unitPrice;
    
    // Add additional charges based on bill type
    const additionalCharges = billInfo.type === "electricity"
      ? (billInfo.ercLevy || 0) + (billInfo.repLevy || 0)
      : (billInfo.sewageCharges || 0) + (billInfo.serviceCharge || 0);
      
    // Apply VAT (16%) and tax levy (5%)
    const newVat = newSubTotal * 0.16;
    const newTaxLevy = newSubTotal * 0.05;
    const newAmount = newSubTotal + newVat + newTaxLevy + additionalCharges;
    
    // Update parent component
    onAmountChange(newAmount);
  };

  return (
    <div className="mb-8">
      <h3 className="font-semibold mb-3">Usage Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="space-y-2">
          <Label htmlFor="previousReading">Previous Reading</Label>
          <Input
            id="previousReading"
            type="number"
            value={previousReading}
            onChange={(e) => setPreviousReading(parseInt(e.target.value) || 0)}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentReading">Current Reading</Label>
          <Input
            id="currentReading"
            type="number"
            value={currentReading}
            onChange={handleCurrentReadingChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="consumption">Consumption</Label>
          <Input
            id="consumption"
            type="number"
            value={currentReading - previousReading}
            readOnly
            className="bg-gray-50"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="bill-table w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 border border-gray-200">Description</th>
              <th className="text-left p-2 border border-gray-200">Usage</th>
              <th className="text-left p-2 border border-gray-200">Rate</th>
              <th className="text-right p-2 border border-gray-200">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border border-gray-200">
                {billInfo.type === "water" ? "Water" : "Electricity"} Usage
              </td>
              <td className="p-2 border border-gray-200">
                {currentReading - previousReading} {billInfo.type === "water" ? "gallons" : "kWh"}
              </td>
              <td className="p-2 border border-gray-200">
                {billInfo.type === "water" ? "KES 120 per gallon" : "KES 24 per kWh"}
              </td>
              <td className="text-right p-2 border border-gray-200 font-medium">
                {formatCurrency((currentReading - previousReading) * (billInfo.type === "water" ? 120 : 24))}
              </td>
            </tr>
            
            {billInfo.type === "electricity" ? (
              <>
                {billInfo.ercLevy && (
                  <tr>
                    <td className="p-2 border border-gray-200">ERC Levy</td>
                    <td className="p-2 border border-gray-200"></td>
                    <td className="p-2 border border-gray-200"></td>
                    <td className="text-right p-2 border border-gray-200">{formatCurrency(billInfo.ercLevy)}</td>
                  </tr>
                )}
                {billInfo.repLevy && (
                  <tr>
                    <td className="p-2 border border-gray-200">REP Levy</td>
                    <td className="p-2 border border-gray-200"></td>
                    <td className="p-2 border border-gray-200"></td>
                    <td className="text-right p-2 border border-gray-200">{formatCurrency(billInfo.repLevy)}</td>
                  </tr>
                )}
              </>
            ) : (
              <>
                {billInfo.sewageCharges && (
                  <tr>
                    <td className="p-2 border border-gray-200">Sewage Charges</td>
                    <td className="p-2 border border-gray-200"></td>
                    <td className="p-2 border border-gray-200"></td>
                    <td className="text-right p-2 border border-gray-200">{formatCurrency(billInfo.sewageCharges)}</td>
                  </tr>
                )}
                {billInfo.serviceCharge && (
                  <tr>
                    <td className="p-2 border border-gray-200">Service Charge</td>
                    <td className="p-2 border border-gray-200"></td>
                    <td className="p-2 border border-gray-200"></td>
                    <td className="text-right p-2 border border-gray-200">{formatCurrency(billInfo.serviceCharge)}</td>
                  </tr>
                )}
              </>
            )}
            
            <tr>
              <td className="p-2 border border-gray-200">VAT (16%)</td>
              <td className="p-2 border border-gray-200"></td>
              <td className="p-2 border border-gray-200"></td>
              <td className="text-right p-2 border border-gray-200">
                {formatCurrency((currentReading - previousReading) * (billInfo.type === "water" ? 120 : 24) * 0.16)}
              </td>
            </tr>
            <tr>
              <td className="p-2 border border-gray-200">Tax Levy (5%)</td>
              <td className="p-2 border border-gray-200"></td>
              <td className="p-2 border border-gray-200"></td>
              <td className="text-right p-2 border border-gray-200">
                {formatCurrency((currentReading - previousReading) * (billInfo.type === "water" ? 120 : 24) * 0.05)}
              </td>
            </tr>
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="p-2 border border-gray-200 font-semibold">Total</td>
              <td className="text-right p-2 border border-gray-200 font-semibold text-black">
                {formatCurrency(billInfo.amount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default BillUsageDetails;
