import { afterAll, describe, expect, it, vi } from 'vitest';

const API_URL = import.meta.env.VITE_API_URL ?? 'https://saas-finanza.onrender.com';

vi.setConfig({ testTimeout: 30000, hookTimeout: 30000 });

async function llamar(ruta, method = 'GET', body) {
  const res = await fetch(`${API_URL}${ruta}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const texto = await res.text();
  let data = null;
  try {
    data = texto ? JSON.parse(texto) : null;
  } catch {
    data = { raw: texto };
  }
  return { res, data, texto };
}

describe('Pruebas de Integración - Rutas HTTP de Finanzas', () => {
  let conceptoId = null;
  let movimientoId = null;
  const nombreConcepto = `Concepto Test ${Date.now()}`;
  const sucursalId = 1;

  afterAll(async () => {
    if (movimientoId) await llamar(`/transacciones/${movimientoId}`, 'DELETE').catch(() => {});
    if (conceptoId) await llamar(`/conceptos/${conceptoId}`, 'DELETE').catch(() => {});
  });

  it('Debe crear un concepto nuevo (POST /conceptos)', async () => {
    const { res, data, texto } = await llamar('/conceptos', 'POST', {
      nombre: nombreConcepto,
      tipo: 'Ingreso',
      categoria_padre: '',
    });

    expect([200, 201], `POST /conceptos respondió ${res.status}: ${texto}`).toContain(res.status);
    expect(data.datos.nombre).toBe(nombreConcepto);
    conceptoId = data.datos.id;
    expect(conceptoId).toBeTruthy();
  });

  it('Debe editar un concepto existente (PUT /conceptos/:id)', async () => {
    expect(conceptoId, 'No hay conceptoId: falló la prueba de crear concepto').toBeTruthy();

    const { res, data, texto } = await llamar(`/conceptos/${conceptoId}`, 'PUT', {
      nombre: `${nombreConcepto} editado`,
      tipo: 'Ingreso',
      categoria_padre: 'Test',
    });

    expect(res.status, `PUT /conceptos respondió ${res.status}: ${texto}`).toBe(200);
    expect(data.datos.nombre).toBe(`${nombreConcepto} editado`);
  });

  it('Debe crear un movimiento (POST /transacciones)', async () => {
    expect(conceptoId, 'No hay conceptoId: fallaron las pruebas de concepto').toBeTruthy();

    const { res, data } = await llamar('/transacciones', 'POST', {
      id_tipo: 'Ingreso',
      id_concepto: conceptoId,
      id_sucursal: sucursalId,
      monto: 500.5,
      notas: 'Prueba desde Vitest',
      fecha: '2026-10-18',
    });

    expect([200, 201]).toContain(res.status);
    expect(Number(data.datos.monto)).toBeCloseTo(500.5);
    movimientoId = data.datos.id;
    expect(movimientoId).toBeTruthy();
  });

  it('Debe editar un movimiento existente (PUT /transacciones/:id)', async () => {
    expect(movimientoId, 'No hay movimientoId: falló la prueba de crear movimiento').toBeTruthy();

    const { res, data } = await llamar(`/transacciones/${movimientoId}`, 'PUT', {
      id_tipo: 'Ingreso',
      id_concepto: conceptoId,
      id_sucursal: sucursalId,
      monto: 1000,
      notas: 'Nota actualizada por Vitest',
      fecha: '2026-10-18',
    });

    expect(res.status).toBe(200);
    expect(Number(data.datos.monto)).toBeCloseTo(1000);
    expect(data.datos.notas).toBe('Nota actualizada por Vitest');
  });

  it('Debe eliminar el movimiento (DELETE /transacciones/:id)', async () => {
    expect(movimientoId, 'No hay movimientoId').toBeTruthy();

    const { res } = await llamar(`/transacciones/${movimientoId}`, 'DELETE');

    expect([200, 204]).toContain(res.status);
    movimientoId = null;
  });

  it('Debe eliminar el concepto (DELETE /conceptos/:id)', async () => {
    expect(conceptoId, 'No hay conceptoId').toBeTruthy();

    const { res } = await llamar(`/conceptos/${conceptoId}`, 'DELETE');

    expect([200, 204]).toContain(res.status);
    conceptoId = null;
  });
});