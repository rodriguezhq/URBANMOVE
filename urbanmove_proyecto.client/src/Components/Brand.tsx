import { Leaf, Bike, Car, TrainFront, Navigation } from 'lucide-react';

function BrandPanel() {
    return (
        <div className="flex-col justify-between bg-gradient-to-br from-violet-600 to-purple-900 p-12 text-white">
            <div className="flex items-center gap-2">
                <Leaf size={28} />
                <span className="text-xl font-bold tracking-wide">URBANMOVE</span>
            </div>

            <div>
                <div className="mb-6 flex gap-3">
                    <IconoTransporte icono={<Bike size={20} />} />
                    <IconoTransporte icono={<Car size={20} />} />
                    <IconoTransporte icono={<TrainFront size={20} />} />
                    <IconoTransporte icono={<Navigation size={20} />} />
                </div>
                <h2 className="text-2xl font-bold leading-snug">
                    Camina
                    <br />
                    Run
                </h2>
                <p className="mt-2 text-sm text-violet-100">
                    lorem....
                </p>
            </div>
        </div>
    );
}

function IconoTransporte({ icono }: { icono: React.ReactNode }) {
    return (
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/20">
            {icono}
        </div>
    );
}

export default BrandPanel;