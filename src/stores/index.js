import React, { createContext, useContext } from 'react';
import { CoinStore } from './CoinStore';
import { SessionStore } from './SessionStore';

const rootStore = {
  coinStore: new CoinStore(),
  sessionStore: new SessionStore(),
};

const StoreContext = createContext(rootStore);

export const StoreProvider = ({ children }) => (
  <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>
);

export const useStores = () => useContext(StoreContext);
export const useCoinStore = () => useContext(StoreContext).coinStore;
export const useSessionStore = () => useContext(StoreContext).sessionStore;
