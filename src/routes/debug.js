const express = require('express');
const router = express.Router();
const { getEmailLogs } = require('../services/emailService');

// Get all sent emails/bills
router.get('/email-logs', (req, res) => {
  const logs = getEmailLogs();
  const summary = {
    total: logs.length,
    sent: logs.filter(l => l.status === 'sent').length,
    failed: logs.filter(l => l.status === 'failed').length,
    logged: logs.filter(l => l.status === 'logged').length,
    emails: logs.map(l => ({
      to: l.to,
      timestamp: l.timestamp,
      status: l.status,
      subject: l.subject,
      billData: l.billData,
      error: l.error || null,
      mailResult: l.mailResult || null
    }))
  };
  res.json(summary);
});

// Get email status
router.get('/email-status', (req, res) => {
  const emailUser = process.env.EMAIL_USER;
  const hasEmailConfig = !!emailUser && !!process.env.EMAIL_PASSWORD;
  const logs = getEmailLogs();
  const mongoose = require('mongoose');
  
  res.json({
    configured: hasEmailConfig,
    service: process.env.EMAIL_SERVICE || 'gmail',
    emailUser: emailUser ? emailUser.replace(/(.{2})(.*)(?=.{2})/, '$1***$2') : 'Not configured',
    totalSent: logs.filter(l => l.status === 'sent').length,
    totalFailed: logs.filter(l => l.status === 'failed').length,
    totalLogs: logs.length,
    useDb: process.env.USE_DB === 'true',
    dbConnected: mongoose.connection.readyState === 1
  });
});

// Clear email logs
router.delete('/email-logs', (req, res) => {
  const logs = getEmailLogs();
  const count = logs.length;
  logs.length = 0;
  res.json({ message: 'Email logs cleared', count: count });
});

// Clean DB
router.post('/clean-db', async (req, res) => {
  try {
    const { cleanDatabase } = require('../models/store');
    await cleanDatabase();
    res.json({ message: 'Database successfully cleaned and reset to default seeds.' });
  } catch (err) {
    console.error('Error cleaning database:', err);
    res.status(500).json({ error: 'Failed to clean database' });
  }
});

module.exports = router;
