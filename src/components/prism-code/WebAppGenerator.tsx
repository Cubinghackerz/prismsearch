import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useAuth } from "@clerk/clerk-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import DeploymentDialog from "@/components/prism-code/DeploymentDialog";
import ModelSelector, { AIModel } from "@/components/prism-code/ModelSelector";

interface GeneratedApp {
  html: string;
  css: string;
  javascript: string;
  description: string;
  features: string[];
}

const WebAppGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedApp, setGeneratedApp] = useState<GeneratedApp | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeploymentDialog, setShowDeploymentDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-2.5-pro-exp-03-25');
  const [password, setPassword] = useState("");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [deploymentURL, setDeploymentURL] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { getToken } = useAuth();
  const { toast } = useToast();

  const generateWebApp = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-webapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, model: selectedModel }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate web app');
        return;
      }

      const data = await response.json();
      setGeneratedApp(data);
    } catch (e: any) {
      setError(e.message || 'Failed to generate web app');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedModel]);

  const copyToClipboard = (content: string, type: string) => {
    navigator.clipboard.writeText(content)
      .then(() => toast({
        title: `${type} Copied!`,
        description: `Successfully copied ${type} to clipboard.`,
      }))
      .catch(err => toast({
        variant: "destructive",
        title: "Copy Failed",
        description: `Failed to copy ${type}: ${err.message}`,
      }));
  };

  const downloadWebApp = () => {
    if (!generatedApp) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No web app generated yet!",
      });
      return;
    }

    const zip = new JSZip();
    zip.file("index.html", generatedApp.html);
    zip.file("style.css", generatedApp.css);
    zip.file("script.js", generatedApp.javascript);

    zip.generateAsync({ type: "blob" })
      .then(blob => {
        saveAs(blob, "webapp.zip");
      })
      .catch(err => {
        toast({
          variant: "destructive",
          title: "Download Failed",
          description: `Failed to generate zip file: ${err.message}`,
        });
      });
  };

  const deployWebApp = async () => {
    if (!generatedApp) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No web app generated yet!",
      });
      return;
    }

    setShowDeploymentDialog(true);
  };

  const handleModelChange = (model: AIModel) => {
    setSelectedModel(model);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Web App Generator</CardTitle>
          <CardDescription>
            Enter a prompt to generate a web application.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="A landing page for a SaaS product"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <ModelSelector selectedModel={selectedModel} onModelChange={handleModelChange} disabled={isGenerating} />
        </CardContent>
        <CardFooter>
          <Button disabled={isGenerating} onClick={generateWebApp}>
            {isGenerating ? "Generating..." : "Generate Web App"}
          </Button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardFooter>
      </Card>

      {generatedApp && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Web App</CardTitle>
              <CardDescription>{generatedApp.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="html">HTML</Label>
                <div className="relative">
                  <Textarea
                    id="html"
                    value={generatedApp.html}
                    readOnly
                    className="resize-none"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => copyToClipboard(generatedApp.html, "HTML")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="css">CSS</Label>
                <div className="relative">
                  <Textarea
                    id="css"
                    value={generatedApp.css}
                    readOnly
                    className="resize-none"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => copyToClipboard(generatedApp.css, "CSS")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="javascript">JavaScript</Label>
                <div className="relative">
                  <Textarea
                    id="javascript"
                    value={generatedApp.javascript}
                    readOnly
                    className="resize-none"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={() => copyToClipboard(generatedApp.javascript, "JavaScript")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={downloadWebApp}>
                Download Web App <Download className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={deployWebApp}>
                Deploy Web App <Upload className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <DeploymentDialog generatedApp={generatedApp || { html: '', css: '', javascript: '', description: '', features: [] }}>
        <Button variant="outline">
          Deploy Web App <Upload className="ml-2 h-4 w-4" />
        </Button>
      </DeploymentDialog>
    </div>
  );
};

export default WebAppGenerator;
