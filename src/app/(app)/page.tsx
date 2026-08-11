import { TodayList } from "@/components/today-list";

// Zakładka „Dziś" — sama lista zadań na dziś i zaległe.
// Kalendarz ma własną zakładkę (/kalendarz).
// Karta „Stan konta" dojdzie tutaj w etapie 4 (Finanse).
export default function TodayPage() {
  return (
    <div className="space-y-8">
      <TodayList />
    </div>
  );
}
