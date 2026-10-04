// A soft fade between pages, so moving around feels like an app.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="kep-page">{children}</div>;
}
