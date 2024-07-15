import React from 'react';
import { useEffect } from 'react';
import ReactGA from 'react-ga';

const GA = () => {
  useEffect(() => {
    ReactGA.initialize('G-LR5133HTDQ');
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  return null;
};

export default GA;