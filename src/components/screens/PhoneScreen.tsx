interface screenProps {
    children: React.ReactNode;
}

export default function PhoneScreen(props: screenProps) {
    return (
        <div className="w-full relative">
            {/* This padding-bottom creates the aspect ratio */}

            <div className="pb-[206.15%] w-full flex border-gray-600 border-2 shadow-xl  rounded-[2.5rem] bg-gray-300 overflow-hidden"></div>
            <div className="absolute inset-1 bg-white border-black border-4 flex items-center justify-center rounded-[2.25rem] overflow-hidden">
                <div className="h-full w-full overflow-scroll no-scrollbar">
                    {props.children}
                </div>
            </div>

            {/* 16/9 = 1.7777... so 177.77% */}
            {/* Content container, absolutely positioned to fill the space */}
        </div>
    );
}
