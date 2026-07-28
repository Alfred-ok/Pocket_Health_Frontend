import { Link } from "react-router";
import { WalletIcon } from "./icons";

export default function InsuranceBalanceCard() {
  return (
    <Link
      to="/insurance"
      className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition hover:shadow-theme-md dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/15">
          <WalletIcon className="size-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Insurance Balance</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Card</p>
        </div>
      </div>
      <p className="text-lg font-semibold text-gray-800 dark:text-white/90">KES 24,000</p>
    </Link>
  );
}
