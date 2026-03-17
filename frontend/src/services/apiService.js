const API_BASE_URL = 'http://localhost:5000/api';

export async function createAppointment(payload) {
  const res = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function fetchAppointments(query = {}) {
  const params = new URLSearchParams(query);
  const res = await fetch(`${API_BASE_URL}/appointments?${params.toString()}`);
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function deleteAppointment(id) {
  const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export async function callAiAgent(message, conversationHistory, bookingState) {
  const res = await fetch(`${API_BASE_URL}/ai-agent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, conversationHistory, bookingState }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

