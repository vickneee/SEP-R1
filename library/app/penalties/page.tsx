"use client";

import { useEffect, useState } from "react";
import { getAllPenalties, payPenalty, waivePenalty, processOverdueBooks, type UserPenalty } from "./penaltyActions";

type ExtendedPenalty = UserPenalty & {
  user_name: string;
  user_email: string;
};

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState<ExtendedPenalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({});
  const [processingOverdue, setProcessingOverdue] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'waived'>('pending');

  useEffect(() => {
    loadPenalties();
  }, []);

  const loadPenalties = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getAllPenalties();
      if (result.error) {
        setError(result.error);
      } else {
        setPenalties(result.penalties || []);
      }
    } catch (err) {
      console.error("Error loading penalties:", err);
      setError("Failed to load penalties");
    } finally {
      setLoading(false);
    }
  };

  const handlePayPenalty = async (penaltyId: number) => {
    setActionLoading({ ...actionLoading, [penaltyId]: true });
    setFeedback("");
    setError("");

    try {
      const result = await payPenalty(penaltyId);
      if (result.success) {
        setFeedback("Penalty marked as paid successfully");
        // Update local state
        setPenalties(penalties.map(p =>
          p.penalty_id === penaltyId
            ? { ...p, status: 'paid' }
            : p
        ));
      } else {
        setError(result.error || "Failed to pay penalty");
      }
    } catch (err) {
      console.error("Error paying penalty:", err);
      setError("Failed to pay penalty");
    } finally {
      setActionLoading({ ...actionLoading, [penaltyId]: false });
    }
  };

  const handleWaivePenalty = async (penaltyId: number) => {
    setActionLoading({ ...actionLoading, [penaltyId]: true });
    setFeedback("");
    setError("");

    try {
      const result = await waivePenalty(penaltyId);
      if (result.success) {
        setFeedback("Penalty waived successfully");
        // Update local state
        setPenalties(penalties.map(p =>
          p.penalty_id === penaltyId
            ? { ...p, status: 'waived' }
            : p
        ));
      } else {
        setError(result.error || "Failed to waive penalty");
      }
    } catch (err) {
      console.error("Error waiving penalty:", err);
      setError("Failed to waive penalty");
    } finally {
      setActionLoading({ ...actionLoading, [penaltyId]: false });
    }
  };

  const handleProcessOverdue = async () => {
    setProcessingOverdue(true);
    setFeedback("");
    setError("");

    try {
      const result = await processOverdueBooks();
      if (result.error) {
        setError(result.error);
      } else {
        setFeedback(`Processed ${result.processed_count} overdue books`);
        // Reload penalties to show new ones
        await loadPenalties();
      }
    } catch (err) {
      console.error("Error processing overdue books:", err);
      setError("Failed to process overdue books");
    } finally {
      setProcessingOverdue(false);
    }
  };

  const filteredPenalties = penalties.filter(penalty => {
    if (filter === 'all') return true;
    return penalty.status === filter;
  });

  const pendingCount = penalties.filter(p => p.status === 'pending').length;
  const totalPendingAmount = penalties
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Penalty Management</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800">Pending Penalties</h3>
            <p className="text-2xl font-bold text-red-600">{pendingCount}</p>
            <p className="text-sm text-red-600">${totalPendingAmount.toFixed(2)} total</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800">Paid Penalties</h3>
            <p className="text-2xl font-bold text-green-600">
              {penalties.filter(p => p.status === 'paid').length}
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800">Waived Penalties</h3>
            <p className="text-2xl font-bold text-gray-600">
              {penalties.filter(p => p.status === 'waived').length}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={handleProcessOverdue}
              disabled={processingOverdue}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {processingOverdue ? "Processing..." : "Process Overdue Books"}
            </button>
            <button
              onClick={loadPenalties}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-1 bg-gray-200 rounded-lg p-1">
            {(['all', 'pending', 'paid', 'waived'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-white text-gray-800 shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && ` (${penalties.filter(p => p.status === status).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Messages */}
        {feedback && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700">
            {feedback}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Penalties Table */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading penalties...</p>
        </div>
      ) : filteredPenalties.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {filter === 'all' ? 'No penalties found.' : `No ${filter} penalties found.`}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Book</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Reason</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPenalties.map((penalty) => (
                <tr key={penalty.penalty_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{penalty.user_name}</div>
                      <div className="text-sm text-gray-500">{penalty.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {penalty.book_title || 'Unknown Book'}
                      </div>
                      {penalty.book_author && (
                        <div className="text-sm text-gray-500">by {penalty.book_author}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-semibold text-gray-900">
                      ${penalty.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                    <div className="truncate" title={penalty.reason}>
                      {penalty.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      penalty.status === 'pending' ? 'bg-red-100 text-red-800' :
                      penalty.status === 'paid' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {penalty.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(penalty.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {penalty.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePayPenalty(penalty.penalty_id)}
                          disabled={actionLoading[penalty.penalty_id]}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs disabled:bg-gray-400"
                        >
                          {actionLoading[penalty.penalty_id] ? '...' : 'Pay'}
                        </button>
                        <button
                          onClick={() => handleWaivePenalty(penalty.penalty_id)}
                          disabled={actionLoading[penalty.penalty_id]}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs disabled:bg-gray-400"
                        >
                          {actionLoading[penalty.penalty_id] ? '...' : 'Waive'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}