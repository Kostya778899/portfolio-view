import { useState } from 'react';
import portfolioLogo from './assets/portfolio.png';
import './App.css';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <>
        <div>
            <img src={portfolioLogo} className="hover-shine"/>
            <img src={portfolioLogo} className="hover-shine light"/>
        </div>
        <h1>Portfolio</h1>
        <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  )
}
