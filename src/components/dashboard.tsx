import { SummaryCards } from './summary-cards';
import { OverviewChart } from './overview-chart';
import { RecentTransactions } from './recent-transactions';

export function Dashboard() {
  return (
    <>
      <SummaryCards />
      <div className="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-2">
        <div className="col-span-1 lg:col-span-2">
          <OverviewChart />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <RecentTransactions />
        </div>
      </div>
    </>
  );
}
