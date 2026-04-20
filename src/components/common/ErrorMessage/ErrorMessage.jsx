import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

/*
 * Reusable error display component.
 * Shows when an API call fails.
 *
 * Props:
 *   message  → error string to display
 *   onRetry  → optional callback to retry the failed request
 */
export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="col-12">
      <div
        className="alert alert-danger d-flex flex-column
                   align-items-center text-center py-5"
        role="alert"
      >
        <FaExclamationTriangle size={42} className="mb-3" />
        <h5 className="fw-bold mb-2">Something went wrong</h5>
        <p className="text-muted mb-4 mb-0">{message}</p>

        {onRetry && (
          <button
            className="btn btn-danger d-flex align-items-center gap-2 mt-3"
            onClick={onRetry}
          >
            <FaRedo /> Try Again
          </button>
        )}
      </div>
    </div>
  );
}