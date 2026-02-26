/*
 * searchtools.js
 * ~~~~~~~~~~~~~~~~
 *
 * Sphinx JavaScript utilities for the full-text search.
 *
 * :copyright: Copyright 2007-2023 by the Sphinx team, see AUTHORS.
 * :license: BSD, see LICENSE for details.
 *
 */
"use strict";

/**
 * Simple result scoring code.
 */
if (typeof Scorer === "undefined") {
  var Scorer = {
    // Implement the following function to further tweak the score for each result
    // The function takes a result array [docname, title, anchor, descr, score, filename]
    // and returns the new score.

    score: result => {
      const [docname, title, anchor, descr, score, filename] = result

      return score
    },

    // query matches the full name of an object
    objNameMatch: 11,
    // or matches in the last dotted part of the object name
    objPartialMatch: 6,
    // Additive scores depending on the priority of the object
    objPrio: {
      0: 15, // used to be importantResults
      1: 5, // used to be objectResults
      2: -5, // used to be unimportantResults
    },
    //  Used when the priority is not in the mapping.
    objPrioDefault: 0,

    // query found in title
    title: 15,
    partialTitle: 7,
    // query found in terms
    term: 5,
    partialTerm: 2,
  };
}

const _removeChildren = (element) => {
  while (element && element.lastChild) element.removeChild(element.lastChild);
};

/**
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
 */
const _escapeRegExp = (string) =>
  string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string

const _displayItem = (item, searchTerms) => {
  const docBuilder = DOCUMENTATION_OPTIONS.BUILDER;
  const docUrlRoot = DOCUMENTATION_OPTIONS.URL_ROOT;
  const docFileSuffix = DOCUMENTATION_OPTIONS.FILE_SUFFIX;
  const docLinkSuffix = DOCUMENTATION_OPTIONS.LINK_SUFFIX;
  const showSearchSummary = DOCUMENTATION_OPTIONS.SHOW_SEARCH_SUMMARY;

  const [docName, title, anchor, descr, score, _filename] = item;

  let listItem = document.createElement("li");
  listItem.classList.add("result_item");
  let requestUrl;
  let linkUrl;
  if (docBuilder === "dirhtml") {
    // dirhtml builder
    let dirname = docName + "/";
    if (dirname.match(/\/index\/$/))
      dirname = dirname.substring(0, dirname.length - 6);
    else if (dirname === "index/") dirname = "";
    requestUrl = docUrlRoot + dirname;
    linkUrl = requestUrl;
  } else {
    // normal html builders
    requestUrl = docUrlRoot + docName + docFileSuffix;
    linkUrl = docName + docLinkSuffix;
  }
  let linkEl = listItem.appendChild(document.createElement("a"));
  linkEl.classList.add("result_title");
  linkEl.href = linkUrl + anchor;
  linkEl.dataset.score = score;
  linkEl.innerHTML = title;
  let listItemRootDoc = listItem.appendChild(document.createElement("p"));
  listItemRootDoc.classList.add("result_root_doc");
  if (Search.metaIndex && Search.metaIndex["root_titles"]) {
    const rootTitles = Search.metaIndex["root_titles"]["./" + _filename];
    if (Array.isArray(rootTitles)) {
      listItemRootDoc.innerHTML = rootTitles.join(" • ");
    } else if (rootTitles) {
      listItemRootDoc.innerHTML = rootTitles;
    } else {
      // Try without the "./" prefix
      const altRootTitles = Search.metaIndex["root_titles"][_filename];
      if (Array.isArray(altRootTitles)) {
        listItemRootDoc.innerHTML = altRootTitles.join(" • ");
      } else if (altRootTitles) {
        listItemRootDoc.innerHTML = altRootTitles;
      } else {
        listItemRootDoc.style.display = "none";
      }
    }
  } else {
    listItemRootDoc.style.display = "none";
  }
  if (descr)
    listItem.appendChild(document.createElement("span")).innerHTML =
      " (" + descr + ")";
  else if (showSearchSummary)
    fetch(requestUrl)
      .then((responseData) => responseData.text())
      .then((data) => {
        if (data)
          listItem.appendChild(
            Search.makeSearchSummary(data, searchTerms)
          );
      });
  Search.output.appendChild(listItem);
};

const _finishSearch = (resultCount) => {
  Search.stopPulse();
  Search.title.style.display = "none";

  // Hide loading state
  const loadingEl = document.getElementById("search-progress");
  if (loadingEl) loadingEl.style.display = "none";

  // Show/hide filters based on results
  const filtersEl = document.querySelector(".cl-search-filters");

  // Show/hide empty state
  const emptyEl = document.getElementById("search-empty");
  if (!resultCount) {
    Search.status.innerText = "";
    if (emptyEl) emptyEl.style.display = "block";
    if (filtersEl) filtersEl.style.display = "none";
  } else {
    if (emptyEl) emptyEl.style.display = "none";
    if (filtersEl) filtersEl.style.display = "block";
    Search.status.innerHTML = `We found ${resultCount} results for <b>${Search.og_query}</b>.`;
  }
};
const _displayNextItem = (
  results,
  resultCount,
  searchTerms
) => {
  // results left, load the summary and display it
  // this is intended to be dynamic (don't sub resultsCount)
  if (results.length) {
    _displayItem(results.pop(), searchTerms);
    setTimeout(
      () => _displayNextItem(results, resultCount, searchTerms),
      5
    );
  }
  // search finished, update title and status message
  else _finishSearch(resultCount);
};

/**
 * Default splitQuery function. Can be overridden in ``sphinx.search`` with a
 * custom function per language.
 *
 * The regular expression works by splitting the string on consecutive characters
 * that are not Unicode letters, numbers, underscores, or emoji characters.
 * This is the same as ``\W+`` in Python, preserving the surrogate pair area.
 */
if (typeof splitQuery === "undefined") {
  var splitQuery = (query) => query
    .split(/[^\p{Letter}\p{Number}_\p{Emoji_Presentation}]+/gu)
    .filter(term => term)  // remove remaining empty strings
}

// Initialize SearchEngine and SearchMetadata instances
let searchEngine = null;
let searchMetadata = null;

function loadMetadataIndex() {
  return fetch('_static/metadata_index.json')
    .then(response => response.json())
    .then(data => {
      Search.setMetaIndex(data)
      // Initialize SearchMetadata with loaded data
      if (typeof SearchMetadata !== 'undefined') {
        searchMetadata = new SearchMetadata(data);
      }
    })
    .catch(error => console.error('Error loading metadata_index.json:', error));
}

/**
 * Search Module
 */
const Search = {
  _index: null,
  _queued_query: null,
  _pulse_status: -1,

  htmlToText: (htmlString) => {
    const htmlElement = new DOMParser().parseFromString(htmlString, 'text/html');
    htmlElement.querySelectorAll(".headerlink").forEach((el) => { el.remove() });
    const docContent = htmlElement.querySelector('[role="main"]');
    if (docContent !== undefined) return docContent.textContent;
    console.warn(
      "Content block not found. Sphinx search tries to obtain it via '[role=main]'. Could you check your theme or template."
    );
    return "";
  },

  og_query: null,
  metaIndex: null,
  og_searchterms: null,
  og_results: null,
  activeFilters: {},

  init: () => {
    const query = new URLSearchParams(window.location.search).get("q");
    document
      .querySelectorAll('input[name="q"]')
      .forEach((el) => (el.value = query));
    if (query) {
      Search.og_query = query;
      loadMetadataIndex().then(function () { Search.performSearch(query); })
    }
  },

  loadIndex: (url) =>
    (document.body.appendChild(document.createElement("script")).src = url),

  setIndex: (index) => {
    Search._index = index;

    // Initialize SearchEngine with Sphinx index
    if (typeof SearchEngine !== 'undefined') {
      searchEngine = new SearchEngine();
      searchEngine.initialize(index).then(() => {
        // Now process queued query if there is one
        if (Search._queued_query !== null) {
          const query = Search._queued_query;
          Search._queued_query = null;
          Search.query(query);
        }
      }).catch(err => {
        console.error('[clSearchTools] SearchEngine initialization failed:', err);

        // Fall back to running query with default search
        if (Search._queued_query !== null) {
          const query = Search._queued_query;
          Search._queued_query = null;
          Search.query(query);
        }
      });
    } else {
      // Process queued query with default search
      if (Search._queued_query !== null) {
        const query = Search._queued_query;
        Search._queued_query = null;
        Search.query(query);
      }
    }
  },

  hasIndex: () => Search._index !== null,

  setMetaIndex: (meta) => {
    Search.metaIndex = meta;
  },

  deferQuery: (query) => (Search._queued_query = query),

  stopPulse: () => (Search._pulse_status = -1),

  startPulse: () => {
    if (Search._pulse_status >= 0) return;

    const pulse = () => {
      Search._pulse_status = (Search._pulse_status + 1) % 4;
      Search.dots.innerText = ".".repeat(Search._pulse_status);
      if (Search._pulse_status >= 0) window.setTimeout(pulse, 500);
    };
    pulse();
  },

  /**
   * perform a search for something (or wait until index is loaded)
   */
  performSearch: (query) => {
    // create the required interface elements
    const searchText = document.createElement("h2");
    searchText.textContent = _("Searching");
    const searchSummary = document.createElement("p");
    searchSummary.classList.add("search-summary");
    searchSummary.innerText = "";
    const searchList = document.createElement("ul");
    searchList.classList.add("search");

    const out = document.getElementById("search-results");
    Search.title = out.appendChild(searchText);
    Search.dots = Search.title.appendChild(document.createElement("span"));
    Search.status = out.appendChild(searchSummary);
    Search.output = out.appendChild(searchList);

    // Show loading state
    const searchProgress = document.getElementById("search-progress");
    if (searchProgress) {
      searchProgress.style.display = "flex";
    }

    // Hide empty state
    const emptyEl = document.getElementById("search-empty");
    if (emptyEl) {
      emptyEl.style.display = "none";
    }

    Search.startPulse();

    // index already loaded, the browser was quick!
    if (Search.hasIndex()) Search.query(query);
    else Search.deferQuery(query);
  },

  /**
   * execute search (requires search index to be loaded)
   */
  query: (query) => {
    const filenames = Search._index.filenames;
    const docNames = Search._index.docnames;
    const titles = Search._index.titles;
    const allTitles = Search._index.alltitles;
    const indexEntries = Search._index.indexentries;

    // stem the search terms and add them to the correct list
    const stemmer = new Stemmer();
    const searchTerms = new Set();
    const excludedTerms = new Set();
    const objectTerms = new Set(splitQuery(query.toLowerCase().trim()));
    splitQuery(query.trim()).forEach((queryTerm) => {
      const queryTermLower = queryTerm.toLowerCase();

      // maybe skip this "word"
      // stopwords array is from language_data.js
      if (
        stopwords.indexOf(queryTermLower) !== -1 ||
        queryTerm.match(/^\d+$/)
      )
        return;

      // stem the word
      let word = stemmer.stemWord(queryTermLower);
      // select the correct list
      if (word[0] === "-") excludedTerms.add(word.substr(1));
      else {
        searchTerms.add(word);
      }
    });

    Search.og_searchterms = searchTerms

    // array of [docname, title, anchor, descr, score, filename]
    let results = [];
    _removeChildren(document.getElementById("search-progress"));

    // Try using SearchEngine (Lunr.js) if available and initialized
    if (searchEngine && searchEngine.isInitialized()) {
      // Smart fuzzy matching: exact first, fuzzy fallback for long queries
      results = searchEngine.search(query, {
        fuzzy: true,
        fuzzyDistance: 1,
        minScore: 0.1
      });
    } else {
      // Fall back to original Sphinx search

      const queryLower = query.toLowerCase();
      for (const [title, foundTitles] of Object.entries(allTitles)) {
      if (title.toLowerCase().includes(queryLower) && (queryLower.length >= title.length / 2)) {
        for (const [file, id] of foundTitles) {
          let score = Math.round(100 * queryLower.length / title.length)
          results.push([
            docNames[file],
            titles[file] !== title ? `${titles[file]} > ${title}` : title,
            id !== null ? "#" + id : "",
            null,
            score,
            filenames[file],
          ]);
        }
      }
    }

    // search for explicit entries in index directives
    for (const [entry, foundEntries] of Object.entries(indexEntries)) {
      if (entry.includes(queryLower) && (queryLower.length >= entry.length / 2)) {
        for (const [file, id] of foundEntries) {
          let score = Math.round(100 * queryLower.length / entry.length)
          results.push([
            docNames[file],
            titles[file],
            id ? "#" + id : "",
            null,
            score,
            filenames[file],
          ]);
        }
      }
    }

    // lookup as object
    objectTerms.forEach((term) =>
      results.push(...Search.performObjectSearch(term, objectTerms))
    );

    // lookup as search terms in fulltext
    results.push(...Search.performTermsSearch(searchTerms, excludedTerms));
    }

    // let the scorer override scores with a custom scoring function
    if (Scorer.score) results.forEach((item) => (item[4] = Scorer.score(item)));

    // now sort the results by score (in opposite order of appearance, since the
    // display function below uses pop() to retrieve items) and then
    // alphabetically
    results.sort((a, b) => {
      const leftScore = a[4];
      const rightScore = b[4];
      if (leftScore === rightScore) {
        // same score: sort alphabetically
        const leftTitle = a[1].toLowerCase();
        const rightTitle = b[1].toLowerCase();
        if (leftTitle === rightTitle) return 0;
        return leftTitle > rightTitle ? -1 : 1; // inverted is intentional
      }
      return leftScore > rightScore ? 1 : -1;
    });

    // remove duplicate search results
    // note the reversing of results, so that in the case of duplicates, the highest-scoring entry is kept
    let seen = new Set();
    results = results.reverse().reduce((acc, result) => {
      let resultStr = result[0];
      if (!seen.has(resultStr)) {
        acc.push(result);
        seen.add(resultStr);
      }
      return acc;
    }, []);
    results = results.reverse();

    // for debugging
    Search.lastresults = results.slice();  // a copy
    //console.info("search results:", Search.lastresults);

    // store copy of original results
    Search.og_results = [...Search.lastresults]

    // print the results
    Search.metadataForResults(results);
    _displayNextItem(results, results.length, searchTerms);
  },

  /**
   * search for object names
   */
  performObjectSearch: (object, objectTerms) => {
    const filenames = Search._index.filenames;
    const docNames = Search._index.docnames;
    const objects = Search._index.objects;
    const objNames = Search._index.objnames;
    const titles = Search._index.titles;

    const results = [];

    const objectSearchCallback = (prefix, match) => {
      const name = match[4]
      const fullname = (prefix ? prefix + "." : "") + name;
      const fullnameLower = fullname.toLowerCase();
      if (fullnameLower.indexOf(object) < 0) return;

      let score = 0;
      const parts = fullnameLower.split(".");

      // check for different match types: exact matches of full name or
      // "last name" (i.e. last dotted part)
      if (fullnameLower === object || parts.slice(-1)[0] === object)
        score += Scorer.objNameMatch;
      else if (parts.slice(-1)[0].indexOf(object) > -1)
        score += Scorer.objPartialMatch; // matches in last name

      const objName = objNames[match[1]][2];
      const title = titles[match[0]];

      // If more than one term searched for, we require other words to be
      // found in the name/title/description
      const otherTerms = new Set(objectTerms);
      otherTerms.delete(object);
      if (otherTerms.size > 0) {
        const haystack = `${prefix} ${name} ${objName} ${title}`.toLowerCase();
        if (
          [...otherTerms].some((otherTerm) => haystack.indexOf(otherTerm) < 0)
        )
          return;
      }

      let anchor = match[3];
      if (anchor === "") anchor = fullname;
      else if (anchor === "-") anchor = objNames[match[1]][1] + "-" + fullname;

      const descr = objName + _(", in ") + title;

      // add custom score for some objects according to scorer
      if (Scorer.objPrio.hasOwnProperty(match[2]))
        score += Scorer.objPrio[match[2]];
      else score += Scorer.objPrioDefault;

      results.push([
        docNames[match[0]],
        fullname,
        "#" + anchor,
        descr,
        score,
        filenames[match[0]],
      ]);
    };
    Object.keys(objects).forEach((prefix) =>
      objects[prefix].forEach((array) =>
        objectSearchCallback(prefix, array)
      )
    );
    return results;
  },

  /**
   * search for full-text terms in the index
   */
  performTermsSearch: (searchTerms, excludedTerms) => {
    // prepare search
    const terms = Search._index.terms;
    const titleTerms = Search._index.titleterms;
    const filenames = Search._index.filenames;
    const docNames = Search._index.docnames;
    const titles = Search._index.titles;

    const scoreMap = new Map();
    const fileMap = new Map();

    // perform the search on the required terms
    searchTerms.forEach((word) => {
      const files = [];
      const arr = [
        { files: terms[word], score: Scorer.term },
        { files: titleTerms[word], score: Scorer.title },
      ];
      // add support for partial matches
      if (word.length > 2) {
        const escapedWord = _escapeRegExp(word);
        Object.keys(terms).forEach((term) => {
          if (term.match(escapedWord) && !terms[word])
            arr.push({ files: terms[term], score: Scorer.partialTerm });
        });
        Object.keys(titleTerms).forEach((term) => {
          if (term.match(escapedWord) && !titleTerms[word])
            arr.push({ files: titleTerms[word], score: Scorer.partialTitle });
        });
      }

      // no match but word was a required one
      if (arr.every((record) => record.files === undefined)) return;

      // found search word in contents
      arr.forEach((record) => {
        if (record.files === undefined) return;

        let recordFiles = record.files;
        if (recordFiles.length === undefined) recordFiles = [recordFiles];
        files.push(...recordFiles);

        // set score for the word in each file
        recordFiles.forEach((file) => {
          if (!scoreMap.has(file)) scoreMap.set(file, {});
          scoreMap.get(file)[word] = record.score;
        });
      });

      // create the mapping
      files.forEach((file) => {
        if (fileMap.has(file) && fileMap.get(file).indexOf(word) === -1)
          fileMap.get(file).push(word);
        else fileMap.set(file, [word]);
      });
    });

    // now check if the files don't contain excluded terms
    const results = [];
    for (const [file, wordList] of fileMap) {
      // check if all requirements are matched

      // as search terms with length < 3 are discarded
      const filteredTermCount = [...searchTerms].filter(
        (term) => term.length > 2
      ).length;
      if (
        wordList.length !== searchTerms.size &&
        wordList.length !== filteredTermCount
      )
        continue;

      // ensure that none of the excluded terms is in the search result
      if (
        [...excludedTerms].some(
          (term) =>
            terms[term] === file ||
            titleTerms[term] === file ||
            (terms[term] || []).includes(file) ||
            (titleTerms[term] || []).includes(file)
        )
      )
        break;

      // select one (max) score for the file.
      const score = Math.max(...wordList.map((w) => scoreMap.get(file)[w]));
      // add result to the result list
      results.push([
        docNames[file],
        titles[file],
        "",
        null,
        score,
        filenames[file],
      ]);
    }
    return results;
  },

  metadataForResults: (results) => {
    var toDisplayMeta = {}
    for (var category in Search.metaIndex) {
      if (!category.includes("_")) {
        if (!toDisplayMeta[category]) toDisplayMeta[category] = {};
        for (var result in results) {
          var cur_file = "./" + results[result][5]
          var files_per_cat = Search.metaIndex[category]
          if (files_per_cat[cur_file]) {
            for (var i in files_per_cat[cur_file]) {
              let item = files_per_cat[cur_file][i]
              if (toDisplayMeta[category][item]) {
                toDisplayMeta[category][item]++;
              } else {
                toDisplayMeta[category][item] = 1;
              }
            }
          }
        }
      }
    }
    var toDisplayTitles = {}
    for (var result in results) {
      var cur_file = "./" + results[result][5]
      var cur_titles = Search.metaIndex["root_titles"][cur_file]
      
      // Try without "./" prefix if not found
      if (!cur_titles) {
        cur_titles = Search.metaIndex["root_titles"][results[result][5]]
      }
      
      if (Array.isArray(cur_titles)) {
        // Handle array of titles
        cur_titles.forEach(title => {
          if (toDisplayTitles[title]) {
            toDisplayTitles[title]++;
          } else {
            toDisplayTitles[title] = 1;
          }
        });
      } else if (cur_titles) {
        // Handle single title or comma-separated titles
        const titleList = cur_titles.includes(',') ? 
          cur_titles.split(',').map(t => t.trim()) : [cur_titles];
        
        titleList.forEach(title => {
          if (toDisplayTitles[title]) {
            toDisplayTitles[title]++;
          } else {
            toDisplayTitles[title] = 1;
          }
        });
      }
    }
    const titleEntries = Object.entries(toDisplayTitles);
    titleEntries.sort((a, b) => b[1] - a[1]);
    const sortedTitleEntries = Object.fromEntries(titleEntries);
    AdvancedSearch.initializeAdvancedSearch(toDisplayMeta, sortedTitleEntries);
  },

  updateDisplay: () => {
    const paramList = Search.activeFilters || {};
    
    if (!Search.og_results) {
      Search.og_results = Search.lastresults;
    }
    
    if (!Search.og_results || Search.og_results.length === 0) {
      return;
    }
    
    // If there are no active filters, display the original search results
    if (Object.keys(paramList).length === 0) {
      var tmpResults = [...Search.og_results]
      _removeChildren(Search.output);
      _displayNextItem(tmpResults, tmpResults.length, Search.og_searchterms);
      return;
    }
    const new_results = Search.og_results.filter(result => {
      const cur_result = "./" + result[5];
      return Object.entries(paramList).every(([category, val]) => {
        let cur_val = Search.metaIndex[category][cur_result];
        
        if (!cur_val) {
          cur_val = Search.metaIndex[category][result[5]];
        }
        
        if (category === "root_titles") {
          // Specific handling for root_titles which can be arrays or comma-separated strings
          if (Array.isArray(cur_val)) {
            return val.some(v => cur_val.includes(v));
          } else if (cur_val) {
            const titleList = cur_val.includes(',') ? 
              cur_val.split(',').map(t => t.trim()) : [cur_val];
            return val.some(v => titleList.includes(v));
          } else {
            return false;
          }
        } else if (Array.isArray(cur_val)) {
          return val.some(v => cur_val.includes(v));
        } else if (cur_val) {
          return val.includes(cur_val);
        } else {
          return false; // No metadata for this category/file
        }
      });
    });
    // Display the filtered search results
    _removeChildren(Search.output);
    _displayNextItem(new_results, new_results.length, Search.og_searchterms);
  },

  /**
   * helper function to return a node containing the
   * search summary for a given text. keywords is a list
   * of stemmed words.
   */
  makeSearchSummary: (htmlText, keywords) => {
    const text = Search.htmlToText(htmlText);
    if (text === "") return null;

    const textLower = text.toLowerCase();
    const actualStartPosition = [...keywords]
      .map((k) => textLower.indexOf(k.toLowerCase()))
      .filter((i) => i > -1)
      .slice(-1)[0];
    const startWithContext = Math.max(actualStartPosition - 120, 0);

    const top = startWithContext === 0 ? "" : "...";
    const tail = startWithContext + 240 < text.length ? "..." : "";

    let summary = document.createElement("p");
    summary.classList.add("context");
    let sumFinal = top + text.substr(startWithContext, 240).trim() + tail;
    let sumFinalArr = sumFinal.split(/\s+/)
    for (let word in sumFinalArr) {
      if (keywords.has(sumFinalArr[word].toLowerCase())) {
        sumFinalArr[word] = "<b>" + sumFinalArr[word] + "</b>"
      }
    }
    summary.innerHTML = sumFinalArr.join(' ')

    return summary;
  },
};

_ready(Search.init);