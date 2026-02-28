function RecipeCard({ recipe, onClick }) {
  // The summary from the API includes HTML tags, so I stripped them for the card preview
  function stripHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }

  // Show only the first 150 characters of the summary as a brief description
  const shortSummary = stripHtml(recipe.summary).slice(0, 150) + "...";

  return (
    <div className="recipe-card" onClick={() => onClick(recipe.id)}>
      <img src={recipe.image} alt={recipe.title} className="recipe-image" />
      <div className="recipe-info">
        <h3>{recipe.title}</h3>
        <p className="cook-time">⏱ {recipe.readyInMinutes} minutes</p>
        <p className="recipe-summary">{shortSummary}</p>
        <button className="details-button">View Recipe</button>
      </div>
    </div>
  );
}

export default RecipeCard;
