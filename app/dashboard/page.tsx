import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { ChannelsCard } from "@/components/dashboard/ChannelsCard";
import { CalendarStrip } from "@/components/dashboard/CalendarStrip";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LiveReminders } from "@/components/dashboard/LiveReminders";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/google";
import { getPhoneForEmail, listForUser } from "@/lib/store";

export const metadata = {
  title: "Dashboard — Mnemo",
  description: "Your AI memory layer at a glance.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Gate: only signed-in users can see the dashboard.
  const session = readSession(cookies().get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    redirect("/api/auth/google/login");
  }

  // If the user linked a WhatsApp number, load their real reminders.
  const phone = session.email ? await getPhoneForEmail(session.email) : null;
  const reminders = phone ? await listForUser(phone) : [];
  const initial = reminders.map((r) => ({
    id: r.id,
    task: r.task,
    fireAt: r.fireAt,
    recurrence: r.recurrence,
  }));

  return (
    <div className="min-h-screen">
      <Sidebar />

      <div className="lg:pl-[240px]">
        <TopBar />

        <main className="relative px-5 py-8 md:px-8 md:py-10">
          <div className="relative grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-5">
              <LiveReminders initial={initial} linked={!!phone} />
              <CalendarStrip />
            </div>

            <div className="lg:col-span-4 space-y-5">
              <StatsCard />
              <ChannelsCard />
              <ActivityFeed />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
