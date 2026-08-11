import { Calendar } from "@/components/calendar/calendar";
import { TodayList } from "@/components/today-list";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Karta „Stan konta" pojawi się w etapie 4 (Finanse). */}
      <Calendar />
      <TodayList />
    </div>
  );
}
