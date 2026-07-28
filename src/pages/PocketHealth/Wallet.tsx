import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import TopUpModal from "../../components/PocketHealth/TopUpModal";
import { useModal } from "../../hooks/useModal";
import { useMyWallet } from "../../hooks/useMyWallet";
import { WalletIcon } from "../../components/PocketHealth/dashboard/icons";
import { ArrowDownIcon, ArrowUpIcon } from "../../icons";
import transactionsApi from "../../api/transactionsApi";
import type { Transaction } from "../../types/pocketHealth";

const statusColor: Record<string, "warning" | "success" | "error" | "light"> = {
  pending: "warning",
  completed: "success",
  failed: "error",
};

const typeLabel: Record<string, string> = {
  top_up: "Top up",
  debit: "Debit",
  refund: "Refund",
};

export default function WalletPage() {
  const { wallet, loading: walletLoading, error: walletError, reload } = useMyWallet();
  const topUpModal = useModal();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);

  const loadTransactions = () => {
    if (!wallet) return;
    setLoadingTx(true);
    transactionsApi
      .getByWallet(wallet.walletId)
      .then(setTransactions)
      .finally(() => setLoadingTx(false));
  };

  useEffect(loadTransactions, [wallet]);

  const handleTopUp = () => {
    reload();
    loadTransactions();
  };

  return (
    <>
      <PageMeta title="Wallet | PocketHealth" description="Top up, view balance and transaction history." />
      <PageBreadcrumb pageTitle="Wallet" />

      {walletLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Loading wallet...</p>}
      {walletError && <p className="text-sm text-error-500">{walletError}</p>}

      {wallet && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15">
              <WalletIcon className="size-6" />
            </span>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Wallet balance</p>
              <p className="text-2xl font-semibold text-gray-800 dark:text-white/90">
                KES {Number(wallet.balanceKes).toLocaleString()}
              </p>
            </div>
          </div>
          <Button onClick={topUpModal.openModal}>Top Up</Button>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">Transaction history</h3>

        {loadingTx && <p className="text-sm text-gray-500 dark:text-gray-400">Loading transactions...</p>}
        {!loadingTx && transactions.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">No transactions yet.</p>
        )}

        <div className="space-y-3">
          {transactions.map((tx) => {
            const isCredit = tx.type === "top_up" || tx.type === "refund";
            const Icon = isCredit ? ArrowUpIcon : ArrowDownIcon;
            return (
              <div
                key={tx.transactionId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-9 items-center justify-center rounded-full ${
                      isCredit
                        ? "bg-success-50 text-success-600 dark:bg-success-500/15"
                        : "bg-error-50 text-error-600 dark:bg-error-500/15"
                    }`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {typeLabel[tx.type] ?? tx.type}
                      {tx.paymentMethod ? ` · ${tx.paymentMethod}` : ""}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                      {tx.mpesaReference ? ` · Ref: ${tx.mpesaReference}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${isCredit ? "text-success-600" : "text-error-500"}`}>
                    {isCredit ? "+" : "-"}KES {Number(tx.amount).toLocaleString()}
                  </span>
                  <Badge color={statusColor[tx.status] ?? "light"} size="sm">
                    {tx.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {wallet && (
        <TopUpModal
          isOpen={topUpModal.isOpen}
          onClose={topUpModal.closeModal}
          walletId={wallet.walletId}
          onToppedUp={handleTopUp}
        />
      )}
    </>
  );
}
