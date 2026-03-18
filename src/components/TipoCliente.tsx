import type React from "react";

interface TipoClienteProps {
    tipo: string;
}

const TipoCliente: React.FC<TipoClienteProps> = ({ tipo }) => {

    const isPF = tipo === "PF";

    return (
        <div 
            className={`flex w-fit uppercase font-bold text-xs mb-1 px-2 py-1 rounded-md ${!isPF ? "text-blue bg-status-inprogress" : ""}`}
            style={isPF ? {
                color: "#1A94C4",
                backgroundColor: "#B4EAFF"
            } : {}}
        >
            <p>{!isPF ? "Pessoa Jurídica" : "Pessoa Física"}</p>
        </div>
    );
}

export default TipoCliente;