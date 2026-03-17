const express = require('express');
const {
  createAppointment,
  getAppointments,
  deleteAppointment,
  getAvailability,
} = require('../controllers/appointmentController');

const router = express.Router();

router.post('/', createAppointment);
router.get('/', getAppointments);
router.delete('/:id', deleteAppointment);
router.get('/availability', getAvailability);

module.exports = router;

