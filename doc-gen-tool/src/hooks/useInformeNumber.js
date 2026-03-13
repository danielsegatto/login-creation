import { useState, useEffect } from 'react';

/**
 * Custom hook to manage the Informe counter with localStorage persistence.
 * @param {number} initialValue - The starting number if no value is saved.
 * @returns {[number, function]} - Current number and setter function.
 */
export const useInformeNumber = (initialValue = 35) => {
  const [informeNumber, setInformeNumber] = useState(() => {
    // Check localStorage for an existing count
    const saved = localStorage.getItem('currentInformeNumber');
    return saved !== null ? parseInt(saved, 10) : initialValue;
  });

  // Automatically update localStorage whenever the number changes
  useEffect(() => {
    localStorage.setItem('currentInformeNumber', informeNumber);
  }, [informeNumber]);

  return [informeNumber, setInformeNumber];
};