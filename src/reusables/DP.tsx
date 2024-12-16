"use client";
import Image from "next/image";

const DP: React.FC<{
    dp?: string | null | undefined;
    name: string;
}> = ({dp, name}) => {

    return (
        <>
            {
                dp ? (
                    <span className="w-[40px] h-[40px] lg:w-[50px] lg:h-[50px] rounded-full overflow-hidden">
                        <Image
                            src={dp}
                            alt={name}
                            width={50}
                            height={50}
                            className="rounded-full w-full h-full object-cover object-top"
                        />
                    </span>
                ) : (
                    <span className="flex items-center justify-center h-[50px] w-[50px] bg-blue-700 text-white text-xl lg:text-2xl rounded-full overflow-hidden">
                        {name[0]}
                    </span>
                )
            }
        </>
    );
};

export default DP;
