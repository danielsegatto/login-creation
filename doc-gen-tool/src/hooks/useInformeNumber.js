import { useState, useEffect } from 'react';

export const useInformeNumber = (initialValue = 35) => {
  const [informeNumber, setInformeNumber] = useState(() => {
    const saved = localStorage.getItem('currentInformeNumber');
    return saved !== null ? parseInt(saved, 10) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem('currentInformeNumber', informeNumber);
  }, [informeNumber]);

  return [informeNumber, setInformeNumber];
};