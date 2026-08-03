import { useEffect, useState } from 'react';
import { useAuth } from '@/stores/auth';

export function useUserTrips() {
  const { user, isAuthenticated } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setTrips([]);
      setLoading(false);
      return;
    }

    const loadTrips = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to load from localStorage first (offline/fallback)
        const savedTrips = JSON.parse(localStorage.getItem('savedTrips') || '[]');
        
        // Try API if user is authenticated
        if (user?.id) {
          const response = await fetch('/api/trip?userId=' + user.id);
          if (response.ok) {
            const data = await response.json();
            setTrips(data);
          } else {
            // Fallback to localStorage
            setTrips(savedTrips.filter((t: any) => !t.id.startsWith('temp_')));
          }
        } else {
          setTrips(savedTrips.filter((t: any) => !t.id.startsWith('temp_')));
        }
      } catch (err) {
        console.error('Error loading trips:', err);
        setError('Failed to load trips');
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [isAuthenticated, user]);

  return { trips, loading, error };
}