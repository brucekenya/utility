
import { createContext, useState, useContext, useEffect, ReactNode } from "react";

// Generate 10 random access codes
const generateInitialCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    // Generate a random 8-character code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
};

interface AccessCodesContextType {
  accessCodes: string[];
  activeAccessCode: string;
  setActiveAccessCode: (code: string) => void;
  validateAccessCode: (code: string) => boolean;
  regenerateCodes: () => void;
  addAccessCode: (code: string) => void;
}

const AccessCodesContext = createContext<AccessCodesContextType | undefined>(undefined);

export const AccessCodesProvider = ({ children }: { children: ReactNode }) => {
  const [accessCodes, setAccessCodes] = useState<string[]>([]);
  const [activeAccessCode, setActiveAccessCode] = useState<string>("");
  
  useEffect(() => {
    // Load saved codes or generate new ones
    const savedCodes = localStorage.getItem("accessCodes");
    const savedActiveCode = localStorage.getItem("activeAccessCode");
    
    if (savedCodes) {
      setAccessCodes(JSON.parse(savedCodes));
    } else {
      const newCodes = generateInitialCodes();
      setAccessCodes(newCodes);
      localStorage.setItem("accessCodes", JSON.stringify(newCodes));
    }
    
    if (savedActiveCode) {
      setActiveAccessCode(savedActiveCode);
    } else if (savedCodes) {
      const parsedCodes = JSON.parse(savedCodes);
      setActiveAccessCode(parsedCodes[0] || "");
      localStorage.setItem("activeAccessCode", parsedCodes[0] || "");
    }
  }, []);
  
  // Update localStorage when activeAccessCode changes
  useEffect(() => {
    if (activeAccessCode) {
      localStorage.setItem("activeAccessCode", activeAccessCode);
    }
  }, [activeAccessCode]);

  // Update localStorage when accessCodes change
  useEffect(() => {
    if (accessCodes.length > 0) {
      localStorage.setItem("accessCodes", JSON.stringify(accessCodes));
    }
  }, [accessCodes]);
  
  const regenerateCodes = () => {
    const newCodes = generateInitialCodes();
    setAccessCodes(newCodes);
    setActiveAccessCode(newCodes[0]);
    localStorage.setItem("accessCodes", JSON.stringify(newCodes));
    localStorage.setItem("activeAccessCode", newCodes[0]);
  };
  
  const validateAccessCode = (code: string): boolean => {
    if (!code) return false;
    
    // Check if the code exists in our list of valid codes or is the active code
    return code === activeAccessCode || accessCodes.includes(code);
  };
  
  const addAccessCode = (code: string) => {
    if (!code || accessCodes.includes(code)) return;
    
    setAccessCodes(prev => {
      const updatedCodes = [...prev, code];
      localStorage.setItem("accessCodes", JSON.stringify(updatedCodes));
      return updatedCodes;
    });
  };

  return (
    <AccessCodesContext.Provider 
      value={{ 
        accessCodes, 
        activeAccessCode, 
        setActiveAccessCode, 
        validateAccessCode,
        regenerateCodes,
        addAccessCode
      }}
    >
      {children}
    </AccessCodesContext.Provider>
  );
};

export const useAccessCodes = (): AccessCodesContextType => {
  const context = useContext(AccessCodesContext);
  if (context === undefined) {
    throw new Error("useAccessCodes must be used within an AccessCodesProvider");
  }
  return context;
};
