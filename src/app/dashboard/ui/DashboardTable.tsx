"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export interface ColumnDefinition<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
}

interface ReusableTableProps<T> {
  title: string;
  data: T[];
  columns: ColumnDefinition<T>[];
  emptyMessage?: string;
}

export default function ReusableTable<T>({
  title,
  data,
  columns,
  emptyMessage = "No data available.",
}: ReusableTableProps<T>) {
  // Limit the number of rows to a maximum of 5
  const displayedData = data.slice(0, 5);

  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {displayedData.length > 0 ? (
            <table className="w-full text-center">
              <thead>
                <tr>
                  {columns.map((col, index) => (
                    <th key={index} className="py-2">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b">
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="py-2">
                        {col.accessor(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>{emptyMessage}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
