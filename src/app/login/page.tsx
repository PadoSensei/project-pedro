import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";
    const password = formData.get("password");

    if (password === process.env.APP_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set("smkt_auth", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
      redirect("/");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md border">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Project Pedro</h1>
          <p className="text-sm text-slate-500 mt-1">
            Acesso restrito à equipe
          </p>
        </div>
        <form action={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Senha de Acesso
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite a senha..."
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
