import { useState } from "react";
import GameCanvas from "./components/GameCanvas";
import HUD from "./components/HUD";

export default function App() {
  const [hudData, setHudData] = useState(null);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <GameCanvas onUpdate={setHudData} />
      <HUD data={hudData} />
    </div>
  );
}
