import { beforeEach, describe, expect, it } from 'vitest';
import { SucursalService } from '../../../../core/services/sucursal.service';
import { MapaSucursalComponent } from './mapa-sucursal.component';
import { createPageFixture } from '../../../../shared/utility/test';

describe('MapaSucursalComponent', () => {
  let fixture: Awaited<ReturnType<typeof createPageFixture<MapaSucursalComponent>>>;

  beforeEach(async () => {
    fixture = await createPageFixture(MapaSucursalComponent, [
      { provide: SucursalService, useValue: { lista: () => ({ subscribe: () => undefined }) } }
    ]);
  });

  it('creates a location popup with the branch status', () => {
    const popup = fixture.componentInstance.crearPopupLeaflet({
      nombre_Sucursal: 'Centro',
      codigo: 'SUC-01',
      direccion_Sucursal: 'Av. Central 123',
      ciudad_Sucursal: 'Quito',
      estado: true
    });

    expect(popup).toContain('<h3>Centro</h3>');
    expect(popup).toContain('<strong>Ciudad:</strong> Quito');
    expect(popup).toContain('class="estado-activo">Activo</span>');
  });
});
