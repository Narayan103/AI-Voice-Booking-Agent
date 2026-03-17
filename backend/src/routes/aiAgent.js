const express = require('express');
const Appointment = require('../models/Appointment');
const { callGemini } = require('../services/geminiService');

const router = express.Router();

function parseDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const isoCandidate = `${dateStr}T${timeStr}`;
  const date = new Date(isoCandidate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

function isValidPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[^\d+]/g, '');
  const regex = /^\+?\d{7,15}$/;
  return regex.test(cleaned);
}

async function tryBookFromState(state) {
  const { name, phone, service, date, time } = state;
  if (!name || !phone || !service || !date || !time) {
    return { booked: false, reason: 'missing_fields' };
  }

  if (!isValidPhone(phone)) {
    return { booked: false, reason: 'invalid_phone' };
  }

  const dateTime = parseDateTime(date, time);
  if (!dateTime) {
    return { booked: false, reason: 'invalid_datetime' };
  }

  const existing = await Appointment.findOne({ dateTime });
  if (existing) {
    return { booked: false, reason: 'slot_taken' };
  }

  const appointment = await Appointment.create({
    name,
    phoneNumber: phone,
    service,
    date,
    time,
    dateTime,
  });

  return { booked: true, appointment };
}

router.post('/', async (req, res) => {
  const {
    message,
    conversationHistory = [],
    bookingState: clientBookingState,
  } = req.body || {};

  if (!message) {
    return res.status(400).json({ message: 'Missing message.' });
  }

  try {
    const initialBookingState = {
      name: null,
      phone: null,
      service: null,
      date: null,
      time: null,
      people: null,
      step: 'ask_name',
    };

    const bookingState = {
      ...initialBookingState,
      ...(clientBookingState || {}),
    };

    // Call Gemini to get structured intent + message
    const aiResult = await callGemini({
      message,
      conversationHistory,
      bookingState,
    });

    const intent = aiResult.intent || 'unknown';
    const collecting = aiResult.collecting || null;
    const updates = aiResult.updates || {};
    let reply = aiResult.message || 'Sorry, I had trouble understanding that.';

    // Apply slot updates from Gemini
    if (updates.name) bookingState.name = updates.name;
    if (updates.phone) bookingState.phone = updates.phone;
    if (updates.service) bookingState.service = updates.service;
    if (updates.date) bookingState.date = updates.date;
    if (updates.time) bookingState.time = updates.time;
    if (updates.people) bookingState.people = updates.people;

    // Compute next step based on missing fields
    if (!bookingState.name) bookingState.step = 'ask_name';
    else if (!bookingState.phone) bookingState.step = 'ask_phone';
    else if (!bookingState.service) bookingState.step = 'ask_service';
    else if (!bookingState.date) bookingState.step = 'ask_date';
    else if (!bookingState.time) bookingState.step = 'ask_time';
    else bookingState.step = 'confirm_booking';

    let bookingResult = null;

    if (bookingState.step === 'confirm_booking') {
      bookingResult = await tryBookFromState(bookingState);

      if (bookingResult.booked) {
        const a = bookingResult.appointment;
        reply = `Perfect, ${a.name}. Your ${a.service} appointment on ${a.date} at ${a.time} is confirmed. We look forward to seeing you at Sunshine Salon.`;
      } else if (bookingResult.reason === 'slot_taken') {
        reply =
          'Sorry, that time slot is already taken. Please choose another time.';
        bookingState.step = 'ask_time';
      } else if (bookingResult.reason === 'invalid_phone') {
        reply =
          'The phone number seems invalid. Please repeat your phone number including area code.';
        bookingState.phone = null;
        bookingState.step = 'ask_phone';
      } else if (bookingResult.reason === 'invalid_datetime') {
        reply =
          'The date or time seems invalid. Please provide a valid date and time for your appointment.';
        bookingState.date = null;
        bookingState.time = null;
        bookingState.step = 'ask_date';
      }
    }

    return res.json({
      reply,
      intent,
      collecting,
      bookingState,
      bookingResult,
    });
  } catch (err) {
    console.error('AI agent error:', err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;

