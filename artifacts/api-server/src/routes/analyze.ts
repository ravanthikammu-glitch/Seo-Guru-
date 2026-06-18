import { Router, type IRouter } from "express";
import axios from "axios";
import { load } from "cheerio";

const router: IRouter = Router();

const STOP_WORDS = new Set([
  "a","about","above","after","again","against","all","am","an","and","any","are",
  "as","at","be","because","been","before","being","below","between","both","but",
  "by","can","did","do","does","doing","down","during","each","few","for","from",
  "further","get","got","had","has","have","having","he","her","here","him","his",
  "how","i","if","in","into","is","it","its","itself","just","like","me","more",
  "my","no","nor","not","now","of","off","on","once","only","or","other","our",
  "out","over","own","same","she","should","so","some","such","than","that","the",
  "their","them","then","there","these","they","this","those","through","to","too",
  "under","until","up","us","very","via","was","we","were","what","when","where",
  "which","while","who","will","with","you","your","also","s","t","re","ll","ve",
  "d","m","new","use","using","used","can","may","one","two","see","make","made",
  "way","page","website","web","site","click","here","please","contact","home",
  "about","services","products","company","our","we","us","your","you",
]);

interface ScoreBreakdown {
  metaTitle: number;
  metaDescription: number;
  h1: number;
  contentLength: number;
  keywordDensity: number;
  internalLinks: number;
  readability: number;
}

interface SiteAnalysis {
  url: string;
  domain: string;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  h1s: string[];
  h2s: string[];
  h3s: string[];
  wordCount: number;
  sentences: number;
  paragraphs: number;
  internalLinks: { href: string; text: string }[];
  externalLinks: { href: string; text: string }[];
  images: { src: string; alt: string }[];
  navItems: string[];
  topKeywords: { word: string; count: number; density: number }[];
  services: string[];
  products: string[];
  socialLinks: { platform: string; url: string }[];
  contactInfo: { emails: string[]; phones: string[] };
  companyName: string;
  seoScore: number;
  scoreBreakdown: ScoreBreakdown;
  techIndicators: string[];
  contentPreview: string;
  fetchError?: string;
}

function getDomain(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    return url;
  }
}

function normalizeUrl(url: string): string {
  if (!url.startsWith("http")) return `https://${url}`;
  return url;
}

function extractKeywords(text: string): { word: string; count: number; density: number }[] {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));
  const total = words.length || 1;
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word, count]) => ({ word, count, density: parseFloat(((count / total) * 100).toFixed(2)) }));
}

function detectServices(text: string, headings: string[]): string[] {
  const SERVICE_PATTERNS = [
    /(?:we offer|our services?|we provide|solutions? include|specializ(?:e|ing) in)[:\s]+([^.!?]+)/gi,
    /(?:service|solution|feature|offering)[:\s]+([^.!?\n]{10,60})/gi,
  ];
  const found = new Set<string>();
  const allText = [...headings, text].join(" ");
  for (const pattern of SERVICE_PATTERNS) {
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(allText)) !== null) {
      const s = m[1].trim().replace(/\s+/g, " ").slice(0, 60);
      if (s.length > 5) found.add(s);
    }
  }
  // also pull h2/h3 that contain service keywords
  for (const h of headings) {
    if (/service|solution|feature|offer|plan|package|tool|platform/i.test(h)) {
      found.add(h.trim().slice(0, 60));
    }
  }
  return Array.from(found).slice(0, 10);
}

function detectProducts(text: string, headings: string[]): string[] {
  const found = new Set<string>();
  const PROD_PATTERNS = [/(?:product|software|app|tool|platform|suite|package)[:\s]+([^.!?\n]{5,60})/gi];
  for (const p of PROD_PATTERNS) {
    let m: RegExpExecArray | null;
    while ((m = p.exec(text)) !== null) {
      const s = m[1].trim().slice(0, 60);
      if (s.length > 4) found.add(s);
    }
  }
  for (const h of headings) {
    if (/product|software|app|tool|platform|pricing|plan/i.test(h)) {
      found.add(h.trim().slice(0, 60));
    }
  }
  return Array.from(found).slice(0, 8);
}

function detectSocialLinks(links: { href: string; text: string }[]): { platform: string; url: string }[] {
  const SOCIALS: [RegExp, string][] = [
    [/twitter\.com|x\.com/, "Twitter/X"],
    [/linkedin\.com/, "LinkedIn"],
    [/facebook\.com/, "Facebook"],
    [/instagram\.com/, "Instagram"],
    [/youtube\.com/, "YouTube"],
    [/github\.com/, "GitHub"],
    [/tiktok\.com/, "TikTok"],
  ];
  const found: { platform: string; url: string }[] = [];
  for (const { href } of links) {
    for (const [re, name] of SOCIALS) {
      if (re.test(href) && !found.find(f => f.platform === name)) {
        found.push({ platform: name, url: href });
      }
    }
  }
  return found;
}

function detectTech(html: string): string[] {
  const techs: string[] = [];
  if (/react/i.test(html) || /__react/i.test(html)) techs.push("React");
  if (/vue/i.test(html) || /vue\.js/i.test(html)) techs.push("Vue.js");
  if (/angular/i.test(html)) techs.push("Angular");
  if (/next\.js|_next\//i.test(html)) techs.push("Next.js");
  if (/nuxt/i.test(html)) techs.push("Nuxt.js");
  if (/wordpress|wp-content|wp-includes/i.test(html)) techs.push("WordPress");
  if (/shopify/i.test(html)) techs.push("Shopify");
  if (/webflow/i.test(html)) techs.push("Webflow");
  if (/wix/i.test(html)) techs.push("Wix");
  if (/squarespace/i.test(html)) techs.push("Squarespace");
  if (/gtag|google-analytics|ga\.js/i.test(html)) techs.push("Google Analytics");
  if (/hubspot/i.test(html)) techs.push("HubSpot");
  if (/intercom/i.test(html)) techs.push("Intercom");
  if (/stripe/i.test(html)) techs.push("Stripe");
  if (/cloudflare/i.test(html)) techs.push("Cloudflare");
  if (/bootstrap/i.test(html)) techs.push("Bootstrap");
  if (/tailwind/i.test(html)) techs.push("Tailwind CSS");
  if (/jquery/i.test(html)) techs.push("jQuery");
  if (/node_modules|__webpack/i.test(html)) techs.push("webpack");
  return [...new Set(techs)];
}

function computeScore(data: Omit<SiteAnalysis, "seoScore" | "scoreBreakdown">): { score: number; breakdown: ScoreBreakdown } {
  const { title, metaDescription, h1s, wordCount, topKeywords, internalLinks, sentences, paragraphs } = data;

  // Meta title (10 pts)
  const titleLen = title.length;
  const metaTitle = title ? (titleLen >= 40 && titleLen <= 65 ? 10 : titleLen > 0 ? 6 : 0) : 0;

  // Meta description (10 pts)
  const descLen = metaDescription.length;
  const metaDesc = metaDescription ? (descLen >= 100 && descLen <= 165 ? 10 : descLen > 0 ? 6 : 0) : 0;

  // H1 (10 pts)
  const h1Score = h1s.length === 1 ? 10 : h1s.length > 1 ? 6 : h1s.length === 0 ? 0 : 0;

  // Content length (20 pts)
  const contentScore = wordCount >= 2000 ? 20 : wordCount >= 1000 ? 16 : wordCount >= 500 ? 11 : wordCount >= 200 ? 6 : 2;

  // Keyword density (20 pts) — top keyword density 0.5–2.5%
  const topDensity = topKeywords[0]?.density ?? 0;
  const kwScore = topDensity >= 0.5 && topDensity <= 2.5 ? 20 : topDensity > 0 ? 12 : 4;

  // Internal links (10 pts)
  const ilCount = internalLinks.length;
  const ilScore = ilCount >= 10 ? 10 : ilCount >= 5 ? 7 : ilCount >= 2 ? 5 : ilCount >= 1 ? 2 : 0;

  // Readability (20 pts) — avg words per sentence
  const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : 30;
  const readability = avgWordsPerSentence <= 15 ? 20 : avgWordsPerSentence <= 20 ? 17 : avgWordsPerSentence <= 25 ? 13 : avgWordsPerSentence <= 30 ? 9 : 5;

  const score = metaTitle + metaDesc + h1Score + contentScore + kwScore + ilScore + readability;

  return {
    score: Math.min(score, 100),
    breakdown: {
      metaTitle,
      metaDescription: metaDesc,
      h1: h1Score,
      contentLength: contentScore,
      keywordDensity: kwScore,
      internalLinks: ilScore,
      readability,
    },
  };
}

async function analyzeSite(rawUrl: string): Promise<SiteAnalysis> {
  const url = normalizeUrl(rawUrl);
  const domain = getDomain(url);
  const base: Omit<SiteAnalysis, "seoScore" | "scoreBreakdown"> = {
    url, domain, title: "", metaDescription: "", metaKeywords: "",
    h1s: [], h2s: [], h3s: [], wordCount: 0, sentences: 0, paragraphs: 0,
    internalLinks: [], externalLinks: [], images: [], navItems: [],
    topKeywords: [], services: [], products: [], socialLinks: [],
    contactInfo: { emails: [], phones: [] }, companyName: domain,
    techIndicators: [], contentPreview: "",
  };

  let html = "";
  try {
    const response = await axios.get(url, {
      timeout: 12000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
      },
      maxRedirects: 5,
    });
    html = typeof response.data === "string" ? response.data : JSON.stringify(response.data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Fetch failed";
    const { score, breakdown } = computeScore(base);
    return { ...base, seoScore: score, scoreBreakdown: breakdown, fetchError: msg };
  }

  const $ = load(html);

  // Remove noise
  $("script, style, noscript, svg, iframe").remove();

  // Meta
  base.title = $("title").first().text().trim();
  base.metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
  base.metaKeywords = $('meta[name="keywords"]').attr("content")?.trim() ?? "";

  // Headings
  base.h1s = $("h1").map((_, el) => $(el).text().trim()).get().filter(Boolean);
  base.h2s = $("h2").map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 20);
  base.h3s = $("h3").map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 20);

  // Body text
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  base.wordCount = bodyText.split(/\s+/).filter(Boolean).length;
  base.sentences = (bodyText.match(/[.!?]+/g) || []).length || 1;
  base.paragraphs = $("p").length;
  base.contentPreview = bodyText.slice(0, 300);

  // Keywords
  base.topKeywords = extractKeywords(bodyText);

  // Links
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const text = $(el).text().trim().slice(0, 80);
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    if (href.startsWith("http") && !href.includes(domain)) {
      base.externalLinks.push({ href, text });
    } else {
      base.internalLinks.push({ href: href.startsWith("http") ? href : `${url}${href.startsWith("/") ? "" : "/"}${href}`, text });
    }
  });
  base.internalLinks = base.internalLinks.slice(0, 40);
  base.externalLinks = base.externalLinks.slice(0, 20);

  // Social links
  base.socialLinks = detectSocialLinks(base.externalLinks);

  // Images
  base.images = $("img").map((_, el) => ({
    src: $(el).attr("src") ?? "",
    alt: $(el).attr("alt") ?? "",
  })).get().slice(0, 20);

  // Navigation
  const navSel = $("nav, header, [role='navigation']");
  navSel.find("a").each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length < 40) base.navItems.push(t);
  });
  base.navItems = [...new Set(base.navItems)].slice(0, 15);

  // Company name
  const og = $('meta[property="og:site_name"]').attr("content");
  if (og) base.companyName = og;
  else if (base.title) {
    const parts = base.title.split(/[|\-–—:]/);
    base.companyName = (parts.at(-1) ?? parts[0] ?? domain).trim();
  }

  // Services / products
  const allHeadings = [...base.h1s, ...base.h2s, ...base.h3s];
  base.services = detectServices(bodyText, allHeadings);
  base.products = detectProducts(bodyText, allHeadings);

  // Contact info
  const emails = [...bodyText.matchAll(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g)].map(m => m[0]);
  const phones = [...bodyText.matchAll(/(?:\+?1[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/g)].map(m => m[0].trim());
  base.contactInfo = { emails: [...new Set(emails)].slice(0, 3), phones: [...new Set(phones)].slice(0, 3) };

  // Tech
  base.techIndicators = detectTech(html);

  const { score, breakdown } = computeScore(base);
  return { ...base, seoScore: score, scoreBreakdown: breakdown };
}

router.post("/analyze", async (req, res) => {
  const { yourUrl, competitorUrl } = req.body as { yourUrl?: string; competitorUrl?: string };

  if (!yourUrl || !competitorUrl) {
    res.status(400).json({ error: "yourUrl and competitorUrl are required" });
    return;
  }

  try {
    const [yourSite, competitorSite] = await Promise.all([
      analyzeSite(yourUrl),
      analyzeSite(competitorUrl),
    ]);

    // Keyword gap: competitor keywords not in yours
    const yourKwSet = new Set(yourSite.topKeywords.map(k => k.word));
    const competitorKwSet = new Set(competitorSite.topKeywords.map(k => k.word));
    const keywordGaps = competitorSite.topKeywords.filter(k => !yourKwSet.has(k.word));
    const sharedKeywords = competitorSite.topKeywords.filter(k => yourKwSet.has(k.word));
    const yourUniqueKeywords = yourSite.topKeywords.filter(k => !competitorKwSet.has(k.word));

    // Nav gap
    const yourNavSet = new Set(yourSite.navItems.map(n => n.toLowerCase()));
    const missingPages = competitorSite.navItems.filter(n => !yourNavSet.has(n.toLowerCase()));

    res.json({
      yourSite,
      competitorSite,
      gaps: {
        keywordGaps: keywordGaps.slice(0, 20),
        sharedKeywords: sharedKeywords.slice(0, 10),
        yourUniqueKeywords: yourUniqueKeywords.slice(0, 10),
        missingPages,
        wordCountDiff: competitorSite.wordCount - yourSite.wordCount,
        scoreDiff: competitorSite.seoScore - yourSite.seoScore,
        headingCountDiff: (competitorSite.h1s.length + competitorSite.h2s.length + competitorSite.h3s.length) - (yourSite.h1s.length + yourSite.h2s.length + yourSite.h3s.length),
        internalLinksDiff: competitorSite.internalLinks.length - yourSite.internalLinks.length,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Analysis failed";
    res.status(500).json({ error: msg });
  }
});

export default router;
