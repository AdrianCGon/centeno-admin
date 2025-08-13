import { buildApiUrl, API_CONFIG } from '../config/api';

export interface Comision {
  id?: string;
  periodo: string;
  actividad: string;
  modalidad: string;
  docente: string;
  horario: string;
  aula: string;
  comision: string;
  realizada?: boolean;
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

export interface CreateComisionRequest {
  periodo: string;
  actividad: string;
  modalidad: string;
  docente: string;
  horario: string;
  aula: string;
  comision: string;
}

export class ComisionService {
  static async create(comision: CreateComisionRequest): Promise<Comision> {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.COMISIONES.BASE), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(comision),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear la comisión');
    }

    return response.json();
  }

  static async getAll(): Promise<Comision[]> {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.COMISIONES.BASE), {
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener las comisiones');
    }

    const data = await response.json();
    return data.data || [];
  }

  static async updateRealizada(id: string, realizada: boolean): Promise<Comision> {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.COMISIONES.BASE + `/${id}/realizada`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ realizada }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar el estado de la comisión');
    }

    return response.json();
  }

  static async deleteAll(): Promise<{ deletedCount: number; message: string }> {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.COMISIONES.BASE + '/all'), {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar todas las comisiones');
    }

    return response.json();
  }
} 