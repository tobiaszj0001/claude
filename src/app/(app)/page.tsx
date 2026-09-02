import { BalanceCompact } from "@/components/finance/balance-compact";
import { TodayList } from "@/components/today-list";

// Zakładka „Dziś": kompaktowy stan konta (klik → Finanse), pod nim zadania.
// Pełna karta z rozbiciem i okresami jest w zakładce Finanse.
export default function TodayPage() {
  return (
    <div className="space-y-6">
      <BalanceCompact />
      <TodayList />
    </div>
  );
}
