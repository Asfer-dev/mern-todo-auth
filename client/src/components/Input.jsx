const Input = ({ label, error, className = "", ...props }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 bg-white border-0 rounded-lg shadow-sm focus:shadow-md focus:ring-2 focus:ring-yellow-200 transition-all duration-200 outline-none
                  ${error ? "border-red-500" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Input;
