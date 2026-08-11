import { AreaItems } from "@/components/area-items";

export default function BiznesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Biznes</h1>
      <p className="text-sm text-muted-foreground">
        Finanse, przychód/koszty/dochód i widok zbiorczy podzakładek pojawią się w etapie 5.
      </p>
      <AreaItems area="BIZNES" />
    </div>
  );
}
