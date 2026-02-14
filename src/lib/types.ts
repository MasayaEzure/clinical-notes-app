export interface AnalysisResult {
  learnings: string[];
  challenges: string[];
  medicalTerms: MedicalTermSuggestion[];
}

export interface MedicalTermSuggestion {
  original: string;
  candidates: string[];
}

export interface PubMedPaper {
  pmid: string;
  title: string;
  authors: string[];
  abstract: string;
  publishedDate: string;
  doi?: string;
}

export interface SessionWithRelations {
  id: number;
  title: string;
  audioPath: string;
  transcription: string;
  createdAt: Date;
  updatedAt: Date;
  learnings: { id: number; content: string }[];
  challenges: { id: number; content: string }[];
  medicalTerms: {
    id: number;
    original: string;
    resolved: boolean;
    resolvedTerm: string | null;
    candidates: { id: number; term: string }[];
  }[];
}
