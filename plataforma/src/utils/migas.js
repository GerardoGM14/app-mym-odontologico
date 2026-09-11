// Migas de pan compartidas por las páginas del flujo clínico:
// Pacientes › Ana Pérez › Caries dental › Pagos

export const migaPacientes = { texto: 'Pacientes', a: '/clientes' };

export const migaCliente = (clienteId, cliente) => ({
  texto: cliente?.nombre ?? '…',
  a: `/clientes/${clienteId}/diagnostico`,
});

export const migaDiagnostico = (clienteId, diagnosticoId, diagnostico) => ({
  texto: diagnostico?.diagnostico ?? '…',
  a: `/clientes/${clienteId}/diagnostico/${diagnosticoId}/tratamientos`,
});
