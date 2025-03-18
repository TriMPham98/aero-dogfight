# Aero Dogfight

A 3D airplane dogfighting game built with React and React Three Fiber.

## Features

- 3D environment with rudimentary block-based airplanes
- WASD/Arrow keys flight controls
- Space to shoot bullets
- Enemy AI that follows the player
- Score tracking and health system

## Controls

- **Arrow keys / WASD**: Control your airplane
  - Up/W: Pitch down
  - Down/S: Pitch up
  - Left/A: Roll left and turn left
  - Right/D: Roll right and turn right
- **Space**: Shoot bullets

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```
3. Start the development server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- React
- TypeScript
- Three.js
- React Three Fiber
- Zustand for state management

## Game Mechanics

- Destroy enemy planes by shooting them with bullets
- Avoid collisions with enemy planes to preserve health
- Score points for each enemy destroyed
- Enemies will respawn to maintain a minimum number of opponents
