"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { API_BASE_URL } from "@/lib/api";

interface LabResult {
  id: number;
  report_id: number;
  biomarker_name: string;
  value: number;
  unit: string;
  reference_range: string | null;
  is_flagged: boolean;
  test_date: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
  formattedDate: string;
}

export function BiomarkerChart() {
  const [results, setResults] = useState<LabResult[]>([]);
  const [selectedBiomarker, setSelectedBiomarker] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [biomarkers, setBiomarkers] = useState<string[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/labs/results`);
        if (response.ok) {
          const data: LabResult[] = await response.json();
          setResults(data);
          
          // Extract unique biomarker names
          const uniqueBiomarkers = Array.from(
            new Set(data.map((r) => r.biomarker_name))
          ).sort();
          setBiomarkers(uniqueBiomarkers);
          
          // Select the first biomarker by default
          if (uniqueBiomarkers.length > 0 && !selectedBiomarker) {
            setSelectedBiomarker(uniqueBiomarkers[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch results", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const chartData: ChartDataPoint[] = results
    .filter((r) => r.biomarker_name === selectedBiomarker)
    .sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime())
    .map((r) => ({
      date: r.test_date,
      value: r.value,
      formattedDate: format(new Date(r.test_date), "MMM d, yyyy"),
    }));

  const selectedUnit = results.find(
    (r) => r.biomarker_name === selectedBiomarker
  )?.unit;

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading chart...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Biomarker Trends</CardTitle>
        <CardDescription>
          Track how your biomarkers change over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {biomarkers.length === 0 ? (
          <div className="text-center text-muted-foreground p-6">
            No biomarker data available. Upload lab reports to see trends.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label htmlFor="biomarker-select" className="text-sm font-medium">
                Select Biomarker:
              </label>
              <Select
                value={selectedBiomarker}
                onValueChange={setSelectedBiomarker}
              >
                <SelectTrigger id="biomarker-select" className="w-[250px]">
                  <SelectValue placeholder="Choose a biomarker" />
                </SelectTrigger>
                <SelectContent>
                  {biomarkers.map((biomarker) => (
                    <SelectItem key={biomarker} value={biomarker}>
                      {biomarker}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {chartData.length === 0 ? (
              <div className="text-center text-muted-foreground p-6">
                No historical data for {selectedBiomarker}.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="formattedDate"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <YAxis
                    label={{
                      value: selectedUnit || "Value",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "hsl(var(--foreground))" },
                    }}
                    tick={{ fill: "hsl(var(--foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                    name={selectedBiomarker}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
