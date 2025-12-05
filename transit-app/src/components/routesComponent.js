export default function RoutesDropdown({ routes, onSelectRoute }) {
  return (
    <select onChange={(e) => onSelectRoute(e.target.value)}>
      <option value="">Select a route</option>
      {routes.map((r) => (
        <option key={r.id} value={r.id}>
          {r.nullSafeShortName} — {r.description}
        </option>
      ))}
    </select>
  );
}
