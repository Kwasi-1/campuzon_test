import { useState } from "react";
import { format } from "date-fns";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Banknote,
  PiggyBank,
  History,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { SellerPageTemplate } from "@/pages/seller/components/SellerPageTemplate";
import { useWallet, useWalletTransactions, useWithdrawFunds } from "@/hooks";
import { useCurrency } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/shared/Skeleton";
import { Modal } from "@/components/shared/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { SellerWalletTransaction } from "@/types-new";

export function SellerWalletPage() {
  const { formatGHS } = useCurrency();
  const { data: walletData, isLoading: isWalletLoading } = useWallet();
  const { data: transactions, isLoading: isTransactionsLoading } = useWalletTransactions();
  const withdrawMutation = useWithdrawFunds();

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) return;
    
    withdrawMutation.mutate(
      { amount, accountID: "" },
      {
        onSuccess: () => {
          setIsWithdrawModalOpen(false);
          setWithdrawAmount("");
        },
      }
    );
  };

  const getTransactionIcon = (type: string) => {
    return type === "credit" ? (
      <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
        <ArrowDownLeft className="w-4 h-4" />
      </div>
    ) : (
      <div className="p-2 bg-red-100 rounded-full text-red-600">
        <ArrowUpRight className="w-4 h-4" />
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Completed</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>;
      case "failed":
        return <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100">Failed</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isWalletLoading) {
    return (
      <SellerPageTemplate title="Finances" description="Manage your wallet, track escrow, and request payouts.">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </SellerPageTemplate>
    );
  }

  // walletData has balance, pendingBalance, etc. based on normalized type
  // Let's assume balance and pendingBalance are numbers
  const balance = walletData?.balance || 0;
  const pendingBalance = walletData?.pendingBalance || 0;
  const lastWithdrawal = walletData?.lastWithdrawalAt;

  return (
    <SellerPageTemplate
      title="Finances"
      description="Manage your wallet, track escrow, and request payouts."
      headerActions={
        <Button onClick={() => setIsWithdrawModalOpen(true)} className="rounded-full shadow-sm">
          <Banknote className="mr-2 h-4 w-4" />
          Request Payout
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Wallet Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatGHS(balance)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready for withdrawal
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Escrow</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{formatGHS(pendingBalance)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pending order completion
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Payout</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lastWithdrawal ? format(new Date(lastWithdrawal), "MMM d, yyyy") : "Never"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Most recent withdrawal date
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isTransactionsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((tx: SellerWalletTransaction) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {tx.description || (tx.type === "credit" ? "Credit" : "Debit")}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {format(new Date(tx.dateCreated), "MMM d, yyyy • h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`font-semibold ${tx.type === "credit" ? "text-emerald-600" : "text-gray-900"}`}>
                        {tx.type === "credit" ? "+" : "-"}{formatGHS(tx.amount)}
                      </span>
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <History className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No transactions yet</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  When you make sales or withdraw funds, your transaction history will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Withdraw Modal */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => !withdrawMutation.isPending && setIsWithdrawModalOpen(false)}
        title="Request Payout"
      >
        <div className="space-y-4 pt-2">
          <Alert className="bg-primary/5 text-primary border-primary/20">
            <AlertCircle className="h-4 w-4 stroke-primary" />
            <AlertTitle>Available to withdraw</AlertTitle>
            <AlertDescription className="font-semibold text-lg mt-1">
              {formatGHS(balance)}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Withdraw</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              disabled={withdrawMutation.isPending}
            />
          </div>

          {/* Note: You might want to display the default payout account here or let them select one */}
          
          <div className="pt-4 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsWithdrawModalOpen(false)}
              disabled={withdrawMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={
                withdrawMutation.isPending ||
                !withdrawAmount ||
                parseFloat(withdrawAmount) <= 0 ||
                parseFloat(withdrawAmount) > balance
              }
            >
              {withdrawMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                "Confirm Withdrawal"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </SellerPageTemplate>
  );
}
