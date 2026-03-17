const Appointment = require('../models/Appointment');

function isValidPhone(phone) {
  const cleaned = phone.replace(/[^\d+]/g, '');
  const regex = /^\+?\d{7,15}$/;
  return regex.test(cleaned);
}

function parseDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const isoCandidate = `${dateStr}T${timeStr}`;
  const date = new Date(isoCandidate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

exports.createAppointment = async (req, res) => {
  try {
    const { name, phoneNumber, service, date, time } = req.body || {};

    if (!name || !phoneNumber || !service || !date || !time) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    if (!isValidPhone(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format.' });
    }

    const dateTime = parseDateTime(date, time);
    if (!dateTime) {
      return res
        .status(400)
        .json({ message: 'Invalid date or time. Use YYYY-MM-DD and HH:MM.' });
    }

    const existing = await Appointment.findOne({ dateTime });
    if (existing) {
      return res
        .status(409)
        .json({ message: 'This time slot is already booked.' });
    }

    const appointment = await Appointment.create({
      name,
      phoneNumber,
      service,
      date,
      time,
      dateTime,
    });

    return res.status(201).json({
      message: 'Appointment booked successfully.',
      appointment,
    });
  } catch (err) {
    console.error('Create appointment error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const { searchPhone } = req.query;
    const filter = {};

    if (searchPhone) {
      filter.phoneNumber = { $regex: searchPhone, $options: 'i' };
    }

    const appointments = await Appointment.find(filter)
      .sort({ dateTime: 1 })
      .lean();

    return res.json({ appointments });
  } catch (err) {
    console.error('Get appointments error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }
    return res.json({ message: 'Appointment deleted.' });
  } catch (err) {
    console.error('Delete appointment error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Missing date query parameter.' });
    }

    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59.999`);

    if (Number.isNaN(startOfDay.getTime())) {
      return res
        .status(400)
        .json({ message: 'Invalid date. Use YYYY-MM-DD format.' });
    }

    const appointments = await Appointment.find({
      dateTime: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ dateTime: 1 })
      .lean();

    const takenSlots = appointments.map((a) => a.dateTime.toISOString());

    return res.json({
      date,
      takenSlots,
    });
  } catch (err) {
    console.error('Get availability error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
};

