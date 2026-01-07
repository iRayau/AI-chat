"use client";

import { Globe, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SearchResult } from "@/types";

interface SearchResultsViewProps {
  results: SearchResult[];
  onBack: () => void;
}

export function SearchResultsView({ results, onBack }: SearchResultsViewProps) {
  if (results.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <Globe className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium mb-2">No search results</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Try searching for something to see web results here
        </p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <Globe className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Web Results</h2>
            <p className="text-sm text-muted-foreground">
              {results.length} sources found
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <SearchResultCard key={index} result={result} index={index + 1} />
        ))}
      </div>
    </div>
  );
}

interface SearchResultCardProps {
  result: SearchResult;
  index: number;
}

function SearchResultCard({ result, index }: SearchResultCardProps) {
  const domain = new URL(result.url).hostname.replace("www.", "");

  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
          {index}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-muted">
              <Globe className="h-3 w-3" />
            </div>
            <span className="truncate">{domain}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h3 className="text-base font-medium group-hover:text-primary transition-colors mb-2">
            {result.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {result.snippet}
          </p>
        </div>
      </div>
    </a>
  );
}

