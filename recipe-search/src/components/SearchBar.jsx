import React from "react";

// Dietary restriction options shown as checkboxes
const DIET_OPTIONS = ["vegan", "vegetarian", "gluten free", "ketogenic", "paleo"];

function SearchBar({ ingredients, selectedDiets, onIngredientsChange, onDietChange, onSearch }) {
  // Allow pressing Enter to trigger search
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      onSearch();
    }
  }

  return (
    <div className="search-bar">
      <h1>Recipe Search</h1>

      {/* Ingredient input */}
      <div className="input-row">
        <input
          type="text"
          placeholder="Enter ingredients separated by commas (e.g. chicken, rice, garlic)"
          value={ingredients}
          onChange={(e) => onIngredientsChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="ingredient-input"
        />
        <button onClick={onSearch} className="search-button">
          Search
        </button>
      </div>

      {/* Diet filter checkboxes — supports multi-select */}
      <div className="diet-filters">
        <span className="filter-label">Dietary filters:</span>
        {DIET_OPTIONS.map((diet) => (
          <label key={diet} className="diet-option">
            <input
              type="checkbox"
              checked={selectedDiets.includes(diet)}
              onChange={() => onDietChange(diet)}
            />
            {diet}
          </label>
        ))}
      </div>
    </div>
  );
}

export default SearchBar;
