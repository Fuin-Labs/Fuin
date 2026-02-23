import { Header } from "./components/Header";
import { ShaderHero } from "./components/ShaderHero";
import { Features } from "./components/Features";
import { UsecaseFlow } from "./components/UsecaseFlow";
import { Footer } from "./components/Footer";

export default function Home() {
  return (
    <main className="bg-[#050505] min-h-screen">
      <Header />
      <ShaderHero />
      <Features />
      <UsecaseFlow />
      <Footer />
    </main>
  );
}
