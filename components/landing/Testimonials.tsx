"use client"
import Section from "../ui/Section"
import { testimonials } from "@/lib/data"
import { InfiniteMovingCards } from "../ui/InfiniteMovingCard"

const Testimonials = () => {
    return (
        <Section
            title="What Our Customers Say"
            subtitle="Read what our satisfied customers have to say about our services who've improved their productivity and project management"
        >
            <div className="md:px-20 my-10 md:my-20">
                <InfiniteMovingCards
                    items={testimonials}
                    direction="right"
                    speed="slow"
                />
            </div>
        </Section>
    )
}

export default Testimonials