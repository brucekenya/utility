
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerInfo, BillInfo, generateBill } from "@/utils/billGenerator";
import { companyInfo } from "@/assets/logos";
import { toast } from "sonner";

interface BillFormProps {
  onGenerateBill: (customerInfo: CustomerInfo, billType: "water" | "electricity", usageAmount: number) => void;
}

const BillForm = ({ onGenerateBill }: BillFormProps) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    accountNumber: "",
  });

  const [billType, setBillType] = useState<"water" | "electricity">("water");
  const [usageAmount, setUsageAmount] = useState<number>(100);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBillTypeChange = (value: string) => {
    setBillType(value as "water" | "electricity");
    // Set default usage amounts based on bill type
    setUsageAmount(value === "water" ? 100 : 500);
  };

  const handleGenerateBill = () => {
    // Validate form
    const requiredFields = ["name", "address", "city", "state", "zip"];
    const missingFields = requiredFields.filter(field => !customerInfo[field as keyof CustomerInfo]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    // Generate account number if not provided
    if (!customerInfo.accountNumber) {
      const randomAccount = Math.floor(Math.random() * 10000000000).toString().padStart(10, "0");
      setCustomerInfo(prev => ({ ...prev, accountNumber: randomAccount }));
    }

    // Pass data to parent component
    onGenerateBill(customerInfo, billType, usageAmount);
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Bill Type</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billType">Utility Type</Label>
                <Select value={billType} onValueChange={handleBillTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bill type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="water">Water Bill</SelectItem>
                      <SelectItem value="electricity">Electricity Bill</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="usageAmount">
                  {billType === "water" ? "Water Usage (gallons)" : "Electricity Usage (kWh)"}
                </Label>
                <Input
                  id="usageAmount"
                  type="number"
                  value={usageAmount}
                  onChange={(e) => setUsageAmount(parseInt(e.target.value) || 0)}
                  min={1}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={customerInfo.accountNumber}
                  onChange={handleChange}
                  placeholder="Will be generated if empty"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={customerInfo.address}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={customerInfo.city}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={customerInfo.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code *</Label>
                  <Input
                    id="zip"
                    name="zip"
                    value={customerInfo.zip}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleGenerateBill}>Generate Bill</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BillForm;
