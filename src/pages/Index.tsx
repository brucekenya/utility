
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import BillForm from "@/components/BillForm";
import BillPreview from "@/components/BillPreview";
import { CustomerInfo, BillData, generateBill } from "@/utils/billGenerator";
import { companyInfo } from "@/assets/logos";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("form");
  const [billData, setBillData] = useState<BillData | null>(null);

  const handleGenerateBill = (
    customerInfo: CustomerInfo,
    billType: "water" | "electricity",
    usageAmount: number
  ) => {
    try {
      // Generate the bill data
      const generatedBill = generateBill(customerInfo, billType, usageAmount);
      
      // Add company info
      generatedBill.company = companyInfo[billType];
      
      // Update state
      setBillData(generatedBill);
      setActiveTab("preview");
      
      toast.success(`${billType.charAt(0).toUpperCase() + billType.slice(1)} bill generated successfully!`);
    } catch (error) {
      console.error("Error generating bill:", error);
      toast.error("Failed to generate bill. Please try again.");
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Utility Bill Generator</h1>
            <p className="text-muted-foreground">
              Create professional water or electricity bills for proof of address
            </p>
          </div>
          <Link to="/admin/login">
            <Button variant="outline" className="flex items-center gap-2">
              <ShieldCheck size={16} />
              Admin Login
            </Button>
          </Link>
        </div>

        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Bill Information</TabsTrigger>
            <TabsTrigger value="preview" disabled={!billData}>
              Preview & Download
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="mt-6">
            <BillForm onGenerateBill={handleGenerateBill} />
          </TabsContent>
          
          <TabsContent value="preview" className="mt-6">
            {billData ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={() => setActiveTab("form")}>
                    Edit Bill Information
                  </Button>
                </div>
                <BillPreview billData={billData} />
              </div>
            ) : (
              <div className="text-center py-12">
                <p>Generate a bill first to see the preview</p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("form")} 
                  className="mt-4"
                >
                  Go to Bill Form
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
