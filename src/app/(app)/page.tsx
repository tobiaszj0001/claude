import { BalanceCard } from "@/components/finance/balance-card";
import { TodayList } from "@/components/today-list";

// Zakładka „Dziś": stan konta na górze (§4.1), pod nim lista na dziś.
// Kalendarz ma własną zakładkę (/kalendarz).
export default function TodayPage() {
  return (
    <div className="space-y-8">
      <BalanceCard />
      <TodayList />
    </div>
  );
}
