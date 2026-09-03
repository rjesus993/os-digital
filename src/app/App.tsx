import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useOsStore } from '../features/os/store/osStore';
import { useAutoSave } from '../features/os/hooks/useAutoSave';

import { Screen1Identification } from '../features/os/pages/Screen1Identification';
// import { Screen2Checklist } from '../features/os/pages/Screen2Checklist';
// import { Screen3Materials } from '../features/os/pages/Screen3Materials';
// import { Screen4Finish } from '../features/os/pages/Screen4Finish';
// import { Screen5Success } from '../features/os/pages/Screen5Success';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { currentOs, loadOs, initNewOs, setStep } = useOsStore();
  
  // Ativa o hook de auto-save em background
  useAutoSave();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const draftOs = await invoke<OSDigital | null>('get_draft_os');
        if (draftOs) {
          loadOs(draftOs);
        } else {
          initNewOs();
        }
      } catch (error) {
        console.error("Falha ao recuperar OS do banco:", error);
        initNewOs();
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [loadOs, initNewOs]);

  if (isLoading || !currentOs) {
    return <div className="flex h-screen items-center justify-center text-primary">Carregando ambiente seguro...</div>;
  }

  return (
    <div className="app-container">
      {currentOs.current_step === 1 && <Screen1Identification onNext={() => setStep(2)} />}
      {/* {currentOs.current_step === 2 && <Screen2Checklist onNext={() => setStep(3)} onPrev={() => setStep(1)} />} */}
      {/* Implementações visuais das telas 2 a 5 serão inseridas conforme avançamos */}
    </div>
  );
}

export default App;