import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ModuleNavContext = createContext(null);

export function ModuleNavProvider({ children }) {
  const [state, setState] = useState({ open: false, title: '' });

  const registerModule = useCallback((title) => {
    setState((prev) => ({ ...prev, title }));
  }, []);

  const unregisterModule = useCallback(() => {
    setState({ open: false, title: '' });
  }, []);

  const openNav = useCallback(() => {
    setState((prev) => ({ ...prev, open: true }));
  }, []);

  const closeNav = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(
    () => ({
      isModuleRoute: Boolean(state.title),
      moduleTitle: state.title,
      mobileNavOpen: state.open,
      registerModule,
      unregisterModule,
      openNav,
      closeNav,
    }),
    [state, registerModule, unregisterModule, openNav, closeNav],
  );

  return <ModuleNavContext.Provider value={value}>{children}</ModuleNavContext.Provider>;
}

export function useModuleNav() {
  return useContext(ModuleNavContext);
}
