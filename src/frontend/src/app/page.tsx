import { UploadLabForm } from "@/components/UploadLabForm";
import { LabResultsTable } from "@/components/LabResultsTable";
import { BiomarkerChart } from "@/components/BiomarkerChart";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">GregMD Dashboard</h1>
          <p className="text-lg text-slate-500 mt-2">
            Your personal health AI agent. Upload labs to automatically extract and track your biomarkers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="md:col-span-1">
            <UploadLabForm />
          </div>

          {/* Results Section */}
          <div className="md:col-span-2 space-y-8">
            <LabResultsTable />
            <BiomarkerChart />
          </div>
        </div>
      </div>
    </main>
  );
}
