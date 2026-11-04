import { RawStack, Skeleton } from "@moonwitness/ui";

export default function Loading() {
  return (
    <div className="gate-page flex min-h-[40vh] items-center justify-center">
      <RawStack gap="tight" role="status" aria-label="Memuat halaman">
        <Skeleton size="lg" style={{ width: '200px', height: '48px' }} />
        <Skeleton size="md" style={{ width: '300px', height: '24px' }} />
      </RawStack>
    </div>
  );
}
