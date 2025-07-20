import WelcomeSection from '@/components/WelcomeSection';
import ActionsSection from '@/components/ActionsSection';
import PromotionalProductsSection from '@/components/PromotionalProductsSection';
import DeliverySection from '@/components/DeliverySection';

export default function Mesa01Page() {
  return (
    <div className="min-h-screen">
      <WelcomeSection />
      <ActionsSection />
      <PromotionalProductsSection />
      <DeliverySection />
    </div>
  );
} 