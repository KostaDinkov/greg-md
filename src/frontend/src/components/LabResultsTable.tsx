"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { API_BASE_URL } from "@/lib/api";

export interface LabResult {
  id: number;
  report_id: number;
  biomarker_name: string;
  value: number;
  unit: string;
  reference_range: string | null;
  is_flagged: boolean;
  test_date: string;
}

export function LabResultsTable() {
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/labs/results`);
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Failed to fetch results", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading lab results...</div>;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recent Biomarkers</CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center text-muted-foreground p-6">
            No lab results found. Upload a report to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Biomarker</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Range</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{format(new Date(result.test_date), "MMM d, yyyy")}</TableCell>
                  <TableCell className="font-medium">{result.biomarker_name}</TableCell>
                  <TableCell>
                    {result.value} <span className="text-muted-foreground text-xs">{result.unit}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {result.reference_range || "-"}
                  </TableCell>
                  <TableCell>
                    {result.is_flagged ? (
                      <Badge variant="destructive">Flagged</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Normal</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
