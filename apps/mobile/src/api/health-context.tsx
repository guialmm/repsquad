import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { getHealth } from "./client";

export type ApiStatus = "verificando" | "conectada" | "sem conexão";

type ApiHealthContextValue = {
  status: ApiStatus;
  refresh: () => void;
};

const ApiHealthContext = createContext<ApiHealthContextValue>({
  status: "verificando",
  refresh: () => {},
});

export function ApiHealthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ApiStatus>("verificando");

  const runCheck = useCallback((isMounted: () => boolean) => {
    // Também "acorda" a API quando ela está dormindo no plano grátis do Render.
    getHealth()
      .then((health) => {
        if (isMounted()) {
          setStatus(health.status === "ok" ? "conectada" : "sem conexão");
        }
      })
      .catch(() => {
        if (isMounted()) {
          setStatus("sem conexão");
        }
      });
  }, []);

  const refresh = useCallback(() => {
    setStatus("verificando");
    runCheck(() => true);
  }, [runCheck]);

  useEffect(() => {
    let active = true;
    runCheck(() => active);
    return () => {
      active = false;
    };
  }, [runCheck]);

  return (
    <ApiHealthContext.Provider value={{ status, refresh }}>
      {children}
    </ApiHealthContext.Provider>
  );
}

export function useApiHealth() {
  return useContext(ApiHealthContext);
}
