import { HeroSection, LogosSection } from "@/components/ui/hero-1";
import { Header } from "@/components/ui/header-1";

export default function DemoHeroPage() {
    return (
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
            <Header />
            <main className="grow">
                <HeroSection />
                <LogosSection />
            </main>
        </div>
    );
}
