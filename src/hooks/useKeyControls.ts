import { useEffect, useState } from "react";

interface Controls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
}

const useKeyControls = () => {
  const [keys, setKeys] = useState<Controls>({
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          setKeys((prev) => ({ ...prev, up: true }));
          break;
        case "ArrowDown":
        case "KeyS":
          setKeys((prev) => ({ ...prev, down: true }));
          break;
        case "ArrowLeft":
        case "KeyA":
          setKeys((prev) => ({ ...prev, left: true }));
          break;
        case "ArrowRight":
        case "KeyD":
          setKeys((prev) => ({ ...prev, right: true }));
          break;
        case "Space":
          setKeys((prev) => ({ ...prev, shoot: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          setKeys((prev) => ({ ...prev, up: false }));
          break;
        case "ArrowDown":
        case "KeyS":
          setKeys((prev) => ({ ...prev, down: false }));
          break;
        case "ArrowLeft":
        case "KeyA":
          setKeys((prev) => ({ ...prev, left: false }));
          break;
        case "ArrowRight":
        case "KeyD":
          setKeys((prev) => ({ ...prev, right: false }));
          break;
        case "Space":
          setKeys((prev) => ({ ...prev, shoot: false }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const updateControls = () => {
    return keys;
  };

  return { updateControls };
};

export default useKeyControls;
