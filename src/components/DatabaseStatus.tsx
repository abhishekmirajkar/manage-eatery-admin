
import React, { useState } from "react";
import { useDatabase } from "@/contexts/DatabaseContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatabaseIcon, AlertCircle, RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const DatabaseStatus: React.FC = () => {
  const { isConnected, connectionError, reconnect, dbConfig } = useDatabase();
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    await reconnect();
    setIsReconnecting(false);
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <DatabaseIcon className="h-4 w-4" />
              {isConnected ? (
                <Badge variant="success">Connected</Badge>
              ) : (
                <Badge variant="destructive">Disconnected</Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              <p>Database connection: {isConnected ? "Active" : "Inactive"}</p>
              <p>Host: {dbConfig.host}:{dbConfig.port}</p>
              <p>Database: {dbConfig.database}</p>
              {connectionError && (
                <div className="flex items-center text-destructive gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{connectionError}</span>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {!isConnected && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReconnect}
          disabled={isReconnecting}
        >
          <RefreshCw className={`h-3 w-3 ${isReconnecting ? "animate-spin" : ""}`} />
          <span className="ml-1">{isReconnecting ? "Connecting..." : "Reconnect"}</span>
        </Button>
      )}
    </div>
  );
};

export default DatabaseStatus;
