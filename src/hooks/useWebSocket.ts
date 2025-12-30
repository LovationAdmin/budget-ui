// src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: 'budget_updated' | 'member_joined' | 'member_left';
  user: string;
  budgetId?: string;
}

interface UseWebSocketOptions {
  budgetId: string;
  onUpdate?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
}

export const useWebSocket = ({
  budgetId,
  onUpdate,
  onConnect,
  onDisconnect,
  reconnectInterval = 3000,
}: UseWebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const isIntentionalCloseRef = useRef(false);

  const connect = useCallback(() => {
    // Éviter les connexions multiples
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
    const wsUrl = API_URL.replace(/^http/, 'ws');
    
    try {
      const ws = new WebSocket(`${wsUrl}/ws/budgets/${budgetId}`);
      
      ws.onopen = () => {
        console.log(`✅ WebSocket connecté au budget ${budgetId}`);
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onUpdate?.(message);
        } catch (error) {
          console.error('❌ Erreur parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket erreur:', error);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket fermé');
        onDisconnect?.();
        wsRef.current = null;

        // Reconnexion automatique si pas intentionnel
        if (!isIntentionalCloseRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Tentative de reconnexion...');
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('❌ Erreur création WebSocket:', error);
    }
  }, [budgetId, onUpdate, onConnect, onDisconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    isIntentionalCloseRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { disconnect };
};