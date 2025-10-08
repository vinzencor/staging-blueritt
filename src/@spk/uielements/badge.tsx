const Badge: React.FC<{ label: React.ReactNode; color: string }> = ({
  label,
  color,
}) => (
  <div
    className={`bg-${color} text-xs flex items-center justify-center font-semibold rounded-full text-white px-3 py-1`}
  >
    {label}
  </div>
);

export default Badge;