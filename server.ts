import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { simulationEngine } from './server/simulationEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // 1. Get all facilities with occupancy, status, and smart alternatives
  app.get('/api/facilities', (_req: Request, res: Response) => {
    try {
      const facilities = simulationEngine.getAllFacilities();
      res.json({
        success: true,
        data: facilities,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Get single facility details
  app.get('/api/facilities/:id', (req: Request, res: Response) => {
    try {
      const facility = simulationEngine.getFacilityById(req.params.id);
      if (!facility) {
        return res.status(404).json({ success: false, error: 'Facility not found' });
      }
      res.json({
        success: true,
        data: facility,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Simulate Entry (Check-in)
  app.post('/api/facilities/:id/checkin', (req: Request, res: Response) => {
    try {
      const count = parseInt(req.body.count, 10) || 1;
      const updated = simulationEngine.checkIn(req.params.id, count);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Facility not found' });
      }
      res.json({
        success: true,
        data: updated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Simulate Exit (Check-out)
  app.post('/api/facilities/:id/checkout', (req: Request, res: Response) => {
    try {
      const count = parseInt(req.body.count, 10) || 1;
      const updated = simulationEngine.checkOut(req.params.id, count);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Facility not found' });
      }
      res.json({
        success: true,
        data: updated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- VITE DEV OR STATIC SERVING ---
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`CrowdSense server running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start CrowdSense server:', err);
  process.exit(1);
});
