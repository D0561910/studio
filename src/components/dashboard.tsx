import { SummaryCards } from './summary-cards';
import { OverviewChart } from './overview-chart';
import { RecentTransactions } from './recent-transactions';

export function Dashboard() {
  return (
    <>
      <SummaryCards />
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <OverviewChart />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
      </div>
    </>
  );
}
