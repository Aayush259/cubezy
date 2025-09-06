"use client"
import { H2, P } from "../ui/Text"
import { testimonials } from "@/lib/data"
import { InfiniteMovingCards } from "../ui/InfiniteMovingCard"

const Testimonials = () => {
    return (
        <section className="py-5 md:py-10">
            <H2 className="text-center max-w-[97vw] mx-auto">{"What Our Customers Say"}</H2>
            <P className="text-center my-4 max-w-[85%] md:max-w-[40%] mx-auto">{"Read what our satisfied customers have to say about our services who've improved their productivity and project management"}</P>

            <div className="md:px-20 my-10 md:my-20">
                <InfiniteMovingCards
                    items={testimonials}
                    direction="right"
                    speed="slow"
                />
            </div>
        </section>
    )
}

export default Testimonials