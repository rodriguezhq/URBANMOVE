import { Bike, Car, Leaf, Navigation, TrainFront } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function IndexLayout() {
    return (
        <div className="grid grid-cols-1 grid-rows-[1fr_2fr] min-h-screen lg:grid-cols-2 lg:grid-rows-1 bg-gradient-to-br from-violet-600 to-purple-900 overflow-hidden">
            <aside className='relative px-4 py-6 lg:p-16 text-white flex flex-col justify-between'>
                <div aria-hidden className='rounded-full bg-white/10 absolute bottom-0 right-0 aspect-square w-100 translate-y-1/2 translate-x-1/2' />
                <div aria-hidden className='rounded-full bg-white/10 absolute bottom-0 right-0 aspect-square w-300 translate-y-1/2 translate-x-1/2' />
                <div className="flex items-center gap-2">
                    <Leaf size={28} />
                    <span className="text-xl font-bold tracking-wide">URBANMOVE</span>
                </div>
                <div className=''>
                    <div className="mb-6 flex gap-3 text-white *:bg-white/20 *:rounded-md *:p-3 *:backdrop-blur-sm *:shadow-md *:shadow-black/10">
                        <span>
                            <Bike size={24} />
                        </span>
                        <span>
                            <Car size={24} />
                        </span>
                        <span>
                            <TrainFront size={24} />
                        </span>
                        <span>
                            <Navigation size={24} />
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-violet-100">
                        lorem....
                    </p>
                </div>
            </aside>

            <div className="flex w-full items-start lg:items-center justify-center bg-white rounded-t-2xl lg:rounded-none p-8 z-10">
                <Outlet />
            </div>
        </div >
    );
}