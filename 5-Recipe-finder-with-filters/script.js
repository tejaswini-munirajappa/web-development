const apiKey = "API-KEY"; // REPLACE A API KEY FROM Spoonacular API.

const recipeContainer = document.getElementById("recipeContainer");
const searchInput = document.getElementById("searchInput");
const cuisineFilter = document.getElementById("cuisineFilter");
const dietFilter = document.getElementById("dietFilter");
const mealTypeFilter = document.getElementById("mealTypeFilter");
const recommendationsSection = document.querySelector(".recommendations");
let isCuisineSelected = false;

window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").classList.add("active");
  }, 1000);

  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    loadRecommendations(); // Load default recommendations
  }, 7000);
});

function applyFiltersAndSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    alert("Please enter a recipe name to search.");
    return;
  }
  searchRecipeByName(query);
}

async function searchRecipeByName(dishName) {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${dishName}&number=6&apiKey=${apiKey}`
    );
    const data = await response.json();
    const results = data.results.map((item) => ({
      id: item.id,
      name: item.title,
      image: item.image,
    }));
    displayRecipes(results, recipeContainer);
  } catch (error) {
    console.error("Search error:", error);
    alert("Something went wrong while searching for the recipe.");
  }
}

function displayRecipes(recipesToShow, container) {
  container.innerHTML = "";
  if (!recipesToShow || recipesToShow.length === 0) {
    container.innerHTML = `<p style='text-align:center;'>No matching recipes found.</p>`;
    return;
  }
  recipesToShow.forEach((recipe) => {
    const safeTitle = recipe.name.replace(/'/g, "\\'");
    const card = document.createElement("div");
    card.classList.add("recipe-card");
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}" />
      <div class="content">
        <h3>${recipe.name}</h3>
        <button onclick="fetchRecipeSteps(${recipe.id}, '${safeTitle}')">View Steps</button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function fetchRecipeSteps(id, dishTitle) {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${id}/analyzedInstructions?apiKey=${apiKey}`
    );
    const data = await response.json();
    const stepsArray = data[0]?.steps.map((step) => step.step) || [];

    if (stepsArray.length > 0) {
      showStepsModal(dishTitle, stepsArray);
    } else {
      fetchRecipeSummary(id, dishTitle);
    }
  } catch (error) {
    console.error("Steps fetch error:", error);
    alert("Error getting recipe steps.");
  }
}

async function fetchRecipeSummary(id, dishTitle) {
  try {
    const res = await fetch(
      `https://api.spoonacular.com/recipes/${id}/summary?apiKey=${apiKey}`
    );
    const data = await res.json();
    showSummaryModal(dishTitle, data.summary);
  } catch (error) {
    alert("No instructions or summary available.");
  }
}

function showStepsModal(title, stepsArray) {
  const modalHTML = `
    <div id="stepsModal" class="modal">
      <div class="modal-content">
        <h2>${title}</h2>
        <ol>
          ${stepsArray.map((step) => `<li>${step}</li>`).join("")}
        </ol>
        <button onclick="closeModal()">Close</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  document.addEventListener("keydown", escCloseModal);
}

function showSummaryModal(title, summary) {
  const modalHTML = `
    <div id="stepsModal" class="modal">
      <div class="modal-content">
        <h2>${title}</h2>
        <p>${summary}</p>
        <button onclick="closeModal()">Close</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  document.addEventListener("keydown", escCloseModal);
}

function closeModal() {
  const modal = document.getElementById("stepsModal");
  if (modal) modal.remove();
  document.removeEventListener("keydown", escCloseModal);
}

function escCloseModal(event) {
  if (event.key === "Escape") closeModal();
}

async function loadRecommendations(cuisine = "all", diet = "all", mealType = "all") {
  // Clear existing recommendations
  recommendationsSection.innerHTML = "";

  if (mealType !== "all") {
    // Meal-type-specific recommendations
    const capitalizedMealType = mealType.charAt(0).toUpperCase() + mealType.slice(1);
    recommendationsSection.innerHTML = `
      <h3>${capitalizedMealType} Recommendations</h3>
      <div id="mealTypeContainer" class="recommendation-grid"></div>
    `;
    const container = document.getElementById("mealTypeContainer");

    try {
      let url = `https://api.spoonacular.com/recipes/complexSearch?type=${mealType}&number=8&apiKey=${apiKey}`;
      if (cuisine !== "all") url += `&cuisine=${cuisine}`;
      if (diet !== "all") url += `&diet=${diet}`;

      const response = await fetch(url);
      const data = await response.json();
      const recipes = data.results.map((item) => ({
        id: item.id,
        name: item.title,
        image: item.image,
      }));
      displayRecipes(recipes, container);
    } catch (error) {
      console.error(`Failed to load ${mealType} recommendations:`, error);
      container.innerHTML = `<p style='text-align:center;'>No matching recipes found for ${capitalizedMealType}.</p>`;
    }
  } else if (cuisine !== "all") {
    // Cuisine-specific recommendations
    isCuisineSelected = true;
    const capitalizedCuisine = cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
    recommendationsSection.innerHTML = `
      <h3>${capitalizedCuisine} Recommendations</h3>
      <div id="cuisineContainer" class="recommendation-grid"></div>
    `;
    const container = document.getElementById("cuisineContainer");

    try {
      let url = `https://api.spoonacular.com/recipes/complexSearch?cuisine=${cuisine}&number=8&apiKey=${apiKey}`;
      if (diet !== "all") url += `&diet=${diet}`;

      const response = await fetch(url);
      const data = await response.json();
      const recipes = data.results.map((item) => ({
        id: item.id,
        name: item.title,
        image: item.image,
      }));
      displayRecipes(recipes, container);
    } catch (error) {
      console.error(`Failed to load ${cuisine} recommendations:`, error);
      container.innerHTML = `<p style='text-align:center;'>No matching recipes found for ${capitalizedCuisine}.</p>`;
    }
  } else {
    // Default meal-type-based recommendations
    isCuisineSelected = false;
    const meals = [
      { type: "breakfast", containerId: "breakfastContainer", title: "Breakfast Ideas" },
      { type: "lunch", containerId: "lunchContainer", title: "Lunch Specials" },
      { type: "dinner", containerId: "dinnerContainer", title: "Dinner Picks" },
      { type: "dessert", containerId: "dessertContainer", title: "Dessert Cravings" },
    ];

    for (const meal of meals) {
      try {
        let url = `https://api.spoonacular.com/recipes/complexSearch?type=${meal.type}&number=4&apiKey=${apiKey}`;
        if (diet !== "all") url += `&diet=${diet}`;

        const response = await fetch(url);
        const data = await response.json();
        if (data.results.length > 0) {
          // Only add section if there are recipes to display
          recommendationsSection.innerHTML += `
            <h3>${meal.title}</h3>
            <div id="${meal.containerId}" class="recommendation-grid"></div>
          `;
          const container = document.getElementById(meal.containerId);
          const recipes = data.results.map((item) => ({
            id: item.id,
            name: item.title,
            image: item.image,
          }));
          displayRecipes(recipes, container);
        }
      } catch (error) {
        console.error(`Failed to load ${meal.type} recommendations:`, error);
      }
    }
  }
}

// Update recommendations when any filter changes
[cuisineFilter, dietFilter, mealTypeFilter].forEach((filter) => {
  filter.addEventListener("change", () => {
    loadRecommendations(cuisineFilter.value, dietFilter.value, mealTypeFilter.value);
  });
});