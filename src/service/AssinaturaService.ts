import { authApi } from "../api/AuthService";
import type { AssinaturaResponseDTO, CriarAssinaturaDTO, TrocarPlanoDTO } from "../types/AssinaturaTypes";

const BASE_URL = '/admin/assinaturas';

export const AssinaturaService = {
    
    listarTodas: async (): Promise<AssinaturaResponseDTO[]> => {
        const response = await authApi.get(BASE_URL);
        return response.data;
    },

    criar: async (dados: CriarAssinaturaDTO) => {
        return await authApi.post(BASE_URL, dados);
    },

    renovar: async (id: string) => {
        return await authApi.patch(`${BASE_URL}/${id}/renovar`);
    },

    cancelar: async (id: string, imediato: boolean) => {
        return await authApi.patch(`${BASE_URL}/${id}/cancelar?imediato=${imediato}`);
    },

    trocarPlano: async (id: string, dados: TrocarPlanoDTO) => {
        return await authApi.patch(`${BASE_URL}/${id}/trocar-plano`, dados);
    }
}