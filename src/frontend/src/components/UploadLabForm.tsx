"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

export function UploadLabForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus("uploading");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8089/api/v1/labs/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("File uploaded successfully! Extraction is processing.");
        // In a real app, we would poll the status endpoint here
      } else {
        setStatus("error");
        setMessage(data.detail || "Upload failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error connecting to the server.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Lab Report</CardTitle>
        <CardDescription>Upload a PDF of your blood work or hormone panel to extract the biomarkers.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-4">
            <Input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <Button onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? "Uploading..." : <><UploadCloud className="mr-2 h-4 w-4" /> Upload</>}
            </Button>
          </div>
          
          {status === "success" && (
            <div className="flex items-center text-sm text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {message}
            </div>
          )}
          
          {status === "error" && (
            <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="mr-2 h-4 w-4" />
              {message}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
