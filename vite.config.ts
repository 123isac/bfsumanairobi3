import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { createClient } from "@supabase/supabase-js";

function adminApiPlugin() {
  return {
    name: "admin-api-middleware",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === "/api/admin/create-worker" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk: any) => body += chunk);
          req.on("end", async () => {
            try {
              const env = loadEnv("development", process.cwd(), "");
              const supabaseUrl = env.VITE_SUPABASE_URL || "https://vjhjnbefyyfxfsyncdrr.supabase.co";
              const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

              if (!serviceKey) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                return res.end(JSON.stringify({ success: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY in .env" }));
              }

              const supabaseAdmin = createClient(supabaseUrl, serviceKey);
              const data = JSON.parse(body);
              const { email, password, fullName, employeeId, position, department, role } = data;

              if (!email || !fullName || !employeeId || !role) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                return res.end(JSON.stringify({ success: false, error: "Missing required fields" }));
              }

              const normalizedEmail = email.trim().toLowerCase();
              let targetUserId = null;
              let isExistingUser = false;

              // Check existing user in auth.users
              const { data: userListData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
              if (!listError && userListData?.users) {
                const found = userListData.users.find((u: any) => u.email?.toLowerCase() === normalizedEmail);
                if (found) {
                  targetUserId = found.id;
                  isExistingUser = true;
                  // Override password with temporary password if provided
                  if (password && password.length >= 6) {
                    await supabaseAdmin.auth.admin.updateUserById(targetUserId, { 
                      password,
                      user_metadata: { full_name: fullName }
                    });
                  }
                }
              }

              // If not found, create new auth user
              if (!targetUserId) {
                const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                  email: normalizedEmail,
                  password: password || "Staff@2026!",
                  email_confirm: true,
                  user_metadata: { full_name: fullName }
                });

                if (createError) {
                  res.statusCode = 400;
                  res.setHeader("Content-Type", "application/json");
                  return res.end(JSON.stringify({ success: false, error: createError.message }));
                }

                targetUserId = newUser.user?.id;
              }

              if (!targetUserId) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                return res.end(JSON.stringify({ success: false, error: "Failed to get user ID" }));
              }

              // Update role in user_roles
              await supabaseAdmin.from("user_roles").delete().eq("user_id", targetUserId);
              await supabaseAdmin.from("user_roles").insert({
                user_id: targetUserId,
                role: role
              });

              // Upsert workers table
              await supabaseAdmin.from("workers").upsert({
                user_id: targetUserId,
                employee_id: employeeId,
                full_name: fullName,
                position: position || role,
                department: department || null,
                role: role,
                status: "active"
              }, { onConflict: "user_id" });

              // Upsert profiles
              await supabaseAdmin.from("profiles").upsert({
                id: targetUserId,
                full_name: fullName
              }, { onConflict: "id" });

              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify({
                success: true,
                isExistingUser,
                message: isExistingUser
                  ? `Existing account for ${fullName} upgraded to ${role} role with password updated!`
                  : `New staff account for ${fullName} created successfully!`
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              return res.end(JSON.stringify({ success: false, error: err.message || "Internal server error" }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    adminApiPlugin(),
    react(),
    ...(mode === "development" ? [componentTagger()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    emptyOutDir: true,
  },
}));
