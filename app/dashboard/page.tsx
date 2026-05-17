import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import {
  ReminderCard,
  QuickAddCard,
} from "@/components/dashboard/ReminderCard";
import { ChannelsCard } from "@/components/dashboard/ChannelsCard";
import { CalendarStrip } from "@/components/dashboard/CalendarStrip";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { StatsCard } from "@/components/dashboard/StatsCard";

export const metadata = {
  title: "Dashboard — Mnemo",
  description: "Your AI memory layer at a glance.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Sidebar />

      <div className="lg:pl-[240px]">
        <TopBar />      

        <main className="relative px-5 py-8 md:px-8 md:py-10">
          <div className="relative grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-5">
              <QuickAddCard />
              <ReminderCard />
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
