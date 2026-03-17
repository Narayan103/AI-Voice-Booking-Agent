import React, { useEffect, useState } from 'react';
import {
  fetchAppointments,
  deleteAppointment,
} from '../services/apiService.js';

const AppointmentsDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const { ok, data } = await fetchAppointments(
        searchPhone ? { searchPhone } : {}
      );
      if (!ok) {
        setError('Failed to load appointments.');
      } else {
        setError('');
        setAppointments(data.appointments || []);
      }
    } catch {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      const { ok } = await deleteAppointment(id);
      if (ok) {
        setAppointments((prev) => prev.filter((a) => a._id !== id));
      }
    } catch {
      // ignore
    }
  };

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    const dateStr = d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const timeStr = d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return { dateStr, timeStr };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Appointments Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              View, search, and manage salon appointments.
            </p>
          </div>
          <a
            href="/"
            className="text-xs px-3 py-1.5 rounded-full border border-slate-700 text-slate-200 hover:bg-slate-800"
          >
            Back to Call
          </a>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="Search by phone number"
            className="h-9 px-3 rounded-full bg-slate-900 border border-slate-700 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={load}
            className="h-9 px-4 rounded-full bg-emerald-500 text-slate-950 text-xs font-semibold"
          >
            Search
          </button>
        </div>

        {error && <p className="text-xs text-rose-400 mb-3">{error}</p>}

        <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60">
          <table className="min-w-full text-xs">
            <thead className="bg-slate-900/80">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-300">
                  Name
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-300">
                  Phone
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-300">
                  Service
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-300">
                  Date
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-300">
                  Time
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-300">
                  Created
                </th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-4 text-center text-slate-400"
                  >
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-4 text-center text-slate-500"
                  >
                    No appointments found.
                  </td>
                </tr>
              ) : (
                appointments.map((a) => {
                  const { dateStr, timeStr } = formatDateTime(a.dateTime);
                  const created = formatDateTime(a.createdAt);
                  return (
                    <tr
                      key={a._id}
                      className="border-t border-slate-800/80 hover:bg-slate-800/40"
                    >
                      <td className="px-3 py-2">{a.name}</td>
                      <td className="px-3 py-2">{a.phoneNumber}</td>
                      <td className="px-3 py-2">{a.service}</td>
                      <td className="px-3 py-2">{a.date || dateStr}</td>
                      <td className="px-3 py-2">{a.time || timeStr}</td>
                      <td className="px-3 py-2">
                        {created.dateStr} {created.timeStr}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(a._id)}
                          className="px-3 py-1.5 rounded-full bg-rose-500 text-white text-[11px]"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsDashboard;

