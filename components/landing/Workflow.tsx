"use client"
import { useState } from 'react';
import { H2, P, P2 } from '../ui/Text'
import { workflowFeatures } from '@/lib/data'

const WorkflowFeatures = () => {
    const [activeFeatureIdx, setActiveFeatureIdx] = useState<number>(0);

    return (
        <section className="py-5 md:py-10">
            <H2 className="text-center max-w-[97vw] mx-auto">{"Powerful Features to Elevate Your Workflow"}</H2>
            <P className="text-center my-4 max-w-[85%] md:max-w-[40%] mx-auto">{"Explore advanced tools that help you make smarter decisions, track progress, and manage your tasks with ease. Stay organized and in control with features designed to enhance your productivity"}</P>

            <div className="flex items-center justify-center [@media(min-width:1760px)]:justify-between gap-12 md:px-20 my-20 flex-wrap">
                {workflowFeatures.map((feature, idx) => (
                    <div
                        key={idx}
                        className="w-[500px] max-w-[90vw] p-6 border rounded-3xl flex flex-col items-start gap-4 md:gap-8"
                        onClick={() => setActiveFeatureIdx(idx)}
                        style={{ backgroundColor: idx === activeFeatureIdx ? feature.color + "33" : "transparent", borderColor: idx === activeFeatureIdx ? feature.color : "#1E2939" }}
                    >
                        <div className="rounded-full h-20 w-20 flex-shrink-0 flex items-center justify-center bg-gray-800">
                            <feature.icon size={35} style={{ color: feature.color }} />
                        </div>

                        <div className="mt-4">
                            <P2 className="font-semibold text-white text-xl">{feature.title}</P2>
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

export default WorkflowFeatures