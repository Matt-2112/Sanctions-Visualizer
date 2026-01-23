import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import ListComponent from './components/ListComponent.jsx';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Sanctions Visualizer</h1>
      <div className="card">
        <ListComponent />
      </div>
    </>
  )
}

export default App
