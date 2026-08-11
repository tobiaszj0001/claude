import { AreaItems } from "@/components/area-items";
import { Goals } from "@/components/goals";

export default function ŻyciePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Życie</h1>
      <p className="text-sm text-muted-foreground">Wydarzenia, oś czasu i koszty życiowe pojawią się w etapie 7.</p>
      <AreaItems area="ZYCIE" />
      <Goals area="ZYCIE" />
    </div>
  );
}
