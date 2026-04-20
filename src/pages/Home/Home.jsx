// src/pages/Home/Home.jsx
import HeroBanner       from './components/HeroBanner';
import FeaturesStrip    from './components/FeaturesStrip';
import ShopByCategory   from './components/ShopByCategory/ShopByCategory'; // ← NEW
import FeaturedProducts from './components/FeaturedProducts';
import CategorySection  from './components/CategorySection';
import Newsletter       from './components/Newsletter';
import FlashSaleSection from './components/FlashSaleSection/FlashSaleSection';


export default function Home() {
  return (
    <main>
      <HeroBanner />
      <FeaturesStrip />
            <FlashSaleSection /> 

      <ShopByCategory />     {/* ← NEW: inserted here between FeaturesStrip and FeaturedProducts */}
      <FeaturedProducts />
      <CategorySection />
      <Newsletter />
    </main>
  );
}