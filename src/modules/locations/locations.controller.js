import LocationRepository from './locations.repository.js';
import AppError from '../../utils/AppError.js';

class LocationController {
  async getRegions(req, res, next) {
    try {
      const regions = await LocationRepository.findAllRegions();
      res.status(200).json({
        status: 'success',
        results: regions.length,
        data: { regions }
      });
    } catch (error) {
      next(error);
    }
  }

  async getDistricts(req, res, next) {
    try {
      const { regionId } = req.params;
      const districts = await LocationRepository.findDistrictsByRegion(regionId);
      
      res.status(200).json({
        status: 'success',
        results: districts.length,
        data: { districts }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LocationController();
