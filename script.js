// Elementos DOM principais
const pokedex = document.getElementById("pokedex"); // Container onde os cards de Pokémon serão exibidos
const searchBar = document.getElementById("search-bar"); // Barra de pesquisa
const filterContainer = document.getElementById("filter-container"); // Container que envolve o botão de filtro
const filterButton = document.getElementById("filter-button"); // Botão para exibir o menu de filtros
const filterMenu = document.getElementById("filter-menu"); // Menu de filtros
let allPokemon = []; // Lista de todos os Pokémon carregados
let selectedTypes = ["all"]; // Tipos de Pokémon selecionados (inicialmente "todos")

// Função para buscar dados dos 151 primeiros Pokémon da API
const fetchPokemon = async () => {
  const pokemonList = [];
  for (let i = 1; i <= 151; i++) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`); // Faz uma requisição para a API
    const data = await response.json(); // Converte a resposta em JSON
    pokemonList.push({
      id: data.id, // ID do Pokémon
      name: data.name, // Nome do Pokémon
      staticImage: data.sprites.front_default, // Imagem estática
      animatedImage: data.sprites.versions["generation-v"]["black-white"].animated.front_default, // Imagem animada (GIF)
      type: data.types.map((type) => type.type.name), // Tipos do Pokémon (ex.: "fire", "water")
    });
  }
  return pokemonList; // Retorna a lista de Pokémon
};

// Função para renderizar os cards de Pokémon na página
const renderPokemon = (pokemonList) => {
  // Verifica se há Pokémon na lista para exibir
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
            <p class="pokemon-id">#${pokemon.id.toString().padStart(3, "0")}</p> <!-- ID formatado -->
            <p class="pokemon-name">${pokemon.name}</p> <!-- Nome do Pokémon -->
            <div class="pokemon-types">
              ${pokemon.type
                .map(
                  (type) =>
                    `<span class="pokemon-type type-${type}">${type}</span>` // Tipos estilizados
                )
                .join("")}
            </div>
          </div>
        </div>
      `
        )
        .join("") // Concatena todos os cards
    : '<p class="no-results">No Pokémon found.</p>'; // Mensagem exibida quando não há resultados
};

// Função para alternar entre imagem estática e GIF ao passar o mouse
const toggleGif = (card, image) => {
  const img = card.querySelector("img"); // Seleciona a imagem do card
  img.src = image; // Altera a fonte da imagem
};

// Função para aplicar filtro de tipos
const filterByType = () => {
  const filteredPokemon =
    selectedTypes.includes("all") || selectedTypes.length === 0 // Verifica se "todos" está selecionado
      ? allPokemon // Exibe todos os Pokémon
      : allPokemon.filter((pokemon) =>
          selectedTypes.some((type) => pokemon.type.includes(type)) // Filtra Pokémon pelo tipo selecionado
        );

  const searchQuery = searchBar.value.toLowerCase(); // Obtém o valor atual da barra de pesquisa
  filterPokemon(searchQuery, filteredPokemon); // Aplica os filtros de pesquisa e tipo
};

// Atualizar os tipos de filtro quando o usuário interagir
filterContainer.addEventListener("change", (e) => {
  const { value, checked } = e.target; // Obtém o valor e o estado do checkbox

  if (value === "all") {
    // Se "all" foi marcado, limpa outras seleções
    selectedTypes = checked ? ["all"] : [];
    document
      .querySelectorAll("#filter-menu input") // Seleciona todos os checkboxes
      .forEach((input) => (input.checked = value === "all")); // Marca/desmarca todos
  } else {
    selectedTypes = selectedTypes.filter((type) => type !== "all"); // Remove "all" da seleção
    if (checked) selectedTypes.push(value); // Adiciona o tipo selecionado
    else selectedTypes = selectedTypes.filter((type) => type !== value); // Remove o tipo desmarcado
  }

  filterByType(); // Atualiza os resultados na página
});

// Função para alternar a exibição do menu de filtros
filterButton.addEventListener("click", () => {
  filterMenu.classList.toggle("active"); // Adiciona/remove a classe "active"
  filterMenu.style.display = filterMenu.style.display === "block" ? "none" : "block"; // Exibe/esconde o menu
});

// Função para filtrar Pokémon com base na pesquisa
const filterPokemon = (searchQuery, pokemonList) => {
  const normalizedQuery = searchQuery.startsWith("#") // Remove o "#" no início
    ? searchQuery.slice(1)
    : searchQuery.toLowerCase();

  const filteredPokemon = pokemonList.filter((pokemon) => {
    const isIdMatch =
      pokemon.id.toString().includes(normalizedQuery) || // Busca parcial por ID
      pokemon.id.toString().padStart(3, "0").includes(normalizedQuery); // Busca parcial por ID com zeros à esquerda

    const isNameMatch = pokemon.name.toLowerCase().includes(normalizedQuery); // Busca por nome

    return isIdMatch || isNameMatch; // Retorna true se houver correspondência
  });

  renderPokemon(filteredPokemon); // Renderiza os resultados filtrados
};

// Função principal para inicializar a Pokédex
const initPokedex = async () => {
  allPokemon = await fetchPokemon(); // Carrega todos os Pokémon
  renderPokemon(allPokemon); // Exibe todos os Pokémon inicialmente

  // Adiciona evento para buscar Pokémon ao digitar na barra de pesquisa
  searchBar.addEventListener("input", (e) => {
    const searchQuery = e.target.value.toLowerCase(); // Obtém o texto digitado
    filterPokemon(searchQuery, selectedTypes.includes("all") ? allPokemon : allPokemon); // Aplica a busca
  });
};

initPokedex(); // Chama a função principal para iniciar a aplicação
