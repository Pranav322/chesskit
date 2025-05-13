import { NextPage } from 'next';
import { GameImportContainer } from '@/components/GameImport/GameImportContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Icon } from '@iconify/react';

const ImportGamesPage: NextPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-6">
              <Icon icon="mdi:database-import" className="text-5xl text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Import Your Chess Games</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Import your games from Lichess or Chess.com to analyze and improve your play
            </p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <GameImportContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportGamesPage; 