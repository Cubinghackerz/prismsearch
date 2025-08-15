
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, AlertTriangle } from "lucide-react";

interface WebAppPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WebAppPasswordDialog = ({ isOpen, onClose, onSuccess }: WebAppPasswordDialogProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (password === "Apple#001") {
      onSuccess();
      setPassword("");
      setError("");
    } else {
      setError("Invalid password. Access denied.");
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-orange-500/20">
            <Lock className="w-8 h-8 text-orange-400" />
          </div>
          <DialogTitle className="text-xl font-bold">Beta Access Required</DialogTitle>
          <DialogDescription className="text-prism-text-muted">
            This AI Web App Generator is a restricted beta feature. Enter the beta access password to continue.
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="border-orange-500/30 bg-orange-500/5">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-300">
            <strong>Beta Warning:</strong> This feature uses Gemini 2.5 Flash to generate web applications. 
            Generated code should be reviewed before use.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beta-password" className="text-sm font-medium">
              Beta Access Password
            </Label>
            <Input
              id="beta-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter beta password..."
              className="bg-prism-surface/20 border-prism-border"
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !password.trim()}>
              {isLoading ? "Verifying..." : "Access Beta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WebAppPasswordDialog;
