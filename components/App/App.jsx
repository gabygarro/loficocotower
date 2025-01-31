import React from "react"
import "./gradient-animation-day.css"
import "./gradient-animation-night.css"
import "./App.css"
import { clientOnly } from 'vike-react/clientOnly'

const Player = clientOnly(() => import("../Player/Player"));

function App() {
  return <Player fallback={<>loficocotower loading...</>}/>
}

export default App
