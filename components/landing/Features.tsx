"use client"
import { H2, P, P2 } from "../ui/Text"
import { featuresForBetterExperience } from "@/lib/data"

const Features = () => {
    return (
        <section className="py-10">
            <H2 className="text-center max-w-[97vw] mx-auto">{"Features for a better experience"}</H2>
            <P className="text-center my-4 max-w-[85%] md:max-w-[40%] mx-auto">{"Explore the essential tools designed to streamline your workflows, enhance team collaboration, and ensure your projects run smoothly from start to finish"}</P>

            <div className="flex items-center justify-center [@media(min-width:1760px)]:justify-between gap-12 px-20 my-20 flex-wrap">
                {featuresForBetterExperience.map((feature, idx) => (
                    <div key={idx} className="w-[500px] max-w-[90vw] flex flex-shrink-0 items-start gap-4 md:gap-8">
                        <div className="rounded-full h-20 w-20 flex-shrink-0 flex items-center justify-center" style={{backgroundColor: feature.bgColor}}>
                            <feature.icon size={35} style={{color: feature.iconColor}} />
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
        </section>
    )
}

export default Features