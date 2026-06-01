// app/purchase/page.tsx
import { redirect } from 'next/navigation';
import { getActivePurchase, getPurchasePackages } from './queries';
import NoActivePurchase from '@/app/ui/purchase/NoActivePurchase';
import PurchaseTracker from '@/app/ui/purchase/PurchaseTracker';

export default async function PurchasesPage() {
  const currentPurchase = await getActivePurchase();

  if (!currentPurchase) {
    return <NoActivePurchase />;
  }

  if (currentPurchase.status === 'PENDING') {
    const paymentsURL = process.env.PAYMENTS_SERVICE_URL;
    const paymentsCheckoutUrl = `${paymentsURL}/checkout/${currentPurchase.purchase_id}`;
    redirect(paymentsCheckoutUrl);
  }

  const packages = await getPurchasePackages(currentPurchase.purchase_id);

  return <PurchaseTracker purchase={currentPurchase} packages={packages} />;
}