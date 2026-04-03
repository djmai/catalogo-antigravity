'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Shield, 
  Mail, 
  Calendar, 
  Edit, 
  Trash2, 
  Loader2,
  Key,
  UserPlus,
  ArrowRight,
  CheckCircle,
  UserCheck,
  RotateCw
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [updating, setUpdating] = useState(false)
  const [creating, setCreating] = useState(false)

  // Create user form state
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('client')
  
  const supabase = createClient()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setUsers(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail || !newPassword) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setCreating(true)
    try {
      // Supabase Client for creating user
      const { email, password } = { email: newEmail, password: newPassword }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: newRole,
            email_confirmed: true // This depends on Supabase config, but we try to set it
          }
        }
      })

      if (error) throw error

      // If Supabase didn't automatically create a profile via trigger (which is best practice) 
      // we check and could manually insert here, but usually, it's done via DB trigger.
      // For safety, let's assume the DB trigger handles it based on auth.users -> public.profiles metadata

      toast.success('Usuario creado con éxito. Se le notificará por email.')
      setIsCreateDialogOpen(false)
      setNewEmail('')
      setNewPassword('')
      setNewRole('client')
      fetchUsers()
    } catch (error: any) {
      toast.error('Error al crear usuario: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateRole = async (role: string) => {
    if (!selectedUser) return
    setUpdating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.id === selectedUser.id && role !== 'admin') {
        toast.error('No puedes quitarte el permiso de Administrador a ti mismo.')
        setIsDialogOpen(false)
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role: role })
        .eq('id', selectedUser.id)
      
      if (error) throw error
      toast.success('Rol actualizado con éxito')
      setIsDialogOpen(false)
      fetchUsers()
    } catch (error: any) {
      toast.error('Error: ' + error.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleActivateUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('confirm_user_email', { user_id: userId })
      if (error) throw error
      toast.success('Usuario activado con éxito')
      fetchUsers()
    } catch (error: any) {
      toast.error('Error al activar: ' + error.message)
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-4">
            <Users className="h-10 w-10 text-[#13C8B5]" />
            Gestión de Usuarios
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Control total sobre roles y accesos del catálogo.</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="h-14 px-8 bg-[#2B364A] hover:bg-[#13C8B5] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl transition-all active:scale-95 group"
        >
          <UserPlus className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Usuario</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Email</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Rol</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Estado</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px]">Registro</TableHead>
              <TableHead className="py-6 font-black text-slate-900 uppercase tracking-widest text-[10px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Cargando perfiles...</p>
                </TableCell>
              </TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id} className="hover:bg-slate-50/80 border-gray-100 transition-colors group">
                <TableCell className="py-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 h-10 w-10 rounded-xl flex items-center justify-center font-black text-slate-900 uppercase">
                      {u.email[0]}
                    </div>
                    <span className="font-bold text-slate-900">Usuario Premium</span>
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Mail className="h-4 w-4" />
                    {u.email}
                  </div>
                </TableCell>
                <TableCell className="py-6">
                  <Badge 
                    className={`font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg border-none ${
                      u.role === 'admin' ? 'bg-indigo-50 text-indigo-700' : 
                      u.role === 'editor' ? 'bg-amber-50 text-amber-700' : 
                      'bg-slate-50 text-slate-600'
                    }`}
                  >
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell className="py-6">
                  {u.is_verified ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded-lg">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verificado
                    </Badge>
                  ) : (
                    <Badge className="bg-rose-50 text-rose-700 border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded-lg">
                      <RotateCw className="mr-1 h-3 w-3 animate-spin duration-[3000ms]" />
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-6">
                  <div className="flex items-center gap-2 text-muted-foreground font-medium text-xs">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(u.created_at), 'dd MMM yyyy', { locale: es })}
                  </div>
                </TableCell>
                <TableCell className="py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!u.is_verified && (
                      <Button 
                        onClick={() => handleActivateUser(u.id)}
                        variant="ghost" 
                        size="sm" 
                        title="Activar Manualmente"
                        className="h-10 w-10 rounded-xl p-0 hover:bg-emerald-50 text-emerald-600 border border-transparent hover:border-emerald-100"
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      onClick={() => {
                        setSelectedUser(u)
                        setIsDialogOpen(true)
                      }}
                      variant="ghost" 
                      size="sm" 
                      className="h-10 w-10 rounded-xl p-0 hover:bg-slate-100"
                    >
                      <Edit className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog for Creating User */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md rounded-[40px] p-10 border-none bg-white shadow-2xl animate-in zoom-in-95 duration-300">
          <DialogHeader className="pb-4">
             <div className="h-16 w-16 bg-[#13C8B5]/10 rounded-[24px] flex items-center justify-center mb-6">
                <UserPlus className="h-8 w-8 text-[#13C8B5]" />
             </div>
             <DialogTitle className="text-3xl font-black text-[#2B364A]">Nuevo Usuario</DialogTitle>
             <DialogDescription className="font-medium text-slate-400 mt-2">
                Crea una cuenta para un nuevo colaborador o cliente.
             </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-8 mt-4">
             <div className="space-y-6">
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Correo Electrónico</Label>
                   <Input 
                      type="email" 
                      placeholder="usuario@ejemplo.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="h-14 px-6 rounded-[20px] bg-slate-50 border-none focus:ring-2 focus:ring-[#13C8B5] font-bold text-slate-700"
                      required
                   />
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Contraseña Temporal</Label>
                   <div className="relative">
                      <Input 
                        type="password" 
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-14 px-6 rounded-[20px] bg-slate-50 border-none focus:ring-2 focus:ring-[#13C8B5] font-bold text-slate-700"
                        required
                      />
                      <Key className="absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nivel de Acceso</Label>
                   <Select value={newRole} onValueChange={setNewRole}>
                      <SelectTrigger className="h-14 px-6 rounded-[20px] bg-slate-50 border-none focus:ring-2 focus:ring-[#13C8B5] font-bold text-slate-700 shadow-none">
                         <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[24px] p-2 border-slate-100 shadow-2xl">
                         <SelectItem value="client" className="rounded-xl py-3 px-4 focus:bg-[#13C8B5]/10 focus:text-[#13C8B5] font-bold">Cliente</SelectItem>
                         <SelectItem value="editor" className="rounded-xl py-3 px-4 focus:bg-[#13C8B5]/10 focus:text-[#13C8B5] font-bold">Editor de Catálogo</SelectItem>
                         <SelectItem value="admin" className="rounded-xl py-3 px-4 focus:bg-[#13C8B5]/10 focus:text-[#13C8B5] font-bold text-indigo-600">Administrador</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
             </div>

             <Button 
                type="submit" 
                disabled={creating}
                className="w-full h-14 bg-[#2B364A] hover:bg-[#13C8B5] text-white font-black uppercase tracking-widest text-xs rounded-[20px] shadow-xl transition-all group"
             >
                {creating ? (
                   <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                   <>
                      Crear Acceso
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                   </>
                )}
             </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-[40px] p-10 border-none bg-white shadow-2xl animate-in fade-in duration-300">
          <DialogHeader>
             <div className="h-16 w-16 bg-slate-100 rounded-[24px] flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-[#2B364A]" />
             </div>
             <DialogTitle className="text-2xl font-black text-[#2B364A]">Cambiar Permisos</DialogTitle>
             <DialogDescription className="font-medium text-slate-400 mt-2">
                Actualiza el nivel de acceso para <strong>{selectedUser?.email}</strong>.
             </DialogDescription>
          </DialogHeader>
          <div className="mt-8 space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nivel de Acceso</Label>
              <Select 
                defaultValue={selectedUser?.role} 
                onValueChange={handleUpdateRole}
                disabled={updating}
              >
                <SelectTrigger className="h-14 px-6 rounded-[20px] bg-slate-50 border-none focus:ring-2 focus:ring-[#13C8B5] font-bold text-slate-700 shadow-none">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent className="rounded-[24px] p-2 border-slate-100 shadow-2xl">
                  <SelectItem value="client" className="rounded-xl py-3 px-4 font-bold">Cliente</SelectItem>
                  <SelectItem value="editor" className="rounded-xl py-3 px-4 font-bold">Editor</SelectItem>
                  <SelectItem value="admin" className="rounded-xl py-3 px-4 font-bold text-indigo-600">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {updating && (
              <div className="flex items-center justify-center gap-3 text-[#13C8B5] animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin text-[#13C8B5]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Sincronizando permisos...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
