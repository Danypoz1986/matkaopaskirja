import React, { createContext, useState, useContext } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
  return useContext(FavoritesContext);
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const addFavorite = (city) => {
    if (!favorites.includes(city)) {
      setFavorites((prev) => [...prev, city]);
    }
  };

  const removeFavorite = (city) => {
    setFavorites((prev) => prev.filter((fav) => fav !== city));
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
