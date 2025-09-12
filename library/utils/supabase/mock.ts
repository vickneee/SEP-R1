const registeredCredentials = new Map<string, string>();
export async function createMockClient() {
  return {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
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
        return {
          data: null,
          error: { message: "Invalid login credentials" },
        };
      }),
      signUp: jest.fn(async ({ email, password }) => {
        if (registeredCredentials.has(email)) {
          return {
            data: { user: { id: "mock-user-id", identities: [] } },
            error: { message: "User already registered" },
          };
        }
        registeredCredentials.set(email, password);
        return {
          data: { user: { id: "mock-user-id", identities: [{}] } },
          error: null,
        };
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  };
}
