const db = require('../config/database');
const logger = require('../utils/logger');

// Get all sites
exports.getAllSites = async (req, res) => {
  try {
    const [sites] = await db.query('SELECT * FROM sites ORDER BY name');

    res.json({
      success: true,
      data: sites
    });
  } catch (error) {
    logger.error('Get all sites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sites'
    });
  }
};

// Get site by ID
exports.getSiteById = async (req, res) => {
  try {
    const [sites] = await db.query('SELECT * FROM sites WHERE id = ?', [req.params.id]);

    if (sites.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }

    res.json({
      success: true,
      data: sites[0]
    });
  } catch (error) {
    logger.error('Get site by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch site'
    });
  }
};

// Create site
exports.createSite = async (req, res) => {
  try {
    const { site_code, name, address } = req.body;

    if (!site_code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Site code and name are required'
      });
    }

    // Check if site code exists
    const [existing] = await db.query('SELECT id FROM sites WHERE site_code = ?', [site_code]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Site code already exists'
      });
    }

    const [result] = await db.query(`
      INSERT INTO sites (site_code, name, address) VALUES (?, ?, ?)
    `, [site_code, name, address]);

    logger.info(`Site created: ${site_code} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Site created successfully',
      data: {
        id: result.insertId,
        site_code,
        name,
        address
      }
    });
  } catch (error) {
    logger.error('Create site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create site'
    });
  }
};

// Update site
exports.updateSite = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    const [sites] = await db.query('SELECT id FROM sites WHERE id = ?', [id]);
    if (sites.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }

    await db.query(`
      UPDATE sites SET name = ?, address = ? WHERE id = ?
    `, [name, address, id]);

    logger.info(`Site updated: ID ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Site updated successfully'
    });
  } catch (error) {
    logger.error('Update site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update site'
    });
  }
};

// Delete site
exports.deleteSite = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if site has permits
    const [permits] = await db.query('SELECT COUNT(*) as count FROM permits WHERE site_id = ?', [id]);
    if (permits[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete site with existing permits'
      });
    }

    await db.query('DELETE FROM sites WHERE id = ?', [id]);

    logger.info(`Site deleted: ID ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Site deleted successfully'
    });
  } catch (error) {
    logger.error('Delete site error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete site'
    });
  }
};