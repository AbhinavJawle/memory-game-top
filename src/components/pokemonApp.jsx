import React, { useState, useEffect } from "react";
import "./pokemonApp.css";

const Card = ({ pokemon, onClick }) => {
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 20;
    const rotateY = ((x - centerX) / centerX) * 20;

    card.style.transform = `
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(1.05, 1.05, 1.05)
      `;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  return (
    <div
      className="card"
      onClick={() => onClick(pokemon.id)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-content">
        <img src={pokemon.image} alt={pokemon.name} className="pokemon-image" />
        <p className="pokemon-name">{pokemon.name}</p>
      </div>
    </div>
  );
};

const PokemonMemoryGame = () => {
  const [pokemons, setPokemons] = useState([]);
  const [clickedPokemons, setClickedPokemons] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPokemons();
  }, []);

  const fetchPokemons = async () => {
    try {
      setLoading(true);
      const pokemonIds = [];
      while (pokemonIds.length < 12) {
        const randomId = Math.floor(Math.random() * 151) + 1;
        if (!pokemonIds.includes(randomId)) {
          pokemonIds.push(randomId);
        }
      }

      const pokemonPromises = pokemonIds.map(async (id) => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        console.log(id);
        return {
          id: data.id,
          name: data.name,
          image: data.sprites.front_default,
        };
      });

      const fetchedPokemons = await Promise.all(pokemonPromises);
      setPokemons(fetchedPokemons);
    } catch (error) {
      console.error("Error fetching Pokemon:", error);
    } finally {
      setLoading(false);
    }
  };

  const shufflePokemons = () => {
    setPokemons((prevPokemons) => {
      const newPokemons = [...prevPokemons];
      for (let i = newPokemons.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newPokemons[i], newPokemons[j]] = [newPokemons[j], newPokemons[i]];
      }
      return newPokemons;
    });
  };

  const handlePokemonClick = (pokemonId) => {
    if (clickedPokemons.includes(pokemonId)) {
      // Reset game if Pokemon was already clicked
      setClickedPokemons([]);
      setCurrentScore(0);
    } else {
      // Add Pokemon to clicked list and update score
      const newScore = currentScore + 1;
      setCurrentScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
      }
      setClickedPokemons([...clickedPokemons, pokemonId]);
    }
    shufflePokemons();
  };

  if (loading) {
    return (
      <>
        <div className="loading">
          <div className="loading-spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="game-container">
        <div className="header">
          <h1 className="title">Pokemon Memory Game</h1>
          <p className="instructions">Click on each Pokemon only once!</p>
          <div className="score-board">
            <p>Current Score: {currentScore}</p>
            <p>Best Score: {bestScore}</p>
          </div>
        </div>

        <div className="cards-grid">
          {pokemons.map((pokemon) => (
            <Card
              key={pokemon.id}
              pokemon={pokemon}
              onClick={handlePokemonClick}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default PokemonMemoryGame;
