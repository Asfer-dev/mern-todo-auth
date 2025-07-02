const PrimaryButton = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  return (
    <button
      className={`space-x-2 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-lg transition-colors shadow-sm hover:shadow-md font-medium ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
