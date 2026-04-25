/**
 * ObstacleManager: Dynamic obstacle spawning and collision system
 * Implements difficulty scaling and wave-based enemy patterns
 */

class ObstacleManager {
  constructor(scene, bloomFilter, config) {
    this.scene = scene;
    this.bloomFilter = bloomFilter;
    this.config = config;
    this.obstacles = [];
    this.spawnQueue = [];
    this.time = 0;
    this.waveNumber = 0;
    this.difficultyMultiplier = 1.0;
    this.spawnRate = 2.0; // Obstacles per second
    this.lastSpawnTime = 0;
  }

  /**
   * Update obstacles and spawn new ones
   */
  update(deltaTime, playerPosition) {
    this.time += deltaTime;
    
    // Spawn new obstacles based on rate
    this.updateSpawnRate();
    this.attemptSpawn();
    
    // Update existing obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.position.z += this.config.physics.obstacleBaseSpeed * this.difficultyMultiplier * deltaTime;
      
      // Remove if past player
      if (obstacle.position.z > playerPosition.z + 10) {
        this.scene.remove(obstacle.mesh);
        this.obstacles.splice(i, 1);
      }
    }
    
    // Update difficulty based on time
    this.updateDifficulty();
  }

  /**
   * Attempt to spawn a new obstacle
   */
  attemptSpawn() {
    const timeSinceLastSpawn = this.time - this.lastSpawnTime;
    const spawnInterval = 1.0 / this.spawnRate;
    
    if (timeSinceLastSpawn >= spawnInterval) {
      this.spawn();
      this.lastSpawnTime = this.time;
    }
  }

  /**
   * Spawn a random obstacle
   */
  spawn() {
    // Random lane (0-4)
    const lane = Math.floor(Math.random() * this.config.physics.laneCount);
    const laneX = (lane - 2) * this.config.physics.laneWidth;
    
    // Random obstacle type
    const obstacleType = Math.random() < 0.7 ? 'box' : 'sphere';
    
    const obstacle = this.createObstacle(obstacleType, laneX);
    if (obstacle) {
      this.obstacles.push(obstacle);
      this.bloomFilter.add(obstacle.id);
    }
  }

  /**
   * Create an obstacle mesh
   */
  createObstacle(type, laneX) {
    let geometry, material, mesh;
    const id = Math.random();
    
    if (type === 'box') {
      geometry = new THREE.BoxGeometry(1, 1.5, 1);
      material = new THREE.MeshStandardMaterial({
        color: 0xff0055,
        roughness: 0.4,
        metalness: 0.6
      });
    } else {
      geometry = new THREE.SphereGeometry(0.7, 16, 16);
      material = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0x333300
      });
    }
    
    mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(laneX, 1, -50);
    mesh.rotation.z = Math.random() * Math.PI * 2;
    
    this.scene.add(mesh);
    
    return {
      mesh,
      id,
      type,
      position: mesh.position,
      geometry,
      active: true
    };
  }

  /**
   * Update spawn rate based on difficulty
   */
  updateSpawnRate() {
    // Increase spawn rate over time (max 5 obstacles/sec)
    this.spawnRate = Math.min(5.0, 2.0 + this.time * 0.3);
  }

  /**
   * Update difficulty multiplier
   */
  updateDifficulty() {
    // Difficulty increases every 30 seconds
    this.waveNumber = Math.floor(this.time / 30);
    this.difficultyMultiplier = 1.0 + this.waveNumber * 0.15;
  }

  /**
   * Get all obstacle positions (for collision detection)
   */
  getPositions() {
    return this.obstacles.map(obs => ({
      position: obs.position,
      radius: obs.type === 'box' ? 0.7 : 0.7,
      id: obs.id
    }));
  }

  /**
   * Check collision with player
   */
  checkCollision(playerPosition, playerRadius = 0.5) {
    for (let i = 0; i < this.obstacles.length; i++) {
      const obstacle = this.obstacles[i];
      const distance = playerPosition.distanceTo(obstacle.position);
      const minDistance = playerRadius + 0.7; // Collision radius
      
      if (distance < minDistance) {
        return {
          collided: true,
          obstacle,
          distance
        };
      }
    }
    
    return { collided: false };
  }

  /**
   * Clear all obstacles
   */
  clear() {
    this.obstacles.forEach(obs => {
      this.scene.remove(obs.mesh);
    });
    this.obstacles = [];
  }

  /**
   * Get difficulty stats
   */
  getDifficultyStats() {
    return {
      wave: this.waveNumber,
      multiplier: this.difficultyMultiplier.toFixed(2),
      spawnRate: this.spawnRate.toFixed(2),
      activeObstacles: this.obstacles.length
    };
  }
}

// Export for use in main game
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ObstacleManager;
}