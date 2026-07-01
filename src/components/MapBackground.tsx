import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGameStore } from '../store/gameStore';
import { barcelona, getLocationById } from '../data/cities/barcelona';
import { elAlquimista } from '../data/story/el-alquimista';
import { getLocationsForChapter } from '../engine/storyEngine';
import type { LocationPOI } from '../store/types';

const BASE = import.meta.env.BASE_URL;

const LOCATION_EMOJIS: Record<string, string> = {
  home: '🏠', plaza: '🏛️', library: '📚', park: '🌳',
  market: '🛒', church: '⛪', monument: '🏛️', cafe: '☕',
  theatre: '🎭', office: '🏢', airport: '✈️',
};

const LOCATION_COLORS: Record<string, string> = {
  home: '#22c55e', plaza: '#eab308', library: '#3b82f6',
  park: '#22c55e', market: '#f97316', church: '#a855f7',
  monument: '#ec4899', cafe: '#f59e0b', theatre: '#8b5cf6',
  office: '#6366f1', airport: '#ef4444',
};

function createLocationIcon(type: string, isRequired: boolean): L.DivIcon {
  const color = LOCATION_COLORS[type] ?? '#e94560';
  const emoji = LOCATION_EMOJIS[type] ?? '📍';
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 38px; height: 38px;
      background: ${isRequired ? '#e94560' : color}22;
      border: 3px solid ${isRequired ? '#e94560' : color};
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.5);
      cursor: pointer;
      transition: transform 0.2s;
    ">${emoji}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
}

const PROTAGONIST_FILES: Record<string, string> = {
  trump: 'trump.png',
  ramos: 'ramos.png',
};

function createPlayerIcon(chosenCharacter: string | null): L.DivIcon {
  const file = PROTAGONIST_FILES[chosenCharacter ?? ''] ?? 'protagonist.jpg';
  const imgUrl = `${BASE}characters/${file}`;
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 36px; height: 36px;
      border: 3px solid white;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(233,69,96,0.7), 0 2px 8px rgba(0,0,0,0.5);
      background: #e94560;
    "><img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;object-position:top" /></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

interface MapBackgroundProps {
  onLocationSelect: (location: LocationPOI) => void;
}

export default function MapBackground({ onLocationSelect }: MapBackgroundProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const playerMarkerRef = useRef<L.Marker | null>(null);
  const currentChapter = useGameStore((s) => s.currentChapter);
  const currentLocationId = useGameStore((s) => s.currentLocationId);
  const phase = useGameStore((s) => s.phase);
  const chosenCharacter = useGameStore((s) => s.chosenCharacter);

  const chapter = elAlquimista.chapters[currentChapter];
  const available = chapter ? getLocationsForChapter(chapter, barcelona.locations) : [];

  const playerLocation = currentLocationId ? getLocationById(currentLocationId) : getLocationById('bcn-home');

  // Init map once
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    try {
      const map = L.map(mapRef.current, {
        center: [barcelona.position.lat, barcelona.position.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        fadeAnimation: true,
        zoomAnimation: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      leafletMapRef.current = map;

      (window as any).__mapInstance = map;
      (window as any).__selectLocation = (id: string) => {
        const loc = available.find((l) => l.id === id) ?? getLocationById(id);
        if (loc) onLocationSelect(loc);
      };
    } catch (e) {
      console.warn('Map initialization failed:', e);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      playerMarkerRef.current = null;
      delete (window as any).__mapInstance;
      delete (window as any).__selectLocation;
    };
  }, []);

  // Toggle interactivity based on phase
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    const isBgOnly = phase === 'title' || phase === 'city_select';
    try {
      if (isBgOnly) {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
      } else {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
      }
    } catch (e) {
      // ignore
    }
  }, [phase]);

  // Update location markers when chapter changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Remove old location markers (keep the player marker)
    const toRemove: L.Layer[] = [];
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer !== playerMarkerRef.current) {
        toRemove.push(layer);
      }
    });
    toRemove.forEach((l: L.Layer) => map.removeLayer(l));

    // Add current chapter markers
    available.forEach((loc) => {
      const isRequired = chapter?.requiredLocationIds?.includes(loc.id) ?? false;
      const marker = L.marker([loc.position.lat, loc.position.lng], {
        icon: createLocationIcon(loc.type, isRequired),
      });

      const accentColor = isRequired ? '#e94560' : '#0e7490';
      const accentGradient = 'linear-gradient(to right,#22c55e,#16a34a)';
      const accentShadow = '0 2px 10px rgba(34,197,94,0.45)';

      marker.bindPopup(`
        <div style="width:200px;background:#1a1a2e;border-radius:12px;overflow:hidden;font-family:system-ui;">
          <div style="position:relative;height:120px;overflow:hidden;background:${accentColor}22;">
            <img
              src="${BASE}locations/${loc.id}.jpg"
              style="width:100%;height:100%;object-fit:cover;display:block;"
              onerror="this.style.display='none'"
            />
            <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.80) 0%,rgba(0,0,0,0.15) 55%,transparent 100%);"></div>
            ${isRequired ? `<div style="position:absolute;top:8px;right:8px;background:#e94560;color:white;font-size:9px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:2px 7px;border-radius:20px;">Story</div>` : ''}
            <div style="position:absolute;bottom:0;left:0;right:0;padding:8px 10px;">
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="font-size:17px;line-height:1;">${LOCATION_EMOJIS[loc.type] ?? '📍'}</span>
                <span style="font-size:13px;font-weight:700;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,0.9);line-height:1.2;">${loc.name}</span>
              </div>
            </div>
          </div>
          <div style="padding:10px;">
            <button
              onclick="window.__selectLocation && window.__selectLocation('${loc.id}')"
              style="width:100%;padding:9px 0;background:${accentGradient};color:white;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:${accentShadow};letter-spacing:0.02em;"
            >
              ${isRequired ? 'Investigate →' : 'Visit →'}
            </button>
          </div>
        </div>
      `, { className: 'loc-popup', maxWidth: 220 });

      marker.addTo(map);
    });
  }, [currentChapter, available.length]);

  // Update player marker when location changes
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !playerLocation) return;

    if (playerMarkerRef.current) {
      map.removeLayer(playerMarkerRef.current);
    }

    const playerMarker = L.marker(
      [playerLocation.position.lat, playerLocation.position.lng],
      { icon: createPlayerIcon(chosenCharacter), zIndexOffset: 1000 }
    );
    playerMarker.bindTooltip('You are here', { direction: 'top', offset: [0, -18] });
    playerMarker.addTo(map);
    playerMarkerRef.current = playerMarker;
  }, [currentLocationId, chosenCharacter]);

  return (
    <div
      ref={mapRef}
      className="fixed inset-0 z-0"
    />
  );
}

export function flyToMap(lat: number, lng: number, zoom: number = 15) {
  const map = (window as any).__mapInstance as L.Map | undefined;
  if (map) {
    map.flyTo([lat, lng], zoom, { duration: 1.5 });
  }
}

export function flyToPlayer() {
  const map = (window as any).__mapInstance as L.Map | undefined;
  if (!map) return;
  // Find player marker or center on Barcelona
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      const marker = layer;
      // crude heuristic: find the player marker (no popup)
      if (!marker.getPopup()) {
        map.flyTo(marker.getLatLng(), 15, { duration: 1 });
      }
    }
  });
}