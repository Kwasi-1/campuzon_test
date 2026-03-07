import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import TableSkeleton from "@/components/ui/table-skeleton";
import EmptyDateState from "@/components/shared/EmptyDateState";
import DateFilter from "@/components/shared/DateFilter";
import { useDateFilter } from "@/contexts/DateFilterContext";
import { isWithinInterval, parseISO, format } from "date-fns";
import { Download } from "lucide-react";
import adminTransactionsService, {
  Disbursement,
} from "@/services/adminTransactionsService";

const AdminDisbursements = () => {
  const [loading, setLoading] = useState(true);
  const [autoDisbursement, setAutoDisbursement] = useState(false);
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const { toast } = useToast();
  const {
    selectedPeriod,
    dateRange,
    isFiltered,
    isLoading: dateLoading,
  } = useDateFilter();

  useEffect(() => {
    const fetchDisbursements = async () => {
      setLoading(true);
      try {
        const data = await adminTransactionsService.getAllDisbursements();
        setDisbursements(data);
      } catch (error) {
        toast({
          title: "Failed to fetch disbursements",
          description: (error as Error).message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDisbursements();
  }, [toast]);

  // Auto-disbursement effect
  useEffect(() => {
    if (autoDisbursement) {
      const enableAutoDisbursement = async () => {
        try {
          await adminTransactionsService.enableAutoDisbursement(true);
          // Simulate auto-disbursement at 11:59 PM
          const timer = setTimeout(() => {
            setDisbursements((prev) =>
              prev.map((disbursement) => {
                if (disbursement.status === "Pending") {
                  return {
                    ...disbursement,
                    status: "Disbursed" as const,
                    disbursedAt: new Date().toISOString(),
                  };
                }
                return disbursement;
              })
            );

            toast({
              title: "Auto-Disbursement Complete",
              description:
                "All pending payouts have been automatically disbursed.",
            });
          }, 2000); // Simulate 2 seconds for demo

          return () => clearTimeout(timer);
        } catch (error) {
          toast({
            title: "Failed to enable auto-disbursement",
            description: (error as Error).message,
            variant: "destructive",
          });
        }
      };

      enableAutoDisbursement();
    }
  }, [autoDisbursement, toast]);

  // Filter disbursements based on date range
  const filteredDisbursements = disbursements.filter((disbursement) => {
    if (!isFiltered || !dateRange.from || !dateRange.to) {
      return true;
    }

    // For pending disbursements, use today's date
    // For disbursed, use the disbursedAt date
    const relevantDate = disbursement.disbursedAt
      ? parseISO(disbursement.disbursedAt)
      : new Date(); // Today for pending

    return isWithinInterval(relevantDate, {
      start: dateRange.from,
      end: dateRange.to,
    });
  });

  const handleManualDisburse = async (disbursement: Disbursement) => {
    try {
      await adminTransactionsService.processManualDisbursement(disbursement.id);

      // Update disbursement status
      setDisbursements((prev) =>
        prev.map((d) =>
          d.id === disbursement.id
            ? {
                ...d,
                status: "Disbursed" as const,
                disbursedAt: new Date().toISOString(),
              }
            : d
        )
      );

      toast({
        title: "Disbursement Successful",
        description: `₵${disbursement.netPayout.toFixed(
          2
        )} has been disbursed to ${disbursement.storeName}`,
      });
    } catch (error) {
      // Handle failed disbursement
      setDisbursements((prev) =>
        prev.map((d) =>
          d.id === disbursement.id ? { ...d, status: "Failed" as const } : d
        )
      );

      toast({
        title: "Disbursement Failed",
        description: "Failed to process payout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportDisbursements = async () => {
    try {
      const blob = await adminTransactionsService.exportDisbursements("csv");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `disbursements-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Completed",
        description: "Disbursement data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disbursed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Calculate summary stats
  const totalGrossSales = filteredDisbursements.reduce(
    (sum, d) => sum + d.grossSales,
    0
  );
  const totalPlatformFees = filteredDisbursements.reduce(
    (sum, d) => sum + d.platformFee,
    0
  );
  const totalNetPayouts = filteredDisbursements.reduce(
    (sum, d) => sum + d.netPayout,
    0
  );
  const pendingCount = filteredDisbursements.filter(
    (d) => d.status === "Pending"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header with Auto-Disburse Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Store Disbursements
          </h2>
          <p className="text-muted-foreground">
            Manage store payouts and disbursement settings
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={handleExportDisbursements}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <div className="flex items-center space-x-2">
            <label htmlFor="auto-disburse" className="text-sm font-medium">
              Auto-Disburse Daily
            </label>
            <Switch
              id="auto-disburse"
              checked={autoDisbursement}
              onCheckedChange={setAutoDisbursement}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Gross Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{totalGrossSales.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Before platform fees
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{totalPlatformFees.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">10% commission</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₵{totalNetPayouts.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">After deductions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting disbursement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Date Filter */}
      <div className="flex justify-start">
        <DateFilter />
      </div>

      {/* Disbursements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Disbursement Records</CardTitle>
          <CardDescription>
            {autoDisbursement
              ? "Auto-disbursement is enabled. Payouts will be processed automatically at 11:59 PM daily."
              : "Manual disbursement mode. Click 'Disburse Now' to process individual payouts."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading || dateLoading ? (
            <TableSkeleton rows={6} columns={7} />
          ) : filteredDisbursements.length === 0 ? (
            <EmptyDateState message="No disbursement records for this date" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Gross Sales</TableHead>
                  <TableHead>Fees Deducted</TableHead>
                  <TableHead>Net Payout</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Disbursed At</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisbursements.map((disbursement) => (
                  <TableRow key={disbursement.id}>
                    <TableCell className="font-medium">
                      {disbursement.storeName}
                    </TableCell>
                    <TableCell>₵{disbursement.grossSales.toFixed(2)}</TableCell>
                    <TableCell>
                      ₵{disbursement.platformFee.toFixed(2)} (10%)
                    </TableCell>
                    <TableCell className="font-bold">
                      ₵{disbursement.netPayout.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(disbursement.status)}>
                        {disbursement.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {disbursement.disbursedAt
                        ? format(
                            parseISO(disbursement.disbursedAt),
                            "MMM dd, yyyy HH:mm"
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={disbursement.status !== "Pending"}
                        onClick={() => handleManualDisburse(disbursement)}
                      >
                        {disbursement.status === "Pending"
                          ? "Disburse Now"
                          : "Disbursed"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Backend Integration Placeholder */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Backend Integration Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Paystack Transfers API Integration:</strong>
          </p>
          <p>• Replace console.log with actual Paystack transfers API call</p>
          <p>• Endpoint: POST /transfers with recipient code and amount</p>
          <p>• Handle webhook callbacks for transfer status updates</p>
          <br />
          <p>
            <strong>Auto-Disbursement Scheduling:</strong>
          </p>
          <p>• Set up cron job or scheduled task to run at 11:59 PM daily</p>
          <p>• Query all pending disbursements and process via Paystack</p>
          <p>• Update database with disbursement status and timestamps</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDisbursements;
