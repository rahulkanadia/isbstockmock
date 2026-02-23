import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardClient from "./DashboardClient";
import { getDashboardData } from "@/lib/calculator";

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home(props: PageProps) {
  // Await Next 15 props
  const searchParams = await props.searchParams;
  const params = await props.params;
  
  const session = await getServerSession(authOptions);

  // Use the new centralized math engine
  const { 
    finalBenchmarks, 
    seasonStandings, 
    monthlyStandings, 
    monthlyHistory 
  } = await getDashboardData();

  return (
    <DashboardClient 
      benchmarks={finalBenchmarks}
      seasonStandings={seasonStandings}
      monthlyStandings={monthlyStandings}
      monthlyHistory={monthlyHistory}
      session={session}
    />
  );
}