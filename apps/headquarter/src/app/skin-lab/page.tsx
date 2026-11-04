import type { Metadata } from 'next';
import { SkinLaboratory } from '@moonwitness/ui';

export const metadata: Metadata = {
  title: 'Skin Laboratory | Headquarter',
};

export default function SkinLaboratoryPage() {
  return (
    <div className="hq-route">
      <SkinLaboratory />
    </div>
  );
}
