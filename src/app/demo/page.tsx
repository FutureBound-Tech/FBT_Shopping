import { ProductCard } from "@/components/ui/product-card-1";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background p-10 flex flex-col items-center gap-10">
      <h1 className="text-4xl font-bold">Product Card Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        <ProductCard
          name="Premium Silk Kanjivaram Saree"
          price={2499.00}
          originalPrice={3500.00}
          rating={4.9}
          reviewCount={85}
          discount={28}
          freeShipping
          isNew
          isBestSeller
          colors={["Gold", "Maroon", "Dark Green"]}
          sizes={["Free Size"]}
          images={[
            "https://images.unsplash.com/photo-1610030469983-98e550d3215c?q=80&w=1287&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=1287&auto=format&fit=crop"
          ]}
        />

        <ProductCard
          name="A-Line Designer Co-Ord Set"
          price={650.00}
          originalPrice={999.00}
          rating={4.7}
          reviewCount={325}
          discount={35}
          freeShipping
          isBestSeller
          colors={["Yellow", "Olive Green", "Wine"]}
          sizes={["M", "L", "XL", "2XL", "3XL"]}
          images={[
            "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1286&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1470&auto=format&fit=crop"
          ]}
        />

        <ProductCard
          name="Anarkali Ethnic Wear Set"
          price={1199.00}
          originalPrice={1899.00}
          rating={4.6}
          reviewCount={120}
          discount={37}
          freeShipping
          isNew
          colors={["Dark Brown", "Gold"]}
          sizes={["S", "M", "L", "XL"]}
          images={[
            "https://images.unsplash.com/photo-1621252327598-e71e72b4c9e7?q=80&w=1287&auto=format&fit=crop"
          ]}
        />
      </div>
    </main>
  );
}
