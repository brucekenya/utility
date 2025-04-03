
import { formatCurrency } from "@/utils/billGenerator";

interface BillSummaryProps {
  previousBalance: number;
  currentCharges: number;
  totalDue: number;
}

const BillSummary = ({ previousBalance, currentCharges, totalDue }: BillSummaryProps) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md">
      <h3 className="font-semibold mb-2">Bill Summary</h3>
      <div className="flex justify-between mb-2">
        <span>Previous Balance</span>
        <span className="font-medium">{formatCurrency(previousBalance)}</span>
      </div>
      <div className="flex justify-between mb-2 border-b pb-2 border-gray-300">
        <span className="font-medium">Current Charges</span>
        <span className="font-bold text-black text-lg">{formatCurrency(currentCharges)}</span>
      </div>
      <div className="flex justify-between pt-1 mt-1">
        <span className="font-bold">Total Amount Due</span>
        <span className="text-xl font-bold text-black">{formatCurrency(totalDue)}</span>
      </div>
    </div>
  );
};

export default BillSummary;
