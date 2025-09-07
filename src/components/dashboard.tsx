import { SummaryCards } from './summary-cards';
import { OverviewChart } from './overview-chart';
import { RecentTransactions } from './recent-transactions';

export function Dashboard() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <SummaryCards />
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <OverviewChart />
        </div>
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
      </div>
    </main>
  );
}
