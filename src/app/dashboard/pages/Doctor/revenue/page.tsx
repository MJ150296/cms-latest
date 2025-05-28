"use client";

import React, { useMemo } from "react";
import DashboardLayout from "@/app/dashboard/layout/DashboardLayout";
import DashboardCards, { Stat } from "@/app/dashboard/ui/DashboardCards";
import DashboardChart from "@/app/dashboard/ui/DashboardChart";
import DashboardPieChart from "@/app/dashboard/ui/DashboardPieChart";
import { useAppSelector } from "@/app/redux/store/hooks";
import { BillingRecord, selectBillings } from "@/app/redux/slices/billingSlice";
import { format } from "date-fns";
import {
  ReceiptIndianRupee,
  DollarSign,
  TrendingUp,
  PieChart,
} from "lucide-react";
import DataTable, { ColumnDef } from "@/app/components/DataTable";

export default function RevenueDashboard() {
  const billings = useAppSelector(selectBillings);

  // Compute advanced analytics from the billing data
  const analytics = useMemo(() => {
    if (!billings || billings.length === 0) {
      return {
        totalRevenue: 0,
        totalReceived: 0,
        totalOutstanding: 0,
        averageInvoice: 0,
        averageDiscount: 0,
        revenueByPaymentMode: {} as Record<string, number>,
        monthlyRevenue: {} as Record<string, number>,
      };
    }

    let totalRevenue = 0;
    let totalReceived = 0;
    let totalOutstanding = 0;
    let totalDiscount = 0;
    let invoiceCount = 0;
    const revenueByPaymentMode: Record<string, number> = {};
    const monthlyRevenue: Record<string, number> = {};

    billings.forEach((billing: BillingRecord) => {
      // totalAmount is already computed in the model (amountBeforeDiscount - discount)
      totalRevenue += billing.totalAmount;
      totalReceived += billing.amountReceived;
      totalOutstanding += billing.amountDue;
      totalDiscount += billing.discount || 0;
      invoiceCount += 1;

      // Aggregate revenue by payment mode
      const mode = billing.modeOfPayment;
      revenueByPaymentMode[mode] =
        (revenueByPaymentMode[mode] || 0) + billing.totalAmount;

      // Aggregate monthly revenue using billing date
      const month = format(new Date(billing.date), "yyyy-MM");
      monthlyRevenue[month] =
        (monthlyRevenue[month] || 0) + billing.totalAmount;
    });

    return {
      totalRevenue,
      totalReceived,
      totalOutstanding,
      averageInvoice: invoiceCount ? totalRevenue / invoiceCount : 0,
      averageDiscount: invoiceCount ? totalDiscount / invoiceCount : 0,
      revenueByPaymentMode,
      monthlyRevenue,
    };
  }, [billings]);

  const billingTableColumns: ColumnDef<BillingRecord, keyof BillingRecord>[] = [
    {
      header: "Invoice ID",
      accessorKey: "invoiceId",
      sortable: true,
    },
    {
      header: "Date",
      accessorKey: "date",
      sortable: true,
      render: (value) =>
        value ? new Date(value as string).toLocaleDateString() : "N/A",
    },
    {
      header: "Total Amount",
      accessorKey: "totalAmount",
      sortable: true,
      render: (value) =>
        typeof value === "number" ? `₹ ${value.toFixed(2)}` : "N/A",
    },
    {
      header: "Discount",
      accessorKey: "discount",
      sortable: true,
      render: (value) =>
        typeof value === "number" ? `₹ ${value.toFixed(2)}` : "N/A",
    },
    {
      header: "Received",
      accessorKey: "amountReceived",
      sortable: true,
      render: (value) =>
        typeof value === "number" ? `₹ ${value.toFixed(2)}` : "N/A",
    },
    {
      header: "Due",
      accessorKey: "amountDue",
      sortable: true,
      render: (value) =>
        typeof value === "number" ? `₹ ${value.toFixed(2)}` : "N/A",
    },
    {
      header: "Mode",
      accessorKey: "modeOfPayment",
      sortable: true,
      render: (value) => (typeof value === "string" ? value : "N/A"),
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      render: (value) => (typeof value === "string" ? value : "N/A"),
    },
  ];

  // Prepare stat cards
  const stats: Stat[] = [
    {
      title: "Total Revenue",
      value: `${analytics.totalRevenue.toLocaleString()}`,
      icon: <ReceiptIndianRupee size={24} color="white" />,
      color: "bg-orange-500",
      LinkURL: "",
    },
    {
      title: "Amount Received",
      value: `${analytics.totalReceived.toLocaleString()}`,
      icon: <DollarSign size={24} color="white" />,
      color: "bg-green-500",
      LinkURL: "",
    },
    {
      title: "Outstanding",
      value: `${analytics.totalOutstanding.toLocaleString()}`,
      icon: <TrendingUp size={24} color="white" />,
      color: "bg-red-500",
      LinkURL: "",
    },
    {
      title: "Average Invoice",
      value: `${analytics.averageInvoice.toFixed(2)}`,
      icon: <ReceiptIndianRupee size={24} color="white" />,
      color: "bg-blue-500",
      LinkURL: "",
    },
    {
      title: "Avg. Discount",
      value: `${analytics.averageDiscount.toFixed(2)}`,
      icon: <PieChart size={24} color="white" />,
      color: "bg-purple-500",
      LinkURL: "",
    },
  ];

  // Prepare data for a monthly revenue trend chart
  const monthlyData = useMemo(() => {
    const months = Object.keys(analytics.monthlyRevenue).sort();
    return months.map((month) => ({
      month,
      users: analytics.monthlyRevenue[month],
    }));
  }, [analytics.monthlyRevenue]);

  // Prepare data for a pie chart showing revenue by payment mode
  const paymentModeData = useMemo(() => {
    return Object.entries(analytics.revenueByPaymentMode).map(
      ([mode, revenue]) => ({
        name: mode,
        value: revenue,
      })
    );
  }, [analytics.revenueByPaymentMode]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
        <DashboardCards stats={stats} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DashboardChart
            title="Monthly Revenue Trend"
            data={monthlyData}
            // Pass additional chart configurations as needed
          />
          <DashboardPieChart
            title="Revenue by Payment Mode"
            data={paymentModeData}
          />
        </div>

        <div>
          <DataTable
            title="Billing Details"
            data={billings}
            columns={billingTableColumns}
            searchFields={["invoiceId", "date", "modeOfPayment", "status"]}
            showSearch={true}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
