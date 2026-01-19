import { Card, CardContent } from "@/components/ui/card";

export function RulesCard() {
  return (
    <Card className="mb-6 bg-zinc-900 border-zinc-800">
      <CardContent className="text-sm text-zinc-300 space-y-1 pt-4">
        <p>• One stock per user (NSE, BSE, SME allowed)</p>
        <p>• Entry price = same day open (or next trading day)</p>
        <p>• Daily P&amp;L based on closing price</p>
        <p>• One stock change allowed per calendar month</p>
        <p>• Historical P&amp;L is frozen on change</p>
      </CardContent>
    </Card>
  );
}
