import { Calendar } from "@/components/calendar/calendar";
import { TodayList } from "@/components/today-list";

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Karta „Stan konta" pojawi się w etapie 4 (Finanse).
          Lista na dziś jest wyżej niż kalendarz — to po nią wchodzi się
          najczęściej i ma być pod kciukiem od razu po otwarciu. */}
      <TodayList />
      <Calendar />
    </div>
  );
}
