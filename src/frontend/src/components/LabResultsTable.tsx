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
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

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

type SortColumn = "test_date" | "biomarker_name" | "value" | "is_flagged";
type SortDirection = "asc" | "desc";

export function LabResultsTable() {
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<SortColumn>("test_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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

  useEffect(() => {
    fetchResults();

    // Listen for updates from upload form
    const handleUpdate = () => {
      fetchResults();
    };
    window.addEventListener("lab-results-updated", handleUpdate);
    return () => window.removeEventListener("lab-results-updated", handleUpdate);
  }, []);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      // New column, default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const sortedResults = [...results].sort((a, b) => {
    let comparison = 0;
    
    switch (sortColumn) {
      case "test_date":
        comparison = new Date(a.test_date).getTime() - new Date(b.test_date).getTime();
        break;
      case "biomarker_name":
        comparison = a.biomarker_name.localeCompare(b.biomarker_name);
        break;
      case "value":
        comparison = a.value - b.value;
        break;
      case "is_flagged":
        comparison = (a.is_flagged ? 1 : 0) - (b.is_flagged ? 1 : 0);
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

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
                <TableHead 
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort("test_date")}
                >
                  <div className="flex items-center">
                    Date
                    {getSortIcon("test_date")}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort("biomarker_name")}
                >
                  <div className="flex items-center">
                    Biomarker
                    {getSortIcon("biomarker_name")}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort("value")}
                >
                  <div className="flex items-center">
                    Value
                    {getSortIcon("value")}
                  </div>
                </TableHead>
                <TableHead>Range</TableHead>
                <TableHead 
                  className="cursor-pointer select-none hover:bg-muted/50"
                  onClick={() => handleSort("is_flagged")}
                >
                  <div className="flex items-center">
                    Status
                    {getSortIcon("is_flagged")}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedResults.map((result) => (
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
