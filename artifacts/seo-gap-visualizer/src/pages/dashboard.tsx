import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import {
  ArrowUp, ArrowDown, ChevronUp, ChevronDown, ChevronsUpDown,
  AlertCircle, CheckCircle, Clock, Lightbulb, Search, Globe,
} from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  MOCK_KEYWORDS, MOCK_CONTENT_GAPS, MOCK_TOPIC_CLUSTERS,
  MOCK_RECOMMENDATIONS, HEATMAP_DATA, COMPARISON_DATA,
} from "@/lib/mock-data";

// ── Animated counter ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1500, active = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return value;
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, suffix = "", color, icon: Icon, delta }: {
  label: string; value: number; suffix?: string; color: string;
  icon: React.ElementType; delta?: string;
}) {
  const count = useCountUp(value);
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${color}`} />
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
            <p className="text-3xl font-extrabold mt-1 text-foreground">
              {count.toLocaleString()}{suffix}
            </p>
            {delta && (
              <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3" />{delta}
              </p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace("bg-", "bg-").replace("-500", "-500/15")}`}>
            <Icon className={`w-5 h-5 ${color.replace("bg-", "text-")}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Sort icon helper ──────────────────────────────────────────────────────────
function SortIcon({ field, sort }: { field: string; sort: { field: string; dir: "asc" | "desc" } }) {
  if (sort.field !== field) return <ChevronsUpDown className="w-3 h-3 text-muted-foreground inline ml-1" />;
  return sort.dir === "asc"
    ? <ChevronUp className="w-3 h-3 text-primary inline ml-1" />
    : <ChevronDown className="w-3 h-3 text-primary inline ml-1" />;
}

// ── Priority badge ─────────────────────────────────────────────────────────────
function PriorityBadge({ p }: { p: string }) {
  const map = {
    High: "bg-red-500/15 text-red-400 border-red-500/20",
    Medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  } as Record<string, string>;
  return <Badge className={`text-xs ${map[p] ?? ""}`}>{p}</Badge>;
}

// ── Topic cluster SVG ─────────────────────────────────────────────────────────
function TopicCluster() {
  const [hovered, setHovered] = useState<string | null>(null);
  const cx = 450, cy = 255;
  const r1 = 150, r2 = 68;
  const baseAngles = [0, 60, 120, 180, 240, 300];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox="0 0 900 510" className="w-full max-w-3xl mx-auto" style={{ minWidth: 400 }}>
        {/* Lines from center to cluster nodes */}
        {MOCK_TOPIC_CLUSTERS.map((cluster, i) => {
          const angle = (baseAngles[i] * Math.PI) / 180;
          const nx = cx + r1 * Math.cos(angle);
          const ny = cy + r1 * Math.sin(angle);
          return (
            <line key={`line-c-${i}`} x1={cx} y1={cy} x2={nx} y2={ny}
              stroke={cluster.color} strokeWidth="1.5" strokeOpacity="0.35" strokeDasharray="4 3" />
          );
        })}

        {/* Sub-node lines and nodes */}
        {MOCK_TOPIC_CLUSTERS.map((cluster, i) => {
          const angle = (baseAngles[i] * Math.PI) / 180;
          const nx = cx + r1 * Math.cos(angle);
          const ny = cy + r1 * Math.sin(angle);
          const dx = nx - cx, dy = ny - cy;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len, uy = dy / len;

          return cluster.subTopics.map((sub, j) => {
            const n = cluster.subTopics.length;
            const spread = ((j - (n - 1) / 2) * 22 * Math.PI) / 180;
            const cosS = Math.cos(spread), sinS = Math.sin(spread);
            const rx = ux * cosS - uy * sinS;
            const ry = ux * sinS + uy * cosS;
            const sx = nx + r2 * rx;
            const sy = ny + r2 * ry;
            const key = `${cluster.name}-${sub}`;
            return (
              <g key={key}>
                <line x1={nx} y1={ny} x2={sx} y2={sy}
                  stroke={cluster.color} strokeWidth="1" strokeOpacity="0.3" />
                <circle cx={sx} cy={sy} r={hovered === key ? 22 : 18}
                  fill={cluster.color} fillOpacity="0.15"
                  stroke={cluster.color} strokeWidth="1" strokeOpacity="0.5"
                  style={{ cursor: "pointer", transition: "r 0.2s" }}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                />
                <text x={sx} y={sy + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize="7.5" fill={cluster.color} fontWeight="600" style={{ pointerEvents: "none" }}
                >
                  {sub.split(" ").map((w, wi) => (
                    <tspan key={wi} x={sx} dy={wi === 0 ? (sub.split(" ").length > 1 ? -4 : 0) : 9}>{w}</tspan>
                  ))}
                </text>
              </g>
            );
          });
        })}

        {/* Cluster nodes */}
        {MOCK_TOPIC_CLUSTERS.map((cluster, i) => {
          const angle = (baseAngles[i] * Math.PI) / 180;
          const nx = cx + r1 * Math.cos(angle);
          const ny = cy + r1 * Math.sin(angle);
          const isHov = hovered?.startsWith(cluster.name);
          return (
            <g key={cluster.name}>
              <circle cx={nx} cy={ny} r={isHov ? 30 : 26}
                fill={cluster.color} fillOpacity={isHov ? "0.35" : "0.2"}
                stroke={cluster.color} strokeWidth="2"
                style={{ cursor: "pointer", transition: "r 0.2s" }}
              />
              <text x={nx} y={ny} textAnchor="middle" dominantBaseline="middle"
                fontSize="8.5" fill={cluster.color} fontWeight="700" style={{ pointerEvents: "none" }}
              >
                {cluster.name.split(" ").map((w, wi, arr) => (
                  <tspan key={wi} x={nx} dy={wi === 0 ? (arr.length > 1 ? -5 : 0) : 11}>{w}</tspan>
                ))}
              </text>
            </g>
          );
        })}

        {/* Center node */}
        <circle cx={cx} cy={cy} r="38" fill="hsl(var(--primary))" fillOpacity="0.2"
          stroke="hsl(var(--primary))" strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r="28" fill="hsl(var(--primary))" fillOpacity="0.15" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
          fontSize="13" fill="hsl(var(--primary))" fontWeight="800">SEO</text>
      </svg>
    </div>
  );
}

// ── Heatmap ───────────────────────────────────────────────────────────────────
function OpportunityHeatmap() {
  const [hov, setHov] = useState<number | null>(null);
  const cols = 6;
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {HEATMAP_DATA.map((cell, i) => {
        const bg = cell.level === "High"
          ? "bg-emerald-500/25 border-emerald-500/30 hover:bg-emerald-500/40"
          : cell.level === "Medium"
          ? "bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/35"
          : "bg-red-500/20 border-red-500/30 hover:bg-red-500/35";
        const textColor = cell.level === "High"
          ? "text-emerald-400"
          : cell.level === "Medium"
          ? "text-yellow-400"
          : "text-red-400";
        return (
          <UITooltip key={i}>
            <TooltipTrigger asChild>
              <div
                data-testid={`heatmap-cell-${i}`}
                className={`relative rounded-lg border p-2 transition-all cursor-pointer ${bg}`}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
              >
                <p className="text-xs font-medium text-foreground leading-tight truncate">{cell.topic}</p>
                <p className={`text-base font-extrabold mt-0.5 ${textColor}`}>{cell.score}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">{cell.topic}</p>
              <p className="text-xs">Opportunity: {cell.score}/100 — {cell.level}</p>
            </TooltipContent>
          </UITooltip>
        );
      })}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [yourUrl, setYourUrl] = useState("mywebsite.com");
  const [competitorUrl, setCompetitorUrl] = useState("ahrefs.com");
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const [gapSearch, setGapSearch] = useState("");
  const [kwSearch, setKwSearch] = useState("");
  const [gapSort, setGapSort] = useState<{ field: string; dir: "asc" | "desc" }>({ field: "opportunityScore", dir: "desc" });
  const [kwSort, setKwSort] = useState<{ field: string; dir: "asc" | "desc" }>({ field: "opportunityScore", dir: "desc" });

  const handleAnalyze = () => {
    setLoading(true);
    setAnalyzed(false);
    setTimeout(() => {
      setLoading(false);
      setAnalyzed(true);
    }, 1600);
  };

  const toggleSort = (current: typeof gapSort, field: string, setter: (s: typeof gapSort) => void) => {
    setter(current.field === field ? { field, dir: current.dir === "asc" ? "desc" : "asc" } : { field, dir: "desc" });
  };

  const filteredGaps = MOCK_CONTENT_GAPS
    .filter(g => g.topic.toLowerCase().includes(gapSearch.toLowerCase()))
    .sort((a, b) => {
      const v = gapSort.dir === "asc" ? 1 : -1;
      const av = a[gapSort.field as keyof typeof a], bv = b[gapSort.field as keyof typeof b];
      return typeof av === "number" ? (av - (bv as number)) * v : String(av).localeCompare(String(bv)) * v;
    });

  const filteredKws = MOCK_KEYWORDS
    .filter(k => k.keyword.toLowerCase().includes(kwSearch.toLowerCase()))
    .sort((a, b) => {
      const v = kwSort.dir === "asc" ? 1 : -1;
      const av = a[kwSort.field as keyof typeof a], bv = b[kwSort.field as keyof typeof b];
      return typeof av === "number" ? (av - (bv as number)) * v : String(av).localeCompare(String(bv)) * v;
    });

  return (
    <AppLayout>
      <div className="px-6 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Competitive SEO intelligence at a glance</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Missing Topics" value={42} color="bg-violet-500" icon={AlertCircle} delta="+8 this week" />
          <StatCard label="Keyword Opportunities" value={156} color="bg-blue-500" icon={Search} delta="+23 new" />
          <StatCard label="Competitor Articles" value={87} color="bg-cyan-500" icon={Globe} />
          <StatCard label="SEO Score" value={73} suffix="/100" color="bg-emerald-500" icon={CheckCircle} delta="+4 pts" />
        </div>

        {/* Analysis form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Website Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Your Website URL</label>
                <Input
                  data-testid="input-your-url"
                  value={yourUrl}
                  onChange={e => setYourUrl(e.target.value)}
                  placeholder="mywebsite.com"
                  className="bg-background"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Competitor Website URL</label>
                <Input
                  data-testid="input-competitor-url"
                  value={competitorUrl}
                  onChange={e => setCompetitorUrl(e.target.value)}
                  placeholder="competitor.com"
                  className="bg-background"
                />
              </div>
              <div className="flex items-end">
                <Button data-testid="analyze-button" onClick={handleAnalyze} disabled={loading} className="gap-2 px-8">
                  {loading ? <Clock className="w-4 h-4 animate-spin" /> : null}
                  {loading ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </div>
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {analyzed && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Overview comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-primary/30">
                  <CardContent className="pt-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Your Site — {yourUrl}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Articles</span>
                        <span className="font-bold text-foreground">45</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Keywords</span>
                        <span className="font-bold text-foreground">210</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Backlinks</span>
                        <span className="font-bold text-foreground">1,240</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Domain Score</span>
                        <span className="font-bold text-foreground">38</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-500/20">
                  <CardContent className="pt-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Competitor — {competitorUrl}</p>
                    <div className="space-y-2">
                      {[["Articles", "87"], ["Keywords", "620"], ["Backlinks", "4,800"], ["Domain Score", "67"]].map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{k}</span>
                          <span className="font-bold text-red-400">{v}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Gap Summary</p>
                    <div className="space-y-2">
                      {[
                        { label: "Content Gap", val: "42 topics", color: "text-red-400" },
                        { label: "Keyword Gap", val: "410 keywords", color: "text-orange-400" },
                        { label: "Backlink Gap", val: "3,560 links", color: "text-yellow-400" },
                        { label: "Authority Gap", val: "29 points", color: "text-red-400" },
                      ].map(({ label, val, color }) => (
                        <div key={label} className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{label}</span>
                          <span className={`font-bold ${color}`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison bar chart */}
              <Card>
                <CardHeader><CardTitle className="text-base">Metric Comparison</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={COMPARISON_DATA} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="category" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: "hsl(var(--foreground))" }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="yourSite" name={yourUrl} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="competitor" name={competitorUrl} fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Content Gap Table */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="text-base">Content Gap Analysis</CardTitle>
                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        data-testid="gap-search"
                        className="pl-8 h-8 text-xs bg-background"
                        placeholder="Filter topics..."
                        value={gapSearch}
                        onChange={e => setGapSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {[
                            { key: "topic", label: "Topic" },
                            { key: "competitorCoverage", label: "Competitor %" },
                            { key: "yourCoverage", label: "Your %" },
                            { key: "opportunityScore", label: "Score" },
                            { key: "priority", label: "Priority" },
                          ].map(col => (
                            <th
                              key={col.key}
                              className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                              onClick={() => toggleSort(gapSort, col.key, setGapSort)}
                            >
                              {col.label}<SortIcon field={col.key} sort={gapSort} />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGaps.map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-2.5 font-medium text-foreground">{row.topic}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${row.competitorCoverage}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{row.competitorCoverage}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full" style={{ width: `${row.yourCoverage}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{row.yourCoverage}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`font-bold ${row.opportunityScore >= 85 ? "text-emerald-400" : row.opportunityScore >= 70 ? "text-yellow-400" : "text-red-400"}`}>
                                {row.opportunityScore}
                              </span>
                            </td>
                            <td className="px-4 py-2.5"><PriorityBadge p={row.priority} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Topic Cluster */}
              <Card>
                <CardHeader><CardTitle className="text-base">Topic Cluster Map</CardTitle></CardHeader>
                <CardContent>
                  <TopicCluster />
                  <div className="flex flex-wrap gap-3 mt-4 justify-center">
                    {MOCK_TOPIC_CLUSTERS.map(c => (
                      <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                        {c.name}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Keyword Opportunities */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="text-base">Keyword Opportunities</CardTitle>
                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        data-testid="keyword-search"
                        className="pl-8 h-8 text-xs bg-background"
                        placeholder="Filter keywords..."
                        value={kwSearch}
                        onChange={e => setKwSearch(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0">
                        <tr className="border-b border-border bg-card">
                          {[
                            { key: "keyword", label: "Keyword" },
                            { key: "searchVolume", label: "Volume" },
                            { key: "difficulty", label: "Difficulty" },
                            { key: "competitorRank", label: "Comp. Rank" },
                            { key: "opportunityScore", label: "Score" },
                          ].map(col => (
                            <th
                              key={col.key}
                              className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                              onClick={() => toggleSort(kwSort, col.key, setKwSort)}
                            >
                              {col.label}<SortIcon field={col.key} sort={kwSort} />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredKws.map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-2.5 font-medium text-foreground">{row.keyword}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{row.searchVolume.toLocaleString()}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${row.difficulty <= 30 ? "bg-emerald-500" : row.difficulty <= 55 ? "bg-yellow-500" : "bg-red-500"}`}
                                    style={{ width: `${row.difficulty}%` }} />
                                </div>
                                <span className="text-xs">{row.difficulty}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">{row.competitorRank}</td>
                            <td className="px-4 py-2.5">
                              <span className={`font-bold text-sm ${row.opportunityScore >= 85 ? "text-emerald-400" : row.opportunityScore >= 70 ? "text-yellow-400" : "text-muted-foreground"}`}>
                                {row.opportunityScore}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {MOCK_RECOMMENDATIONS.map((rec, i) => (
                      <motion.div
                        key={rec.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="p-4 rounded-xl border border-border bg-background hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <PriorityBadge p={rec.priority} />
                          <span className="text-xs text-emerald-400 font-semibold">{rec.impact}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground mb-1 mt-2">{rec.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{rec.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{rec.keywords} keywords</span>
                          <Button size="sm" variant="outline" className="h-7 text-xs px-3 group-hover:border-primary/50 transition-colors">
                            Start Creating
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Heatmap */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Opportunity Heatmap</CardTitle>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-500/40" /><span className="text-muted-foreground">High</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-yellow-500/40" /><span className="text-muted-foreground">Medium</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500/40" /><span className="text-muted-foreground">Low</span></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <OpportunityHeatmap />
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!analyzed && !loading && (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <Search className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Enter your website and a competitor URL above, then click Analyze</p>
            <p className="text-xs text-muted-foreground mt-1">Results will appear here in seconds</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
