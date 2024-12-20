// Elementos DOM principais
const pokedex = document.getElementById("pokedex");
const searchBar = document.getElementById("search-bar");
const filterContainer = document.getElementById("filter-container");
const filterButton = document.getElementById("filter-button");
const filterMenu = document.getElementById("filter-menu");
const generationTabButton = document.getElementById("generation-tab");
const typeTabButton = document.getElementById("type-tab");
const tabHighlight = document.getElementById("tab-highlight");
const clearFiltersButton = document.getElementById("clear-filters-btn"); // Botão de limpar filtros
let allPokemon = [];
let selectedTypes = ["all"];
let selectedGeneration = null;

let loadedPokemonCount = 0;
const pokemonBatchSize = 50;
const maxPokemonId = 1025;

// Função para buscar dados dos Pokémon da API em lotes
const fetchPokemon = async () => {
  const pokemonList = [];
  let nextUrl = `https://pokeapi.co/api/v2/pokemon?limit=${pokemonBatchSize}&offset=${loadedPokemonCount}`;

  while (nextUrl) {
    const response = await fetch(nextUrl);
    const data = await response.json();

    for (const pokemon of data.results) {
      const pokemonData = await fetch(pokemon.url);
      const pokemonDetails = await pokemonData.json();
      if (pokemonDetails.id <= maxPokemonId) {
        const generation = pokemonDetails.id <= 151
          ? 1 : pokemonDetails.id <= 251
          ? 2 : pokemonDetails.id <= 386
          ? 3 : pokemonDetails.id <= 493
          ? 4 : pokemonDetails.id <= 649
          ? 5 : pokemonDetails.id <= 721
          ? 6 : pokemonDetails.id <= 809
          ? 7 : pokemonDetails.id <= 905
          ? 8 : pokemonDetails.id <= 1025
          ? 9 : null;

        const animatedImage = pokemonDetails.sprites.versions["generation-v"]["black-white"].animated.front_default
          || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${pokemonDetails.id}.gif`
          || null;

        pokemonList.push({
          id: pokemonDetails.id,
          name: pokemonDetails.name,
          staticImage: pokemonDetails.sprites.front_default,
          animatedImage: animatedImage,
          type: pokemonDetails.types.map((type) => type.type.name),
          generation: generation,
        });
      }
    }

    if (pokemonList.length >= maxPokemonId) {
      nextUrl = null;
    } else {
      nextUrl = data.next;
    }
  }

  loadedPokemonCount += pokemonList.length;
  return pokemonList;
};

// Função para renderizar os cards de Pokémon na página
const renderPokemon = (pokemonList) => {
  const generations = {};
  pokemonList.forEach(pokemon => {
    if (!generations[pokemon.generation]) {
      generations[pokemon.generation] = [];
    }
    generations[pokemon.generation].push(pokemon);
  });

  let output = "";

  for (const generation in generations) {
    if (selectedGeneration === null || generation == selectedGeneration) {
      const romanGeneration = convertToRoman(parseInt(generation));

      output += `
        <h2 class="generation-title">Generation ${romanGeneration}</h2>
        <div class="generation-container" id="generation-${generation}" style="${selectedGeneration && selectedGeneration != generation ? 'display: none;' : ''}">
          ${generations[generation].map(
            (pokemon) => `
              <div class="pokemon-card" 
                onmouseover="toggleGif(this, '${pokemon.animatedImage || pokemon.staticImage}')"
                onmouseout="toggleGif(this, '${pokemon.staticImage}')">
                <img src="${pokemon.staticImage}" alt="${pokemon.name}" data-static-image="${pokemon.staticImage}">
                <div class="pokemon-info">
                  <p class="pokemon-id">#${pokemon.id.toString().padStart(3, "0")}</p>
                  <p class="pokemon-name">${pokemon.name}</p>
                  <div class="pokemon-types">
                    ${pokemon.type.map(
                      (type) => `<span class="pokemon-type type-${type}">${type}</span>`
                    ).join("")}
                  </div>
                </div>
              </div>
            `
          ).join("")}
        </div>
        <hr>
      `;
    }
  }

  pokedex.innerHTML = output || '<p class="no-results">No Pokémon found.</p>';
};

// Função para alternar entre imagem estática e GIF
const toggleGif = (card, image) => {
  const img = card.querySelector("img");
  img.src = image || img.dataset.staticImage;  // Se não houver imagem animada, mantém a estática
};

// Função para aplicar filtro de tipos
const filterByType = () => {
  const filteredPokemon =
    selectedTypes.includes("all") || selectedTypes.length === 0
      ? allPokemon
      : allPokemon.filter((pokemon) =>
          selectedTypes.some((type) => pokemon.type.includes(type))
        );

  renderPokemon(filteredPokemon);
};

// Função para aplicar filtro de geração
const filterByGeneration = () => {
  const filteredByGeneration = allPokemon.filter(pokemon => {
    return selectedGeneration === null || pokemon.generation === selectedGeneration;
  });

  filterByType(filteredByGeneration);
};

// Atualizar a geração selecionada ao interagir com os botões de radio
document.querySelectorAll('input[name="generation"]').forEach((radio) => {
  radio.addEventListener('change', (e) => {
    selectedGeneration = parseInt(e.target.value);
    selectedTypes = ["all"]; // Sempre que uma geração for selecionada, definimos "All" como tipo padrão
    document.querySelectorAll("#filter-menu input[type='checkbox']").forEach((checkbox) => {
      checkbox.checked = false; // Desmarcar todas as opções de tipo
    });
    document.querySelector('input[value="all"]').checked = true; // Marcar "All" como selecionado
    filterByGeneration();
  });
});

// Atualizar os tipos de filtro quando o usuário interagir
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

  filterByGeneration(); // Aplica a geração e os tipos após mudança
});

// Toggle para exibir o menu de filtros
filterButton.addEventListener("click", () => {
  filterMenu.classList.toggle("active");
  filterMenu.style.display = filterMenu.style.display === "block" ? "none" : "block";
});

// Função para filtrar Pokémon com base na pesquisa
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

// Alternar entre Filtros de Tipos e Gerações
typeTabButton.addEventListener("click", () => {
  document.querySelector(".generation-filters").style.display = "none";
  document.querySelector(".type-filters").style.display = "block";
  tabHighlight.style.left = "0%"; // Desliza o destaque para "Types"
  typeTabButton.classList.add("selected");
  generationTabButton.classList.remove("selected");
});

generationTabButton.addEventListener("click", () => {
  document.querySelector(".type-filters").style.display = "none";
  document.querySelector(".generation-filters").style.display = "block";
  tabHighlight.style.left = "50%"; // Desliza o destaque para "Generations"
  generationTabButton.classList.add("selected");
  typeTabButton.classList.remove("selected");
});

// Função para limpar os filtros
clearFiltersButton.addEventListener("click", () => {
  selectedTypes = ["all"];
  selectedGeneration = null;
  document.querySelectorAll("#filter-menu input").forEach((input) => input.checked = false);
  document.querySelector('input[value="all"]').checked = true; // Marca "All" como selecionado

  renderPokemon(allPokemon); // Exibe todos os Pokémon novamente
});

// Função principal para inicializar a Pokédex
const initPokedex = async () => {
  allPokemon = await fetchPokemon();
  renderPokemon(allPokemon);

  searchBar.addEventListener("input", (e) => {
    const searchQuery = e.target.value.toLowerCase();
    filterPokemon(searchQuery, allPokemon);
  });
};

initPokedex();

// Função para converter números para romanos
function convertToRoman(num) {
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    return romanNumerals[num - 1] || num;
}
