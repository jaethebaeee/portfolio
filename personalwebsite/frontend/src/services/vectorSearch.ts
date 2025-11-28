import { DocumentChunk } from './contentIndexer';

export interface SearchResult {
  document: DocumentChunk;
  score: number;
  highlights: string[];
}

export class VectorSearch {
  private documents: DocumentChunk[] = [];
  private termFrequency: Map<string, Map<string, number>> = new Map();
  private documentFrequency: Map<string, number> = new Map();
  private idfCache: Map<string, number> = new Map();

  constructor(documents: DocumentChunk[]) {
    this.documents = documents;
    this.buildIndex();
  }

  private buildIndex() {
    // Build term frequency and document frequency indexes
    this.documents.forEach(doc => {
      const terms = this.tokenize(doc.content + ' ' + doc.metadata.title + ' ' + doc.metadata.tags.join(' '));
      const termCount = new Map<string, number>();

      terms.forEach(term => {
        termCount.set(term, (termCount.get(term) || 0) + 1);
      });

      this.termFrequency.set(doc.id, termCount);

      terms.forEach(term => {
        this.documentFrequency.set(term, (this.documentFrequency.get(term) || 0) + 1);
      });
    });

    // Pre-compute IDF values
    const totalDocs = this.documents.length;
    this.documentFrequency.forEach((df, term) => {
      this.idfCache.set(term, Math.log(totalDocs / df));
    });
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2)
      .map(term => term.replace(/s$/, '')); // Simple stemming
  }

  private computeTFIDFVector(docId: string): Map<string, number> {
    const tf = this.termFrequency.get(docId) || new Map();
    const vector = new Map<string, number>();

    tf.forEach((freq, term) => {
      const idf = this.idfCache.get(term) || 0;
      vector.set(term, freq * idf);
    });

    return vector;
  }

  private cosineSimilarity(vec1: Map<string, number>, vec2: Map<string, number>): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    // Calculate dot product and norms
    const allTerms = new Set([...vec1.keys(), ...vec2.keys()]);

    allTerms.forEach(term => {
      const val1 = vec1.get(term) || 0;
      const val2 = vec2.get(term) || 0;
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    });

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  private findHighlights(doc: DocumentChunk, query: string): string[] {
    const queryTerms = this.tokenize(query);
    const highlights: string[] = [];
    const content = doc.content.toLowerCase();

    queryTerms.forEach(term => {
      if (content.includes(term)) {
        const index = content.indexOf(term);
        const start = Math.max(0, index - 50);
        const end = Math.min(content.length, index + term.length + 50);
        const snippet = doc.content.substring(start, end);
        highlights.push(`...${snippet}...`);
      }
    });

    return highlights.slice(0, 3); // Limit to 3 highlights
  }

  search(query: string, limit: number = 5): SearchResult[] {
    const queryTerms = this.tokenize(query);
    const queryVector = new Map<string, number>();

    // Build query vector
    queryTerms.forEach(term => {
      const idf = this.idfCache.get(term) || 0;
      queryVector.set(term, (queryVector.get(term) || 0) + idf);
    });

    // Calculate similarity for each document
    const results: SearchResult[] = this.documents.map(doc => {
      const docVector = this.computeTFIDFVector(doc.id);
      const score = this.cosineSimilarity(queryVector, docVector);

      return {
        document: doc,
        score,
        highlights: this.findHighlights(doc, query)
      };
    });

    // Sort by score and return top results
    return results
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Simple keyword-based search as fallback
  keywordSearch(query: string, limit: number = 5): SearchResult[] {
    const queryLower = query.toLowerCase();

    return this.documents
      .filter(doc => {
        const searchableText = (doc.content + ' ' + doc.metadata.title + ' ' + doc.metadata.tags.join(' ')).toLowerCase();
        return searchableText.includes(queryLower);
      })
      .map(doc => ({
        document: doc,
        score: 1, // Simple binary score
        highlights: this.findHighlights(doc, query)
      }))
      .slice(0, limit);
  }

  // Hybrid search combining semantic and keyword search
  hybridSearch(query: string, limit: number = 5): SearchResult[] {
    const semanticResults = this.search(query, limit * 2);
    const keywordResults = this.keywordSearch(query, limit * 2);

    // Combine and deduplicate results
    const combined = new Map<string, SearchResult>();

    [...semanticResults, ...keywordResults].forEach(result => {
      const existing = combined.get(result.document.id);
      if (!existing || result.score > existing.score) {
        combined.set(result.document.id, result);
      }
    });

    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
