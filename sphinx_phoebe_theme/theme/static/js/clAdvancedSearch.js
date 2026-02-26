
// Function to initialize the page with the loaded metadata index

const AdvancedSearch = {
    initializeAdvancedSearch: (displayMeta, displayTitles) => {
        // Filter Options
        var filters = document.getElementById('filters');
        if (filters) {
            const titleContainer = document.createElement("div");
            titleContainer.className = "search-filter__title-container";

            const titleLabel = document.createElement("div");
            titleLabel.className = "search-filter__title-label";
            titleLabel.textContent = "Document filter";

            const clearButton = document.createElement("button");
            clearButton.className = "search-filter__clear";
            clearButton.textContent = "Clear";
            clearButton.style.display = "none";
            clearButton.addEventListener("click", function() {
                document.querySelectorAll(".search-filter__item--active").forEach(item => {
                    item.classList.remove("search-filter__item--active");
                });
                clearButton.style.display = "none";
                debouncedRefresh();
            });

            titleContainer.appendChild(titleLabel);
            titleContainer.appendChild(clearButton);
            filters.innerHTML = "";
            filters.appendChild(titleContainer);

            const filterElement = document.createElement("div")
            filterElement.className = "search-filter__section"
            filters.appendChild(filterElement)

            for (var doc in displayTitles) {
                if (!doc || doc === "undefined" || doc === "null") {
                    continue;
                }
                const filterItem = document.createElement("div");
                filterItem.className = "search-filter__item";
                filterItem.textContent = doc + " (" + displayTitles[doc] + ")";
                filterItem.dataset.filter = "root_titles";
                filterItem.dataset.value = doc;

                filterItem.addEventListener("click", function() {
                    this.classList.toggle("search-filter__item--active");

                    // Show/hide clear button based on active filters
                    const hasActive = document.querySelectorAll(".search-filter__item--active").length > 0;
                    clearButton.style.display = hasActive ? "block" : "none";

                    debouncedRefresh();
                });

                filterElement.appendChild(filterItem);
            }
        }
    }
}

// Prevent rapid-fire filter updates
let refreshTimeout;
let isUpdating = false;

const debouncedRefresh = () => {
    clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(refresh, 150);
};

const refresh = () => {
    if (isUpdating) {
        return;
    }

    isUpdating = true;

    var activeItems = document.querySelectorAll('.search-filter__item--active')
    var filterParams = {}
    for (const item of activeItems) {
        const filterType = item.dataset.filter;
        const filterValue = item.dataset.value;
        if (filterParams[filterType]) {
            filterParams[filterType].push(filterValue)
        } else {
            filterParams[filterType] = [filterValue]
        }
    }

    // Store filter params globally for the filtering logic to use
    Search.activeFilters = filterParams;

    // Update display without changing URL
    Search.updateDisplay()

    setTimeout(() => {
        isUpdating = false;
    }, 50);
}