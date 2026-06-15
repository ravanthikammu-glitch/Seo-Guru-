import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area,
} from "recharts";
import { Download, FileText, TrendingUp, Target, AlertCircle } from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MOCK_CONTENT_GAPS, MOCK_KEYWORDS } from "@/lib/mock-data";

const TRAFFIC_DATA = [
  { month: "Jan", current: 3400, projected: 3400 },
  { month: "Feb", current: 4200, projected: 5100 },
  { month: "Mar", current: 3800, projected: 6800 },
  { month: "Apr", current: 5100, projected: 9200 },
  { month: "May", current: 4700, projected: 12400 },
  { month: "Jun", current: 6200, projected: 16800 },
];

const GAP_CHART_DATA = MOCK_CONTENT_GAPS.slice(0, 8).map(g => ({
  topic: g.topic.split(" ").slice(0, 2).join(" "),
  competitor: g.competitorCoverage,
  yours: g.yourCoverage,
}));

const CONTENT_PLAN = [
  { topic: "Technical SEO Fundamentals", keyword: "technical seo guide", priority: "High", traffic: "+15k/mo" },
  { topic: "Schema Markup Implementation", keyword: "schema markup guide", priority: "High", traffic: "+8k/mo" },
  { topic: "Voice Search Optimization", keyword: "voice search seo guide", priority: "High", traffic: "+11k/mo" },
  { topic: "Core Web Vitals Guide", keyword: "core web vitals guide", priority: "Medium", traffic: "+9k/mo" },
  { topic: "Featured Snippets Strategy", keyword: "featured snippet optimization", priority: "Medium", traffic: "+7k/mo" },
  { topic: "International SEO Guide", keyword: "international seo", priority: "High", traffic: "+12k/mo" },
];

export default function Reports() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("Last 30 days");

  const handleExport = (type: string) => {
    toast({ title: `Report exported successfully`, description: `Your ${type} report is ready to download.` });
  };

  const highPriority = MOCK_CONTENT_GAPS.filter(g => g.priority === "High").length;
  const topKeywords = MOCK_KEYWORDS.filter(k => k.opportunityScore >= 85).length;

  return (
    <AppLayout>
      <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">SEO Gap Report</h1>
            <p className="text-sm text-muted-foreground">mywebsite.com vs. ahrefs.com</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="text-xs bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              data-testid="date-range-select"
            >
              {["Last 7 days", "Last 30 days", "Last 90 days", "Last year"].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <Button
              data-testid="export-pdf"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => handleExport("PDF")}
            >
              <FileText className="w-3.5 h-3.5" /> PDF Export
            </Button>
            <Button
              data-testid="export-csv"
              size="sm"
              className="gap-2"
              onClick={() => handleExport("CSV")}
            >
              <Download className="w-3.5 h-3.5" /> CSV Export
            </Button>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Content Gaps", value: MOCK_CONTENT_GAPS.length, icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
            { label: "High Priority", value: highPriority, icon: Target, color: "text-orange-400", bg: "bg-orange-500/10" },
            { label: "Top Keywords", value: topKeywords, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { label: "Est. Traffic Opp.", value: "68k/mo", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10", isString: true },
          ].map(({ label, value, icon: Icon, color, bg, isString }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    <p className={`text-2xl font-extrabold mt-1 ${color}`}>{isString ? value : value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-4.5 h-4.5 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Executive Summary */}
        <Card>
          <CardHeader><CardTitle className="text-base">Executive Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Analysis of <strong className="text-foreground">mywebsite.com</strong> vs <strong className="text-foreground">ahrefs.com</strong> over the past {dateRange.toLowerCase()} reveals significant content gaps in Technical SEO, Schema Markup, and Voice Search categories. The competitor currently outranks you on <strong className="text-foreground">410 keywords</strong> with a combined monthly traffic opportunity of <strong className="text-foreground">68,000+ visits</strong>.
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Content Coverage Gap", pct: 58, color: "bg-red-500" },
                    { label: "Keyword Overlap", pct: 34, color: "bg-yellow-500" },
                    { label: "Backlink Ratio", pct: 26, color: "bg-orange-500" },
                  ].map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2 font-medium">Projected Traffic (with recommendations)</p>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={TRAFFIC_DATA}>
                    <defs>
                      <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                    <Area type="monotone" dataKey="current" name="Current" stroke="hsl(var(--chart-3))" fill="none" strokeWidth={2} />
                    <Area type="monotone" dataKey="projected" name="Projected" stroke="hsl(var(--primary))" fill="url(#projGrad)" strokeWidth={2} strokeDasharray="5 3" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Gaps */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Content Gaps</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={GAP_CHART_DATA} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis type="category" dataKey="topic" width={130} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="competitor" name="Competitor %" fill="hsl(var(--destructive))" fillOpacity={0.8} radius={[0, 3, 3, 0]} />
                <Bar dataKey="yours" name="Your %" fill="hsl(var(--primary))" fillOpacity={0.8} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Keyword Opportunities */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Keyword Opportunities</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Keyword</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Volume</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Difficulty</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Comp. Rank</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Score</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_KEYWORDS.filter(k => k.opportunityScore >= 85).slice(0, 10).map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{row.keyword}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{row.searchVolume.toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-medium ${row.difficulty <= 30 ? "text-emerald-400" : row.difficulty <= 55 ? "text-yellow-400" : "text-red-400"}`}>
                        {row.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{row.competitorRank}</td>
                    <td className="px-4 py-2.5">
                      <span className="font-bold text-emerald-400">{row.opportunityScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Content Plan */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recommended Content Plan</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Topic</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Target Keyword</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Priority</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Est. Traffic</th>
                </tr>
              </thead>
              <tbody>
                {CONTENT_PLAN.map((row, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 font-medium">{row.topic}</td>
                    <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{row.keyword}</td>
                    <td className="px-4 py-2.5">
                      <Badge className={`text-xs ${row.priority === "High" ? "bg-red-500/15 text-red-400 border-red-500/20" : "bg-yellow-500/15 text-yellow-400 border-yellow-500/20"}`}>
                        {row.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-emerald-400 font-semibold text-xs">{row.traffic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Print hint */}
        <p className="text-xs text-muted-foreground text-center pb-4">
          Use PDF Export for a print-ready version. CSV Export includes all raw data for spreadsheet analysis.
        </p>
      </div>
    </AppLayout>
  );
}
