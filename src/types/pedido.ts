export type EstadoPedido = 'pendiente' | 'entregado' | 'no_entregado' | 'entrega_parcial' | 'rechazado' | 'postergado';

export interface EvidenciasFormulario {
  // Flujo entregado (6 pasos)
  nombreReceptor?: string;
  rutReceptor?: string;
  fotos?: string[];
  fotosPOD?: string[];
  metodoPago?: string;
  // Flujo entrega_parcial / no_entregado (2 pasos)
  comentarios?: string;
  // Compartido
  fotosLugar?: string[];
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
