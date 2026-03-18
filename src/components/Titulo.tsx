import React from 'react';

interface TituloProps {
    tamanho?: string;
    children: React.ReactNode;
}

const Titulo: React.FC<TituloProps> = ({ tamanho = "text-2xl", children }) => {
    return (
        <h1 className={`${tamanho} font-bold text-main`}>{children}</h1>
    );
}

export default Titulo;