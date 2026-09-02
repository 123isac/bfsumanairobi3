import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Verify requesting user is admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Invalid admin session" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminRole?.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized: Only administrators can create workers" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const { email, password, fullName, employeeId, position, department, role } = await req.json()

    if (!email || !role || !fullName) {
      return new Response(
        JSON.stringify({ success: false, error: "Email, full name, and role are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()

    // 1. Check if user already exists in auth.users
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) throw listError

    const existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    )

    let targetUserId = ""
    let isExisting = false

    if (existingUser) {
      // ── EXISTING CUSTOMER: Upgrade to Worker ──
      targetUserId = existingUser.id
      isExisting = true

      // Update password and metadata if provided
      const updateData: any = {
        user_metadata: { full_name: fullName.trim() },
        email_confirm: true,
      }
      if (password && password.length >= 6) {
        updateData.password = password
      }

      const { error: updateAuthErr } = await supabaseAdmin.auth.admin.updateUserById(
        targetUserId,
        updateData
      )
      if (updateAuthErr) throw updateAuthErr

    } else {
      // ── NEW USER: Create in auth.users ──
      if (!password || password.length < 6) {
        return new Response(
          JSON.stringify({ success: false, error: "Password must be at least 6 characters" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }

      const { data: newUser, error: createAuthErr } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: fullName.trim() },
      })

      if (createAuthErr) throw createAuthErr
      if (!newUser.user) throw new Error("Failed to create auth user")
      
      targetUserId = newUser.user.id
    }

    // 2. Insert or update profile
    await supabaseAdmin.from('profiles').upsert({
      id: targetUserId,
      full_name: fullName.trim(),
    }, { onConflict: 'id' })

    // 3. Upsert user role to new worker role
    await supabaseAdmin.from('user_roles').delete().eq('user_id', targetUserId)
    const { error: roleErr } = await supabaseAdmin.from('user_roles').insert({
      user_id: targetUserId,
      role: role,
    })
    if (roleErr) throw roleErr

    // 4. Upsert workers table
    const { error: workerErr } = await supabaseAdmin.from('workers').upsert({
      user_id: targetUserId,
      employee_id: employeeId || `EMP-${Date.now().toString().slice(-4)}`,
      full_name: fullName.trim(),
      position: position || role,
      department: department || 'General',
      role: role,
      status: 'active',
      created_by: user.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (workerErr) throw workerErr

    return new Response(
      JSON.stringify({
        success: true,
        isExistingUser: isExisting,
        message: isExisting
          ? `Customer account (${cleanEmail}) successfully upgraded to ${role} staff role!`
          : `Staff account (${cleanEmail}) created successfully!`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error("Error in create-worker:", error)
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Failed to create or upgrade worker" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
})
