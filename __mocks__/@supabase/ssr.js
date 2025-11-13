export const createServerClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn(() => ({ data: { user: { id: 'mock-user-id' } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        // Mock the call to get data
        single: jest.fn(() => ({
          data: {
            id: 'mock-data'
          },
          error: null
        })),
        // Or to get multiple items
        promise: jest.fn(() =>
          Promise.resolve({
          data: [],
          error: null
        })),
      })),
    })),
  })),
}));

export const createClient = jest.fn(() => ({

}));
