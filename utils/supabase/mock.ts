// A Map to store registered credentials (email -> password) for mocking authentication
const registeredCredentials = new Map<string, string>();
// Function to create a mock Supabase client for testing purposes
export async function createMockClient() {
  return {
    auth: {
      // Mock getSession: always resolves with no active session
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      // Mock getUser: always resolves with no user
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      // Mock signInWithPassword: checks credentials against registeredCredentials Map
      signInWithPassword: jest.fn(async ({ email, password }) => {
        if (registeredCredentials.has(email)) {
          const storedPassword = registeredCredentials.get(email);
          if (storedPassword === password) {
            return {
              data: { session: { access_token: "mock-token" } },
              error: null,
            };
          }
        }
        // Return error if credentials are invalid
        return {
          data: null,
          error: { message: "Invalid login credentials" },
        };
      }),
      // Mock signUp: registers new credentials or returns error if already registered
      signUp: jest.fn(async ({ email, password }) => {
        if (registeredCredentials.has(email)) {
          return {
            data: { user: { id: "mock-user-id", identities: [] } },
            error: { message: "User already registered" },
          };
        }
        // Register new user
        registeredCredentials.set(email, password);
        return {
          data: { user: { id: "mock-user-id", identities: [{}] } },
          error: null,
        };
      }),
      // Mock signOut: always resolves with no error
      signOut: jest.fn().mockResolvedValue({ error: null }),
      // Mock onAuthStateChange: returns a subscription object with an unsubscribe function
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    // Mock database query builder
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      // Mock single: always resolves with no data and no error
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  };
}
