import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ExploreProjects from './ExploreProjects';
import witterApi from '../../api/witterApi'; // Importamos la API real

// 1. MOCKEAMOS LA API: Le decimos a Vitest que intercepte cualquier llamada a witterApi
vi.mock('../api/witterApi');

describe('Pruebas en el componente ExploreProjects', () => {
  
  it('Debe renderizar los proyectos simulados (Mocks) exitosamente', async () => {
    
    // 2. CREAMOS LOS DATOS FALSOS (MOCK DATA)
    const mockProjects = [
      {
        id: 1,
        title: 'Desarrollo de API para Telemedicina',
        companyName: 'SaludTech de Colima',
        description: 'Proyecto de prueba para validar la interfaz.',
        category: 'Backend',
        budget: 15000,
        durationDays: 30,
        levelRequired: 'Junior',
        skills: ['C#', '.NET'],
        createdAt: '2026-05-14T00:00:00Z'
      }
    ];

    // 3. CONFIGURAMOS EL MOCK: Cuando el componente haga get('/projects/open'), devuelve la data falsa
    (witterApi.get as any).mockResolvedValue({ data: mockProjects });

    // 4. RENDERIZAMOS EL COMPONENTE (Envuelto en Router porque usamos <Link>)
    render(
      <BrowserRouter>
        <ExploreProjects />
      </BrowserRouter>
    );

    // 5. VALIDACIÓN 1: Verificamos que al inicio aparezca el texto de carga
    expect(screen.getByText(/Buscando proyectos disponibles/i)).toBeInTheDocument();

    // 6. VALIDACIÓN 2: Esperamos a que el componente procese los datos y muestre nuestro proyecto falso
    await waitFor(() => {
      expect(screen.getByText('Desarrollo de API para Telemedicina')).toBeInTheDocument();
      expect(screen.getByText('🏢 SaludTech de Colima')).toBeInTheDocument();
      expect(screen.getByText('$15,000 MXN')).toBeInTheDocument();
    });
  });
});