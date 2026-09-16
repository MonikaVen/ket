import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Nav } from './components/Nav';
import { AuthProvider } from './hooks/useAuth';
import { CardsProvider } from './hooks/useCards';
import { ContentProvider } from './hooks/useContent';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { ChapterPage } from './pages/ChapterPage';
import { ExamPage } from './pages/ExamPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { HomePage } from './pages/HomePage';
import { ProgressPage } from './pages/ProgressPage';
import { QuizPage } from './pages/QuizPage';
import { SignsPage } from './pages/SignsPage';
import { StudyPage } from './pages/StudyPage';

export default function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <CardsProvider>
          <BrowserRouter>
            <div className="app-shell">
              <Nav />
              <main className="main">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/mokytis" element={<StudyPage />} />
                  <Route path="/mokytis/:chapterId" element={<ChapterPage />} />
                  <Route path="/zenklai" element={<SignsPage />} />
                  <Route path="/korteles" element={<FlashcardsPage />} />
                  <Route path="/testas" element={<QuizPage />} />
                  <Route path="/egzaminas" element={<ExamPage />} />
                  <Route path="/pazanga" element={<ProgressPage />} />
                  <Route path="/paskyra" element={<AuthPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </CardsProvider>
      </ContentProvider>
    </AuthProvider>
  );
}
