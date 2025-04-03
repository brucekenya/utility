
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useAccessCodes } from "@/hooks/useAccessCodes";
import { toast } from "sonner";
import { Copy, LogOut, RefreshCw } from "lucide-react";

const AdminPanel = () => {
  const { isAuthenticated, logout } = useAuth();
  const { accessCodes, activeAccessCode, setActiveAccessCode, regenerateCodes } = useAccessCodes();
  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => toast.success("Code copied to clipboard!"))
      .catch(() => toast.error("Failed to copy code"));
  };

  const handleRegenerateCodes = () => {
    if (window.confirm("Are you sure you want to regenerate all access codes? This will invalidate all existing codes.")) {
      regenerateCodes();
      toast.success("Access codes regenerated successfully!");
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <Button variant="outline" onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-2">
            <LogOut size={16} />
            Logout
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Access Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessCodes.map((code) => (
                      <TableRow key={code}>
                        <TableCell className="font-mono">{code}</TableCell>
                        <TableCell>
                          {code === activeAccessCode ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inactive</span>
                          )}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCopyCode(code)}
                          >
                            <Copy size={14} />
                          </Button>
                          {code !== activeAccessCode && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setActiveAccessCode(code)}
                            >
                              Set Active
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="flex justify-end">
                  <Button onClick={handleRegenerateCodes} className="flex items-center gap-2">
                    <RefreshCw size={16} />
                    Regenerate All Codes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Access Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md border">
                  <p className="text-sm text-gray-500 mb-2">Current active code:</p>
                  <p className="font-mono text-lg font-bold break-all">{activeAccessCode}</p>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>This is the code that users will need to enter to download bills.</p>
                </div>
                
                <Button 
                  onClick={() => handleCopyCode(activeAccessCode)}
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Copy size={16} />
                  Copy to clipboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
