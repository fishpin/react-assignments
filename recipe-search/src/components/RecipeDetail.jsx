function RecipeDetail({ recipe, onClose }) {
  return (
    // Dark overlay behind the modal — clicking it closes the detail view
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop clicks inside the modal from closing it */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✕</button>

        <img src={recipe.image} alt={recipe.title} className="modal-image" />
        <h2>{recipe.title}</h2>
        <p className="cook-time">⏱ {recipe.readyInMinutes} minutes</p>

        {/* Ingredients list */}
        <h3>Ingredients</h3>
        <ul className="ingredients-list">
          {recipe.extendedIngredients.map((ingredient, index) => (
            <li key={index}>{ingredient.original}</li>
          ))}
        </ul>

        {/* Instructions come as HTML from the API, so we render them safely */}
        <h3>Instructions</h3>
        <div
          className="instructions"
          dangerouslySetInnerHTML={{ __html: recipe.instructions || "No instructions available." }}
        />
      </div>
    </div>
  );
}

export default RecipeDetail;
