import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/shared/Modal";
import { CustomInputTextField } from "@/components/shared/text-field";
import { useSellerWallet, useSellerWithdrawFunds } from "@/hooks/useSellerPortal";

interface WithdrawFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawFundsModal({
  isOpen,
  onClose,
}: WithdrawFundsModalProps) {
  const withdrawFunds = useSellerWithdrawFunds();
  const { data: wallet } = useSellerWallet();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAccountID, setWithdrawAccountID] = useState("");

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const submitWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!withdrawAccountID || !amount || amount <= 0) return;

    await withdrawFunds.mutateAsync({
      amount,
      accountID: withdrawAccountID,
    });
    setWithdrawAmount("");
    setWithdrawAccountID("");
    onClose();
  };

  const handleClose = () => {
    setWithdrawAmount("");
    setWithdrawAccountID("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Withdraw Funds"
      description="Transfer available wallet balance to your payout account"
      placement="right"
      size="lg"
      outsideClick={true}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-2xl font-semibold text-gray-900">
            {formatPrice(wallet?.balance || 0)}
          </p>
        </div>

        <CustomInputTextField
          label="Withdrawal Amount (GHS)"
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="0.00"
          required
        />

        <CustomInputTextField
          label="Payout Account ID"
          value={withdrawAccountID}
          onChange={(e) => setWithdrawAccountID(e.target.value)}
          placeholder="Enter account reference"
          required
        />

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
          <p className="text-xs text-blue-700">
            💡 Ensure your account ID matches your registered payout account.
            Withdrawals are processed within 2-3 business days.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            onClick={submitWithdraw}
            disabled={withdrawFunds.isPending}
            className="rounded-full"
          >
            {withdrawFunds.isPending ? "Submitting..." : "Submit Withdrawal"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
