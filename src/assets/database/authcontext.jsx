import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { appfirebase } from "../database/firebaseconfig";

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para consumir el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor de contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);


  // Verificar si el usuario está autenticado
  useEffect(() => {
    const auth = getAuth(appfirebase);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Cerrar sesión
  const logout = async () => {
    const auth = getAuth(appfirebase);
    await signOut(auth);
    setIsLoggedIn(false);
  };

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => {
      console.log("¡Conexión restablecida!");
      // Opcional: Mostrar una notificación más amigable (puedes usar un componente de notificación en lugar de alert)
      alert("¡Conexión restablecida!");
    };
    const handleOffline = () => {
      console.log("Estás offline. Los cambios se sincronizarán cuando vuelvas a conectarte.");
      alert("Estás offline. Los cambios se sincronizarán cuando vuelvas a conectarte.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);


  // Valores disponibles para los componentes hijos
  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isOffline, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
