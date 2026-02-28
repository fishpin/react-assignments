import RecipeCard from "./RecipeCard";

function RecipeList({ recipes, onRecipeClick }) {
  // Show a message if no recipes were found
  if (recipes.length === 0) {
    return <p className="no-results">No recipes found. Try different ingredients or filters.</p>;
  }

  return (
    <div className="recipe-grid">
      {/* Render a card for each recipe in the results */}
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onClick={onRecipeClick} />
      ))}
    </div>
  );
}

export default RecipeList;
