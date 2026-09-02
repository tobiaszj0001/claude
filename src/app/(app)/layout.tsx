import { Providers } from "@/components/providers";
import { AppShell } from "@/components/app-shell";
import { ServiceWorkerRegistrar } from "@/components/sw-register";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <ServiceWorkerRegistrar />
      <AppShell>{children}</AppShell>
    </Providers>
  );
}
