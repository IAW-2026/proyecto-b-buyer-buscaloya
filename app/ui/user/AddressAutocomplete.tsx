'use client';

import { useState } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import dynamic from 'next/dynamic';
const SearchBox = dynamic(() => import('@mapbox/search-js-react').then(mod => mod.SearchBox), { ssr: false });
import 'mapbox-gl/dist/mapbox-gl.css'; // Estilos base obligatorios del mapa

interface AddressAutocompleteProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (data: { street: string; city: string; lat: number; lng: number }) => void;
}

// Centro por defecto: Bahía Blanca
const DEFAULT_CENTER = { lat: -38.7183, lng: -62.2663 };

export function AddressAutocomplete({ initialLat, initialLng, onLocationSelect }: AddressAutocompleteProps) {
  const [markerPos, setMarkerPos] = useState({
    lat: initialLat || DEFAULT_CENTER.lat,
    lng: initialLng || DEFAULT_CENTER.lng
  });
  
  // Estado para la cámara del mapa
  const [viewState, setViewState] = useState({
    latitude: initialLat || DEFAULT_CENTER.lat,
    longitude: initialLng || DEFAULT_CENTER.lng,
    zoom: 14
  });

  // Cuando el usuario elige una dirección del Autocompletado
  const handleRetrieve = (res: any) => {
    const feature = res.features[0];
    if (!feature) return;

    // Mapbox devuelve [longitud, latitud]
    const [lng, lat] = feature.geometry.coordinates;
    const context = feature.properties.context || {};
    
    // Extraemos la calle y la ciudad de la respuesta de Mapbox
    const street = feature.properties.name || '';
    const city = context.place?.name || 'Bahía Blanca';

    const newPos = { lat, lng };
    setMarkerPos(newPos);
    
    // Hacemos que la cámara viaje hasta el lugar
    setViewState({ ...viewState, latitude: lat, longitude: lng, zoom: 16 });

    // Le pasamos los datos limpios al formulario
    onLocationSelect({ street, city, lat, lng });
  };

  // Cuando el usuario arrastra el pin manualmente en el mapa
  const handleMarkerDragEnd = (event: any) => {
    const newPos = {
      lat: event.lngLat.lat,
      lng: event.lngLat.lng
    };
    setMarkerPos(newPos);
    
    // Al arrastrar, solo actualizamos coordenadas para no pisar el texto que el usuario haya escrito a mano
    onLocationSelect({ street: '', city: '', lat: newPos.lat, lng: newPos.lng });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Buscador con Autocompletado de Mapbox */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Buscar dirección</label>
        <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
          <SearchBox 
            accessToken={process.env.NEXT_PUBLIC_MAPBOX_API_KEY || ''}
            options={{
              language: 'es',
              country: 'AR', // Restringe a Argentina
              proximity: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat] // Prioriza Bahía Blanca
            }}
            onRetrieve={handleRetrieve}
            theme={{
              variables: {
                fontFamily: 'inherit',
                unit: '16px',
                padding: '0.75em',
                boxShadow: 'none',
                border: 'none',
              }
            }}
          />
        </div>
      </div>

      {/* 2. Mapa Interactivo */}
      <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-300 shadow-inner relative">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12" // Estilo claro oficial
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_KEY || ''}
        >
          <Marker 
            latitude={markerPos.lat} 
            longitude={markerPos.lng} 
            draggable={true} 
            onDragEnd={handleMarkerDragEnd}
            color="#ef4444" // Pin rojo
          />
        </Map>
      </div>
      <p className="text-xs text-gray-500 text-center">
        Buscá tu calle o arrastrá el pin rojo hasta tu ubicación exacta.
      </p>
    </div>
  );
}