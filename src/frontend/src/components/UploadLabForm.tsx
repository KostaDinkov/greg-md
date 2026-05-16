"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export function UploadLabForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [reportId, setReportId] = useState<number | null>(null);

  // Poll status endpoint after upload
  useEffect(() => {
    if (reportId === null || status === "success" || status === "error") {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/labs/${reportId}/status`);
        const data = await response.json();

        if (data.status === "complete") {
          setStatus("success");
          setMessage("Lab report extracted successfully! View your results below.");
          setReportId(null);
          // Trigger a page refresh or results reload
          window.dispatchEvent(new Event("lab-results-updated"));
        } else if (data.status === "failed") {
          setStatus("error");
          setMessage(data.error_message || "Extraction failed. Please try again.");
          setReportId(null);
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [reportId, status]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/labs/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("processing");
        setMessage("File uploaded successfully! Extracting lab results...");
        setReportId(data.report_id);
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
        <CardDescription>
          Upload a PDF of your blood work or hormone panel to extract the biomarkers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isUploading || status === "processing"}
              aria-label="Upload lab report PDF file"
              id="lab-report-upload"
            />
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading || status === "processing"}
            >
              {isUploading ? (
                "Uploading..."
              ) : status === "processing" ? (
                "Processing..."
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload
                </>
              )}
            </Button>
          </div>

          {(status === "success" || status === "processing") && (
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
