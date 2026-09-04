import { listAllProducts } from "@/lib/orders";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductEditForm } from "@/components/admin/product-edit-form";

export default async function AdminProductsPage() {
  const products = await listAllProducts();

  return (
    <div>
      {products.length === 0 ? (
        <p className="py-10 text-center text-slate-500">등록된 상품이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <p className="font-semibold text-slate-900">{p.nameKo}</p>
                <Badge variant={p.isActive ? "success" : "outline"}>
                  {p.isActive ? "판매중" : "비활성"}
                </Badge>
              </div>
              {p.description && <p className="mb-2 text-sm text-slate-500">{p.description}</p>}
              <ProductEditForm product={p} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
