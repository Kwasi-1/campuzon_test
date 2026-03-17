import { Download, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderReceiptActionsProps {
  onViewReceipt: () => void;
  onDownloadReceipt: () => void;
  compact?: boolean;
}

export function OrderReceiptActions({
  onViewReceipt,
  onDownloadReceipt,
  compact = false,
}: OrderReceiptActionsProps) {
  return (
    <div className={`flex ${compact ? "flex-col w-full" : "flex-wrap"} gap-2`}>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full w-full md:w-auto"
        onClick={onViewReceipt}
      >
        <ReceiptText className="mr-1 h-4 w-4" />
        View Receipt
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="rounded-full w-full md:w-auto"
        onClick={onDownloadReceipt}
      >
        <Download className="mr-1 h-4 w-4" />
        Download Receipt
      </Button>
    </div>
  );
}
