import { useState } from "react";
import GameCanvas from "./components/GameCanvas";
import HUD from "./components/HUD";

export default function App() {
  const [hudData, setHudData] = useState(null);

  return (
    <div className="relative w-screen min-h-dvh overflow-hidden bg-black touch-none select-none">
      <GameCanvas onUpdate={setHudData} />
      <HUD data={hudData} />
    </div>
  );
}
