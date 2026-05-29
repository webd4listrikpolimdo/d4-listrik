import { NextResponse } from "next/server";

interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

export interface NewsArticle {
  id: string;
  judul: string;
  ringkasan: string;
  tanggal: string;
  url: string;
  gambar: string | null;
  sumber: string;
  _rawDate?: string;
}

// In-memory cache
let cachedArticles: NewsArticle[] | null = null;
let cacheTimestamp = 0;
let cachedIsLive = false;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

// RSS feed sources separated into Local (Indonesian) and International
const LOCAL_FEEDS = [
  {
    url: "https://www.dunia-energi.com/feed/",
    sumber: "Dunia Energi",
  },
  {
    url: "https://www.ruangenergi.com/feed/",
    sumber: "Ruang Energi",
  },
];

const INTL_FEEDS = [
  {
    url: "https://www.power-technology.com/feed/",
    sumber: "Power Technology",
  },
  {
    url: "https://www.renewableenergyworld.com/feed/",
    sumber: "Renewable Energy World",
  },
  {
    url: "https://electrek.co/feed/",
    sumber: "Electrek",
  },
  {
    url: "https://cleantechnica.com/feed/",
    sumber: "CleanTechnica",
  },
];

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Extract text content between XML tags
function extractTag(xml: string, tag: string): string {
  // Try CDATA first
  const cdataRegex = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, "i");
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  // Regular tag content
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : "";
}

// Extract image URL from RSS item
function extractImage(itemXml: string): string | null {
  // Try media:content
  const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch) return mediaMatch[1];

  // Try media:thumbnail
  const thumbMatch = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
  if (thumbMatch) return thumbMatch[1];

  // Try enclosure
  const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image/i);
  if (enclosureMatch) return enclosureMatch[1];

  // Try image tag in content or description
  const imgMatch = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];

  // Try og:image style content
  const ogMatch = itemXml.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]*)?/i);
  if (ogMatch) return ogMatch[0];

  return null;
}

// Fetch og:image from an article's actual page as a fallback
async function fetchOgImage(articleUrl: string): Promise<string | null> {
  try {
    const response = await fetch(articleUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(4000),
      redirect: "follow",
    });

    if (!response.ok) return null;

    // Only read the first ~20KB to find the og:image meta tag (it's always in <head>)
    const reader = response.body?.getReader();
    if (!reader) return null;

    let html = "";
    const decoder = new TextDecoder();
    while (html.length < 20000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      // Stop early if we've passed </head>
      if (html.includes("</head>")) break;
    }
    reader.cancel().catch(() => {});

    // Match og:image meta tag (handles both property/name and content order variations)
    const ogMatch = html.match(
      /<meta[^>]+(?:property|name)=["']og:image["'][^>]+content=["']([^"']+)["']/i
    );
    if (ogMatch) return ogMatch[1];

    // Also try reversed attribute order: content before property
    const ogMatchReversed = html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']og:image["']/i
    );
    if (ogMatchReversed) return ogMatchReversed[1];

    // Try twitter:image as another fallback
    const twitterMatch = html.match(
      /<meta[^>]+(?:property|name)=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
    );
    if (twitterMatch) return twitterMatch[1];

    const twitterMatchReversed = html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']twitter:image["']/i
    );
    if (twitterMatchReversed) return twitterMatchReversed[1];

    return null;
  } catch {
    return null;
  }
}

// Strip HTML tags and decode common HTML entities from text
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8211;/g, "-") // en dash
    .replace(/&#8212;/g, "--") // em dash
    .replace(/&#8216;/g, "'") // left single quote
    .replace(/&#8217;/g, "'") // right single quote
    .replace(/&#8220;/g, '"') // left double quote
    .replace(/&#8221;/g, '"') // right double quote
    .replace(/\s+/g, " ")
    .trim();
}

// Parse raw date string into a timestamp for sorting
function parseDateTimestamp(dateStr: string): number {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  } catch {
    return 0;
  }
}

// Keywords for filtering electricity, energy, and technology topics
const STRICT_KEYWORDS = [
  "listrik", "kelistrikan", "ketenagalistrikan", "pln", "gardu", "tegangan",
  "ebt", "surya", "solar", "turbin", "generator", "baterai", "battery",
  "power grid", "power plant", "pembangkit", "nuklir", "kabel listrik",
  "ev", "mobil listrik", "motor listrik", "kendaraan listrik", "charging station", "spklu",
  "wind farm", "renewable", "geothermal", "hidro", "batu bara", "coal", "biomassa",
  "electricity", "electrical", "power line", "wind turbine", "photovoltaic", "microgrid",
  "smart grid", "substation", "nuclear", "fusion",
  "plts", "plta", "pltu", "pltg", "pltb", "pltn", "pltmh", "transmisi", "distribusi",
  "gardu induk", "trafo", "transformator", "dinamo", "instalasi listrik", "arus listrik",
  "voltase", "ampere", "watt", "kilowatt", "megawatt", "panel surya", "inverter",
  "jaringan listrik", "energi bersih", "energi terbarukan", "transisi energi", "energi hijau",
  "energi baru"
];

const EXCLUDE_KEYWORDS = [
  "rudal", "senjata", "bom", "militer", "perang", "tempur", "serang", "pasukan",
  "ditembak", "tewas", "hulu ledak", "ledakan", "polisi", "kriminal", "pembunuhan", "teroris",
  "roket", "misil", "weapon", "military", "war", "combat", "army",
  "smartphone", "iphone", "playstation", "ps4", "ps5", "game", "gaming", "samsung galaxy",
  "gadget", "hp", "handphone", "hacker", "peretasan", "ransomware", "siber", "cyber", "malware",
  "aplikasi", "medsos", "sosial media", "tiktok", "instagram", "facebook", "whatsapp", "meta",
  "google search", "android", "ios", "windows", "film", "drama", "bioskop", "streaming", "tv",
  "saham", "rupiah", "emas", "investasi", "rekening", "pinjol", "fintech", "perbankan", "bank",
  "kripto", "bitcoin", "kiamat", "bencana", "gempa", "tsunami", "banjir", "cuaca", "hujan",
  // Oil & Gas and general corporate award exclusions
  "migas", "hulu migas", "minyak bumi", "gas bumi", "pengeboran", "drilling", "carbon trading",
  "bursa karbon", "carbon credit", "karya tulis", "juara", "lomba", "kompetisi", "penghargaan",
  "award", "menang", "eksplorasi", "kilang", "hulu", "kontrak", "masela", "blm",
  "pertamina", "biodiesel", "biofuel", "aprobi", "patra niaga", "bbm", "spbu", "pom bensin",
  "phe", "phi", "ptk"
];

function buildRegex(keyword: string, exactWord: boolean = false): RegExp {
  if (exactWord) {
    return new RegExp(`\\b${keyword}\\b`, "i");
  }
  const wholeWordOnly = [
    "ev", "ebt", "pln", "daya", "grid", "smr", "coal", "wind",
    "plts", "plta", "pltu", "pltg", "pltb", "pltn", "pltmh", "trafo", "watt"
  ];
  if (wholeWordOnly.includes(keyword.toLowerCase())) {
    return new RegExp(`\\b${keyword}\\b`, "i");
  }
  return new RegExp(`\\b${keyword}`, "i");
}

const STRICT_REGEXES = STRICT_KEYWORDS.map(k => buildRegex(k));
const EXCLUDE_REGEXES = EXCLUDE_KEYWORDS.map(k => buildRegex(k, true));

function getRelevanceScore(title: string, description: string): number {
  const text = `${title} ${description}`;
  
  // Exclude irrelevant topics (military, weapons, consumer gadgets, cybersecurity, finance, general disasters)
  if (EXCLUDE_REGEXES.some(r => r.test(text))) {
    return -1; // Discard
  }
  
  // Check strict keywords
  if (STRICT_REGEXES.some(r => r.test(text))) {
    return 1; // High relevance (Directly electrical/energy program)
  }
  
  return 0; // Low relevance / Off-topic
}

// Parse a single RSS feed and return articles
async function parseRSSFeed(feedUrl: string, sourceName: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(feedUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.warn(`RSS feed ${feedUrl} returned ${response.status}`);
      return [];
    }

    const xml = await response.text();

    // Split into items
    const items = xml.split(/<item[\s>]/i).slice(1);

    // Process up to 25 items from the XML to find relevant articles
    const allParsed = items.slice(0, 25).map((item, index) => {
      const title = stripHtml(extractTag(item, "title"));
      const link = extractTag(item, "link") || extractTag(item, "guid");
      const description = stripHtml(extractTag(item, "description"));
      const pubDate = extractTag(item, "pubDate");
      const image = extractImage(item);

      return {
        id: `rss-${sourceName.toLowerCase().replace(/\s+/g, "-")}-${index}-${Date.now()}`,
        judul: title,
        ringkasan: description.slice(0, 250) + (description.length > 250 ? "..." : ""),
        tanggal: formatDate(pubDate),
        url: link,
        gambar: image,
        sumber: sourceName,
        _rawDate: pubDate, // preserve raw date for sorting
        _score: getRelevanceScore(title, description),
      };
    }).filter(a => a.judul && a.url);

    // Keep only articles that are strictly relevant (score 1)
    const filtered = allParsed.filter(a => a._score === 1);

    // Take top 5 and strip the internal _score
    const articles = filtered.slice(0, 5).map(({ _score, ...rest }) => rest);

    // For articles missing images, try fetching og:image from the actual page
    const ogFetches = articles.map(async (article) => {
      if (!article.gambar && article.url) {
        const ogImage = await fetchOgImage(article.url);
        if (ogImage) {
          article.gambar = ogImage;
        }
      }
      return article;
    });

    return Promise.all(ogFetches);
  } catch (err) {
    console.warn(`Failed to parse RSS feed ${feedUrl}:`, err);
    return [];
  }
}

// Fetch from all RSS feeds (guaranteeing at least 1 from each source, balanced 5/5 local vs international)
async function fetchFromRSS(): Promise<NewsArticle[]> {
  const feeds = [
    ...LOCAL_FEEDS.map(f => ({ ...f, type: "local" as const })),
    ...INTL_FEEDS.map(f => ({ ...f, type: "intl" as const }))
  ];

  const feedPromises = feeds.map(async (feed) => {
    const articles = await parseRSSFeed(feed.url, feed.sumber);
    return { sumber: feed.sumber, type: feed.type, articles };
  });

  const results = await Promise.allSettled(feedPromises);

  const selectedLocal: NewsArticle[] = [];
  const selectedIntl: NewsArticle[] = [];
  const localPool: NewsArticle[] = [];
  const intlPool: NewsArticle[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      const { sumber, type, articles } = result.value;
      if (articles.length > 0) {
        // Sort articles of this source by date to find the newest one
        const sortedArticles = [...articles].sort((a, b) => {
          const dateA = parseDateTimestamp(a._rawDate || a.tanggal);
          const dateB = parseDateTimestamp(b._rawDate || b.tanggal);
          return dateB - dateA;
        });

        // The newest is guaranteed to be included
        if (type === "local") {
          selectedLocal.push(sortedArticles[0]);
          localPool.push(...sortedArticles.slice(1));
        } else {
          selectedIntl.push(sortedArticles[0]);
          intlPool.push(...sortedArticles.slice(1));
        }
      }
    }
  }

  // Sort pools by date (newest first)
  const sortByDate = (a: any, b: any) => {
    const dateA = parseDateTimestamp(a._rawDate || a.tanggal);
    const dateB = parseDateTimestamp(b._rawDate || b.tanggal);
    return dateB - dateA;
  };
  localPool.sort(sortByDate);
  intlPool.sort(sortByDate);

  // Fill local selection up to 5 from local pool
  const localNeeded = 5 - selectedLocal.length;
  if (localNeeded > 0 && localPool.length > 0) {
    selectedLocal.push(...localPool.splice(0, localNeeded));
  }

  // Fill international selection up to 5 from international pool
  const intlNeeded = 5 - selectedIntl.length;
  if (intlNeeded > 0 && intlPool.length > 0) {
    selectedIntl.push(...intlPool.splice(0, intlNeeded));
  }

  // If we still have fewer than 10 articles in total, fill remaining slots from the combined pool
  const totalCount = selectedLocal.length + selectedIntl.length;
  if (totalCount < 10) {
    const combinedPool = [...localPool, ...intlPool].sort(sortByDate);
    const needed = 10 - totalCount;
    const padding = combinedPool.slice(0, needed);
    
    // Distribute padding based on type
    for (const art of padding) {
      const isLocal = LOCAL_FEEDS.some(f => f.sumber === art.sumber);
      if (isLocal) {
        selectedLocal.push(art);
      } else {
        selectedIntl.push(art);
      }
    }
  }

  // Combine and sort selection by date (newest first)
  const combined = [...selectedLocal, ...selectedIntl];
  combined.sort(sortByDate);

  // Strip internal _rawDate before returning
  return combined.map(({ _rawDate, ...rest }) => rest);
}

// Fetch from GNews API (requires API key)
async function fetchFromGNews(): Promise<NewsArticle[]> {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];

  const query = encodeURIComponent("electricity OR electrical engineering OR power grid OR renewable energy");
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&max=10&apikey=${apiKey}`;

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    console.error("GNews API error:", response.status, await response.text());
    return [];
  }

  const data: GNewsResponse = await response.json();

  const mapped = data.articles.map((article, index) => {
    const desc = article.description || article.content?.slice(0, 200) || "";
    return {
      id: `gnews-${index}-${Date.now()}`,
      judul: article.title,
      ringkasan: desc,
      tanggal: formatDate(article.publishedAt),
      url: article.url,
      gambar: article.image || null,
      sumber: article.source.name,
      _rawDate: article.publishedAt,
      _score: getRelevanceScore(article.title, desc),
    };
  }).filter(a => a._score >= 1);

  // Sort by date (newest first), then by image presence as tiebreaker
  mapped.sort((a, b) => {
    const dateA = parseDateTimestamp(a._rawDate);
    const dateB = parseDateTimestamp(b._rawDate);
    if (dateA !== dateB) return dateB - dateA;
    if (a.gambar && !b.gambar) return -1;
    if (!a.gambar && b.gambar) return 1;
    return 0;
  });

  // Strip internal _rawDate and _score before returning
  return mapped.map(({ _rawDate, _score, ...rest }) => rest);
}

// Main fetch: try GNews first, then RSS feeds
async function fetchNews(): Promise<{ articles: NewsArticle[]; isLive: boolean }> {
  // Try GNews first (if API key available)
  const gnewsArticles = await fetchFromGNews();
  if (gnewsArticles.length >= 5) {
    return { articles: gnewsArticles, isLive: true };
  }

  // Fallback to RSS feeds (always free, no key needed)
  console.log("Fetching from RSS feeds...");
  const rssArticles = await fetchFromRSS();
  if (rssArticles.length > 0) {
    return { articles: rssArticles, isLive: true };
  }

  // Should rarely happen — both GNews and all RSS feeds failed
  return { articles: [], isLive: false };
}

// GET /api/news — Public: Fetch realtime electricity/energy news
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("refresh") === "true";
    const now = Date.now();

    // Return cached data if still valid and not forcing a refresh
    if (!forceRefresh && cachedArticles && cachedArticles.length > 0 && now - cacheTimestamp < CACHE_DURATION_MS) {
      return NextResponse.json({
        articles: cachedArticles,
        cached: true,
        live: cachedIsLive,
        cachedAt: new Date(cacheTimestamp).toISOString(),
      });
    }

    // Fetch fresh data
    const { articles, isLive } = await fetchNews();

    if (articles.length > 0) {
      // Update cache
      cachedArticles = articles;
      cacheTimestamp = now;
      cachedIsLive = isLive;
    }

    return NextResponse.json({
      articles,
      cached: false,
      live: isLive,
      cachedAt: new Date(now).toISOString(),
    });
  } catch (err) {
    console.error("News API error:", err);

    // If cache exists but expired, still serve it as stale
    if (cachedArticles && cachedArticles.length > 0) {
      return NextResponse.json({
        articles: cachedArticles,
        cached: true,
        stale: true,
        live: cachedIsLive,
        cachedAt: new Date(cacheTimestamp).toISOString(),
      });
    }

    return NextResponse.json({
      articles: [],
      cached: false,
      live: false,
    });
  }
}
