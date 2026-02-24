export type EstadoPedido = 'pendiente' | 'entregado' | 'rechazado' | 'postergado';

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
}
