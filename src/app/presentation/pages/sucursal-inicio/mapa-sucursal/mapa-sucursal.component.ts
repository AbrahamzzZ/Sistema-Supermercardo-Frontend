import { Component, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { SucursalService } from '../../../../core/services/sucursal.service';
import { MaterialModule } from '../../../../shared/ui/material-module';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

// @ts-expect-error - Leaflet icon configuration
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/images/marker-icon-2x.png',
  iconUrl: 'assets/images/marker-icon.png',
  shadowUrl: 'assets/images/marker-shadow.png'
});

@Component({
  selector: 'app-mapa-sucursal',
  standalone: true,
  imports: [MaterialModule, GoogleMapsModule, CommonModule],
  templateUrl: './mapa-sucursal.component.html',
  styleUrl: './mapa-sucursal.component.scss'
})
export class MapaSucursalComponent implements OnInit, AfterViewInit {
  private sucursalService = inject(SucursalService);
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  center: google.maps.LatLngLiteral = {
    lat: -2.187746,
    lng: -79.894365
  };
  zoom = 12;
  markers: {
    position: google.maps.LatLngLiteral;
    title: string;
    data: unknown;
  }[] = [];
  infoWindowData: Record<string, unknown> | null = null;
  private leafletMap: L.Map | undefined;
  private leafletMarkers: L.Marker[] = [];
  useGoogleMaps: boolean;
  sucursales: unknown[] = [];

  constructor() {
    this.useGoogleMaps = !!(window as { google?: { maps?: unknown } }).google?.maps;
  }

  ngOnInit(): void {
    this.cargarSucursales();
  }

  ngAfterViewInit(): void {
    if (!this.useGoogleMaps) {
      setTimeout(() => this.inicializarLeaflet());
    }
  }

  cargarSucursales() {
    this.sucursalService.lista().subscribe((resp: unknown) => {
      const respData = resp as { data: unknown[] };
      this.sucursales = respData.data.filter((s: unknown) => {
        const sucursal = s as { latitud: number; longitud: number };
        return sucursal.latitud && sucursal.longitud;
      });

      if (this.useGoogleMaps) {
        this.markers = (this.sucursales as unknown[]).map((s: unknown) => {
          const sucursal = s as { latitud: number; longitud: number; nombre_Sucursal: string };
          return {
            position: {
              lat: sucursal.latitud,
              lng: sucursal.longitud
            },
            title: sucursal.nombre_Sucursal,
            data: s
          };
        });
      } else {
        this.agregarMarcadoresLeaflet();
      }
    });
  }

  inicializarLeaflet() {
    if (!this.leafletMap) {
      const sucursalInicial = this.sucursales[0] as { latitud: number; longitud: number };
      if (!sucursalInicial) return;

      this.leafletMap = L.map('leaflet-map').setView(
        [sucursalInicial.latitud, sucursalInicial.longitud],
        12
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.leafletMap);
    }
  }

  agregarMarcadoresLeaflet() {
    this.leafletMarkers.forEach((marker) => marker.remove());
    this.leafletMarkers = [];

    if (!this.leafletMap) {
      this.inicializarLeaflet();
    }

    (this.sucursales as unknown[]).forEach((sucursal: unknown) => {
      const s = sucursal as { latitud: number; longitud: number };
      const marker = L.marker([s.latitud, s.longitud])
        .bindPopup(this.crearPopupLeaflet(sucursal))
        .addTo(this.leafletMap!);

      this.leafletMarkers.push(marker);
    });
  }

  crearPopupLeaflet(sucursal: unknown): string {
    const s = sucursal as {
      nombre_Sucursal: string;
      codigo: string;
      direccion_Sucursal: string;
      ciudad_Sucursal: string;
      estado: boolean;
    };
    return `
      <div class="popup-content">
        <h3>${s.nombre_Sucursal}</h3>
        <p><strong>Código:</strong> ${s.codigo}</p>
        <p><strong>Dirección:</strong> ${s.direccion_Sucursal}</p>
        <p><strong>Ciudad:</strong> ${s.ciudad_Sucursal}</p>
        <p><strong>Estado:</strong> <span class="${
          s.estado ? 'estado-activo' : 'estado-inactivo'
        }">${s.estado ? 'Activo' : 'Inactivo'}</span></p>
      </div>
    `;
  }

  abrirInfoWindow(marker: { position: google.maps.LatLngLiteral; title: string; data: unknown }, markerRef: MapMarker) {
    this.infoWindowData = marker.data as Record<string, unknown>;
    this.infoWindow.open(markerRef);
  }
}