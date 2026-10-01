const express = require('express');
const router = express.Router();
const { computeGstSummary, generateGstCsv } = require('../services/gstService');
const { updateRestaurant, getRestaurant, listRestaurants } = require('../models/store');

// Strict Authorization Guard: Only sagarmanchadi324@gmail.com is authorized
router.use((req, res, next) => {
  if (!req.user || req.user.email !== 'sagarmanchadi324@gmail.com') {
    return res.status(403).json({
      error: 'Access Denied: GST Filing module and GSTR-3B records are confidential and restricted exclusively to sagarmanchadi324@gmail.com'
    });
  }
  next();
});

// GET /api/v1/gst-filing/summary
router.get('/summary', async (req, res) => {
  try {
    const { restaurantId, month, fromDate, toDate, scheme } = req.query;
    const summary = await computeGstSummary({ restaurantId, month, fromDate, toDate, scheme });
    res.json(summary);
  } catch (err) {
    console.error('Error computing GST summary:', err);
    res.status(500).json({ error: 'Failed to compute GST filing summary' });
  }
});

// GET /api/v1/gst-filing/sales-register
router.get('/sales-register', async (req, res) => {
  try {
    const { restaurantId, month, fromDate, toDate, scheme } = req.query;
    const summary = await computeGstSummary({ restaurantId, month, fromDate, toDate, scheme });
    res.json(summary.salesRegister);
  } catch (err) {
    console.error('Error fetching sales register:', err);
    res.status(500).json({ error: 'Failed to fetch sales register' });
  }
});

// GET /api/v1/gst-filing/purchase-register
router.get('/purchase-register', async (req, res) => {
  try {
    const { restaurantId, month, fromDate, toDate, scheme } = req.query;
    const summary = await computeGstSummary({ restaurantId, month, fromDate, toDate, scheme });
    res.json(summary.purchaseRegister);
  } catch (err) {
    console.error('Error fetching purchase register:', err);
    res.status(500).json({ error: 'Failed to fetch purchase register' });
  }
});

// GET /api/v1/gst-filing/export
router.get('/export', async (req, res) => {
  try {
    const { restaurantId, month, fromDate, toDate, scheme, type = 'summary', format = 'csv' } = req.query;
    const summary = await computeGstSummary({ restaurantId, month, fromDate, toDate, scheme });

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=GSTR3B_${summary.period}_${type}.json`);
      return res.json(summary);
    }

    const csvData = generateGstCsv(summary, type);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=GSTR3B_${summary.period}_${type}.csv`);
    res.send(csvData);
  } catch (err) {
    console.error('Error exporting GST data:', err);
    res.status(500).json({ error: 'Failed to export GST data' });
  }
});

// PUT /api/v1/gst-filing/settings
router.put('/settings', async (req, res) => {
  try {
    const { restaurantId, gstin, legalName, tradeName, state, stateCode, filingFrequency, defaultGstScheme } = req.body;
    let targetRestId = restaurantId;
    if (!targetRestId) {
      const all = await listRestaurants();
      if (all.length > 0) targetRestId = all[0].id;
    }
    if (!targetRestId) {
      return res.status(400).json({ error: 'No restaurant found to update GST settings' });
    }

    const updated = await updateRestaurant(targetRestId, {
      gstin,
      legalName,
      tradeName,
      state,
      stateCode,
      filingFrequency,
      defaultGstScheme
    });
    res.json(updated);
  } catch (err) {
    console.error('Error updating GST settings:', err);
    res.status(500).json({ error: 'Failed to update GST settings' });
  }
});

module.exports = router;
