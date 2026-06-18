import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  Globe, Search, AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
  Link2, Image, FileText, Tag, ChevronDown, ChevronUp, ArrowRight,
  Zap, Shield, BarChart2, Hash, Eye, Code,
} from "lucide-react";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ────────────────────────────────────────────────────────────────────
interface ScoreBreakdown {
  metaTitle: number; metaDescription: number; h1: number;
  contentLength: number; keywordDensity: number; internalLinks: number; readability: number;
}
interface SiteAnalysis {
  url: string; domain: string; title: string; metaDescription: string; metaKeywords: string;
  h1s: string[]; h2s: string[]; h3s: string[]; wordCount: number; sentences: number; paragraphs: number;
  internalLinks: { href: string; text: string }[];
  externalLinks: { href: string; text: string }[];
  images: { src: string; alt: string }[];
  navItems: string[];
  topKeywords: { word: string; count: number; density: number }[];
  services: string[]; products: string[];
  socialLinks: { platform: string; url: string }[];
  contactInfo: { emails: string[]; phones: string[] };
  companyName: string; seoScore: number; scoreBreakdown: ScoreBreakdown;
  techIndicators: string[]; contentPreview: string; fetchError?: string;
}
interface AnalysisResult {
  yourSite: SiteAnalysis;
  competitorSite: SiteAnalysis;
  gaps: {
    keywordGaps: { word: string; count: number; density: number }[];
    sharedKeywords: { word: string; count: number; density: number }[];
    yourUniqueKeywords: { word: string; count: number; density: number }[];
    missingPages: string[];
    wordCountDiff: number; scoreDiff: number; headingCountDiff: number; internalLinksDiff: number;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 75 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : score >= 50 ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
    : "text-red-400 bg-red-500/10 border-red-500/20";
  const label = score >= 75 ? "Good" : score >= 50 ? "Needs Work" : "Poor";
  return <Badge className={`text-xs ${cls}`}>{label}</Badge>;
}

function StatRow({ label, a, b, higherIsBetter = true }: { label: string; a: number | string; b: number | string; higherIsBetter?: boolean }) {
  const numA = Number(a), numB = Number(b);
  const aWins = higherIsBetter ? numA >= numB : numA <= numB;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground w-40 shrink-0">{label}</span>
      <span className={`text-sm font-semibold flex-1 ${typeof a === "number" && typeof b === "number" ? (aWins ? "text-emerald-400" : "text-red-400") : "text-foreground"}`}>{a}</span>
      <span className={`text-sm font-semibold flex-1 ${typeof a === "number" && typeof b === "number" ? (!aWins ? "text-emerald-400" : "text-red-400") : "text-foreground"}`}>{b}</span>
    </div>
  );
}

function ScoreBar({ label, yourVal, competitorVal, max }: { label: string; yourVal: number; competitorVal: number; max: number }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>{label}</span>
        <span>{yourVal}/{max} vs {competitorVal}/{max}</span>
      </div>
      <div className="flex gap-1 h-2">
        <div className="flex-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(yourVal / max) * 100}%` }} />
        </div>
        <div className="flex-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-red-400 rounded-full transition-all" style={{ width: `${(competitorVal / max) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function ExpandableList({ items, limit = 5, emptyMsg = "None detected" }: { items: string[]; limit?: number; emptyMsg?: string }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, limit);
  if (items.length === 0) return <p className="text-xs text-muted-foreground italic">{emptyMsg}</p>;
  return (
    <div>
      {shown.map((item, i) => (
        <div key={i} className="flex items-start gap-2 py-1 border-b border-border/50 last:border-0">
          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
          <span className="text-xs text-foreground">{item}</span>
        </div>
      ))}
      {items.length > limit && (
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
          {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />+{items.length - limit} more</>}
        </button>
      )}
    </div>
  );
}

function SiteErrorBanner({ site }: { site: SiteAnalysis }) {
  if (!site.fetchError) return null;
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-400 mb-4">
      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span><strong>{site.domain}</strong>: {site.fetchError}. Showing partial data.</span>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function AnalyzingState({ yourUrl, competitorUrl }: { yourUrl: string; competitorUrl: string }) {
  const steps = [
    "Fetching website HTML...",
    "Extracting meta tags & headings...",
    "Analyzing keyword density...",
    "Computing SEO scores...",
    "Building gap analysis...",
  ];
  const [step, setStep] = useState(0);
  useState(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 900);
    return () => clearInterval(t);
  });
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-14 h-14 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto mb-6" />
            <p className="font-semibold text-foreground mb-1">Analyzing Websites</p>
            <p className="text-xs text-muted-foreground mb-6">{yourUrl} vs {competitorUrl}</p>
            <div className="space-y-2 text-left">
              {steps.map((s, i) => (
                <div key={s} className={`flex items-center gap-2 text-xs transition-all ${i <= step ? "opacity-100" : "opacity-30"}`}>
                  {i < step ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    : i === step ? <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                    : <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />}
                  <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-2 gap-4"><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-40 rounded-xl" /></div>
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Intelligence() {
  const [yourUrl, setYourUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!yourUrl || !competitorUrl) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yourUrl, competitorUrl }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as AnalysisResult;
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const { yourSite, competitorSite, gaps } = result ?? {};

  const radarData = yourSite && competitorSite ? [
    { subject: "Meta Title", your: yourSite.scoreBreakdown.metaTitle, competitor: competitorSite.scoreBreakdown.metaTitle, max: 10 },
    { subject: "Meta Desc", your: yourSite.scoreBreakdown.metaDescription, competitor: competitorSite.scoreBreakdown.metaDescription, max: 10 },
    { subject: "H1", your: yourSite.scoreBreakdown.h1, competitor: competitorSite.scoreBreakdown.h1, max: 10 },
    { subject: "Content", your: yourSite.scoreBreakdown.contentLength, competitor: competitorSite.scoreBreakdown.contentLength, max: 20 },
    { subject: "Keywords", your: yourSite.scoreBreakdown.keywordDensity, competitor: competitorSite.scoreBreakdown.keywordDensity, max: 20 },
    { subject: "Links", your: yourSite.scoreBreakdown.internalLinks, competitor: competitorSite.scoreBreakdown.internalLinks, max: 10 },
    { subject: "Readability", your: yourSite.scoreBreakdown.readability, competitor: competitorSite.scoreBreakdown.readability, max: 20 },
  ] : [];

  const kwBarData = gaps?.keywordGaps.slice(0, 10).map(k => ({
    keyword: k.word,
    competitorCount: k.count,
    yourCount: 0,
  })) ?? [];

  return (
    <AppLayout>
      <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold">Competitor Intelligence</h1>
          <p className="text-sm text-muted-foreground">Real-time website scraping and rule-based SEO gap analysis — no AI required</p>
        </div>

        {/* Input form */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="w-4 h-4 text-primary" />Website Analysis</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Your Website</label>
                <Input data-testid="intel-your-url" value={yourUrl} onChange={e => setYourUrl(e.target.value)} placeholder="https://yourwebsite.com" className="bg-background" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Competitor Website</label>
                <Input data-testid="intel-competitor-url" value={competitorUrl} onChange={e => setCompetitorUrl(e.target.value)} placeholder="https://competitor.com" className="bg-background" />
              </div>
              <div className="flex items-end">
                <Button data-testid="intel-analyze-btn" onClick={handleAnalyze} disabled={loading || !yourUrl || !competitorUrl} className="gap-2 px-8">
                  <Search className="w-4 h-4" />
                  {loading ? "Analyzing..." : "Analyze"}
                </Button>
              </div>
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />{error}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">Fetches live HTML, extracts content, and generates a rule-based SEO report. Works with any public website.</p>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && <AnalyzingState yourUrl={yourUrl} competitorUrl={competitorUrl} />}

        {/* Results */}
        <AnimatePresence>
          {result && !loading && yourSite && competitorSite && gaps && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">

              {/* Error banners */}
              <SiteErrorBanner site={yourSite} />
              <SiteErrorBanner site={competitorSite} />

              {/* Score cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Your Site", site: yourSite, color: "border-primary/30 bg-primary/5", scoreColor: "text-primary" },
                  { label: "Competitor", site: competitorSite, color: "border-red-500/30 bg-red-500/5", scoreColor: "text-red-400" },
                ].map(({ label, site, color, scoreColor }) => (
                  <Card key={label} className={`border ${color}`}>
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                          <p className="font-bold text-sm text-foreground mt-0.5 truncate max-w-48">{site.companyName}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-48">{site.domain}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-4xl font-extrabold ${scoreColor}`}>{site.seoScore}</p>
                          <p className="text-xs text-muted-foreground">/100 SEO Score</p>
                          <ScoreBadge score={site.seoScore} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {[
                          { label: "Words", val: site.wordCount.toLocaleString() },
                          { label: "Headings", val: site.h1s.length + site.h2s.length + site.h3s.length },
                          { label: "Int. Links", val: site.internalLinks.length },
                        ].map(({ label: l, val }) => (
                          <div key={l} className="rounded-lg bg-background border border-border p-2">
                            <p className="text-base font-bold text-foreground">{val}</p>
                            <p className="text-xs text-muted-foreground">{l}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Score diff banner */}
              <Card className={`border ${gaps.scoreDiff > 0 ? "border-red-500/20 bg-red-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    {gaps.scoreDiff > 0
                      ? <TrendingDown className="w-5 h-5 text-red-400 shrink-0" />
                      : <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {gaps.scoreDiff > 0
                          ? `Competitor leads by ${gaps.scoreDiff} SEO points — ${gaps.wordCountDiff > 0 ? `${gaps.wordCountDiff.toLocaleString()} more words` : "stronger meta tags"} and ${Math.abs(gaps.headingCountDiff)} more headings.`
                          : `You lead by ${Math.abs(gaps.scoreDiff)} SEO points! Focus on ${gaps.keywordGaps.length} missing keywords to extend your advantage.`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{gaps.keywordGaps.length} unique competitor keywords identified · {gaps.missingPages.length} missing navigation pages</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <div className={`text-2xl font-extrabold ${gaps.scoreDiff > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {gaps.scoreDiff > 0 ? "-" : "+"}{Math.abs(gaps.scoreDiff)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="overview">
                <TabsList className="flex-wrap h-auto gap-1">
                  <TabsTrigger value="overview" className="gap-1.5 text-xs"><BarChart2 className="w-3.5 h-3.5" />Overview</TabsTrigger>
                  <TabsTrigger value="seo" className="gap-1.5 text-xs"><Zap className="w-3.5 h-3.5" />SEO Scores</TabsTrigger>
                  <TabsTrigger value="keywords" className="gap-1.5 text-xs"><Hash className="w-3.5 h-3.5" />Keywords</TabsTrigger>
                  <TabsTrigger value="content" className="gap-1.5 text-xs"><FileText className="w-3.5 h-3.5" />Content</TabsTrigger>
                  <TabsTrigger value="gaps" className="gap-1.5 text-xs"><AlertTriangle className="w-3.5 h-3.5" />Gaps</TabsTrigger>
                  <TabsTrigger value="tech" className="gap-1.5 text-xs"><Code className="w-3.5 h-3.5" />Technical</TabsTrigger>
                </TabsList>

                {/* ── OVERVIEW ─────────────────────────────── */}
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Metric Comparison</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-xs mb-3">
                          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary/60" /><span className="text-muted-foreground">Your Site</span></div>
                          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-400/60" /><span className="text-muted-foreground">Competitor</span></div>
                        </div>
                        <StatRow label="SEO Score" a={yourSite.seoScore} b={competitorSite.seoScore} />
                        <StatRow label="Word Count" a={yourSite.wordCount} b={competitorSite.wordCount} />
                        <StatRow label="Total Headings" a={yourSite.h1s.length + yourSite.h2s.length + yourSite.h3s.length} b={competitorSite.h1s.length + competitorSite.h2s.length + competitorSite.h3s.length} />
                        <StatRow label="Internal Links" a={yourSite.internalLinks.length} b={competitorSite.internalLinks.length} />
                        <StatRow label="Images" a={yourSite.images.length} b={competitorSite.images.length} />
                        <StatRow label="External Links" a={yourSite.externalLinks.length} b={competitorSite.externalLinks.length} />
                        <StatRow label="Nav Items" a={yourSite.navItems.length} b={competitorSite.navItems.length} />
                        <StatRow label="Keywords Found" a={yourSite.topKeywords.length} b={competitorSite.topKeywords.length} />
                        <StatRow label="Services Detected" a={yourSite.services.length} b={competitorSite.services.length} />
                        <StatRow label="Tech Stack Count" a={yourSite.techIndicators.length} b={competitorSite.techIndicators.length} />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Score Radar</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                          <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                            <Radar name="Your Site" dataKey="your" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                            <Radar name="Competitor" dataKey="competitor" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.15} strokeWidth={2} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Company overview side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Your Site", site: yourSite },
                      { label: "Competitor", site: competitorSite },
                    ].map(({ label, site }) => (
                      <Card key={label}>
                        <CardHeader><CardTitle className="text-sm">{label} — Company Overview</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Title Tag</p>
                            <p className="text-xs text-foreground">{site.title || <em className="text-muted-foreground">Not found</em>}</p>
                            {site.title && <p className="text-xs text-muted-foreground mt-0.5">{site.title.length} chars {site.title.length < 40 ? "— too short" : site.title.length > 65 ? "— too long" : "— optimal"}</p>}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Meta Description</p>
                            <p className="text-xs text-foreground">{site.metaDescription || <em className="text-muted-foreground">Missing</em>}</p>
                            {site.metaDescription && <p className="text-xs text-muted-foreground mt-0.5">{site.metaDescription.length} chars {site.metaDescription.length < 100 ? "— too short" : site.metaDescription.length > 165 ? "— too long" : "— optimal"}</p>}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Services Detected</p>
                            <ExpandableList items={site.services} limit={3} emptyMsg="No services detected in content" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">Navigation Pages</p>
                            <div className="flex flex-wrap gap-1">
                              {site.navItems.length > 0 ? site.navItems.map(n => (
                                <Badge key={n} variant="secondary" className="text-xs">{n}</Badge>
                              )) : <span className="text-xs text-muted-foreground italic">None detected</span>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* ── SEO SCORES ───────────────────────────── */}
                <TabsContent value="seo" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Score Breakdown</CardTitle></CardHeader>
                      <CardContent>
                        <ScoreBar label="Meta Title (max 10)" yourVal={yourSite.scoreBreakdown.metaTitle} competitorVal={competitorSite.scoreBreakdown.metaTitle} max={10} />
                        <ScoreBar label="Meta Description (max 10)" yourVal={yourSite.scoreBreakdown.metaDescription} competitorVal={competitorSite.scoreBreakdown.metaDescription} max={10} />
                        <ScoreBar label="H1 Tag (max 10)" yourVal={yourSite.scoreBreakdown.h1} competitorVal={competitorSite.scoreBreakdown.h1} max={10} />
                        <ScoreBar label="Content Length (max 20)" yourVal={yourSite.scoreBreakdown.contentLength} competitorVal={competitorSite.scoreBreakdown.contentLength} max={20} />
                        <ScoreBar label="Keyword Density (max 20)" yourVal={yourSite.scoreBreakdown.keywordDensity} competitorVal={competitorSite.scoreBreakdown.keywordDensity} max={20} />
                        <ScoreBar label="Internal Links (max 10)" yourVal={yourSite.scoreBreakdown.internalLinks} competitorVal={competitorSite.scoreBreakdown.internalLinks} max={10} />
                        <ScoreBar label="Readability (max 20)" yourVal={yourSite.scoreBreakdown.readability} competitorVal={competitorSite.scoreBreakdown.readability} max={20} />
                        <div className="mt-4 flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1"><div className="w-3 h-1.5 rounded bg-primary" /><span className="text-muted-foreground">Your Site</span></div>
                          <div className="flex items-center gap-1"><div className="w-3 h-1.5 rounded bg-red-400" /><span className="text-muted-foreground">Competitor</span></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-sm">SEO Recommendations</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          {
                            condition: yourSite.scoreBreakdown.metaTitle < 10,
                            severity: yourSite.scoreBreakdown.metaTitle < 6 ? "High" : "Medium",
                            rec: `Meta title is ${yourSite.title.length === 0 ? "missing" : yourSite.title.length < 40 ? "too short" : "too long"} (${yourSite.title.length} chars). Aim for 50–65 characters.`,
                          },
                          {
                            condition: yourSite.scoreBreakdown.metaDescription < 10,
                            severity: yourSite.scoreBreakdown.metaDescription < 6 ? "High" : "Medium",
                            rec: `Meta description is ${yourSite.metaDescription.length === 0 ? "missing" : "not optimal"} (${yourSite.metaDescription.length} chars). Aim for 120–160 characters.`,
                          },
                          {
                            condition: yourSite.scoreBreakdown.h1 < 10,
                            severity: "High",
                            rec: yourSite.h1s.length === 0 ? "Page is missing an H1 tag — critical for SEO." : `Page has ${yourSite.h1s.length} H1 tags. Use exactly one H1 per page.`,
                          },
                          {
                            condition: yourSite.scoreBreakdown.contentLength < 16,
                            severity: "Medium",
                            rec: `Content is only ${yourSite.wordCount} words. Competitor has ${competitorSite.wordCount}. Add ${Math.max(0, competitorSite.wordCount - yourSite.wordCount)} words to close the gap.`,
                          },
                          {
                            condition: yourSite.scoreBreakdown.internalLinks < 7,
                            severity: "Low",
                            rec: `Only ${yourSite.internalLinks.length} internal links found. Add more internal links to improve crawlability and PageRank flow.`,
                          },
                          {
                            condition: yourSite.scoreBreakdown.readability < 15,
                            severity: "Medium",
                            rec: "Readability score is low. Shorten sentences to under 20 words and break up paragraphs.",
                          },
                        ].filter(r => r.condition).map((r, i) => (
                          <div key={i} className={`flex items-start gap-2 p-3 rounded-lg border ${r.severity === "High" ? "border-red-500/20 bg-red-500/5" : r.severity === "Medium" ? "border-yellow-500/20 bg-yellow-500/5" : "border-blue-500/20 bg-blue-500/5"}`}>
                            <div>
                              <Badge className={`text-xs mb-1 ${r.severity === "High" ? "bg-red-500/15 text-red-400 border-red-500/20" : r.severity === "Medium" ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" : "bg-blue-500/15 text-blue-400 border-blue-500/20"}`}>{r.severity}</Badge>
                              <p className="text-xs text-foreground">{r.rec}</p>
                            </div>
                          </div>
                        ))}
                        {[yourSite.scoreBreakdown.metaTitle, yourSite.scoreBreakdown.metaDescription, yourSite.scoreBreakdown.h1, yourSite.scoreBreakdown.contentLength, yourSite.scoreBreakdown.internalLinks, yourSite.scoreBreakdown.readability].every(s => s >= 10) && (
                          <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <p className="text-xs text-emerald-400">All SEO fundamentals look solid! Focus on growing content volume.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* ── KEYWORDS ─────────────────────────────── */}
                <TabsContent value="keywords" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="md:col-span-3">
                      <CardHeader><CardTitle className="text-sm">Top Competitor Keywords You're Missing</CardTitle></CardHeader>
                      <CardContent>
                        {gaps.keywordGaps.length === 0
                          ? <p className="text-xs text-muted-foreground">No significant keyword gaps detected.</p>
                          : <ResponsiveContainer width="100%" height={220}>
                              <BarChart data={kwBarData} margin={{ left: -10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="keyword" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} />
                                <Bar dataKey="competitorCount" name="Competitor occurrences" fill="hsl(var(--destructive))" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                        }
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle className="text-sm">Missing Keywords ({gaps.keywordGaps.length})</CardTitle></CardHeader>
                      <CardContent className="p-0 max-h-72 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 bg-card">
                            <tr className="border-b border-border"><th className="px-4 py-2 text-left text-muted-foreground">Keyword</th><th className="px-4 py-2 text-right text-muted-foreground">Count</th><th className="px-4 py-2 text-right text-muted-foreground">Density</th></tr>
                          </thead>
                          <tbody>
                            {gaps.keywordGaps.map((k, i) => (
                              <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                                <td className="px-4 py-1.5 font-medium text-foreground">{k.word}</td>
                                <td className="px-4 py-1.5 text-right text-red-400 font-semibold">{k.count}</td>
                                <td className="px-4 py-1.5 text-right text-muted-foreground">{k.density}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle className="text-sm">Your Unique Keywords ({gaps.yourUniqueKeywords.length})</CardTitle></CardHeader>
                      <CardContent className="p-0 max-h-72 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 bg-card">
                            <tr className="border-b border-border"><th className="px-4 py-2 text-left text-muted-foreground">Keyword</th><th className="px-4 py-2 text-right text-muted-foreground">Count</th><th className="px-4 py-2 text-right text-muted-foreground">Density</th></tr>
                          </thead>
                          <tbody>
                            {gaps.yourUniqueKeywords.map((k, i) => (
                              <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                                <td className="px-4 py-1.5 font-medium text-foreground">{k.word}</td>
                                <td className="px-4 py-1.5 text-right text-emerald-400 font-semibold">{k.count}</td>
                                <td className="px-4 py-1.5 text-right text-muted-foreground">{k.density}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle className="text-sm">Shared Keywords ({gaps.sharedKeywords.length})</CardTitle></CardHeader>
                      <CardContent className="p-0 max-h-72 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="sticky top-0 bg-card">
                            <tr className="border-b border-border"><th className="px-4 py-2 text-left text-muted-foreground">Keyword</th><th className="px-4 py-2 text-right text-muted-foreground">Them</th><th className="px-4 py-2 text-right text-muted-foreground">You</th></tr>
                          </thead>
                          <tbody>
                            {gaps.sharedKeywords.map((k, i) => {
                              const yours = yourSite.topKeywords.find(kk => kk.word === k.word);
                              return (
                                <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                                  <td className="px-4 py-1.5 font-medium text-foreground">{k.word}</td>
                                  <td className="px-4 py-1.5 text-right text-muted-foreground">{k.count}</td>
                                  <td className="px-4 py-1.5 text-right text-muted-foreground">{yours?.count ?? 0}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* ── CONTENT ──────────────────────────────── */}
                <TabsContent value="content" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[{ label: "Your Site", site: yourSite }, { label: "Competitor", site: competitorSite }].map(({ label, site }) => (
                      <Card key={label}>
                        <CardHeader><CardTitle className="text-sm">{label} — Content Structure</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-2">H1 Tags ({site.h1s.length})</p>
                            <ExpandableList items={site.h1s} limit={3} emptyMsg="No H1 tags found" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-2">H2 Tags ({site.h2s.length})</p>
                            <ExpandableList items={site.h2s} limit={5} emptyMsg="No H2 tags found" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-2">H3 Tags ({site.h3s.length})</p>
                            <ExpandableList items={site.h3s} limit={5} emptyMsg="No H3 tags found" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-2">Content Preview</p>
                            <p className="text-xs text-muted-foreground bg-muted/40 rounded p-2 leading-relaxed">{site.contentPreview || "No content extracted"}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* ── GAPS ─────────────────────────────────── */}
                <TabsContent value="gaps" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-400" />Missing Navigation Pages</CardTitle></CardHeader>
                      <CardContent>
                        {gaps.missingPages.length === 0
                          ? <p className="text-xs text-muted-foreground italic">No missing pages detected in nav comparison.</p>
                          : <div className="space-y-1">
                              {gaps.missingPages.map((p, i) => (
                                <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
                                  <ArrowRight className="w-3 h-3 text-yellow-400 shrink-0" />
                                  <span className="text-xs text-foreground">{p}</span>
                                  <Badge className="ml-auto text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Missing</Badge>
                                </div>
                              ))}
                            </div>
                        }
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4 text-primary" />Competitor Services</CardTitle></CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-2">Services Offered</p>
                          <ExpandableList items={competitorSite.services} limit={5} emptyMsg="No services detected" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-2">Products Mentioned</p>
                          <ExpandableList items={competitorSite.products} limit={5} emptyMsg="No products detected" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader><CardTitle className="text-sm">Full Gap Analysis Table</CardTitle></CardHeader>
                      <CardContent className="p-0">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/30">
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Factor</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Your Site</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Competitor</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Gap</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Priority</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { factor: "SEO Score", your: yourSite.seoScore, comp: competitorSite.seoScore, unit: "pts" },
                              { factor: "Word Count", your: yourSite.wordCount, comp: competitorSite.wordCount, unit: "words" },
                              { factor: "H1 Tags", your: yourSite.h1s.length, comp: competitorSite.h1s.length, unit: "" },
                              { factor: "H2 Tags", your: yourSite.h2s.length, comp: competitorSite.h2s.length, unit: "" },
                              { factor: "H3 Tags", your: yourSite.h3s.length, comp: competitorSite.h3s.length, unit: "" },
                              { factor: "Internal Links", your: yourSite.internalLinks.length, comp: competitorSite.internalLinks.length, unit: "" },
                              { factor: "Images", your: yourSite.images.length, comp: competitorSite.images.length, unit: "" },
                              { factor: "Unique Keywords", your: yourSite.topKeywords.length, comp: competitorSite.topKeywords.length, unit: "" },
                              { factor: "Services Detected", your: yourSite.services.length, comp: competitorSite.services.length, unit: "" },
                              { factor: "Social Links", your: yourSite.socialLinks.length, comp: competitorSite.socialLinks.length, unit: "" },
                              { factor: "Tech Stack", your: yourSite.techIndicators.length, comp: competitorSite.techIndicators.length, unit: "" },
                            ].map(({ factor, your, comp, unit }) => {
                              const diff = your - comp;
                              const winning = diff >= 0;
                              const priority = Math.abs(diff) > 500 ? "High" : Math.abs(diff) > 100 ? "Medium" : Math.abs(diff) > 5 ? "Low" : "Equal";
                              return (
                                <tr key={factor} className="border-b border-border last:border-0 hover:bg-muted/20">
                                  <td className="px-4 py-2.5 font-medium text-foreground text-xs">{factor}</td>
                                  <td className="px-4 py-2.5 text-xs font-semibold text-primary">{your.toLocaleString()}{unit}</td>
                                  <td className="px-4 py-2.5 text-xs font-semibold text-red-400">{comp.toLocaleString()}{unit}</td>
                                  <td className={`px-4 py-2.5 text-xs font-bold ${winning ? "text-emerald-400" : "text-red-400"}`}>
                                    {diff === 0 ? "—" : `${winning ? "+" : ""}${diff.toLocaleString()}`}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    {priority === "Equal"
                                      ? <Badge className="text-xs bg-muted text-muted-foreground border-border">Equal</Badge>
                                      : <Badge className={`text-xs ${priority === "High" ? "bg-red-500/15 text-red-400 border-red-500/20" : priority === "Medium" ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/20" : "bg-blue-500/15 text-blue-400 border-blue-500/20"}`}>{priority}</Badge>
                                    }
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* ── TECHNICAL ────────────────────────────── */}
                <TabsContent value="tech" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[{ label: "Your Site", site: yourSite }, { label: "Competitor", site: competitorSite }].map(({ label, site }) => (
                      <Card key={label}>
                        <CardHeader><CardTitle className="text-sm">{label} — Technical Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1"><Code className="w-3 h-3" />Technology Stack</p>
                            <div className="flex flex-wrap gap-1">
                              {site.techIndicators.length > 0
                                ? site.techIndicators.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)
                                : <span className="text-xs text-muted-foreground italic">None detected</span>}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1"><Link2 className="w-3 h-3" />Social Profiles</p>
                            <div className="space-y-1">
                              {site.socialLinks.length > 0
                                ? site.socialLinks.map(s => (
                                    <div key={s.platform} className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">{s.platform}</Badge>
                                      <span className="text-xs text-muted-foreground truncate max-w-48">{s.url}</span>
                                    </div>
                                  ))
                                : <span className="text-xs text-muted-foreground italic">No social profiles found</span>}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1"><Tag className="w-3 h-3" />Contact Info</p>
                            {(site.contactInfo.emails.length + site.contactInfo.phones.length) > 0 ? (
                              <div className="space-y-1">
                                {site.contactInfo.emails.map(e => <p key={e} className="text-xs text-foreground">{e}</p>)}
                                {site.contactInfo.phones.map(p => <p key={p} className="text-xs text-foreground">{p}</p>)}
                              </div>
                            ) : <span className="text-xs text-muted-foreground italic">No contact info found</span>}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1"><Image className="w-3 h-3" />Images ({site.images.length})</p>
                            <div className="space-y-1 max-h-28 overflow-y-auto">
                              {site.images.slice(0, 8).map((img, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full shrink-0 ${img.alt ? "bg-emerald-500" : "bg-red-500"}`} />
                                  <span className="text-xs text-muted-foreground truncate">{img.src.split("/").pop() || img.src}</span>
                                  {!img.alt && <Badge className="text-xs bg-red-500/10 text-red-400 border-red-500/20 shrink-0">No alt</Badge>}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium mb-2 flex items-center gap-1"><Shield className="w-3 h-3" />Meta Keywords</p>
                            <p className="text-xs text-foreground">{site.metaKeywords || <em className="text-muted-foreground">Not set</em>}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!result && !loading && (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Enter two URLs above and click Analyze</p>
            <p className="text-xs text-muted-foreground mt-1">Fetches live HTML — works with any public website. No API keys needed.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
