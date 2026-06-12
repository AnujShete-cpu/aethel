type PublicEnv = Readonly<{
  appName: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
}>;

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env: PublicEnv = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Aethel",
  supabaseUrl: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
};
