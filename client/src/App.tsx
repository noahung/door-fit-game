import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { SlidingDoorGame } from "@/components/SlidingDoorGame";
import { GameOnly } from "@/components/GameOnly";
import "@fontsource/inter";

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen">
        <Routes>
          <Route path="/" element={<SlidingDoorGame />} />
          <Route path="/game" element={<GameOnly />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
