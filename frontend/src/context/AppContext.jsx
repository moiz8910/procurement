import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCategories, getVendors, getPRs } from '../api';

const AppContext = createContext();

export const MOCK_USERS = [
  { id: 1, name: 'Arun', role: 'CPO', roleType: 'CPO' },
  { id: 2, name: 'Sarah Category', role: 'Category Manager', roleType: 'CATEGORY_MANAGER' },
  { id: 3, name: 'John Doe', role: 'Sourcing Analyst', roleType: 'SOURCING_ANALYST' },
  { id: 4, name: 'Alice Requester', role: 'PR Requester', roleType: 'REQUESTER' }
];

export const AppProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    timeRange: '30d',
    categoryId: '',
    vendorId: '',
    searchQuery: '',
  });
  // Track Role-Based Access Control
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('procura_user_id');
    const user = MOCK_USERS.find(u => u.id === parseInt(saved)) || MOCK_USERS[0];
    localStorage.setItem('procura_user_id', user.id);
    return user;
  });

  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [prs, setPrs] = useState([]);

  const [activeTab, setActiveTab] = useState(() => {
    // Determine initial based on current user (MOCK_USERS[0] is CPO by default)
    const initialUser = MOCK_USERS.find(u => u.id === parseInt(localStorage.getItem('procura_user_id'))) || MOCK_USERS[0];
    return initialUser.roleType === 'CPO' ? 'dashboard' : 'categories';
  });

  // Global Copilot State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInput, setCopilotInput] = useState('');

  const openCopilotWithPrompt = (prompt) => {
    setCopilotInput(prompt);
    setIsCopilotOpen(true);
  };

  const switchUser = (userId) => {
    const user = MOCK_USERS.find(u => u.id === parseInt(userId));
    if(user) {
      setCurrentUser(user);
      localStorage.setItem('procura_user_id', user.id);
      window.location.reload(); // Hard reload to refresh all API states dynamically
    }
  };

  useEffect(() => {
    Promise.all([getCategories(), getVendors()]).then(([catRes, venRes]) => {
      setCategories(catRes.data);
      setVendors(venRes.data);
    }).catch(err => console.error("Error loading app context", err));
  }, []);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <AppContext.Provider value={{ 
      filters, 
      updateFilters, 
      activeTab, 
      setActiveTab, 
      categories, 
      vendors, 
      prs, 
      currentUser,
      switchUser,
      MOCK_USERS,
      isCopilotOpen,
      setIsCopilotOpen,
      copilotInput,
      setCopilotInput,
      openCopilotWithPrompt
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
