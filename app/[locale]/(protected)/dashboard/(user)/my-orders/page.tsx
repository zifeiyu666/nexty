import { getMyOrders } from "@/actions/orders/user";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { columns } from "./Columns";
import { MyOrdersDataTable } from "./DataTable";

const PAGE_SIZE = 20;

export default async function MyOrdersPage() {
  const initialData = await getMyOrders({ pageIndex: 0, pageSize: PAGE_SIZE });

  if (!initialData.success) {
    return <p className="text-destructive">{initialData.error}</p>;
  }

  const { orders, totalCount } = initialData.data || {
    orders: [],
    totalCount: 0,
  };

  return (
    <div className="space-y-4">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <MyOrdersDataTable
          columns={columns as any}
          initialData={orders as any}
          initialPageCount={Math.ceil((totalCount || 0) / PAGE_SIZE)}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
        />
      </Suspense>
    </div>
  );
}
