"use client"
import { P } from "../ui/Text"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { faqs } from "@/lib/data"
import Section from "../ui/Section"
import { IoAddOutline } from "react-icons/io5"
import { CgMathMinus } from "react-icons/cg"

const Faq = () => {
    const [activeFaqIdxs, setActiveFaqIdxs] = useState<number[]>([])

    return (
        <Section
            title="FAQs"
            subtitle="Frequently asked questions about Cubezy"
        >
            <div className="max-w-2xl mx-auto">
                {faqs.map((faq, idx) => (
                    <div
                        key={idx}
                        className="border-y border-gray-800 p-4"
                        onClick={() => {
                            if (activeFaqIdxs.includes(idx)) {
                                setActiveFaqIdxs(prev => prev.filter(i => i !== idx))
                            } else {
                                setActiveFaqIdxs(prev => [...prev, idx])
                            }
                        }}
                    >
                        <div className="flex items-center justify-between relative">
                            <P className="!text-xl">
                                {faq.question}
                            </P>

                            <button>
                                {activeFaqIdxs.includes(idx) ? <CgMathMinus size={25} /> : <IoAddOutline size={25} />}
                            </button>
                        </div>

                        <div className={cn("overflow-hidden duration-400", !activeFaqIdxs.includes(idx) ? "h-[0px]" : "py-4 h-[200px] md:h-[90px] max-h-fit")}>
                            {faq.answer}
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    )
}

export default Faq
