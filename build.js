#!/usr/bin/env node
"use strict";

/**
 * Build script for Munyire
 * 
 * This script:
 * 1. Builds the frontend using Vite
 * 2. Copies the built files to backend/dist
 * 
 * Usage: node build.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const BACKEND_DIST = path.join(__dirname, "backend", "dist");
const FRONTEND_DIST = path.join(__dirname, "frontend", "dist");

console.log("🚀 Starting build process...\n");

// Step 1: Clean previous build
try {
  console.log("🧹 Cleaning previous build...");
  if (fs.existsSync(BACKEND_DIST)) {
    fs.rmSync(BACKEND_DIST, { recursive: true, force: true });
    console.log("   ✓ Removed old backend/dist");
  }
  if (fs.existsSync(FRONTEND_DIST)) {
    fs.rmSync(FRONTEND_DIST, { recursive: true, force: true });
    console.log("   ✓ Removed old frontend/dist");
  }
} catch (error) {
  console.error("   ✗ Failed to clean previous build:", error.message);
  process.exit(1);
}

// Step 2: Build frontend
try {
  console.log("\n📦 Building frontend...");
  execSync("npm run build --prefix frontend", { 
    stdio: "inherit",
    cwd: __dirname 
  });
  console.log("   ✓ Frontend build completed");
} catch (error) {
  console.error("   ✗ Frontend build failed:", error.message);
  process.exit(1);
}

// Step 3: Copy dist to backend
try {
  console.log("\n📂 Copying frontend/dist to backend/dist...");
  
  if (!fs.existsSync(FRONTEND_DIST)) {
    throw new Error("frontend/dist folder not found after build");
  }
  
  // Copy recursively
  copyRecursive(FRONTEND_DIST, BACKEND_DIST);
  console.log("   ✓ Files copied to backend/dist");
} catch (error) {
  console.error("   ✗ Failed to copy files:", error.message);
  process.exit(1);
}

console.log("\n✅ Build completed successfully!");
console.log("\nNext steps:");
console.log("  1. Set environment variables in backend/.env");
console.log("  2. Run: cd backend && npm start");
console.log("  3. Access the application at http://localhost:3000");

/**
 * Recursively copy files from source to destination
 */
function copyRecursive(source, destination) {
  const stats = fs.statSync(source);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    const entries = fs.readdirSync(source);
    for (const entry of entries) {
      copyRecursive(
        path.join(source, entry),
        path.join(destination, entry)
      );
    }
  } else {
    fs.copyFileSync(source, destination);
  }
}
