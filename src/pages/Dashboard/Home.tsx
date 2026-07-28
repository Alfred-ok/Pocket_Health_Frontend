import PageMeta from "../../components/common/PageMeta";
import DashboardHeader from "../../components/PocketHealth/dashboard/DashboardHeader";
import HealthReminderCard from "../../components/PocketHealth/dashboard/HealthReminderCard";
import VitalStats from "../../components/PocketHealth/dashboard/VitalStats";
import BodyFluidChart from "../../components/PocketHealth/dashboard/BodyFluidChart";
import SolidsCompositionChart from "../../components/PocketHealth/dashboard/SolidsCompositionChart";
import UpcomingCheckupCalendar from "../../components/PocketHealth/dashboard/UpcomingCheckupCalendar";
import LastHealthCheckList from "../../components/PocketHealth/dashboard/LastHealthCheckList";
import InsuranceBalanceCard from "../../components/PocketHealth/dashboard/InsuranceBalanceCard";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dashboard | Pocket Health"
        description="Your Pocket Health patient dashboard — vitals, upcoming check-ups and recent results."
      />
      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-12">
        <div className="space-y-4 md:space-y-6 xl:col-span-8">
          <DashboardHeader />
          <HealthReminderCard />
          <VitalStats />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            <BodyFluidChart />
            <SolidsCompositionChart />
          </div>
        </div>

        <div className="space-y-4 md:space-y-6 xl:col-span-4">
          <UpcomingCheckupCalendar />
          <LastHealthCheckList />
          <InsuranceBalanceCard />
        </div>
      </div>
    </>
  );
}
