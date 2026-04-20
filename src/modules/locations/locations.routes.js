import { Router } from 'express';
import LocationController from './locations.controller.js';

const router = Router();

router.get('/regions', LocationController.getRegions);
router.get('/districts/:regionId', LocationController.getDistricts);

export default router;
