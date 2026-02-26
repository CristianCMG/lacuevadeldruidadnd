import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import CustomOrders from "@/components/CustomOrders";
import Community from "@/components/Community";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <FeaturedProducts />
      <CustomOrders />
      <Community />
    </div>
  );
}
