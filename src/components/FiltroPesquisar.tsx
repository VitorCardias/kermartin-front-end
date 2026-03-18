import type React from "react";

interface PesquisarProps {
    label?: string;
    placeholder?: string;
    onSearch?: (value: string) => void;
}

const Pesquisar: React.FC<PesquisarProps> = ({ label = "", placeholder = "Pesquise...", onSearch }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    return (
        <div className="w-full">
            <div className="flex flex-col gap-3 md:gap-2">
                {label && (
                    <label className="text-muted font-semibold text-sm uppercase tracking-wide">
                        {label}
                    </label>
                )}
                <input
                    type="text"
                    placeholder={placeholder}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-main placeholder-muted focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-all duration-200"
                />
            </div>
        </div>
    );
}
export default Pesquisar;