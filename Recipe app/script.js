const mealEl_container = document.querySelector(".meal");
const fav_meal_container = document.querySelector(".fav-meals");

const search_input = document.querySelector(".search-input");
const search_icon = document.querySelector(".search-icon");

const popup_container = document.querySelector(".pop-up-container");
const close_popup_btn = document.querySelector(".pop-up > i");
const popup = document.querySelector(".pop-up-inner");

const lightDarkModeSpan = document.querySelector(".light-dark-mode");
const lightDarkModeIcon = document.querySelector(".light-dark-mode > i");

async function getRandomMeal() {
  const resp = await fetch(
    `https://www.themealdb.com/api/json/v1/1/random.php`
  );
  const respData = await resp.json();
  const random_meal = respData.meals[0];
  console.log(random_meal);
  addMeal(random_meal);
}

getRandomMeal();
fetchFavMeals();

async function getMealById(id) {
  const resp = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
  );
  const respData = await resp.json();
  const meal = respData.meals[0];

  return meal;
}

async function getMealBySearch(term) {
  const resp = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`
  );
  const respData = await resp.json();
  const meal = respData.meals;

  return meal;
}

function addMeal(meal) {
  const meal_card = document.createElement("div");
  meal_card.classList.add("meal-card");
  meal_card.innerHTML = `
      <div class="meal-card-img-container">
        <img src="${meal.strMealThumb}" alt="">
      </div>
      <div class="meal-name">
        <p>${meal.strMeal}</p>
        <i class="fa-regular fa-heart"></i>
        </div>
  `;

  const btn = meal_card.querySelector(".fa-heart");
  btn.addEventListener("click", () => {
    if (btn.classList.contains("fa-regular")) {
      btn.setAttribute("class", "fa-solid fa-heart");
      addMealLs(meal.idMeal);
    } else {
      btn.setAttribute("class", "fa-regular fa-heart");
      removeMealLS(meal.idMeal);
    }
    fetchFavMeals();
  });
  meal_card.firstChild.nextSibling.addEventListener("click", () => {
    showMealPopup(meal);
  });
  mealEl_container.appendChild(meal_card);
}

function addMealLs(mealId) {
  const mealIds = getMealLs();
  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealID) {
  const mealIds = getMealLs();
  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealID))
  );
}

function getMealLs() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));
  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  fav_meal_container.innerHTML = "";
  const mealsIds = getMealLs();
  const meals = [];
  for (let i = 0; i < mealsIds.length; i++) {
    const mealID = mealsIds[i];
    meal = await getMealById(mealID);
    addMealToFav(meal);
    meals.push(meal);
  }
}

function addMealToFav(meal) {
  const fav_meals = document.createElement("div");
  fav_meals.innerHTML = `
  <div class="single">
    <div class="top">
      <div class="img-container">
          <img src="${meal.strMealThumb}">
      </div>
      <div class="text">
          <p>${meal.strMeal}</p>
      </div>
  </div>
  <i class="fa-solid fa-x"></i>
</div>`;
  const x = fav_meals.querySelector(".fa-x");
  x.addEventListener("click", () => {
    removeMealLS(meal.idMeal);

    const heart_btns = document.querySelectorAll(".fa-heart");
    heart_btns.forEach((heart_btns) => {
      heart_btns.setAttribute("class", "fa-regular fa-heart");
    });

    fetchFavMeals();
  });

  fav_meals.firstChild.nextSibling.firstChild.nextSibling.addEventListener(
    "click",
    () => {
      showMealPopup(meal);
    }
  );

  fav_meal_container.appendChild(fav_meals);
}

search_icon.addEventListener("click", async () => {
  mealEl_container.innerHTML = "";
  const searchVal = search_input.value;
  const meals = await getMealBySearch(searchVal);
  if (meals) {
    meals.forEach((meal) => {
      addMeal(meal);
    });
    document.querySelector(".meals-container > h2").innerHTML =
      "Search Resutls...";
  } else {
    document.querySelector(".meals-container > h2").innerHTML =
      "No Meals Found";
    mealEl_container.innerHTML = "";
  }
});

close_popup_btn.addEventListener("click", () => {
  popup_container.style.display = "none";
});

function showMealPopup(meal) {
  popup.innerHTML = "";
  const newPopup = document.createElement("div");
  newPopup.classList.add("pop-up-inner");

  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    if (meal[`strIngredient${i}`]) {
      ingredients.push(
        `${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`
      );
    } else {
      break;
    }
  }

  newPopup.innerHTML = `
  <div class="left">
  <div class="meal-card">
      <div class="meal-card-img-container">
          <img src="${meal.strMealThumb}" alt="">
      </div>
      <div class="meal-name">
          <p>${meal.strMeal}</p>
          <i class="fa-regular fa-heart"></i>
      </div>
  </div>
</div>
<div class="right">
  <div>
      <h2>Intructions</h2>
      <p class="meal-info">${meal.strInstructions}</p>
  </div>
  <div>
      <h2>Ingredients / Measures</h2>
      <ul>
          ${ingredients.map((e) => `<li>${e}</li>`).join("")}
      </ul>
  </div>
</div>`;

  popup.appendChild(newPopup);
  popup_container.style.display = "flex";
}

lightDarkModeSpan.addEventListener("click", () => {
  if (lightDarkModeIcon.classList.contains("fa-sun")) {
    lightDarkModeIcon.setAttribute("class", "fa-solid fa-moon");
  }
  else{
    lightDarkModeIcon.setAttribute("class", "fa-solid fa-sun");
  }
  document.documentElement.classList.toggle("light-theme");
});
