export type EstadoPedido = 'pendiente' | 'entregado' | 'no_entregado' | 'entrega_parcial' | 'rechazado' | 'postergado';

export interface EvidenciasFormulario {
  comentarios: string;
  fotosLugar: string[];
}

export interface PedidoConEstado {
  key: string;
  codigo: string;
  cliente: string;
  direccion: string;
  horario: string;
  estado: EstadoPedido;
  sincronizado: boolean;
  lat: number;
  lng: number;
  subestado?: string | null;
  evidencias?: EvidenciasFormulario;
}
