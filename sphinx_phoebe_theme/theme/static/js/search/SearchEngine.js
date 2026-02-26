/**
 * SearchEngine.js
 *
 * Modern search engine powered by Lunr.js with TF-IDF relevance scoring,
 * fuzzy matching, and search operators support.
 */

class SearchEngine {
  constructor() {
    this.index = null;
    this.documentStore = [];
    this.isReady = false;
  }

  /**
   * Initialize the search engine from Sphinx's searchindex.js data
   * @param {Object} searchIndex - The Search._index object from Sphinx
   */
  async initialize(searchIndex) {
    if (this.isReady) return;

    try {
      // Build document store for retrieval
      this.buildDocumentStore(searchIndex);

      // Build Lunr.js index
      const self = this;
      this.index = lunr(function () {
        // Define fields with boosting
        this.ref('id');
        this.field('title', { boost: 10 });      // Titles are most important
        this.field('terms', { boost: 1 });       // Full-text content
        this.field('anchor', { boost: 3 });      // Section anchors

        // Add documents to index
        searchIndex.documents.forEach(doc => {
          this.add(doc);
        });
      });

      this.isReady = true;
    } catch (error) {
      console.error('[SearchEngine] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Build internal document store from Sphinx search index
   * @param {Object} searchIndex - Raw Sphinx search index
   */
  buildDocumentStore(searchIndex) {
    try {
      const { docnames, filenames, titles, terms, alltitles } = searchIndex;

      if (!docnames || !filenames) {
        throw new Error('Invalid search index structure');
      }

      searchIndex.documents = [];

      // Create searchable documents from Sphinx index
      for (let i = 0; i < docnames.length; i++) {
        const docname = docnames[i];
        const filename = filenames[i];
        // titles could be indexed by integer ID or by docname - check both
        const title = titles[i] || titles[docname] || '';

        // Collect all terms for this document
        const docTerms = [];
        if (terms) {
          for (const term in terms) {
            const termDocs = terms[term];
            if (Array.isArray(termDocs) && termDocs.includes(i)) {
              docTerms.push(term);
            }
          }
        }

        // Collect section titles for this document
        const sectionTitles = [];
        if (alltitles) {
          for (const sectionTitle in alltitles) {
            const sectionData = alltitles[sectionTitle];
            if (Array.isArray(sectionData)) {
              // alltitles format: [docname, anchor]
              if (sectionData[0] === docname) {
                sectionTitles.push(sectionTitle);
              }
            }
          }
        }

        const doc = {
          id: i,
          docname: docname,
          filename: filename,
          title: title,
          terms: docTerms.join(' '),
          anchor: sectionTitles.join(' '),
          score: 0
        };

        searchIndex.documents.push(doc);
        this.documentStore[i] = doc;
      }
    } catch (error) {
      console.error('[SearchEngine] Error building document store:', error);
      throw error;
    }
  }

  /**
   * Search the index with a query string
   * @param {string} query - User's search query
   * @param {Object} options - Search options
   * @returns {Array} - Array of results in Sphinx format [docname, title, anchor, descr, score, filename]
   */
  search(query, options = {}) {
    if (!this.isReady || !query || query.trim() === '') {
      return [];
    }

    const {
      fuzzy = true,
      fuzzyDistance = 1,
      maxResults = 50,
      minScore = 0.1
    } = options;

    try {
      // First pass: Try exact search
      let parsedQuery = this.parseQuery(query, false, 0);
      let lunrResults = this.index.search(parsedQuery);

      // Second pass: If we have few results and query is long enough, try fuzzy
      if (lunrResults.length < 5 && query.length >= 6 && fuzzy) {
        const fuzzyQuery = this.parseQuery(query, true, fuzzyDistance);
        const fuzzyResults = this.index.search(fuzzyQuery);

        // Merge results, preferring exact matches (they'll have higher scores)
        const seenRefs = new Set(lunrResults.map(r => r.ref));
        for (const result of fuzzyResults) {
          if (!seenRefs.has(result.ref)) {
            // Penalize fuzzy matches slightly
            result.score *= 0.9;
            lunrResults.push(result);
          }
        }
      }

      // Filter by minimum score and convert to Sphinx format with enhanced scoring
      const sphinxResults = lunrResults
        .filter(result => result.score >= minScore)
        .slice(0, maxResults)
        .map(result => {
        const doc = this.documentStore[parseInt(result.ref)];
        if (!doc) return null;

        let score = result.score * 10;  // Base Lunr score

        // Boost title matches significantly
        const queryLower = query.toLowerCase();
        const titleLower = doc.title.toLowerCase();

        // Exact title match - huge boost
        if (titleLower === queryLower) {
          score += 150;
        }
        // Title starts with query - big boost
        else if (titleLower.startsWith(queryLower)) {
          score += 100;
        }
        // Title contains query - moderate boost
        else if (titleLower.includes(queryLower)) {
          score += 50;
        }

        // Boost index pages (main documentation pages)
        if (doc.docname.endsWith('/index') || doc.docname === 'index') {
          score += 30;
        }

        // Boost files with the query term in the filename
        if (doc.filename.toLowerCase().includes(queryLower)) {
          score += 40;
        }

        // Sphinx result format: [docname, title, anchor, descr, score, filename]
        return [
          doc.docname,
          doc.title,
          '',  // anchor (empty for now, can enhance later)
          '',  // description (will be generated by makeSearchSummary)
          score,
          doc.filename
        ];
      }).filter(r => r !== null);

      // Re-sort by the boosted scores (higher scores first)
      sphinxResults.sort((a, b) => b[4] - a[4]);

      return sphinxResults;

    } catch (error) {
      console.error('[SearchEngine] Search failed:', error);
      // Fallback to empty results on error
      return [];
    }
  }

  /**
   * Parse query and add Lunr.js operators
   * @param {string} query - Raw query string
   * @param {boolean} fuzzy - Enable fuzzy matching
   * @param {number} fuzzyDistance - Edit distance for fuzzy matching
   * @returns {string} - Lunr-formatted query
   */
  parseQuery(query, fuzzy, fuzzyDistance) {
    // Handle quoted phrases - keep them as-is for exact matching
    const phrases = [];
    let parsedQuery = query.replace(/"([^"]+)"/g, (match, phrase) => {
      const placeholder = `__PHRASE_${phrases.length}__`;
      phrases.push(phrase);
      return placeholder;
    });

    // Tokenize remaining terms
    const terms = parsedQuery.split(/\s+/).filter(t => t.length > 0);

    // Process each term
    const processedTerms = terms.map(term => {
      // Restore phrase placeholders
      if (term.startsWith('__PHRASE_')) {
        const phraseIndex = parseInt(term.match(/__PHRASE_(\d+)__/)[1]);
        const phrase = phrases[phraseIndex];
        // Return phrase terms with exact matching
        return phrase.split(/\s+/).map(t => `+${t}`).join(' ');
      }

      // Handle existing operators (+required, -excluded)
      if (term.startsWith('+') || term.startsWith('-')) {
        return term;
      }

      // Apply fuzzy matching for longer terms (6+ chars)
      if (fuzzy && term.length >= 6) {
        return `${term}~${fuzzyDistance}`;
      }

      // Just return the term as-is - Lunr handles stemming automatically
      return term;
    });

    return processedTerms.join(' ');
  }

  /**
   * Get document metadata by ID
   * @param {number} docId - Document ID
   * @returns {Object} - Document metadata
   */
  getDocument(docId) {
    return this.documentStore[docId];
  }

  /**
   * Check if engine is initialized and ready
   * @returns {boolean}
   */
  isInitialized() {
    return this.isReady;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchEngine;
}
