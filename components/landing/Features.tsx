"use client"
import Section from "../ui/Section"
import { P, P2 } from "../ui/Text"
import { featuresForBetterExperience } from "@/lib/data"

const Features = () => {
    return (
        <Section
            title="Features for a better experience"
            subtitle="Explore the essential tools designed to streamline your workflows, enhance team collaboration, and ensure your projects run smoothly from start to finish"
        >
            <div className="flex items-center justify-center [@media(min-width:1760px)]:justify-between gap-12 px-20 my-20 flex-wrap">
                {featuresForBetterExperience.map((feature, idx) => (
                    <div key={idx} className="w-[500px] max-w-[94vw] flex flex-shrink-0 items-start gap-4 md:gap-8">
                        <div className="rounded-full h-16 w-16 md:h-20 md:w-20 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: feature.bgColor }}>
                            <feature.icon className="text-2xl md:text-3xl" style={{ color: feature.iconColor }} />
                        </div>

                        <div>
                            <P2>{feature.title}</P2>
                            <P className="mt-2">
                                {feature.description}
                            </P>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    )
}

export default Features