'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl'; 
import Map, { Marker, MapRef } from 'react-map-gl/maplibre';
import { Location , LiveMapProps } from '@/app/lib/definitions';
import 'maplibre-gl/dist/maplibre-gl.css';


// 2. Definimos el estilo gratuito de OpenStreetMap
const osmStyle = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap Contributors',
      maxzoom: 19
    }
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm'
    }
  ]
};

export default function LiveMap({ courierLocation, destination }: LiveMapProps) {
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    if (mapRef.current && courierLocation) {
      const minLng = Math.min(courierLocation.lng, destination.lng);
      const maxLng = Math.max(courierLocation.lng, destination.lng);
      const minLat = Math.min(courierLocation.lat, destination.lat);
      const maxLat = Math.max(courierLocation.lat, destination.lat);

      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat]
        ],
        { padding: 60, duration: 1000 }
      );
    }
  }, [courierLocation, destination]);

  return (
    <div className="mt-8 border-t pt-6 transition-all duration-500 ease-in-out">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Ubicación en tiempo real</h3>
      
      <div className="w-full h-80 rounded-xl overflow-hidden shadow-inner border border-gray-200 relative">
        <Map
          ref={mapRef}
          mapStyle={osmStyle as any} 
          initialViewState={{
            longitude: destination.lng,
            latitude: destination.lat,
            zoom: 14
          }}
          interactive={true}
        >
          {/* Marcador del Destino */}
          <Marker longitude={destination.lng} latitude={destination.lat} anchor="bottom">
            <div className="flex flex-col items-center">
              <div className="bg-white px-2 py-1 rounded-md shadow-md text-[10px] font-bold text-gray-800 mb-1">
                Destino
              </div>
              <span className="text-3xl drop-shadow-md">🏠</span>
            </div>
          </Marker>

          {/* Marcador de la Delivery */}
          {courierLocation && (
            <Marker longitude={courierLocation.lng} latitude={courierLocation.lat} anchor="bottom">
              <div className="flex flex-col items-center">
                <div className="bg-orange-500 text-white px-2 py-1 rounded-md shadow-md text-[10px] font-bold mb-1">
                  En camino
                </div>
                <span className="text-3xl drop-shadow-md">🚁</span>
              </div>
            </Marker>
          )}
        </Map>
      </div>
      
      <div className="mt-2 flex justify-between text-[10px] text-gray-400 font-mono">
        <p>Casa: {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}</p>
        {courierLocation && (
          <p>Moto: {courierLocation.lat.toFixed(4)}, {courierLocation.lng.toFixed(4)}</p>
        )}
      </div>
    </div>
  );
}