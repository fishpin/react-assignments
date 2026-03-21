import { useState } from "react";
import SearchBar from "./components/SearchBar";
import RecipeList from "./components/RecipeList";
import RecipeDetail from "./components/RecipeDetail";
import "./App.css";

const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY;

function App() {
  // What the user typed in the ingredient box
  const [ingredients, setIngredients] = useState("");

  // Which diet checkboxes are currently checked
  const [selectedDiets, setSelectedDiets] = useState([]);

  // List of recipes returned from the search
  const [recipes, setRecipes] = useState([]);

  // The full detail for a recipe the user clicked on
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Loading and error states for feedback to the user
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Toggle a diet filter on or off
  function handleDietChange(diet) {
    if (selectedDiets.includes(diet)) {
      setSelectedDiets(selectedDiets.filter((d) => d !== diet));
    } else {
      setSelectedDiets([...selectedDiets, diet]);
    }
  }

  // Fetch recipes from Spoonacular based on ingredients and diet filters
  async function handleSearch() {
    if (!ingredients.trim()) {
      setError("Please enter at least one ingredient.");
      return;
    }

    setLoading(true);
    setError("");
    setRecipes([]);

    try {
      // Build the API URL with query parameters
      const params = new URLSearchParams({
        apiKey: API_KEY,
        includeIngredients: ingredients,
        addRecipeInformation: "true", // includes cook time and summary in results
        number: "12",
      });

      // Add diet filters if any are selected
      if (selectedDiets.length > 0) {
        params.append("diet", selectedDiets.join(","));
      }

      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recipes. Please try again.");
      }

      const data = await response.json();
      setRecipes(data.results);

      if (data.results.length === 0) {
        setError("No recipes found. Try different ingredients or fewer filters.");
      }
    } catch (err) {
      // Show an error message in case of internet or network related errors
      setError(err.message || "Whoops, something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  // Fetch the full details for a recipe when the user clicks a card
  async function handleRecipeClick(id) {
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Could not load recipe details.");
      }

      const data = await response.json();
      setSelectedRecipe(data);
    } catch (err) {
      setError(err.message || "Could not load recipe details.");
    }
  }

  return (
    <div className="app">
      {/* Search bar with ingredient input and diet filters */}
      <SearchBar
        ingredients={ingredients}
        selectedDiets={selectedDiets}
        onIngredientsChange={setIngredients}
        onDietChange={handleDietChange}
        onSearch={handleSearch}
      />

      {/* Loading indicator */}
      {loading && <p className="loading">Searching for recipes...</p>}

      {/* Error message */}
      {error && <p className="error">{error}</p>}

      {/* Recipe results grid */}
      {!loading && recipes.length > 0 && (
        <RecipeList recipes={recipes} onRecipeClick={handleRecipeClick} />
      )}

      {/* Recipe detail modal — shown when a card is clicked */}
      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}

export default App;
