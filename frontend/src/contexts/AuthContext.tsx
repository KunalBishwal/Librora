// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import axios from 'axios';

// interface User {
//   id: string;
//   name: string;
//   email: string;
// }

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   login: (email: string, password: string) => Promise<void>;
//   signup: (name: string, email: string, password: string) => Promise<void>;
//   logout: () => void;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// // Configure axios base URL - update this to match your backend
// export const API_BASE_URL = 'http://localhost:5000/api';
// axios.defaults.baseURL = API_BASE_URL;

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);

//   useEffect(() => {
//     // Check for stored token on mount
//     const storedToken = localStorage.getItem('token');
//     const storedUser = localStorage.getItem('user');
    
//     if (storedToken && storedUser) {
//       setToken(storedToken);
//       setUser(JSON.parse(storedUser));
//       axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
//     }
//   }, []);

//   const login = async (email: string, password: string) => {
//     const response = await axios.post('/auth/login', { email, password });
//     const { token: newToken, user: newUser } = response.data;
    
//     setToken(newToken);
//     setUser(newUser);
//     localStorage.setItem('token', newToken);
//     localStorage.setItem('user', JSON.stringify(newUser));
//     axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
//   };

//   const signup = async (name: string, email: string, password: string) => {
//     await axios.post('/auth/signup', { name, email, password });
//   };

//   const logout = () => {
//     setToken(null);
//     setUser(null);
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     delete axios.defaults.headers.common['Authorization'];
//   };

//   return (
//     <AuthContext.Provider 
//       value={{ 
//         user, 
//         token, 
//         login, 
//         signup, 
//         logout, 
//         isAuthenticated: !!token 
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  _id: string; // Corrected to match MongoDB
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // Added to prevent crash
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const API_BASE_URL = 'http://localhost:5000/api';
axios.defaults.baseURL = API_BASE_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start in a loading state

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      // FIX: Safely check and parse user data from storage
      if (storedToken && storedUser && storedUser !== 'undefined') {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error("Failed to parse user data from storage", error);
      // Clear any corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      // Signal that the initial check is complete
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post('/auth/login', { email, password });
    
    // FIX: Correctly handle the flat data structure from your backend
    const { token: newToken, ...loggedInUser } = response.data;
    
    setToken(newToken);
    setUser(loggedInUser as User);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const signup = async (name: string, email: string, password: string) => {
    await axios.post('/auth/signup', { name, email, password });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        login, 
        signup, 
        logout, 
        isAuthenticated: !!token,
        isLoading
      }}
    >
      {/* Do not render the app until the auth check is finished */}
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};