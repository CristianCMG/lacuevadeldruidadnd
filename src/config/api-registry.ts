export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  params?: Record<string, string>;
  body?: Record<string, any>;
}

export const API_REGISTRY: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/admin/config',
    description: 'Get environment configuration and status',
  },
  {
    method: 'POST',
    path: '/api/auth/admin-login',
    description: 'Authenticate as admin',
    body: { secret: 'YOUR_SECRET' },
  },
  {
    method: 'GET',
    path: '/api/auth/login',
    description: 'Initiate Mercado Libre OAuth flow',
  },
  {
    method: 'POST',
    path: '/api/checkout',
    description: 'Create a checkout preference',
    body: {
      items: [
        { id: '1', title: 'Test Item', price: 100, quantity: 1, image: 'https://via.placeholder.com/150' }
      ]
    },
  },
  {
    method: 'POST',
    path: '/api/webhooks/meli',
    description: 'Simulate Mercado Libre Webhook',
    body: {
      topic: 'payment',
      resource: '/v1/payments/12345'
    },
  },
];
