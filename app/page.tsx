import Header from "@/components/landing/Header"
import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import WorkflowFeatures from "@/components/landing/Workflow"
import Testimonials from "@/components/landing/Testimonials"
import Faq from "@/components/landing/Faq"
import Footer from "@/components/landing/Footer"

export default function Home() {
    return (
        <div className="bg-black">
            <div className="max-w-[2000px] mx-auto">
                <div className="relative">
                    <Header />
                    <Hero />
                    <Features />
                    <WorkflowFeatures />
                    <Testimonials />
                    <Faq />
                    <Footer />
                </div>
            </div>
        </div>
    )
}