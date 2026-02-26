/**
 * SearchMetadata.js
 *
 * Handles metadata normalization and filtering for search results.
 * Simplifies the complex format handling in the original implementation.
 */

class SearchMetadata {
  constructor(metadataIndex) {
    this.index = metadataIndex || {};
    this.normalizedCache = new Map();
  }

  /**
   * Get titles for a file, normalized to array format
   * @param {string} filepath - File path (with or without "./" prefix)
   * @returns {Array<string>} - Array of titles
   */
  getTitles(filepath) {
    const normalized = this._normalizeFilepath(filepath);
    const titles = this.index.root_titles?.[normalized];
    return this._toArray(titles);
  }

  /**
   * Get metadata for a specific category and file
   * @param {string} category - Metadata category (e.g., 'root_titles')
   * @param {string} filepath - File path
   * @returns {Array} - Normalized metadata as array
   */
  getMetadata(category, filepath) {
    if (!this.index[category]) return [];

    const normalized = this._normalizeFilepath(filepath);
    const metadata = this.index[category][normalized];
    return this._toArray(metadata);
  }

  /**
   * Build display metadata from search results
   * Returns an object with category -> title -> count mapping
   * @param {Array} results - Search results in Sphinx format
   * @returns {Object} - { category: { title: count } }
   */
  buildDisplayMetadata(results) {
    const displayMeta = {};

    // Iterate through all metadata categories (except those ending with underscore)
    for (const category in this.index) {
      if (category.endsWith('_')) continue;

      displayMeta[category] = {};

      // Count occurrences of each metadata value across results
      for (const result of results) {
        const filename = result[5];  // Sphinx format: result[5] is filename
        const metadata = this.getMetadata(category, filename);

        metadata.forEach(item => {
          displayMeta[category][item] = (displayMeta[category][item] || 0) + 1;
        });
      }
    }

    return displayMeta;
  }

  /**
   * Build title counts for filter display
   * @param {Array} results - Search results in Sphinx format
   * @returns {Object} - { title: count } sorted by count descending
   */
  buildTitleCounts(results) {
    const titleCounts = {};

    for (const result of results) {
      const filename = result[5];
      const titles = this.getTitles(filename);

      titles.forEach(title => {
        titleCounts[title] = (titleCounts[title] || 0) + 1;
      });
    }

    // Sort by count (descending)
    const entries = Object.entries(titleCounts);
    entries.sort((a, b) => b[1] - a[1]);

    return Object.fromEntries(entries);
  }

  /**
   * Check if a result matches active filters
   * @param {Array} result - Single search result in Sphinx format
   * @param {Object} activeFilters - { category: [values] }
   * @returns {boolean} - True if result matches all filter criteria
   */
  matchesFilters(result, activeFilters) {
    if (!activeFilters || Object.keys(activeFilters).length === 0) {
      return true;  // No filters = show all
    }

    const filename = result[5];

    // Result must match ALL filter categories (AND logic)
    return Object.entries(activeFilters).every(([category, filterValues]) => {
      const resultMetadata = this.getMetadata(category, filename);

      // Result must match ANY value within the category (OR logic)
      return filterValues.some(filterValue =>
        resultMetadata.includes(filterValue)
      );
    });
  }

  /**
   * Filter results based on active filters
   * @param {Array} results - All search results
   * @param {Object} activeFilters - { category: [values] }
   * @returns {Array} - Filtered results
   */
  filterResults(results, activeFilters) {
    if (!activeFilters || Object.keys(activeFilters).length === 0) {
      return results;
    }

    return results.filter(result => this.matchesFilters(result, activeFilters));
  }

  /**
   * Normalize filepath to consistent format (with "./" prefix)
   * @private
   */
  _normalizeFilepath(filepath) {
    if (!filepath) return '';

    // Check cache first
    if (this.normalizedCache.has(filepath)) {
      return this.normalizedCache.get(filepath);
    }

    // Normalize: ensure "./" prefix
    const normalized = filepath.startsWith('./') ? filepath : './' + filepath;
    this.normalizedCache.set(filepath, normalized);

    // Also cache the non-prefixed version if we added prefix
    if (!filepath.startsWith('./')) {
      this.normalizedCache.set(normalized, normalized);
    }

    return normalized;
  }

  /**
   * Convert various formats to array
   * Handles: array, string, comma-separated string, undefined/null
   * @private
   */
  _toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    // Handle comma-separated string
    if (typeof value === 'string') {
      if (value.includes(',')) {
        return value.split(',').map(s => s.trim()).filter(s => s);
      }
      return [value];
    }

    return [];
  }

  /**
   * Check if metadata index is loaded
   * @returns {boolean}
   */
  isLoaded() {
    return Object.keys(this.index).length > 0;
  }

  /**
   * Update the metadata index
   * @param {Object} newIndex - New metadata index
   */
  setIndex(newIndex) {
    this.index = newIndex || {};
    this.normalizedCache.clear();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchMetadata;
}
