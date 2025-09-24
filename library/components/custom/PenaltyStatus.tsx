"use client";

import { useState, useEffect } from "react";
import { getUserPenalties, checkUserCanReserve, type UserPenalty, type UserReservationStatus } from "@/app/penalties/penaltyActions";

interface PenaltyStatusProps {
  userId?: string;
  showDetails?: boolean;
  className?: string;
}

export default function PenaltyStatus({ userId, showDetails = false, className = "" }: PenaltyStatusProps) {
  const [penalties, setPenalties] = useState<UserPenalty[]>([]);
  const [reservationStatus, setReservationStatus] = useState<UserReservationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPenaltyData();
  }, [userId]);

  const loadPenaltyData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load both penalties and reservation status
      const [penaltyResult, statusResult] = await Promise.all([
        getUserPenalties(userId),
        checkUserCanReserve(userId)
      ]);

      if (penaltyResult.error) {
        setError(penaltyResult.error);
        return;
      }

      if (statusResult.error) {
        setError(statusResult.error);
        return;
      }

      setPenalties(penaltyResult.penalties || []);
      setReservationStatus(statusResult.status);
    } catch (err) {
      console.error("Error loading penalty data:", err);
      setError("Failed to load penalty information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        Loading penalties...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Error: {error}
      </div>
    );
  }

  const pendingPenalties = penalties.filter(p => p.status === 'pending');
  const totalAmount = pendingPenalties.reduce((sum, p) => sum + p.amount, 0);

  // If no penalties, show nothing or success message
  if (pendingPenalties.length === 0) {
    return showDetails ? (
      <div className={`text-green-600 text-sm ${className}`}>
        ✓ No outstanding penalties
      </div>
    ) : null;
  }

  return (
    <>
      <div className={`${className}`}>
        {/* Penalty Summary */}
        <div className="flex items-center gap-2">
          <div className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm flex items-center gap-1">
            <span className="font-semibold">{pendingPenalties.length}</span>
            <span>penalty{pendingPenalties.length !== 1 ? 'ies' : ''}</span>
            <span className="font-semibold">${totalAmount.toFixed(2)}</span>
          </div>

          {showDetails && (
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              View Details
            </button>
          )}
        </div>

        {/* Restriction Warning */}
        {!reservationStatus?.can_reserve && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            ⚠️ {reservationStatus?.restriction_reason}
          </div>
        )}
      </div>

      {/* Penalty Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Penalty Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {pendingPenalties.map((penalty) => (
                <div key={penalty.penalty_id} className="border border-gray-200 rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {penalty.book_title || 'Unknown Book'}
                      </h4>
                      {penalty.book_author && (
                        <p className="text-sm text-gray-600">by {penalty.book_author}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-red-600">
                        ${penalty.amount.toFixed(2)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        penalty.status === 'pending' ? 'bg-red-100 text-red-700' :
                        penalty.status === 'paid' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {penalty.status}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Reason:</strong> {penalty.reason}</p>
                    {penalty.due_date && (
                      <p><strong>Due Date:</strong> {new Date(penalty.due_date).toLocaleDateString()}</p>
                    )}
                    {penalty.return_date && (
                      <p><strong>Returned:</strong> {new Date(penalty.return_date).toLocaleDateString()}</p>
                    )}
                    <p><strong>Penalty Created:</strong> {new Date(penalty.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total pending penalties: {pendingPenalties.length}
                </div>
                <div className="text-lg font-semibold text-red-600">
                  Total Amount: ${totalAmount.toFixed(2)}
                </div>
              </div>

              {!reservationStatus?.can_reserve && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                  <strong>Restriction Notice:</strong> You cannot borrow new books until all penalties are paid.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}