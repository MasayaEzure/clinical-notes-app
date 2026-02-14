"use client";

import { PubMedPaper } from "@/lib/types";
import Card, { CardBody } from "@/components/ui/Card";

interface PubMedResultsProps {
  papers: PubMedPaper[];
  loading?: boolean;
}

export default function PubMedResults({ papers, loading }: PubMedResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-full mb-1" />
            <div className="h-3 bg-gray-200 rounded w-full mb-1" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        関連する論文が見つかりませんでした
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {papers.map((paper) => (
        <Card key={paper.pmid}>
          <CardBody>
            <h3 className="font-medium text-gray-900 mb-1">{paper.title}</h3>
            <p className="text-xs text-gray-500 mb-2">
              {paper.authors.slice(0, 3).join(", ")}
              {paper.authors.length > 3 && " et al."}
              {paper.publishedDate && ` (${paper.publishedDate})`}
            </p>
            {paper.abstract && (
              <p className="text-sm text-gray-700 line-clamp-4">
                {paper.abstract}
              </p>
            )}
            <div className="mt-3 flex gap-3">
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                PubMedで見る &rarr;
              </a>
              {paper.doi && (
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  DOI &rarr;
                </a>
              )}
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
