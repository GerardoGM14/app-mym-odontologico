import { describe, expect, it } from 'vitest';
import { validarCliente, validarUsuario } from './validaciones';

const clienteValido = { nombre: 'Ana Pérez', dni: '12345678', correo: '', telefono: '987654321' };

describe('validarCliente', () => {
  it('acepta un cliente válido', () => expect(validarCliente(clienteValido)).toBeNull());
  it('exige nombre', () => expect(validarCliente({ ...clienteValido, nombre: '  ' })).toMatch(/nombre/));
  it('exige DNI de 8 dígitos', () => expect(validarCliente({ ...clienteValido, dni: '1234' })).toMatch(/DNI/));
  it('exige teléfono que empiece con 9', () => expect(validarCliente({ ...clienteValido, telefono: '887654321' })).toMatch(/teléfono/));
  it('valida el correo solo si se ingresa', () => expect(validarCliente({ ...clienteValido, correo: 'malo' })).toMatch(/correo/));
});

describe('validarUsuario', () => {
  it('exige contraseña de 6 caracteres', () => {
    expect(validarUsuario({ nombre: 'Luis', email: 'luis@clinica.pe', password: '123' })).toMatch(/contraseña/);
    expect(validarUsuario({ nombre: 'Luis', email: 'luis@clinica.pe', password: '123456' })).toBeNull();
  });
});
