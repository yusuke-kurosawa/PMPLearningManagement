import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock API endpoints (if any external APIs are used in the future)
  http.get('/api/progress', () => {
    return HttpResponse.json({
      totalProcesses: 49,
      completedProcesses: 12,
      knowledgeAreaProgress: {
        'Integration Management': { completed: 3, total: 7 },
        'Scope Management': { completed: 2, total: 6 },
        'Schedule Management': { completed: 1, total: 6 },
        'Cost Management': { completed: 2, total: 4 },
        'Quality Management': { completed: 1, total: 3 },
        'Resource Management': { completed: 1, total: 6 },
        'Communications Management': { completed: 1, total: 3 },
        'Risk Management': { completed: 1, total: 7 },
        'Procurement Management': { completed: 0, total: 3 },
        'Stakeholder Management': { completed: 0, total: 4 },
      },
      processGroupProgress: {
        'Initiating': { completed: 2, total: 2 },
        'Planning': { completed: 6, total: 24 },
        'Executing': { completed: 2, total: 10 },
        'Monitoring and Controlling': { completed: 2, total: 12 },
        'Closing': { completed: 0, total: 1 },
      },
      studyTime: 1200, // in minutes
      lastStudyDate: '2025-08-08T10:30:00Z'
    });
  }),

  http.post('/api/progress/:processId', () => {
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/exam/questions', () => {
    return HttpResponse.json([
      {
        id: 1,
        question: "Which of the following is NOT one of the five process groups in PMBOK?",
        options: [
          "Initiating",
          "Planning", 
          "Testing",
          "Executing"
        ],
        correct: 2,
        knowledgeArea: "Integration Management",
        processGroup: "General",
        explanation: "Testing is not one of the five process groups. The five process groups are: Initiating, Planning, Executing, Monitoring and Controlling, and Closing."
      }
    ]);
  }),

  // Mock localStorage for browser environment
  http.get('/api/storage/:key', ({ params }) => {
    const { key } = params;
    const value = localStorage.getItem(key);
    return HttpResponse.json({ value });
  }),

  http.post('/api/storage/:key', async ({ params, request }) => {
    const { key } = params;
    const { value } = await request.json();
    localStorage.setItem(key, JSON.stringify(value));
    return HttpResponse.json({ success: true });
  }),
];