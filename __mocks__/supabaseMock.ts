/**
 * Chainable Supabase mock builder.
 * Each chain method returns `this` so callers can do:
 *   supabase.from('x').select('*').eq('id', 1).single()
 *
 * Set _result / _error before the call to control what the terminal
 * method (select/insert/update/delete/single) resolves to.
 */

export function createMockSupabaseClient() {
  let _result: any = null;
  let _error: any = null;

  const chain: any = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ data: _result, error: _error })),

    // Helper to set the next response
    __setResult(data: any, error: any = null) {
      _result = data;
      _error = error;
    },

    // Make the chain itself thenable so `await chain.from(...)...` works
    // when the terminal isn't `.single()`:
    then(resolve: any, reject: any) {
      return Promise.resolve({ data: _result, error: _error }).then(resolve, reject);
    },
  };

  return chain;
}
