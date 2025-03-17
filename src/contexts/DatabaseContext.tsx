
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { connectToDatabase, dbConfig } from "@/config/database";

interface DatabaseContextType {
  isConnected: boolean;
  connectionError: string | null;
  reconnect: () => Promise<boolean>;
  dbConfig: typeof dbConfig;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connect = async () => {
    try {
      setConnectionError(null);
      const connected = await connectToDatabase();
      setIsConnected(connected);
      if (connected) {
        toast.success("Connected to database");
      } else {
        toast.error("Failed to connect to database");
        setConnectionError("Connection failed");
      }
      return connected;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setConnectionError(errorMessage);
      setIsConnected(false);
      toast.error(`Database error: ${errorMessage}`);
      return false;
    }
  };

  // Connect on initial load
  useEffect(() => {
    connect();
  }, []);

  return (
    <DatabaseContext.Provider 
      value={{ 
        isConnected, 
        connectionError, 
        reconnect: connect,
        dbConfig 
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};
