import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  TrendingUp, Search, Network, Target, BarChart2, FileText, Download,
  Star, Check, ArrowRight, ChevronRight, Zap, Globe, Award,
  Sun, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";

const FEATURES = [
  { icon: Search, title: "Content Gap Analysis", desc: "Identify every topic your competitors rank for that you're missing. Never let another opportunity slip by." },
  { icon: Network, title: "Topic Cluster Mapping", desc: "Visualize how topics connect and build a strategic content architecture that Google loves." },
  { icon: Target, title: "Keyword Opportunities", desc: "Surface high-value, low-competition keywords your competitors already leverage." },
  { icon: BarChart2, title: "Competitor Comparison", desc: "Side-by-side analysis across content volume, keyword coverage, and authority metrics." },
  { icon: Zap, title: "SEO Recommendations", desc: "AI-powered action items ranked by traffic impact so you always know what to build next." },
  { icon: Download, title: "Export Reports", desc: "Professional PDF and CSV reports ready to share with clients and stakeholders." },
];

const STEPS = [
  { num: "01", title: "Enter your website", desc: "Add your domain to start baseline analysis of your current SEO footprint." },
  { num: "02", title: "Add a competitor", desc: "Input any competitor URL to begin the comparative keyword and content analysis." },
  { num: "03", title: "Generate insights", desc: "Our engine scans thousands of keywords and surfaces the most impactful gaps." },
  { num: "04", title: "Build your strategy", desc: "Export recommendations and start publishing content that captures real traffic." },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "SEO Lead, TechFlow",
    avatar: "SC",
    color: "from-violet-500 to-purple-600",
    text: "SEO Gap Visualizer cut our content planning time in half. The topic cluster map alone is worth every penny.",
    stars: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Founder, Rankly Agency",
    avatar: "MR",
    color: "from-blue-500 to-cyan-600",
    text: "We onboard every new client with a Gap Visualizer audit. The competitor comparison reports are stunning.",
    stars: 5,
  },
  {
    name: "Priya Nair",
    role: "Content Strategist, Hyperion",
    avatar: "PN",
    color: "from-emerald-500 to-teal-600",
    text: "Finally a tool that shows us exactly what to write. Our organic traffic grew 340% in 6 months.",
    stars: 5,
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for getting started",
    popular: false,
    features: ["3 competitor scans/month", "Top 20 keyword gaps", "Basic content gap report", "CSV export"],
    cta: "Get started",
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    desc: "For serious SEO professionals",
    popular: true,
    features: ["Unlimited scans", "Full keyword database", "Topic cluster visualization", "AI recommendations", "PDF & CSV export", "Priority support"],
    cta: "Start free trial",
  },
  {
    name: "Agency",
    price: "$149",
    period: "per month",
    desc: "For teams and agencies",
    popular: false,
    features: ["Everything in Pro", "10 team seats", "White-label reports", "Client portal access", "API access", "Dedicated account manager"],
    cta: "Contact sales",
  },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">SEO Gap Visualizer</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <Link href="/dashboard"><span className="hover:text-foreground transition-colors cursor-pointer">Dashboard</span></Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              data-testid="landing-theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/dashboard">
              <Button data-testid="nav-start-analysis" size="sm">Start Analysis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,_hsl(270_70%_60%_/_0.15),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,_hsl(200_80%_50%_/_0.1),_transparent_60%)]" />
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <Badge className="mb-6 px-4 py-1.5 text-xs font-medium bg-primary/10 text-primary border-primary/20">
              Trusted by 2,400+ SEO professionals
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight max-w-4xl mx-auto">
              Discover Content Opportunities
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Your Competitors Already Rank For
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Analyze competitor websites, uncover content gaps, and build a smarter SEO strategy backed by real data.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link href="/dashboard">
                <Button data-testid="hero-start-analysis" size="lg" className="gap-2 px-8">
                  Start Analysis <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button data-testid="hero-view-demo" variant="outline" size="lg" className="gap-2 px-8">
                View Demo <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-20 relative"
          >
            <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="flex-1 mx-4 h-6 bg-muted rounded-md" />
              </div>
              <div className="p-6 grid grid-cols-4 gap-4">
                {[
                  { label: "Missing Topics", value: "42", color: "bg-violet-500/20 text-violet-400" },
                  { label: "Keyword Opps", value: "156", color: "bg-blue-500/20 text-blue-400" },
                  { label: "Competitor Articles", value: "87", color: "bg-cyan-500/20 text-cyan-400" },
                  { label: "SEO Score", value: "73", color: "bg-emerald-500/20 text-emerald-400" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border p-4 bg-background">
                    <div className={`text-2xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6 grid grid-cols-3 gap-4">
                <div className="col-span-2 rounded-xl border border-border bg-background p-4 h-40 flex items-end gap-2">
                  {[40, 65, 30, 80, 55, 90, 45, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: `hsl(var(--primary) / ${0.4 + i * 0.07})` }} />
                  ))}
                </div>
                <div className="rounded-xl border border-border bg-background p-4 h-40 flex flex-col gap-2">
                  {["Technical SEO", "Schema Markup", "Local SEO", "Core Web Vitals"].map((t, i) => (
                    <div key={t} className="flex items-center gap-2">
                      <div className={`h-1.5 rounded-full flex-1`} style={{ background: `hsl(var(--chart-${(i % 5) + 1}))`, width: `${[92, 88, 70, 82][i]}%` }} />
                      <span className="text-xs text-muted-foreground shrink-0">{[92, 88, 70, 82][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -inset-x-6 -bottom-6 h-24 bg-gradient-to-t from-background to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Features</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold">Everything you need to close the gap</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">A complete suite of SEO intelligence tools in one focused platform.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all hover:shadow-lg group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Process</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">From URL to strategy in minutes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent -translate-x-4 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl border-2 border-primary/30 bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-lg font-extrabold text-primary">{s.num}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Testimonials</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold">Trusted by the people who rank</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xs font-bold text-white`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">Simple, transparent pricing</h2>
            <p className="mt-4 text-muted-foreground">Start free, upgrade when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-6 rounded-2xl border ${p.popular ? "border-primary bg-card shadow-xl shadow-primary/10" : "border-border bg-card"}`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    {p.popular && <Award className="w-4 h-4 text-primary" />}
                    <h3 className="font-bold text-lg">{p.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{p.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">{p.price}</span>
                    <span className="text-sm text-muted-foreground">/{p.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard">
                  <Button
                    data-testid={`pricing-cta-${p.name.toLowerCase()}`}
                    className="w-full"
                    variant={p.popular ? "default" : "outline"}
                  >
                    {p.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-blue-500/10 p-16">
          <Globe className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to outrank your competitors?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">Join 2,400+ SEO professionals who use Gap Visualizer to build smarter content strategies.</p>
          <Link href="/dashboard">
            <Button data-testid="cta-start-analyzing" size="lg" className="gap-2 px-10">
              Start Analyzing Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold">SEO Gap Visualizer</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Home</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <Link href="/dashboard"><span className="hover:text-foreground transition-colors cursor-pointer">Dashboard</span></Link>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">2024 SEO Gap Visualizer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
