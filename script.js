const pokedex = document.getElementById("pokedex");
const searchBar = document.getElementById("search-bar");
const filterContainer = document.getElementById("filter-container");
const filterButton = document.getElementById("filter-button");
const filterMenu = document.getElementById("filter-menu");
let allPokemon = [];
let selectedTypes = ["all"];

// Função para buscar dados dos 151 primeiros Pokémon
const fetchPokemon = async () => {
  const pokemonList = [];
  for (let i = 1; i <= 151; i++) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
    const data = await response.json();
    pokemonList.push({
      id: data.id,
      name: data.name,
      staticImage: data.sprites.front_default,
      animatedImage: data.sprites.versions["generation-v"]["black-white"].animated.front_default,
      type: data.types.map((type) => type.type.name),
    });
  }
  return pokemonList;
};

// Renderizar os cards de Pokémon
const renderPokemon = (pokemonList) => {
  pokedex.innerHTML = pokemonList.length
    ? pokemonList
        .map(
          (pokemon) => `
        <div class="pokemon-card" 
             onmouseover="toggleGif(this, '${pokemon.animatedImage}')"
             onmouseout="toggleGif(this, '${pokemon.staticImage}')">
          <img 
            src="${pokemon.staticImage}" 
            alt="${pokemon.name}">
          <div class="pokemon-info">
            <p class="pokemon-id">#${pokemon.id.toString().padStart(3, "0")}</p>
            <p class="pokemon-name">${pokemon.name}</p>
            <div class="pokemon-types">
              ${pokemon.type
                .map(
                  (type) =>
                    `<span class="pokemon-type type-${type}">${type}</span>`
                )
                .join("")}
            </div>
          </div>
        </div>
      `
        )
        .join("")
    : '<p class="no-results">No Pokémon found.</p>';
};

// Alternar GIF no hover
const toggleGif = (card, image) => {
  const img = card.querySelector("img");
  img.src = image;
};

// Aplicar filtro de tipos
const filterByType = () => {
  const filteredPokemon =
    selectedTypes.includes("all") || selectedTypes.length === 0
      ? allPokemon
      : allPokemon.filter((pokemon) =>
          selectedTypes.some((type) => pokemon.type.includes(type))
        );

  const searchQuery = searchBar.value.toLowerCase();
  filterPokemon(searchQuery, filteredPokemon);
};

// Atualizar seleção de filtros
filterContainer.addEventListener("change", (e) => {
  const { value, checked } = e.target;

  if (value === "all") {
    selectedTypes = checked ? ["all"] : [];
    document
      .querySelectorAll("#filter-menu input")
      .forEach((input) => (input.checked = value === "all"));
  } else {
    selectedTypes = selectedTypes.filter((type) => type !== "all");
    if (checked) selectedTypes.push(value);
    else selectedTypes = selectedTypes.filter((type) => type !== value);
  }

  filterByType();
});

// Toggle para exibir o menu
filterButton.addEventListener("click", () => {
  filterMenu.classList.toggle("active");
  filterMenu.style.display = filterMenu.style.display === "block" ? "none" : "block";
});

// Buscar Pokémon pelo filtro de pesquisa
const filterPokemon = (searchQuery, pokemonList) => {
  const normalizedQuery = searchQuery.startsWith("#")
    ? searchQuery.slice(1)
    : searchQuery.toLowerCase();

  const filteredPokemon = pokemonList.filter((pokemon) => {
    const isIdMatch =
      pokemon.id.toString().includes(normalizedQuery) ||
      pokemon.id.toString().padStart(3, "0").includes(normalizedQuery);

    const isNameMatch = pokemon.name.toLowerCase().includes(normalizedQuery);

    return isIdMatch || isNameMatch;
  });

  renderPokemon(filteredPokemon);
};

// Inicializar a Pokédex
const initPokedex = async () => {
  allPokemon = await fetchPokemon();
  renderPokemon(allPokemon);

  searchBar.addEventListener("input", (e) => {
    const searchQuery = e.target.value.toLowerCase();
    filterPokemon(searchQuery, selectedTypes.includes("all") ? allPokemon : allPokemon);
  });
};

initPokedex();
