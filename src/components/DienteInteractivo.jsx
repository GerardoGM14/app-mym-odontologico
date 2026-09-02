export default function DienteInteractivo({ numero, seleccion, setSeleccion, condicionSeleccionada }) {
    const caras = ['oclusal', 'vestibular', 'lingual', 'mesial', 'distal'];

    const toggleCondicion = (cara) => {
        setSeleccion((prev) => {
            const prevCond = prev[numero]?.[cara] || [];
            const yaExiste = prevCond.includes(condicionSeleccionada);
            const nuevasCondiciones = yaExiste
                ? prevCond.filter((c) => c !== condicionSeleccionada)
                : [...prevCond, condicionSeleccionada];

            return {
                ...prev,
                [numero]: {
                    ...prev[numero],
                    [cara]: nuevasCondiciones
                }
            };
        });
    };

    const colorLayer = (cond) => {
        switch (cond) {
            case 'caries': return 'bg-red-500';
            case 'obturacion': return 'bg-blue-500';
            case 'endodoncia': return 'bg-green-500';
            case 'exodoncia': return 'bg-black';
            case 'fractura': return 'bg-yellow-400';
            case 'curacion': return 'bg-gray-400';
            default: return 'bg-white';
        }
    };
    const renderCara = (cara, style) => {
        const condiciones = seleccion[numero]?.[cara] || [];

        return (
            <div
                onClick={() => toggleCondicion(cara)}
                className={`absolute ${style} cursor-pointer flex items-center justify-center`}
            >
                <div className="w-full h-full relative flex items-center justify-center">
                    {condiciones.map((cond, index) => {
                        const baseColor = colorLayer(cond);

                        if (cond === 'exodoncia') {
                            return (
                                <div key={index} className="absolute inset-0 flex items-center justify-center z-10">
                                    <span className="text-black font-bold text-lg">✕</span>
                                </div>
                            );
                        }

                        if (cond === 'fractura') {
                            return (
                                <div
                                    key={index}
                                    className="absolute w-full h-full border-l-2 border-yellow-400 rotate-45 z-10"
                                ></div>
                            );
                        }

                        if (cond === 'corona') {
                            return (
                                <div
                                    key={index}
                                    className="absolute w-full h-full border-2 border-purple-600 rounded z-10"
                                ></div>
                            );
                        }

                        if (cond === 'curacion') {
                            return (
                                <div
                                    key={index}
                                    className="absolute w-full h-full bg-gray-300 opacity-50 rounded z-0"
                                ></div>
                            );
                        }

                        // colores normales (caries, obturación, endodoncia)
                        return (
                            <div
                                key={index}
                                className={`absolute w-full h-full ${baseColor} opacity-80 rounded z-0`}
                            ></div>
                        );
                    })}
                </div>
            </div>
        );
    };


    return (
        <div className="relative w-16 h-16 border rounded flex items-center justify-center text-xs font-bold shadow bg-white">
            {/* Mesial */}
            {renderCara('mesial', 'left-0 top-1/4 h-1/2 w-2')}
            {/* Distal */}
            {renderCara('distal', 'right-0 top-1/4 h-1/2 w-2')}
            {/* Vestibular */}
            {renderCara('vestibular', 'top-0 left-1/4 w-1/2 h-2')}
            {/* Lingual */}
            {renderCara('lingual', 'bottom-0 left-1/4 w-1/2 h-2')}
            {/* Oclusal */}
            {renderCara('oclusal', 'w-6 h-6 rounded')}

            <span className="absolute text-gray-600 -bottom-4">{numero}</span>
        </div>
    );
}

