/**
 * Sentinel RADIUS Daemon - Main Entry Point
 */
import './server';

// Server is started in server.ts when run directly
// This file exists for explicit module entry point
export { startSentinel, config } from './server';