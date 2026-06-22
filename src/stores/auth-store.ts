import { Account, ID, OAuthProvider, type Models } from "appwrite";
import { create } from "zustand";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { getAppwriteClient, isAppwriteConfigured } from "@/lib/appwrite";

export interface AuthUser {
  $id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
}

function mapAccountUser(session: Models.User): AuthUser {
  return {
    $id: session.$id,
    name: session.name,
    email: session.email,
  };
}

function resolveIsAdmin(session: Models.User): boolean {
  return session.labels?.includes("admin") ?? false;
}

function authFromSession(session: Models.User) {
  return {
    user: mapAccountUser(session),
    isAuthenticated: true,
    isAdmin: resolveIsAdmin(session),
    isLoading: false,
  };
}

const loggedOutState = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
};

async function fetchCurrentSession(account: Account): Promise<Models.User> {
  return account.get();
}

function getOAuthRedirectUrls() {
  const origin = window.location.origin;
  return {
    successUrl: `${origin}/#/home`,
    failureUrl: `${origin}/#/home?auth_failed=1`,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,

  checkSession: async () => {
    if (!isAppwriteConfigured()) {
      set({ ...loggedOutState });
      return;
    }

    try {
      const account = new Account(getAppwriteClient());
      const session = await fetchCurrentSession(account);
      set(authFromSession(session));
    } catch {
      set({ ...loggedOutState });
    }
  },

  login: async (email, password) => {
    if (!isAppwriteConfigured()) {
      throw new Error("Appwrite chưa được cấu hình.");
    }

    const account = new Account(getAppwriteClient());

    try {
      await account.createEmailPasswordSession(email, password);
      const session = await fetchCurrentSession(account);
      set(authFromSession(session));
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  },

  register: async (email, password, name) => {
    if (!isAppwriteConfigured()) {
      throw new Error("Appwrite chưa được cấu hình.");
    }

    const account = new Account(getAppwriteClient());

    try {
      await account.create(ID.unique(), email, password, name.trim());
      await account.createEmailPasswordSession(email, password);
      const session = await fetchCurrentSession(account);
      set(authFromSession(session));
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  },

  loginWithGoogle: () => {
    if (!isAppwriteConfigured()) {
      throw new Error("Appwrite chưa được cấu hình.");
    }

    const account = new Account(getAppwriteClient());
    const { successUrl, failureUrl } = getOAuthRedirectUrls();

    account.createOAuth2Session(
      OAuthProvider.Google,
      successUrl,
      failureUrl,
    );
  },

  logout: async () => {
    if (isAppwriteConfigured()) {
      try {
        const account = new Account(getAppwriteClient());
        await account.deleteSession("current");
      } catch {
        // Session may already be cleared.
      }
    }

    set({ ...loggedOutState });
  },
}));
