export default function Loading() {
  return (
    <div className="gate-page flex min-h-[40vh] items-center justify-center">
      <div className="mw-raw-stack" data-gap="tight" role="status" aria-label="Memuat halaman">
        <div className="mw-skeleton mw-skeleton--lg" aria-hidden="true" style={{ width: '200px', height: '48px' }} />
        <div className="mw-skeleton mw-skeleton--md" aria-hidden="true" style={{ width: '300px', height: '24px' }} />
      </div>
    </div>
  );
}
