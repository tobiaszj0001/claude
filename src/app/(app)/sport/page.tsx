import { AreaItems } from "@/components/area-items";
import { Goals } from "@/components/goals";

export default function SportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sport</h1>
      <p className="text-sm text-muted-foreground">Moduł treningów (baza ćwiczeń, szablony, historia, wykresy progresu) pojawi się w etapie 6.</p>
      <AreaItems area="SPORT" />
      <Goals area="SPORT" />
    </div>
  );
}
