import { PubMedPaper } from "./types";

const EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

interface ESearchResult {
  esearchresult: {
    count: string;
    idlist: string[];
  };
}

export async function searchPubMed(
  query: string,
  maxResults: number = 5
): Promise<PubMedPaper[]> {
  // 1. esearch: キーワードでPMIDを検索
  const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    throw new Error(`PubMed search failed: ${searchRes.statusText}`);
  }
  const searchData: ESearchResult = await searchRes.json();
  const pmids = searchData.esearchresult.idlist;

  if (pmids.length === 0) {
    return [];
  }

  // 2. efetch: PMIDからアブストラクト等を取得（XML）
  const fetchUrl = `${EUTILS_BASE}/efetch.fcgi?db=pubmed&id=${pmids.join(",")}&rettype=abstract&retmode=xml`;
  const fetchRes = await fetch(fetchUrl);
  if (!fetchRes.ok) {
    throw new Error(`PubMed fetch failed: ${fetchRes.statusText}`);
  }
  const xmlText = await fetchRes.text();

  return parsePubMedXml(xmlText);
}

function parsePubMedXml(xml: string): PubMedPaper[] {
  const papers: PubMedPaper[] = [];

  // PubmedArticle ブロックを抽出
  const articleRegex = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;
  let articleMatch;

  while ((articleMatch = articleRegex.exec(xml)) !== null) {
    const article = articleMatch[1];

    const pmid = extractTag(article, "PMID") || "";
    const title = extractTag(article, "ArticleTitle") || "No title";

    // 著者抽出
    const authors: string[] = [];
    const authorRegex = /<Author[\s\S]*?>([\s\S]*?)<\/Author>/g;
    let authorMatch;
    while ((authorMatch = authorRegex.exec(article)) !== null) {
      const lastName = extractTag(authorMatch[1], "LastName") || "";
      const foreName = extractTag(authorMatch[1], "ForeName") || "";
      if (lastName) {
        authors.push(`${lastName} ${foreName}`.trim());
      }
    }

    // アブストラクト抽出
    const abstractMatch = article.match(
      /<Abstract>([\s\S]*?)<\/Abstract>/
    );
    let abstract = "";
    if (abstractMatch) {
      const abstractTextRegex = /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g;
      let textMatch;
      const parts: string[] = [];
      while ((textMatch = abstractTextRegex.exec(abstractMatch[1])) !== null) {
        parts.push(textMatch[1].replace(/<[^>]+>/g, ""));
      }
      abstract = parts.join(" ");
    }

    // 日付抽出
    const pubDateMatch = article.match(
      /<PubDate>([\s\S]*?)<\/PubDate>/
    );
    let publishedDate = "";
    if (pubDateMatch) {
      const year = extractTag(pubDateMatch[1], "Year") || "";
      const month = extractTag(pubDateMatch[1], "Month") || "";
      const day = extractTag(pubDateMatch[1], "Day") || "";
      publishedDate = [year, month, day].filter(Boolean).join("-");
    }

    // DOI抽出
    const doiMatch = article.match(
      /<ArticleId IdType="doi">([\s\S]*?)<\/ArticleId>/
    );
    const doi = doiMatch ? doiMatch[1].trim() : undefined;

    papers.push({ pmid, title, authors, abstract, publishedDate, doi });
  }

  return papers;
}

function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = xml.match(regex);
  return match ? match[1].replace(/<[^>]+>/g, "").trim() : null;
}
